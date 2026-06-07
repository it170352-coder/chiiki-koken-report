create table if not exists idea_memos (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade not null,
  title text not null default '',
  body text not null default '',
  created_at timestamptz default now()
);

alter table idea_memos enable row level security;

create policy "store members can manage idea_memos"
  on idea_memos for all
  using (store_id in (
    select store_id from store_members where user_id = auth.uid()
  ));
