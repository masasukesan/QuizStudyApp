# QuizStudyApp — デプロイ手順書

スマホからアクセスできるように公開するための手順です。

---

## ステップ1：Supabase の設定

### 1-1. DB スキーマを適用する

Supabase ダッシュボード → **SQL Editor** を開き、以下の2ファイルを順番に実行する。

1. `backend/supabase/schema.sql` — テーブル・RLS・インデックス
2. 下記の SQL を追加で実行（`upsert_learning_stats` RPC 関数）:

```sql
-- schema.sql の末尾に追記済みの内容と同じ
-- すでに schema.sql ごと実行していれば不要
```

> ✅ schema.sql の末尾に `upsert_learning_stats` 関数が含まれています。
> schema.sql を一括実行すれば追加 SQL は不要です。

### 1-2. Edge Functions をデプロイする

```bash
cd QuizStudyApp

# Supabase CLI をインストール（未インストールの場合）
brew install supabase/tap/supabase   # Mac
# または: npm install -g supabase

# ログイン
supabase login

# プロジェクトにリンク（Project ID は Supabase ダッシュボード → Settings → General）
supabase link --project-ref <your-project-id>

# 偏差値バッチをデプロイ
supabase functions deploy update-national-stats

# 学習方針提案をデプロイ
supabase functions deploy suggest-study-plan
```

### 1-3. 偏差値バッチのスケジュール設定

Supabase ダッシュボード → **Edge Functions** → `update-national-stats` → **Schedule**

| 設定項目 | 値 |
|---------|-----|
| Cron 式 | `0 15 * * *` |
| 説明 | 毎日 JST 0:00（UTC 15:00）に偏差値・順位を更新 |

---

## ステップ2：フロントエンドのビルド

### 2-1. 環境変数を設定する

```bash
cd frontend

# .env.local を作成（Git には含めない）
cp .env.example .env.local
```

`.env.local` を開いて Supabase の値を入力:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

> Supabase ダッシュボード → **Settings** → **API** から取得できます。

### 2-2. ビルドを実行する

```bash
cd frontend
npm install       # 初回のみ
npm run build     # → dist/ が生成される
```

ビルドが成功すると `frontend/dist/` フォルダが作成されます。

---

## ステップ3：さくらインターネットへのアップロード

### 3-1. FTP でアップロード

**アップロードするもの：** `frontend/dist/` の中身をすべて

**アップロード先：** さくらサーバーの `public_html/` 直下（またはサブディレクトリ）

推奨ツール：**FileZilla**（無料）

```
ローカル: frontend/dist/*
サーバー: /home/<アカウント名>/www/  または  public_html/
```

> ⚠️ `dist/` フォルダ自体ではなく、中身をアップロードしてください。

### 3-2. `.htaccess` の確認

`dist/` 内に `.htaccess` が含まれています（`public/.htaccess` からコピーされます）。
React Router の SPA ルーティングに必要なので、**削除しないでください**。

さくらサーバーで `.htaccess` が有効になっているか確認:
- コントロールパネル → **サーバー設定** → **.htaccess 有効** になっていること

### 3-3. rsync を使う場合（Mac/Linux）

```bash
rsync -avz --delete frontend/dist/ \
  <アカウント名>@<サーバーホスト>:/home/<アカウント名>/www/
```

---

## ステップ4：動作確認

### スマホから確認する手順

1. ブラウザ（Safari / Chrome）でサイトの URL を開く
2. ログインページが表示されることを確認
3. ログイン後、**教科選択 → クイズ → マイページ → ランキング** の順に動作確認
4. Supabase ダッシュボード → **Table Editor** → `quiz_answers` に回答データが保存されていることを確認

### ホーム画面に追加（PWA 的な使い方）

iPhone の場合:
- Safari でサイトを開く → 共有ボタン → **ホーム画面に追加**

Android の場合:
- Chrome でサイトを開く → メニュー → **ホーム画面に追加**

---

## よくあるトラブル

| 症状 | 原因と対処 |
|------|----------|
| ページをリロードすると 404 になる | `.htaccess` が正しくアップロードされていない or `.htaccess` が無効 |
| ログインできない | `.env.local` の Supabase URL / Anon Key が間違っている |
| 回答が DB に保存されない | Supabase の RLS ポリシーが正しく設定されていない。`schema.sql` を再実行 |
| 偏差値が表示されない | まだバッチが実行されていない（初回は手動で Edge Function を実行） |
| `upsert_learning_stats` エラー | schema.sql を Supabase SQL Editor で再実行する |

---

## 偏差値バッチを手動で実行する方法

初回は手動で実行して動作を確認してください。

**方法A：Supabase ダッシュボードから**
Edge Functions → `update-national-stats` → **Invoke** ボタンをクリック

**方法B：curl から**
```bash
curl -X POST \
  https://<your-project-id>.supabase.co/functions/v1/update-national-stats \
  -H "Authorization: Bearer <CRON_SECRET>"
```

---

## 環境変数一覧

| 変数名 | 説明 | 設定場所 |
|--------|------|---------|
| `VITE_SUPABASE_URL` | Supabase プロジェクト URL | フロントエンド `.env.local` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key | フロントエンド `.env.local` |
| `SUPABASE_URL` | （Edge Function 用）自動設定 | Supabase が自動で注入 |
| `SUPABASE_SERVICE_ROLE_KEY` | （Edge Function 用）自動設定 | Supabase が自動で注入 |
| `CRON_SECRET` | バッチ呼び出しの認証トークン（任意） | Supabase Edge Function Secrets |
