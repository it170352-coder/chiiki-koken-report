-- Bakery Hub データベーススキーマ
-- Supabase ダッシュボード → SQL Editor に貼り付けて実行してください。

-- =========================================
-- profiles（店舗オーナー・スタッフ）
-- =========================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  store_name text not null default '',
  role text not null default 'owner',
  created_at timestamptz not null default now()
);

-- 新規ユーザー登録時に profiles を自動作成
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, store_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'store_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =========================================
-- customers（顧客）
-- =========================================
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  memo text,
  created_at timestamptz not null default now()
);
create index if not exists idx_customers_user on customers(user_id);

-- =========================================
-- products（商品）
-- =========================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  category text not null default '',
  price integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_products_user on products(user_id);

-- =========================================
-- reservations（予約・取り置き）
-- =========================================
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  pickup_at timestamptz not null,
  status text not null default 'pending',
  memo text,
  created_at timestamptz not null default now()
);
create index if not exists idx_reservations_user on reservations(user_id);
create index if not exists idx_reservations_pickup on reservations(pickup_at);

-- =========================================
-- reservation_items（予約明細）
-- =========================================
create table if not exists reservation_items (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity integer not null default 1
);
create index if not exists idx_resitems_res on reservation_items(reservation_id);

-- =========================================
-- inventory_logs（在庫・販売・廃棄の日次記録）
-- =========================================
create table if not exists inventory_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  date date not null default current_date,
  produced integer not null default 0,
  sold integer not null default 0,
  wasted integer not null default 0,
  unique (user_id, product_id, date)
);
create index if not exists idx_inventory_user_date on inventory_logs(user_id, date);

-- =========================================
-- Row Level Security（自分の店舗のデータのみ操作可）
-- =========================================
alter table profiles enable row level security;
alter table customers enable row level security;
alter table products enable row level security;
alter table reservations enable row level security;
alter table reservation_items enable row level security;
alter table inventory_logs enable row level security;

-- profiles: 自分の行のみ
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- customers / products / reservations / inventory_logs: user_id = 自分
create policy "own customers" on customers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own products" on products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own reservations" on reservations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own inventory" on inventory_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reservation_items: 親予約が自分のものなら操作可
create policy "own reservation items" on reservation_items
  for all using (
    exists (
      select 1 from reservations r
      where r.id = reservation_items.reservation_id
        and r.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from reservations r
      where r.id = reservation_items.reservation_id
        and r.user_id = auth.uid()
    )
  );
