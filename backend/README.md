# backend/ — StudyQuest バックエンド（Supabase）

このフォルダは StudyQuest のバックエンド設計・Supabase 管理ファイルを格納します。  
実際のサーバーは Supabase が管理するため、このフォルダは **設計書・スキーマ・Edge Functions のソースコード** を管理します。

---

## ■ フォルダ構成

```
backend/
├── README.md                    ← このファイル
├── supabase/
│   ├── schema.sql               ← DB スキーマ正本（必ずここが一次資料）
│   └── functions/               ← Edge Functions ソースコード
│       ├── recommend-questions/ ← レコメンド問題 API
│       │   └── index.ts
│       ├── update-national-stats/ ← 偏差値・順位バッチ（日次）
│       │   └── index.ts
│       └── suggest-study-plan/  ← 学習方針提案 API
│           └── index.ts
└── docs/
    ├── api-overview.md          ← 全体 API 仕様
    ├── rls-policy.md            ← RLS ポリシー一覧
    └── migrations/              ← スキーマ変更の記録
```

---

## ■ Supabase セットアップ手順

1. [supabase.com](https://supabase.com) でアカウント作成・新規プロジェクト作成
2. Supabase ダッシュボード → SQL Editor を開く
3. `backend/supabase/schema.sql` の内容をコピーして実行する
4. Table Editor で各テーブルが作成されていることを確認する
5. Authentication → Providers → Email を有効化する
6. Project Settings → API から `URL` と `anon key` を取得して `frontend/.env.local` に設定する

---

## ■ 重要ルール

- `schema.sql` を変更したら `docs/migrations/` にも変更内容を記録する
- 本番 DB へのスキーマ適用は**経営企画部の承認後**に行う
- `service_role` キーは絶対にフロントエンドや Git に記録しない
- すべてのテーブルで RLS を有効化する（無効のまま公開禁止）

詳細は `departments/backend/CLAUDE.md` を参照。
