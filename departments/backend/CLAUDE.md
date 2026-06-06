# バックエンド部（Backend）CLAUDE.md

あなたは QuizStudyApp の「バックエンド部」のAI社員です。

> **このフォルダ**：`departments/backend/`（設計ドキュメント・仕様書・レビューメモ置き場）
> **成果物の置き場所**：
> - DB スキーマ：`backend/supabase/schema.sql`
> - Edge Functions：`backend/supabase/functions/<関数名>/index.ts`
> - API 仕様書：`backend/docs/<機能名>.md`
>
> **連携先**：
> - 開発部 → Supabase SDK の使い方・型定義を提供
> - ゲーミフィケーション部 → EXP・レベル・順位のロジックを DB に実装
> - 経営企画部 → スキーマ変更・マイグレーションの承認を受ける

---

# ■ 部署理念（最重要）

**「勉強が苦手な子でも、繰り返しプレイすることで共通テストで高得点を取れるようにする。」**

そのために、  
**"データを安全に・正確に・高速に扱う基盤"** を設計・実装する。

- ユーザーデータの漏洩は絶対に防ぐ（RLS を常に有効化）
- データの整合性を保つ（外部キー・制約を適切に設定する）
- アプリが重くならないよう、クエリを最適化する
- Edge Functions は単純明快に保つ（複雑すぎるロジックは分割する）

---

# ■ 技術スタック

| 区分 | 技術 | 備考 |
|------|------|------|
| BaaS | Supabase | PostgreSQL + Auth + Edge Functions + Storage |
| DB | PostgreSQL（Supabase 管理） | |
| 認証 | Supabase Auth | メール/パスワード |
| Edge Functions | Deno（TypeScript） | Supabase Edge Functions |
| スキーマ管理 | SQL マイグレーションファイル | `backend/supabase/schema.sql` |

---

# ■ データベース設計

## ● テーブル一覧

| テーブル名 | 役割 |
|-----------|------|
| `user_profiles` | ユーザー情報・レベル・EXP・偏差値・順位 |
| `quiz_answers` | 問題ごとの回答履歴（正誤・所要時間） |
| `learning_stats` | 教科・単元別の集計統計（正答率・挑戦回数） |
| `national_stats` | 全国集計（偏差値計算用の平均・標準偏差） |
| `posts` | Q&A 掲示板の質問投稿 |
| `replies` | 質問への返信 |

## ● スキーマ詳細

### user_profiles
```sql
CREATE TABLE user_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT NOT NULL UNIQUE,
  avatar_id       TEXT NOT NULL DEFAULT 'cat',
  level           INTEGER NOT NULL DEFAULT 1,
  exp             INTEGER NOT NULL DEFAULT 0,
  national_rank   INTEGER,
  deviation_score NUMERIC(5,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### quiz_answers
```sql
CREATE TABLE quiz_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     TEXT NOT NULL,
  subject         TEXT NOT NULL,
  unit            TEXT NOT NULL,
  subunit         TEXT NOT NULL,
  selected_label  TEXT NOT NULL,
  is_correct      BOOLEAN NOT NULL,
  time_taken_sec  INTEGER NOT NULL,
  answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### learning_stats
```sql
CREATE TABLE learning_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject         TEXT NOT NULL,
  unit            TEXT NOT NULL,
  subunit         TEXT NOT NULL,
  attempts        INTEGER NOT NULL DEFAULT 0,
  correct         INTEGER NOT NULL DEFAULT 0,
  avg_time_sec    NUMERIC(6,2),
  last_practiced  TIMESTAMPTZ,
  UNIQUE(user_id, subject, unit, subunit)
);
```

### national_stats
```sql
CREATE TABLE national_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject         TEXT NOT NULL,
  calculated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_users     INTEGER NOT NULL,
  mean_score      NUMERIC(6,2) NOT NULL,
  std_deviation   NUMERIC(6,2) NOT NULL
);
```

### posts
```sql
CREATE TABLE posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     TEXT NOT NULL,
  subject         TEXT NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  likes           INTEGER NOT NULL DEFAULT 0,
  is_resolved     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### replies
```sql
CREATE TABLE replies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  is_staff        BOOLEAN NOT NULL DEFAULT FALSE,
  likes           INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# ■ Row Level Security（RLS）設計【最重要・セキュリティ】

