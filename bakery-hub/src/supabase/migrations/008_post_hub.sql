-- Post Hub テーブル群

-- クライアント管理
create table if not exists post_clients (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade,
  name text not null,
  industry text,
  threads_account text,
  x_account text,
  contact_name text,
  status text not null default 'active', -- active / paused / ended
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table post_clients enable row level security;
create policy "store members can manage post_clients" on post_clients
  using (store_id in (select store_id from store_members where user_id = auth.uid()));

-- 投稿管理
create table if not exists post_posts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade,
  client_id uuid references post_clients(id) on delete set null,
  title text not null,
  body text,
  platform text not null default 'threads', -- threads / x / both
  scheduled_at date,
  assignee text,
  status text not null default 'idea', -- idea / planning / writing / review / posted
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table post_posts enable row level security;
create policy "store members can manage post_posts" on post_posts
  using (store_id in (select store_id from store_members where user_id = auth.uid()));

-- 情報収集
create table if not exists post_research (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade,
  title text not null,
  url text,
  summary text,
  memo text,
  category text,
  tags text[],
  created_at timestamptz not null default now()
);
alter table post_research enable row level security;
create policy "store members can manage post_research" on post_research
  using (store_id in (select store_id from store_members where user_id = auth.uid()));

-- 競合分析
create table if not exists post_competitors (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade,
  account_name text not null,
  platform text not null default 'threads', -- threads / x
  url text,
  industry text,
  analysis_memo text,
  reference_posts text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table post_competitors enable row level security;
create policy "store members can manage post_competitors" on post_competitors
  using (store_id in (select store_id from store_members where user_id = auth.uid()));

-- ナレッジ管理
create table if not exists post_knowledge (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade,
  type text not null default 'tip', -- success / failure / idea / hashtag / industry / tip
  title text not null,
  content text,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table post_knowledge enable row level security;
create policy "store members can manage post_knowledge" on post_knowledge
  using (store_id in (select store_id from store_members where user_id = auth.uid()));
