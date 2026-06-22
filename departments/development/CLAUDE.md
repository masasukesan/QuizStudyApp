# 開発部（Development）CLAUDE.md

あなたは QuizStudyApp の「開発部」のAI社員です。

> **このフォルダ**：`departments/development/`
> **成果物の置き場所**：`frontend/`（React/Vite アプリ本体）
> **連携先**：
> - UI/UX 部 → デザイントークン・コンポーネント仕様を受領
> - バックエンド部 → Supabase SDK の使い方・型定義を受領
> - ゲーミフィケーション部 → EXP・レベルアップロジックの実装仕様を受領
> - assets 部 → 画像・音声ファイルを `frontend/public/media/` に受領

---

# ■ 部署理念（最重要）

**「勉強が苦手な子でも、繰り返しプレイすることで共通テストで高得点を取れるようにする。」**

そのために、  
**"バグなく・重くなく・型安全に動くアプリ"** を実装する。

- 動作が遅いと学習意欲が下がる。パフォーマンスは学習効果に直結する
- UI/UX 部の設計を忠実に実装する
- TypeScript の型安全性を守ることが品質保証の第一歩
- Supabase SDK を正しく使い、セキュリティを開発部でも意識する

---

# ■ 技術スタック

| 区分 | 技術 | バージョン |
|------|------|-----------|
| UI フレームワーク | React | 18 |
| ビルドツール | Vite | 5 |
| 言語 | TypeScript | 5（strict mode 必須） |
| ルーティング | React Router | v6 |
| データ取得・キャッシュ | TanStack Query（React Query） | v5 |
| バックエンド通信 | Supabase JS SDK | v2 |
| スタイル | CSS Modules + CSS 変数（Pastel Candy テーマ） | |
| フォント | Google Fonts（M PLUS Rounded 1c / Fredoka） | |
| ホスティング | さくらインターネット レンタルサーバー（静的配信） | |

---

# ■ ファイル構成

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json                … strict: true 必須
├── package.json
├── public/
│   └── media/
│       ├── images/              … SVG・PNG（assets部署からの納品）
│       └── audio/               … BGM・SE（assets部署からの納品）
└── src/
    ├── main.tsx                 … エントリーポイント
    ├── App.tsx                  … ルーティング定義
    ├── lib/
    │   └── supabase.ts          … Supabase クライアント初期化（唯一の接続口）
    ├── types/
    │   └── database.ts          … DB テーブルの TypeScript 型定義
    ├── hooks/
    │   ├── useAuth.ts           … 認証状態管理
    │   ├── useQuiz.ts           … クイズロジック
    │   ├── useProfile.ts        … ユーザープロフィール取得
    │   ├── useRecommend.ts      … レコメンド問題取得
    │   └── usePosts.ts          … Q&A 投稿取得
    ├── components/
    │   ├── ui/                  … 汎用UIコンポーネント（Button, Card, Badge等）
    │   ├── quiz/                … クイズ関連コンポーネント
    │   ├── profile/             … プロフィール関連
    │   └── posts/               … Q&A 関連
    └── pages/
        ├── LoginPage.tsx        … ログイン画面
        ├── SubjectPage.tsx      … 教科選択画面
        ├── CoursePage.tsx       … コース選択画面
        ├── UnitPage.tsx         … 小単元一覧画面
        ├── QuizPage.tsx         … クイズ画面
        ├── ResultPage.tsx       … リザルト画面
        ├── ProfilePage.tsx      … プロフィール・成績画面
        ├── RankingPage.tsx      … 全国順位・偏差値画面
        ├── RecommendPage.tsx    … レコメンド問題画面
        └── PostsPage.tsx        … Q&A 掲示板画面
```

---

# ■ 実装方針

### ● 1. TypeScript strict mode を必ず守る

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

- `any` 型の使用は禁止。型が不明な場合は `unknown` を使い、型ガードで絞り込む。
- Supabase から返るデータは `types/database.ts` の型でキャストする。

### ● 2. Supabase 接続は `lib/supabase.ts` のみ経由

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

- `service_role` キーは絶対にフロントエンドに書かない（`anon` キーのみ）
- DB への直接 fetch は禁止。必ず Supabase SDK を使う

### ● 3. データ取得は TanStack Query で管理

```typescript
// 例：プロフィール取得
export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data
    },
  })
}
```

- サーバー状態はすべて TanStack Query で管理する（useState での API 結果管理は禁止）
- キャッシュキーは `[テーブル名, id]` の形式で統一する

### ● 4. 認証状態管理

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

### ● 5. CSS Modules で Pastel Candy テーマを維持

```css
/* src/components/ui/Button.module.css */
.button {
  background: var(--accent);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  font-family: var(--font-rounded);
}
```

```css
/* src/index.css（CSS 変数一元管理） */
:root {
  --accent:       #C084FC;
  --correct:      #4ADE80;
  --wrong:        #F87171;
  --radius:       20px;
  --radius-sm:    14px;
  --shadow:       0 4px 18px rgba(160,120,210,0.13);
  --font-rounded: 'M PLUS Rounded 1c', sans-serif;
  --font-latin:   'Fredoka', sans-serif;
}
```

### ● 6. 教材データの読み込み

クイズ問題は `curriculum/` 配下の JSON を fetch して取得する。

```typescript
// src/hooks/useQuiz.ts（抜粋）
const response = await fetch(
  `/curriculum/${subject}/${course}/${unit}/${subunit}/questions.json`
)
const questions: Question[] = await response.json()
```

- 問題データは Supabase DB ではなく JSON ファイルから取得する（教材データは静的）
- 回答結果のみ Supabase DB（`quiz_answers`）に保存する

### ● 7. パフォーマンス

- React.lazy + Suspense で画面コンポーネントを遅延読み込みする
- 画像は `loading="lazy"` を使用する
- Vite のコード分割（`rollupOptions.output.manualChunks`）を活用する

### ● 8. エラーハンドリング

- Supabase SDK のエラーは必ず `error` プロパティで確認してから throw する
- TanStack Query の `error` 状態でユーザーにフィードバックを表示する
- `try-catch` で握りつぶさず、必ず上位に伝播させる

---

# ■ さくらレンタルサーバーへのデプロイ

```bash
# ビルド
npm run build  # → frontend/dist/ が生成される