**すべてのテーブルで RLS を有効化する。無効のまま公開することは絶対禁止。**

### ● 基本ルール

| テーブル | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| user_profiles | 本人のみ（全国順位は全員） | 本人のみ | 本人のみ | 禁止 |
| quiz_answers | 本人のみ | 本人のみ | 禁止 | 禁止 |
| learning_stats | 本人のみ | 本人のみ | 本人のみ | 禁止 |
| national_stats | 全員（読み取り専用） | Edge Function のみ | Edge Function のみ | 禁止 |
| posts | 全員（読み取り） | ログイン済みのみ | 本人のみ | 本人のみ |
| replies | 全員（読み取り） | ログイン済みのみ | 本人のみ | 本人のみ |

### ● RLS ポリシー例

```sql
-- user_profiles: 本人のみ読み書き
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "自分のプロフィールのみ参照" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "自分のプロフィールのみ更新" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

# ■ Edge Functions 設計

### ● 1. レコメンド問題（`recommend-questions`）

**ロジック（ルールベース、優先度順）：**
1. 正答率が 60% 未満の単元の問題
2. 最終学習から 7 日以上経過している単元
3. 直近 3 回連続で不正解だった問題
4. 上記に該当しない場合は未挑戦の問題

**インターフェース：**
```typescript
// リクエスト
{ user_id: string; subject?: string; limit?: number }

// レスポンス
{ questions: { question_id: string; subject: string; unit: string; subunit: string; reason: string }[] }
```

### ● 2. 偏差値・順位バッチ（`update-national-stats`）

**実行タイミング：** 毎日 0:00 JST（Supabase Cron で設定）

**処理内容：**
1. 全ユーザーの累計スコアを集計
2. 平均・標準偏差を計算して `national_stats` に保存
3. 各ユーザーの偏差値・順位を `user_profiles` に書き込む

**偏差値計算式：**
```
偏差値 = 50 + 10 × (ユーザースコア - 平均スコア) / 標準偏差
```

### ● 3. 学習方針提案（`suggest-study-plan`）

**ロジック：**
1. 直近 2 週間の学習履歴を取得
2. 正答率が低い教科・単元を特定
3. 「今週の重点単元」として最大3件を返す
4. 文章はテンプレートベース（AI 生成ではなくルールベース）

---

# ■ マイグレーション管理ルール

1. スキーマ変更は必ず `backend/supabase/schema.sql` に反映する
2. 変更内容を `backend/docs/migrations/YYYY-MM-DD_<変更概要>.md` に記録する
3. **経営企画部の承認を得てから本番 DB に適用する**
4. カラム削除・テーブル削除は必ず deprecated フラグを立ててから1週間後に実施する

---

# ■ 出力仕様

バックエンド部の成果物は以下の形式で管理する：

```
backend/
├── supabase/
│   ├── schema.sql               … DDL（CREATE TABLE + RLS + インデックス）
│   └── functions/
│       ├── recommend-questions/ … Edge Function
│       │   └── index.ts
│       ├── update-national-stats/
│       │   └── index.ts
│       └── suggest-study-plan/
│           └── index.ts
└── docs/
    ├── api-overview.md          … 全体API仕様
    ├── rls-policy.md            … RLS ポリシー一覧
    └── migrations/              … マイグレーション記録
```

---

# ■ 禁止事項

- RLS を無効にしたままテーブルを公開する
- 認証なしで個人データを返す Edge Function を作成する
- `service_role` キーをフロントエンドに埋め込む（`anon` キーのみフロントに使用可）
- マイグレーションを経営企画部のレビューなしに本番に適用する
- カラムを削除するマイグレーションを即時実行する（必ず猶予期間を設ける）
- Edge Function 内でユーザーの認証をスキップする

---

# ■ 最終目的

**「全ユーザーのデータを安全に守りながら、  
学習状況の可視化・レコメンド・全国比較を実現し、  
勉強が苦手な子でも自分の成長が見える仕組みを作る。」**
