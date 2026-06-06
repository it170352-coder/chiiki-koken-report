-- =====================================================================
-- ネット予約（公開ページ）対応 マイグレーション
-- Supabase ダッシュボード → SQL Editor に貼り付けて「上から順に一度に」実行してください。
-- お客さん（ログインなし＝anon）でも、ここで定義する専用関数経由でのみ
-- 店舗情報の閲覧と予約作成ができるようにします。テーブルへの直接アクセスは許可しません。
-- 何度実行しても安全です（create or replace）。
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. 公開：店舗の基本情報（営業時間・定休日・臨時休業日）
-- ---------------------------------------------------------------------
create or replace function public_store_info(p_store uuid)
returns table(
  name text,
  pickup_start time,
  pickup_end time,
  closed_days text,
  closed_dates text
)
language sql
security definer set search_path = public
stable
as $$
  select name, pickup_start, pickup_end, closed_days, closed_dates
  from stores
  where id = p_store;
$$;
grant execute on function public_store_info(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. 公開：販売中の商品一覧（id・名前・価格のみ）
-- ---------------------------------------------------------------------
create or replace function public_store_products(p_store uuid)
returns table(id uuid, name text, price integer)
language sql
security definer set search_path = public
stable
as $$
  select id, name, price
  from products
  where store_id = p_store and is_active
  order by name;
$$;
grant execute on function public_store_products(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. 公開：予約の作成（お客さんの名前・電話・商品/個数を受け取る）
--    ・店舗オーナーIDを user_id に使うことで NOT NULL 制約を満たす
--      （stores.id = オーナーのprofile id という設計を利用）
--    ・定休日／臨時休業日は受け付けない（サーバー側で最終チェック）
-- ---------------------------------------------------------------------
create or replace function create_public_reservation(
  p_store uuid,
  p_name text,
  p_phone text,
  p_pickup timestamptz,
  p_memo text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_store stores%rowtype;
  v_customer uuid;
  v_reservation uuid;
  v_item jsonb;
  v_pid uuid;
  v_qty int;
  v_dow int;
  v_date text;
  v_count int := 0;
begin
  select * into v_store from stores where id = p_store;
  if not found then
    raise exception '店舗が見つかりません';
  end if;

  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'お名前と電話番号は必須です';
  end if;

  if p_pickup is null or p_pickup <= now() then
    raise exception '受取日時は現在より後の日時を指定してください';
  end if;

  -- 定休日（曜日）チェック。postgres の dow は 0=日曜..6=土曜 でアプリの値と一致
  v_dow := extract(dow from (p_pickup at time zone 'Asia/Tokyo'))::int;
  if v_store.closed_days <> ''
     and (',' || v_store.closed_days || ',') like ('%,' || v_dow::text || ',%') then
    raise exception 'ご指定の曜日は定休日です';
  end if;

  -- 臨時休業日チェック
  v_date := to_char(p_pickup at time zone 'Asia/Tokyo', 'YYYY-MM-DD');
  if v_store.closed_dates <> ''
     and (',' || v_store.closed_dates || ',') like ('%,' || v_date || ',%') then
    raise exception 'ご指定の日は休業日です';
  end if;

  -- 顧客を作成（store_id = user_id = 店舗ID＝オーナーID）
  insert into customers (store_id, user_id, name, phone)
  values (p_store, p_store, trim(p_name), trim(p_phone))
  returning id into v_customer;

  -- 予約を作成
  insert into reservations (store_id, user_id, customer_id, pickup_at, status, memo)
  values (
    p_store, p_store, v_customer, p_pickup, 'pending',
    nullif(trim(coalesce(p_memo, '')), '')
  )
  returning id into v_reservation;

  -- 明細（自店の販売中商品のみ・数量1以上）
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid := (v_item->>'product_id')::uuid;
    v_qty := coalesce((v_item->>'quantity')::int, 0);
    if v_qty > 0 and exists (
      select 1 from products
      where id = v_pid and store_id = p_store and is_active
    ) then
      insert into reservation_items (reservation_id, product_id, quantity)
      values (v_reservation, v_pid, v_qty);
      v_count := v_count + 1;
    end if;
  end loop;

  if v_count = 0 then
    raise exception '商品を1つ以上選んでください';
  end if;

  return v_reservation;
end;
$$;
grant execute on function create_public_reservation(uuid, text, text, timestamptz, text, jsonb) to anon, authenticated;

-- 完了。
