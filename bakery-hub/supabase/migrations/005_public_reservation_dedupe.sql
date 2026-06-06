-- =====================================================================
-- ネット予約：同じ電話番号のお客さんは同一顧客にまとめる
-- Supabase ダッシュボード → SQL Editor に貼り付けて実行してください。
-- create or replace なので何度実行しても安全です。
-- =====================================================================

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

  v_dow := extract(dow from (p_pickup at time zone 'Asia/Tokyo'))::int;
  if v_store.closed_days <> ''
     and (',' || v_store.closed_days || ',') like ('%,' || v_dow::text || ',%') then
    raise exception 'ご指定の曜日は定休日です';
  end if;

  v_date := to_char(p_pickup at time zone 'Asia/Tokyo', 'YYYY-MM-DD');
  if v_store.closed_dates <> ''
     and (',' || v_store.closed_dates || ',') like ('%,' || v_date || ',%') then
    raise exception 'ご指定の日は休業日です';
  end if;

  -- 同じ店・同じ電話番号の既存顧客がいれば再利用、いなければ新規作成
  select id into v_customer
  from customers
  where store_id = p_store and phone = trim(p_phone)
  order by created_at
  limit 1;

  if v_customer is null then
    insert into customers (store_id, user_id, name, phone)
    values (p_store, p_store, trim(p_name), trim(p_phone))
    returning id into v_customer;
  end if;

  insert into reservations (store_id, user_id, customer_id, pickup_at, status, memo)
  values (
    p_store, p_store, v_customer, p_pickup, 'pending',
    nullif(trim(coalesce(p_memo, '')), '')
  )
  returning id into v_reservation;

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

-- 完了。
