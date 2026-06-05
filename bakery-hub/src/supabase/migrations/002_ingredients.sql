-- 原材料マスタ
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category text NOT NULL,
  name text NOT NULL,
  unit text NOT NULL,
  stock_quantity numeric NOT NULL DEFAULT 0,
  minimum_stock numeric NOT NULL DEFAULT 0,
  purchase_price numeric NOT NULL DEFAULT 0,
  supplier text,
  expiration_date date,
  last_order_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- レシピ明細
CREATE TABLE IF NOT EXISTS recipe_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  usage_quantity numeric NOT NULL,
  unit text NOT NULL
);

-- RLS
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_members_ingredients" ON ingredients
  FOR ALL USING (store_id = ANY(SELECT store_id FROM store_members WHERE user_id = auth.uid()));

CREATE POLICY "store_members_recipe_items" ON recipe_items
  FOR ALL USING (store_id = ANY(SELECT store_id FROM store_members WHERE user_id = auth.uid()));
