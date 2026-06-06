-- ============================================================
-- マイグレーション: 教科別偏差値・パーセンタイル・トレンド対応
-- 作成日: 2026-05-31
-- ============================================================

-- user_profiles にパーセンタイル・前回偏差値カラムを追加
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS prev_deviation_score NUMERIC(5,2)
    CHECK (prev_deviation_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS percentile NUMERIC(5,2)
    CHECK (percentile BETWEEN 0 AND 100);

COMMENT ON COLUMN user_profiles.prev_deviation_score IS '前回バッチ時の偏差値（トレンド表示用）';
COMMENT ON COLUMN user_profiles.percentile           IS '全体パーセンタイル（上位○%）';

-- 教科別偏差値テーブルを新設
CREATE TABLE IF NOT EXISTS user_subject_scores (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject              TEXT NOT NULL,
  deviation_score      NUMERIC(5,2) CHECK (deviation_score BETWEEN 0 AND 100),
  prev_deviation_score NUMERIC(5,2) CHECK (prev_deviation_score BETWEEN 0 AND 100),
  national_rank        INTEGER CHECK (national_rank >= 1),
  percentile           NUMERIC(5,2) CHECK (percentile BETWEEN 0 AND 100),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, subject)
);

CREATE INDEX IF NOT EXISTS idx_user_subject_scores_user_id ON user_subject_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subject_scores_subject ON user_subject_scores(subject);

ALTER TABLE user_subject_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "自分の教科別スコアのみ参照" ON user_subject_scores;
CREATE POLICY "自分の教科別スコアのみ参照" ON user_subject_scores
  FOR SELECT USING (auth.uid() = user_id);
