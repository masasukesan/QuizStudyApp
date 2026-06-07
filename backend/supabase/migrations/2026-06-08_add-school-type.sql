-- ══════════════════════════════════════════════════
-- 2026-06-08: 中学生/高校生の区分を追加
-- ══════════════════════════════════════════════════

-- 1. user_profiles に school_type カラムを追加
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS school_type TEXT
    CHECK (school_type IN ('junior_high', 'high_school'));

-- 2. national_stats に school_type カラムを追加
--    既存の NULL 行は「区分なし（移行前データ）」として残す
ALTER TABLE national_stats
  ADD COLUMN IF NOT EXISTS school_type TEXT
    CHECK (school_type IN ('junior_high', 'high_school'));

-- 3. national_stats の検索に使うインデックス
CREATE INDEX IF NOT EXISTS idx_national_stats_school_type
  ON national_stats (subject, school_type, calculated_at DESC);

-- 4. 備考
-- ・既存ユーザーの school_type は NULL のまま（App.tsx の SchoolTypeGuard が初回ログイン時に選択を促す）
-- ・偏差値の再計算 Edge Function は school_type を WHERE 条件に加えること
-- ・national_stats への INSERT 時は school_type を必ず指定すること
