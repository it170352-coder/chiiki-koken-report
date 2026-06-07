create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade not null,
  user_id uuid not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  note text default '',
  created_at timestamptz default now()
);

alter table shifts enable row level security;

create policy "store members can manage shifts"
  on shifts for all
  using (store_id in (
    select store_id from store_members where user_id = auth.uid()
  ));
