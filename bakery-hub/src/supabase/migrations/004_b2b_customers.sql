-- 顧客テーブルに法人対応カラムを追加
ALTER TABLE customers ADD COLUMN IF NOT EXISTS contact_person text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS department text;