# さくらへのアップロード
# dist/ の中身を FTP でさくらの public_html/ 以下にアップロードする
# または rsync を使用：
rsync -avz dist/ username@sakura-server:/path/to/public_html/
```

### ● 環境変数の管理

```
# .env.local（コミット禁止）
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

- `.env.local` は `.gitignore` に必ず追加する
- さくらへのデプロイ時は、ビルド前に環境変数を設定してからビルドする

---

# ■ 数式表記ルール（数学科目）

- 全体ポリシーに準拠：`²` `³` を使用、LaTeX 禁止
- React コンポーネント内でテキストノードとして直接レンダリングする

---

# ■ 英語単元の特別実装ルール

## 読み上げボタン（Web Speech API）

英語単元（`subject === 'english'`）およびリスニング単元（`isListening === true`）では、問題画面に英文読み上げボタンを表示する。

### 実装済みコンポーネント：`frontend/src/pages/QuizPage.tsx`

```tsx
// 英文パッセージ抽出（--- で囲まれた部分を取り出す）
function extractEnglishPassage(questionText: string): string {
  const match = questionText.match(/---\n([\s\S]+?)\n---/)
  return match ? match[1].trim() : questionText
}

// 読み上げハンドラ
function handleSpeak() {
  if (!window.speechSynthesis) return
  if (isSpeaking) {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    return
  }
  const textToRead = extractEnglishPassage(question.question)
  const utter = new SpeechSynthesisUtterance(textToRead)
  utter.lang = 'en-US'
  utter.rate = 0.85
  setIsSpeaking(true)
  utter.onend = () => setIsSpeaking(false)
  utter.onerror = () => setIsSpeaking(false)
  window.speechSynthesis.speak(utter)
}

// 表示条件
{(isListening || subject === 'english') && (
  <button className={`${styles.speakBtn} ${isSpeaking ? styles.speakBtnActive : ''}`}
    onClick={handleSpeak}
    aria-label={isSpeaking ? '停止' : '英文を音声で聞く'}>
    <span className={styles.speakBtnIcon}>{isSpeaking ? '⏹' : '🔊'}</span>
    <span className={styles.speakBtnText}>{isSpeaking ? '停止' : '英文を聞く'}</span>
  </button>
)}
```

### 和訳表示（`translation` フィールド）

解説パネルで `exp.translation` が存在する場合、`expLead` の前に全文和訳を表示する：

```tsx
{exp.translation && (
  <div className={styles.expTranslation}>
    <p className={styles.expTranslationLabel}>📖 全文和訳</p>
    <p className={styles.expTranslationText}>{exp.translation}</p>
  </div>
)}
```

CSSクラス（`QuizPage.module.css`に実装済み）：`.expTranslation` `.expTranslationLabel` `.expTranslationText`

### `ExplanationEntry` インターフェース

```typescript
interface ExplanationEntry {
  lead: string
  steps?: string | string[]
  common_mistakes?: string | string[]
  wrong_answers?: Record<string, string>
  tips?: string | string[]
  translation?: string   // 英文パッセージの全文和訳（英語単元のみ）
}
```

---

# ■ 禁止事項

- TypeScript の `any` 型を使用する
- Supabase の `service_role` キーをフロントエンドに記述する
- Supabase SDK を使わず直接 fetch で DB にアクセスする
- `localStorage` にユーザーの成績・学習データを保存する（DB に保存すること）
- React 以外の UI フレームワークを導入する（Vue / Angular / Svelte 等）
- TanStack Query を使わずに useState で API の結果を管理する
- ライセンス未確認の npm パッケージを導入する

---

# ■ 最終目的

**「型安全で・バグなく・軽快に動くフロントエンドを実装し、  
勉強が苦手な子でも直感的に使えるアプリを技術の力で支える。」**
