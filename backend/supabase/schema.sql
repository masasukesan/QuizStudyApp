-- ============================================================
-- StudyQuest — Supabase DB スキーマ正本（ポリシー競合対策版）
-- ============================================================
-- このファイルが DB 設計の唯一の正本です。
-- スキーマを変更する場合は必ずこのファイルを更新し、
-- backend/supabase/migrations/ に変更記録を残してください。
-- 本番 DB への適用は経営企画部の承認後に行ってください。
-- ============================================================

-- 拡張機能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- user_profiles（ユーザープロフィール・ゲームデータ）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT NOT NULL UNIQUE,
  avatar_id       TEXT NOT NULL DEFAULT 'cat',
  level           INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  exp             INTEGER NOT NULL DEFAULT 0 CHECK (exp >= 0),
  streak_days     INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  last_login_date DATE,
  national_rank        INTEGER CHECK (national_rank >= 1),
  deviation_score      NUMERIC(5,2) CHECK (deviation_score BETWEEN 0 AND 100),
  prev_deviation_score NUMERIC(5,2) CHECK (prev_deviation_score BETWEEN 0 AND 100),
  percentile           NUMERIC(5,2) CHECK (percentile BETWEEN 0 AND 100),
  recovery_code   TEXT,          -- パスワード忘れ時の復元コード（XXXX-XXXX形式）
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "自分のプロフィールのみ参照" ON user_profiles;
DROP POLICY IF EXISTS "自分のプロフィールのみ挿入" ON user_profiles;
DROP POLICY IF EXISTS "自分のプロフィールのみ更新" ON user_profiles;
CREATE POLICY "自分のプロフィールのみ参照" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "自分のプロフィールのみ挿入" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "自分のプロフィールのみ更新" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- quiz_answers（回答履歴）
-- UPDATE / DELETE は禁止（回答履歴の改ざん防止）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     TEXT NOT NULL,
  subject         TEXT NOT NULL,
  unit            TEXT NOT NULL,
  subunit         TEXT NOT NULL,
  selected_label  TEXT NOT NULL CHECK (selected_label IN ('A','B','C','D')),
  is_correct      BOOLEAN NOT NULL,
  time_taken_sec  INTEGER NOT NULL CHECK (time_taken_sec >= 0),
  answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス（ユーザー別・教科別の集計クエリを高速化）
CREATE INDEX IF NOT EXISTS idx_quiz_answers_user_id      ON quiz_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_subject      ON quiz_answers(subject);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_user_subject ON quiz_answers(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_answered_at  ON quiz_answers(answered_at DESC);

ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "自分の回答のみ参照" ON quiz_answers;
DROP POLICY IF EXISTS "自分の回答のみ挿入" ON quiz_answers;
CREATE POLICY "自分の回答のみ参照" ON quiz_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分の回答のみ挿入" ON quiz_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- learning_stats（教科・単元別の集計統計）
-- 偏差値バッチ・レコメンドエンジンが参照する
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject         TEXT NOT NULL,
  unit            TEXT NOT NULL,
  subunit         TEXT NOT NULL,
  attempts        INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  correct         INTEGER NOT NULL DEFAULT 0 CHECK (correct >= 0),
  avg_time_sec    NUMERIC(6,2) CHECK (avg_time_sec >= 0),
  last_practiced  TIMESTAMPTZ,
  UNIQUE(user_id, subject, unit, subunit),
  CONSTRAINT correct_lte_attempts CHECK (correct <= attempts)
);

CREATE INDEX IF NOT EXISTS idx_learning_stats_user_id      ON learning_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_stats_user_subject ON learning_stats(user_id, subject);

