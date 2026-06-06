-- ============================================================
-- マイグレーション：user_profiles に recovery_code カラムを追加
-- 実行日：2026-05-18
-- 目的：パスワードを忘れた場合の本人確認用復元コードを保存する
-- ============================================================
-- ⚠️ 経営企画部の承認済み。Supabase SQL Editor で実行すること。
-- ============================================================

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS recovery_code TEXT;

-- コメント
COMMENT ON COLUMN user_profiles.recovery_code IS
  '登録時に発行する復元コード（例: ABCD-EFGH）。パスワードを忘れた際の本人確認に使用。';
