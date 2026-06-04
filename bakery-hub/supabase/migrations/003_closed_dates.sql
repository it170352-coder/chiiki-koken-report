-- =====================================================================
-- 臨時休業日（特定日付）対応 マイグレーション
-- Supabase ダッシュボード → SQL Editor に貼り付けて実行してください。
-- 何度実行しても安全です（if not exists）。
-- =====================================================================

-- stores に「臨時休業日」の列を追加（YYYY-MM-DD をカンマ区切りで保持）
alter table stores
  add column if not exists closed_dates text not null default '';

-- 完了。既存の毎週の定休曜日(closed_days)はそのまま使えます。
