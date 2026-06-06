# AI チャット機能 セットアップ手順

解説ページに「AIに質問する」ボタンを追加しました。  
OpenAI API を Supabase Edge Function 経由で呼び出す安全な構成です。

---

## 構成図

```
解説パネル（ブラウザ）
  └─ Supabase Edge Function（ai-chat）  ← APIキーはここに保管
       └─ OpenAI API（gpt-4o-mini）
```

---

## ステップ 1：OpenAI API キーを取得する

1. https://platform.openai.com/api-keys にアクセス
2. 「Create new secret key」でキーを作成
3. 文字列（`sk-...`）をコピーしておく

> **コスト管理のため、OpenAI ダッシュボードで月額上限（Usage limits）を設定することを推奨します。**

---

## ステップ 2：Supabase CLI をインストールする

```bash
# macOS / Linux
brew install supabase/tap/supabase

# Windows（npm 経由）
npm install -g supabase
```

---

## ステップ 3：Supabase にログインしてプロジェクトをリンクする

```bash
supabase login
# ブラウザが開くので Supabase アカウントでログイン

supabase link --project-ref <プロジェクトのREF>
# REF は Supabase ダッシュボード → Project Settings → General に表示される
```

---

## ステップ 4：OpenAI API キーを Secret として登録する

```bash
supabase secrets set OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

これでキーはサーバー側のみに保存され、フロントエンドには一切露出しません。

---

## ステップ 5：Edge Function をデプロイする

```bash
# プロジェクトルート（QuizStudyApp/）から実行
supabase functions deploy ai-chat
```

デプロイ完了後、Supabase ダッシュボードの「Edge Functions」に `ai-chat` が表示されます。

---

## ステップ 6：動作確認

1. `npm run dev` でフロントエンドを起動
2. クイズを解いて解説パネルを開く
3. 「🤖 AIに質問する」ボタンをタップ
4. 質問を入力して「送信」

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| 「接続に失敗しました」と表示 | Edge Function 未デプロイ | ステップ5を実行する |
| 「OPENAI_API_KEY が設定されていません」 | Secret 未登録 | ステップ4を実行する |
| 回答が来ない（ローディングのまま） | OpenAI 残高不足 | platform.openai.com で残高確認 |

---

## ファイル一覧（追加・変更されたファイル）

```
supabase/
└── functions/
    └── ai-chat/
        └── index.ts          ← Edge Function（NEW）

frontend/src/
├── components/
│   ├── AIChat.tsx            ← チャットコンポーネント（NEW）
│   └── AIChat.module.css     ← スタイル（NEW）
└── pages/
    └── QuizPage.tsx          ← AIChat を解説パネルに追加（UPDATED）
```
