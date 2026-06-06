# 全国成績管理・偏差値・順位 仕様書

> 作成: 2026-05-31  
> 担当: バックエンド部 / ゲーミフィケーション部  
> 対象ファイル:  
> - `backend/supabase/functions/update-national-stats/index.ts`  
> - `backend/supabase/schema.sql`  
> - `backend/supabase/migrations/2026-05-31_add-phase-to-national-stats.sql`  
> - `backend/supabase/migrations/2026-05-31_add-subject-scores-and-percentile.sql`

---

## 1. 設計思想

ユーザー数が少ない段階から偏差値・順位を表示するため、**3フェーズ切り替え方式**を採用する。  
フェーズは `national_stats.calculation_phase` に記録され、フロントの表示ロジックに使う。

| フェーズ | ユーザー数 | 算出方法 | フロント表示 |
|---------|-----------|---------|------------|
| **1** 仮想分布期 | < 30人 | 仮想ベンチマーク（固定値）を使用 | 偏差値の横に「※参考値」を表示 |
| **2** 移行期 | 30〜99人 | ベイズ収縮（実データ + 仮想の加重平均） | 偏差値の横に「※参考値」を表示 |
| **3** 実データ期 | ≥ 100人 | 純粋な実データのみ（回答10問未満を除外） | 通常表示 |

---

## 2. スコア定義

### 総合スコア
**`user_profiles.exp`（累計経験値）**  
EXP は難易度（basic=8 / standard=12 / exam=20）と正誤が反映済みのため、単純な正答率より公平。

### 教科別スコア
**正答率（correct / attempts × 100）**  
`learning_stats` の教科別集計から算出。0〜100 の範囲。

---

## 3. 偏差値計算式

```
偏差値 = 50 + 10 × (ユーザースコア − 有効平均) / 有効標準偏差
```

- 最小 0・最大 100 にクリップ
- 有効標準偏差 = 0 のときは偏差値 = 50 固定

### フェーズ別「有効平均・有効標準偏差」

**総合（EXPベース）**

| フェーズ | 有効平均 | 有効標準偏差 |
|---------|---------|-----------|
| 1 | 300（固定） | 200（固定） |
| 2 | `w × 実平均 + (1-w) × 300` | `w × 実σ + (1-w) × 200` |
| 3 | 実データの平均 | 実データのσ |

**教科別（正答率ベース）**

| フェーズ | 有効平均 | 有効標準偏差 |
|---------|---------|-----------|
| 1 | 55（固定） | 18（固定） |
| 2 | `w × 実平均 + (1-w) × 55` | `w × 実σ + (1-w) × 18` |
| 3 | 実データの平均 | 実データのσ |

ベイズ収縮の重み係数（フェーズ2）:
```
w = n / (n + 30)
```

---

## 4. パーセンタイル（上位○%）

```
パーセンタイル = (総人数 − 順位 + 1) / 総人数 × 100
```

- 1位（最高偏差値）→ 100%
- 最下位 → 100% / 総人数 に近い値
- `user_profiles.percentile` および `user_subject_scores.percentile` に保存

---

## 5. 時系列トレンド（偏差値の変化）

バッチ実行時に**前回の偏差値を `prev_deviation_score` に退避**してから新しい偏差値を書き込む。

```
トレンド = deviation_score - prev_deviation_score
```

- `prev_deviation_score` が null の場合はトレンド非表示（初回）
- 総合: `user_profiles.prev_deviation_score`
- 教科別: `user_subject_scores.prev_deviation_score`

---

## 6. 実行タイミング

- **毎日 0:00 JST**（Supabase Cron: `"0 15 * * *"` UTC）
- 1回のバッチで総合 + 5教科すべてを算出・保存する
- 手動実行: `Authorization: Bearer <CRON_SECRET>` ヘッダー付きで POST

---

## 7. DB テーブル

### `user_profiles`（総合の最新値）

