# frontend/ — StudyQuest フロントエンド（React/Vite）

このフォルダは StudyQuest アプリのフロントエンド本体です。  
ビルド後の `dist/` をさくらインターネット レンタルサーバーにアップロードして配信します。

---

## ■ 技術スタック

| 区分 | 技術 |
|------|------|
| UI | React 18 |
| ビルドツール | Vite 5 |
| 言語 | TypeScript 5（strict: true 必須） |
| ルーティング | React Router v6 |
| データ取得 | TanStack Query v5 |
| バックエンド通信 | Supabase JS SDK v2 |
| スタイル | CSS Modules + CSS 変数 |

---

## ■ 初期セットアップ

```bash
# 依存パッケージのインストール
npm install

# 環境変数ファイルを作成（.env.local は .gitignore 済み）
cp .env.example .env.local
# VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を記入する

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build
# → dist/ フォルダが生成される
```

---

## ■ フォルダ構成

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json          ← strict: true 設定済み
├── package.json
├── .env.example           ← 環境変数テンプレート
├── .gitignore             ← .env.local を含む
├── public/
│   └── media/
│       ├── images/        ← assets部署からの納品（SVG/PNG）
│       └── audio/         ← assets部署からの納品（mp3/ogg）
└── src/
    ├── main.tsx
    ├── App.tsx            ← ルーティング定義
    ├── index.css          ← CSS 変数（Pastel Candy テーマ）
    ├── lib/
    │   └── supabase.ts    ← Supabase クライアント（唯一の接続口）
    ├── types/
    │   └── database.ts    ← DB テーブルの型定義
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useQuiz.ts
    │   ├── useProfile.ts
    │   ├── useRecommend.ts
    │   └── usePosts.ts
    ├── components/
    │   ├── ui/            ← Button, Card, Badge, Modal 等
    │   ├── quiz/          ← QuizCard, ChoiceButton, Timer 等
    │   ├── profile/       ← LevelBar, BadgeList, StatsChart 等
    │   └── posts/         ← PostCard, ReplyForm 等
    └── pages/
        ├── LoginPage.tsx
        ├── SubjectPage.tsx
        ├── CoursePage.tsx
        ├── UnitPage.tsx
        ├── QuizPage.tsx
        ├── ResultPage.tsx
        ├── ProfilePage.tsx
        ├── RankingPage.tsx
        ├── RecommendPage.tsx
        └── PostsPage.tsx
```

---

## ■ さくらレンタルサーバーへのデプロイ手順

1. `npm run build` を実行し `dist/` を生成する
2. FTP クライアント（または rsync）で `dist/` の中身をさくらの公開フォルダにアップロードする
3. さくらの `.htaccess` に SPA 用リダイレクト設定を追記する（React Router 対応）

```apache
# .htaccess（さくらのルート公開フォルダに設置）
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## ■ 開発ルール

詳細は `departments/development/CLAUDE.md` を参照。

- `any` 型の使用禁止
- Supabase SDK 以外で DB に直接アクセスしない
- `localStorage` にユーザーデータを保存しない（DB に保存）
- 環境変数は `.env.local` で管理し、コミットしない
