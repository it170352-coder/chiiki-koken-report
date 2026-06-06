-- products テーブルに追加カラム
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS tax_rate numeric(4,2) NOT NULL DEFAULT 0.08,
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_managed boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

-- sales テーブル（新規）
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES auth.users(id),
  customer_id uuid REFERENCES customers(id),
  receipt_number text NOT NULL,
  subtotal integer NOT NULL,
  tax_8_amount integer NOT NULL DEFAULT 0,
  tax_10_amount integer NOT NULL DEFAULT 0,
  total_amount integer NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash','card','other')),
  cash_received integer,
  change_amount integer,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','voided')),
  sold_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, receipt_number)
);

-- sale_items テーブル（新規）
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  unit_price integer NOT NULL,
  tax_rate numeric(4,2) NOT NULL,
  quantity integer NOT NULL,
  subtotal integer NOT NULL
);

-- stock_movements テーブル（新規）
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  change_quantity integer NOT NULL,
  reason text NOT NULL CHECK (reason IN ('sale','restock','adjustment','void')),
  reference_id uuid,
  staff_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sales_store_member" ON sales
  USING (
    store_id IN (
      SELECT store_id FROM store_members WHERE user_id = auth.uid()
    )
  );

-- RLS: sale_items
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sale_items_store_member" ON sale_items
  USING (
    sale_id IN (
      SELECT id FROM sales WHERE store_id IN (
        SELECT store_id FROM store_members WHERE user_id = auth.uid()
      )
    )
  );

-- RLS: stock_movements
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_movements_store_member" ON stock_movements
  USING (
    store_id IN (
      SELECT store_id FROM store_members WHERE user_id = auth.uid()
    )
  );

-- create_sale RPC関数（トランザクション）
CREATE OR REPLACE FUNCTION create_sale(
  p_store_id uuid,
  p_staff_id uuid,
  p_customer_id uuid,
  p_items jsonb,
  p_payment_method text,
  p_cash_received integer
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sale_id uuid;
  v_receipt_number text;
  v_subtotal integer := 0;
  v_tax_8 integer := 0;
  v_tax_10 integer := 0;
  v_total integer := 0;
  v_change integer;
  item jsonb;
  v_item_subtotal integer;
  v_item_tax integer;
BEGIN
  -- レシート番号採番
  SELECT 'R' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Tokyo', 'YYYYMMDD') || '-' ||
         LPAD(CAST(COUNT(*) + 1 AS text), 4, '0')
  INTO v_receipt_number
  FROM sales
  WHERE store_id = p_store_id
    AND DATE(sold_at AT TIME ZONE 'Asia/Tokyo') = DATE(NOW() AT TIME ZONE 'Asia/Tokyo');

  -- 金額計算
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_subtotal := (item->>'unit_price')::integer * (item->>'quantity')::integer;
    v_subtotal := v_subtotal + v_item_subtotal;
    IF (item->>'tax_rate')::numeric = 0.08 THEN
      v_item_tax := FLOOR(v_item_subtotal * 0.08 / 1.08);
      v_tax_8 := v_tax_8 + v_item_tax;
    ELSE
      v_item_tax := FLOOR(v_item_subtotal * 0.10 / 1.10);
      v_tax_10 := v_tax_10 + v_item_tax;
    END IF;
  END LOOP;
  v_total := v_subtotal;
  v_change := CASE WHEN p_payment_method = 'cash' THEN p_cash_received - v_total ELSE NULL END;

  -- sales INSERT
  INSERT INTO sales (store_id, staff_id, customer_id, receipt_number, subtotal, tax_8_amount, tax_10_amount, total_amount, payment_method, cash_received, change_amount)
  VALUES (p_store_id, p_staff_id, p_customer_id, v_receipt_number, v_subtotal, v_tax_8, v_tax_10, v_total, p_payment_method, p_cash_received, v_change)
  RETURNING id INTO v_sale_id;

  -- sale_items + 在庫減算
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_subtotal := (item->>'unit_price')::integer * (item->>'quantity')::integer;
    INSERT INTO sale_items (sale_id, product_id, product_name, unit_price, tax_rate, quantity, subtotal)
    VALUES (v_sale_id, (item->>'product_id')::uuid, item->>'product_name', (item->>'unit_price')::integer, (item->>'tax_rate')::numeric, (item->>'quantity')::integer, v_item_subtotal);

    -- 在庫管理対象のみ減算
    UPDATE products
    SET stock_quantity = stock_quantity - (item->>'quantity')::integer
    WHERE id = (item->>'product_id')::uuid AND stock_managed = true;

    INSERT INTO stock_movements (product_id, store_id, change_quantity, reason, reference_id, staff_id)
    VALUES ((item->>'product_id')::uuid, p_store_id, -(item->>'quantity')::integer, 'sale', v_sale_id, p_staff_id);
  END LOOP;

  RETURN v_sale_id;
END;
$$;