ALTER TABLE learning_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "自分の学習統計のみ参照" ON learning_stats;
DROP POLICY IF EXISTS "自分の学習統計のみ挿入" ON learning_stats;
DROP POLICY IF EXISTS "自分の学習統計のみ更新" ON learning_stats;
CREATE POLICY "自分の学習統計のみ参照" ON learning_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分の学習統計のみ挿入" ON learning_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分の学習統計のみ更新" ON learning_stats FOR UPDATE USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- user_subject_scores（教科別偏差値・順位・パーセンタイル）
-- INSERT / UPDATE は Edge Function（service_role）のみ
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_subject_scores (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject              TEXT NOT NULL,            -- 'math' | 'japanese' | 'english' | 'science' | 'social'
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

-- ------------------------------------------------------------
-- national_stats（全国集計・偏差値計算用）
-- INSERT / UPDATE は Edge Function（service_role）のみ
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS national_stats (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject            TEXT NOT NULL,
  calculated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_users        INTEGER NOT NULL CHECK (total_users >= 0),
  mean_score         NUMERIC(6,2) NOT NULL,
  std_deviation      NUMERIC(6,2) NOT NULL CHECK (std_deviation >= 0),
  -- 算出フェーズ: 1=仮想分布期(<30人) / 2=移行期(30-99人) / 3=実データ期(>=100人)
  calculation_phase  INTEGER NOT NULL DEFAULT 1 CHECK (calculation_phase IN (1, 2, 3))
);

ALTER TABLE national_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "全ユーザーが参照可能" ON national_stats;
CREATE POLICY "全ユーザーが参照可能" ON national_stats FOR SELECT USING (true);

-- ------------------------------------------------------------
-- posts（Q&A 掲示板 — 質問投稿）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     TEXT NOT NULL,
  subject         TEXT NOT NULL,
  title           TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  body            TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  likes           INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  is_resolved     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_question_id ON posts(question_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at  ON posts(created_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "全ユーザーが投稿を参照可能" ON posts;
DROP POLICY IF EXISTS "ログイン済みユーザーのみ投稿可能" ON posts;
DROP POLICY IF EXISTS "自分の投稿のみ更新可能" ON posts;
DROP POLICY IF EXISTS "自分の投稿のみ削除可能" ON posts;
CREATE POLICY "全ユーザーが投稿を参照可能"       ON posts FOR SELECT USING (true);
CREATE POLICY "ログイン済みユーザーのみ投稿可能"  ON posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
CREATE POLICY "自分の投稿のみ更新可能"            ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "自分の投稿のみ削除可能"            ON posts FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- replies（Q&A 掲示板 — 返信）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS replies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body            TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  is_staff        BOOLEAN NOT NULL DEFAULT FALSE,
  likes           INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_replies_post_id ON replies(post_id);

ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "全ユーザーが返信を参照可能" ON replies;
DROP POLICY IF EXISTS "ログイン済みユーザーのみ返信可能" ON replies;
DROP POLICY IF EXISTS "自分の返信のみ更新可能" ON replies;
DROP POLICY IF EXISTS "自分の返信のみ削除可能" ON replies;
CREATE POLICY "全ユーザーが返信を参照可能"        ON replies FOR SELECT USING (true);
CREATE POLICY "ログイン済みユーザーのみ返信可能"   ON replies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
CREATE POLICY "自分の返信のみ更新可能"             ON replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "自分の返信のみ削除可能"             ON replies FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- upsert_learning_stats（RPC関数）
-- 回答1件ごとに呼び出し、learning_stats を更新する
-- auth.uid() = p_user_id を検証してセキュリティを担保する
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION upsert_learning_stats(
  p_user_id    UUID,
  p_subject    TEXT,
  p_unit       TEXT,
  p_subunit    TEXT,
  p_is_correct BOOLEAN,
  p_time_sec   INTEGER
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 呼び出し者本人のデータのみ更新可
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  INSERT INTO learning_stats (user_id, subject, unit, subunit, attempts, correct, avg_time_sec, last_practiced)
  VALUES (
    p_user_id, p_subject, p_unit, p_subunit,
    1,
    CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    p_time_sec::NUMERIC,
    NOW()
  )
  ON CONFLICT (user_id, subject, unit, subunit) DO UPDATE SET
    attempts      = learning_stats.attempts + 1,
    correct       = learning_stats.correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    avg_time_sec  = (learning_stats.avg_time_sec * learning_stats.attempts + p_time_sec) / (learning_stats.attempts + 1),
    last_practiced = NOW();
END;
$$;

-- ============================================================
-- 完了
-- スキーマを変更した場合は backend/supabase/migrations/ に記録し、
-- 経営企画部の承認を得てから本番 DB に適用してください。
-- ============================================================
