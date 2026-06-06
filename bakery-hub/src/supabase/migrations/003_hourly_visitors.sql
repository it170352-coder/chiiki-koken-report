CREATE TABLE IF NOT EXISTS hourly_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date date NOT NULL,
  hour integer NOT NULL CHECK (hour >= 0 AND hour <= 23),
  visitor_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, date, hour)
);

ALTER TABLE hourly_visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_members_hourly_visitors" ON hourly_visitors
  FOR ALL USING (store_id = ANY(SELECT store_id FROM store_members WHERE user_id = auth.uid()));
