-- 顧客テーブルに個人/法人の区分カラムを追加
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_type text DEFAULT 'individual';