| カラム | 型 | 説明 |
|-------|----|------|
| `national_rank` | INTEGER | 全国順位（null = データ蓄積中） |
| `deviation_score` | NUMERIC(5,2) | 総合偏差値（null = 同上） |
| `prev_deviation_score` | NUMERIC(5,2) | 前回の総合偏差値（トレンド用） |
| `percentile` | NUMERIC(5,2) | 上位○%（null = 同上） |

### `user_subject_scores`（教科別の最新値）

| カラム | 型 | 説明 |
|-------|----|------|
| `user_id` | UUID | ユーザーID |
| `subject` | TEXT | `math` / `japanese` / `english` / `science` / `social` |
| `deviation_score` | NUMERIC(5,2) | 教科別偏差値 |
| `prev_deviation_score` | NUMERIC(5,2) | 前回の教科別偏差値（トレンド用） |
| `national_rank` | INTEGER | 教科別順位 |
| `percentile` | NUMERIC(5,2) | 教科別パーセンタイル |

### `national_stats`（算出結果のスナップショット）

| カラム | 型 | 説明 |
|-------|----|------|
| `subject` | TEXT | `'all'` または教科名 |
| `total_users` | INTEGER | 集計対象ユーザー数 |
| `mean_score` | NUMERIC(6,2) | 有効平均 |
| `std_deviation` | NUMERIC(6,2) | 有効標準偏差 |
| `calculation_phase` | INTEGER | 1/2/3 |

---

## 8. フロントエンド実装ガイド

### データ取得

```typescript
// 総合スコア（本人のみ参照可）
const { data: profile } = await supabase
  .from('user_profiles')
  .select('national_rank, deviation_score, prev_deviation_score, percentile')
  .eq('id', userId)
  .single()

// 教科別スコア（本人のみ参照可）
const { data: subjectScores } = await supabase
  .from('user_subject_scores')
  .select('subject, deviation_score, prev_deviation_score, national_rank, percentile')
  .eq('user_id', userId)

// 最新バッチのフェーズ（全員が参照可）
const { data: latestStats } = await supabase
  .from('national_stats')
  .select('calculation_phase, total_users')
  .eq('subject', 'all')
  .order('calculated_at', { ascending: false })
  .limit(1)
  .single()
```

### 表示ロジック

```typescript
const phase = latestStats?.calculation_phase ?? 1
const isReference = phase < 3

// 偏差値
function renderDeviation(score: number | null): string {
  if (score === null) return '--'
  const val = score.toFixed(1)
  return isReference ? `${val}（※参考値）` : val
}

// パーセンタイル
function renderPercentile(percentile: number | null): string {
  if (percentile === null) return '--'
  const val = percentile.toFixed(1)
  const label = isReference ? '（※参考値）' : ''
  return `上位 ${val}%${label}`
}

// トレンド
function renderTrend(
  current: number | null,
  prev: number | null
): string {
  if (current === null || prev === null) return ''
  const diff = current - prev
  if (Math.abs(diff) < 0.1) return '→ 変化なし'
  return diff > 0
    ? `↑ +${diff.toFixed(1)}（先週比）`
    : `↓ ${diff.toFixed(1)}（先週比）`
}
```

### フェーズ別注釈テキスト

| フェーズ | 注釈 |
|---------|------|
| 1 | 「全国のデータが集まるにつれて、より正確な偏差値になります」 |
| 2 | 「データ蓄積中のため、偏差値は暫定値です」 |
| 3 | （注釈なし） |

---

## 9. セキュリティ注意事項

- `update-national-stats` は `service_role` キーを使用 → **フロントから直接呼び出し禁止**
- `CRON_SECRET` を Supabase Dashboard の Secrets に設定すること
- `national_stats` の INSERT/UPDATE は Edge Function（service_role）のみ（RLS 設定済み）
- `user_subject_scores` の SELECT は本人のみ（RLS 設定済み）
