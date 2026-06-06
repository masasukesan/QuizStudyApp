# RLS（Row Level Security）ポリシー一覧

すべてのテーブルで RLS を有効化しています。  
このドキュメントは `backend/supabase/schema.sql` と常に同期させてください。

---

## テーブル別ポリシー一覧

| テーブル | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| `user_profiles` | 本人のみ | 本人のみ | 本人のみ | ❌ 禁止 |
| `quiz_answers` | 本人のみ | 本人のみ | ❌ 禁止 | ❌ 禁止 |
| `learning_stats` | 本人のみ | 本人のみ | 本人のみ | ❌ 禁止 |
| `national_stats` | 全員（読み取り専用） | Edge Function のみ | Edge Function のみ | ❌ 禁止 |
| `posts` | 全員 | ログイン済みのみ | 本人のみ | 本人のみ |
| `replies` | 全員 | ログイン済みのみ | 本人のみ | 本人のみ |

---

## 重要ルール

- `service_role` キーは Edge Function 内でのみ使用する
- フロントエンドには `anon` キーのみを渡す
- `anon` キーは RLS によって保護されているテーブルのみアクセス可能
- 新しいテーブルを追加する際は、必ず RLS を有効化してからポリシーを設定する
