-- =====================================================================
-- スタッフ共有機能 マイグレーション（フェーズ2）
-- Supabase ダッシュボード → SQL Editor に貼り付けて「上から順に一度に」実行してください。
-- 既存データ（現状ほぼテストデータ）はそのまま新しい「お店」に引き継がれます。
-- 何度実行しても安全なように if not exists / on conflict を使っています。
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. お店（テナント）と所属メンバーのテーブル
--    既存の各オーナーをそのまま店主にするため、store.id = profiles.id にする
-- ---------------------------------------------------------------------
create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  pickup_start time,
  pickup_end time,
  closed_days text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists store_members (
  store_id uuid not null references stores(id) on delete cascade,
  user_id  uuid not null references profiles(id) on delete cascade,
  role text not null default 'staff',          -- owner / manager / staff
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);
create index if not exists idx_store_members_user on store_members(user_id);

-- ---------------------------------------------------------------------
-- 2. 既存プロフィールから「お店」を作り、本人をオーナーとして所属させる
-- ---------------------------------------------------------------------
insert into stores (id, name, pickup_start, pickup_end, closed_days)
select id, store_name, pickup_start, pickup_end, coalesce(closed_days, '')
from profiles
on conflict (id) do nothing;

insert into store_members (store_id, user_id, role)
select id, id, 'owner'
from profiles
on conflict (store_id, user_id) do nothing;

-- ---------------------------------------------------------------------
-- 3. 既存データに store_id を追加し、user_id から引き継ぐ
--    （store.id = 旧 user_id なので、そのままコピーで対応づく）
-- ---------------------------------------------------------------------
alter table customers      add column if not exists store_id uuid references stores(id) on delete cascade;
alter table products       add column if not exists store_id uuid references stores(id) on delete cascade;
alter table reservations   add column if not exists store_id uuid references stores(id) on delete cascade;
alter table inventory_logs add column if not exists store_id uuid references stores(id) on delete cascade;

update customers      set store_id = user_id where store_id is null;
update products       set store_id = user_id where store_id is null;
update reservations   set store_id = user_id where store_id is null;
update inventory_logs set store_id = user_id where store_id is null;

alter table customers      alter column store_id set not null;
alter table products       alter column store_id set not null;
alter table reservations   alter column store_id set not null;
alter table inventory_logs alter column store_id set not null;

create index if not exists idx_customers_store      on customers(store_id);
create index if not exists idx_products_store       on products(store_id);
create index if not exists idx_reservations_store   on reservations(store_id);
create index if not exists idx_inventory_store_date on inventory_logs(store_id, date);

-- ---------------------------------------------------------------------
-- 4. 在庫の重複防止キーを「店舗単位」に変更
--    （旧：user_id+product_id+date → 新：store_id+product_id+date）
-- ---------------------------------------------------------------------
alter table inventory_logs drop constraint if exists inventory_logs_user_id_product_id_date_key;
alter table inventory_logs drop constraint if exists inventory_logs_store_id_product_id_date_key;
alter table inventory_logs
  add constraint inventory_logs_store_id_product_id_date_key
  unique (store_id, product_id, date);

-- ---------------------------------------------------------------------
-- 5. 所属店ID一覧を返す補助関数（RLSの無限ループを避けるため SECURITY DEFINER）
-- ---------------------------------------------------------------------
create or replace function my_store_ids()
returns setof uuid
language sql
security definer set search_path = public
stable
as $$
  select store_id from store_members where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- 6. RLS（行レベルセキュリティ）を「自分が所属する店のデータだけ」に張り替え
-- ---------------------------------------------------------------------
alter table stores        enable row level security;
alter table store_members enable row level security;

-- 旧ポリシーを削除（user_id ベース）
drop policy if exists "own customers"  on customers;
drop policy if exists "own products"   on products;
drop policy if exists "own reservations" on reservations;
drop policy if exists "own inventory"  on inventory_logs;

-- 新ポリシー（store_id ベース）
create policy "store customers" on customers
  for all using (store_id in (select my_store_ids()))
  with check (store_id in (select my_store_ids()));

create policy "store products" on products
  for all using (store_id in (select my_store_ids()))
  with check (store_id in (select my_store_ids()));

create policy "store reservations" on reservations
  for all using (store_id in (select my_store_ids()))
  with check (store_id in (select my_store_ids()));

create policy "store inventory" on inventory_logs
  for all using (store_id in (select my_store_ids()))
  with check (store_id in (select my_store_ids()));

-- 予約明細：親予約が自店のものなら操作可（store_id 基準に更新）
drop policy if exists "own reservation items" on reservation_items;
create policy "store reservation items" on reservation_items
  for all using (
    exists (
      select 1 from reservations r
      where r.id = reservation_items.reservation_id
        and r.store_id in (select my_store_ids())
    )
  ) with check (
    exists (
      select 1 from reservations r
      where r.id = reservation_items.reservation_id
        and r.store_id in (select my_store_ids())
    )
  );

-- stores：自分が所属する店のみ閲覧・更新可
drop policy if exists "member stores" on stores;
create policy "member stores" on stores
  for all using (id in (select my_store_ids()))
  with check (id in (select my_store_ids()));

-- store_members：自分が所属する店のメンバーのみ閲覧可
drop policy if exists "member store_members" on store_members;
create policy "member store_members" on store_members
  for select using (store_id in (select my_store_ids()));
-- ※ メンバーの追加・削除はサーバー側（管理者キー）で行うため、
--   一般ユーザー向けの insert/update/delete ポリシーはあえて作らない。

-- ---------------------------------------------------------------------
-- 7. 新規ユーザー登録時の自動処理を更新
--    ・自分で新規登録 → 新しいお店を作り、本人をオーナーに
--    ・オーナーがスタッフとして作成（join_store_id を渡す）→ 既存店に所属
-- ---------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_join_store uuid := nullif(new.raw_user_meta_data->>'join_store_id', '')::uuid;
  v_role text := coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'staff');
  v_new_store uuid;
begin
  -- プロフィールは全ユーザー共通で作成
  insert into public.profiles (id, store_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'store_name', ''))
  on conflict (id) do nothing;

  if v_join_store is not null then
    -- スタッフとして既存店に参加
    insert into public.store_members (store_id, user_id, role)
    values (v_join_store, new.id, v_role)
    on conflict (store_id, user_id) do nothing;
  else
    -- 自分で新規登録：新しいお店を作り、本人をオーナーに
    insert into public.stores (id, name)
    values (new.id, coalesce(new.raw_user_meta_data->>'store_name', ''))
    on conflict (id) do nothing
    returning id into v_new_store;

    insert into public.store_members (store_id, user_id, role)
    values (new.id, new.id, 'owner')
    on conflict (store_id, user_id) do nothing;
  end if;

  return new;
end;
$$;

-- 完了。動作確認後、必要なら profiles の store_name/pickup_* 列は将来削除して構いません
-- （現時点では残してあります）。
