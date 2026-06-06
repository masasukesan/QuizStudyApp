/**
 * update-national-stats
 * ─────────────────────
 * 毎日 0:00 JST に Supabase Cron（pg_cron）から呼び出す。
 * 全ユーザーの EXP を集計し、フェーズ別ロジックで偏差値・順位・
 * パーセンタイル・トレンドを算出して保存する。
 *
 * デプロイ:
 *   supabase functions deploy update-national-stats
 *
 * Cron 設定（Supabase Dashboard > Edge Functions > Scheduled):
 *   cron: "0 15 * * *"  (UTC 15:00 = JST 0:00)
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ■ 処理の流れ
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  1. 総合偏差値・順位・パーセンタイル・前回偏差値を算出
 *     → user_profiles を更新
 *  2. 教科別（math / japanese / english / science / social）も同様に算出
 *     → user_subject_scores を upsert
 *  3. national_stats にスナップショットを保存（総合 + 教科別）
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ■ フェーズ別算出ロジック
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  フェーズ1（< 30人）   : 仮想分布（PRIOR_MEAN / PRIOR_STD）で固定
 *  フェーズ2（30〜99人） : ベイズ収縮（実 + 仮想の加重平均）
 *  フェーズ3（≥ 100人）  : 実データのみ（回答 MIN_ATTEMPTS 問未満を除外）
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ■ スコア定義
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  総合スコア  : user_profiles.exp（難易度 × 正誤が反映済みの累計経験値）
 *  教科別スコア: learning_stats の正答率（correct / attempts × 100）
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// ─── 定数 ────────────────────────────────────────────────
// ※ フロントエンドのURL param と合わせること（国語は 'kokugo'）
const SUBJECTS = ['math', 'kokugo', 'english', 'science', 'social'] as const
type Subject = typeof SUBJECTS[number]

/** フェーズ1/2 仮想分布（総合 EXP ベース） */
const PRIOR_MEAN_OVERALL = 300
const PRIOR_STD_OVERALL  = 200

/** フェーズ1/2 仮想分布（教科別正答率ベース、0〜100） */
const PRIOR_MEAN_SUBJECT = 55
const PRIOR_STD_SUBJECT  = 18

/** ベイズ収縮係数 */
const PRIOR_WEIGHT = 30

/** フェーズ3 外れ値除外: 総回答数がこの値未満のユーザーを除外 */
const MIN_ATTEMPTS = 10

// ─── ユーティリティ ──────────────────────────────────────
function getPhase(n: number): 1 | 2 | 3 {
  if (n < 30) return 1
  if (n < 100) return 2
  return 3
}

function calcStats(scores: number[]): { mean: number; std: number } {
  if (scores.length === 0) return { mean: 0, std: 0 }
  const mean = scores.reduce((s, v) => s + v, 0) / scores.length
  const variance = scores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / scores.length
  return { mean, std: Math.sqrt(variance) }
}

function bayesShrink(
  actual: { mean: number; std: number },
  prior:  { mean: number; std: number },
  n: number,
): { mean: number; std: number } {
  const w = n / (n + PRIOR_WEIGHT)
  return {
    mean: w * actual.mean + (1 - w) * prior.mean,
    std:  w * actual.std  + (1 - w) * prior.std,
  }
}

function effectiveStats(
  actual: { mean: number; std: number },
  prior:  { mean: number; std: number },
  n: number,
  phase: 1 | 2 | 3,
): { mean: number; std: number } {
  if (phase === 1) return prior
  if (phase === 2) return bayesShrink(actual, prior, n)
  return actual
}

function calcDeviation(score: number, mean: number, std: number): number {
  if (std === 0) return 50
  const raw = 50 + 10 * (score - mean) / std
  return Math.min(100, Math.max(0, round2(raw)))
}

/** パーセンタイル: 上位何パーセントか（rank=1 → 100%） */
function calcPercentile(rank: number, total: number): number {
  if (total === 0) return 0
  return round2(((total - rank + 1) / total) * 100)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ─── メイン ──────────────────────────────────────────────
Deno.serve(async (req) => {
  /* 認証チェック */
  const authHeader = req.headers.get('Authorization')
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const result = await runBatch()
    return json({ success: true, ...result })
  } catch (err) {
    console.error('update-national-stats error:', err)
    return json({ error: String(err) }, 500)
  }
})

// ─── バッチ本体 ───────────────────────────────────────────
async function runBatch() {
  /* ① user_profiles（EXP・現在の偏差値）を全件取得 */
  const { data: profiles, error: e1 } = await supabaseAdmin
    .from('user_profiles')
    .select('id, exp, deviation_score')
  if (e1) throw e1
  if (!profiles?.length) return { message: 'No users found' }

  /* ② learning_stats（教科別 attempts / correct）を全件取得 */
  const { data: statsRows, error: e2 } = await supabaseAdmin
    .from('learning_stats')
    .select('user_id, subject, attempts, correct')
  if (e2) throw e2

  // ユーザーごとの総回答数
  const userTotalAttempts = new Map<string, number>()
  // ユーザー × 教科の正答率
  const subjectMap = new Map<string, Map<Subject, { attempts: number; correct: number }>>()

  for (const row of statsRows ?? []) {
    // 総回答数
    userTotalAttempts.set(row.user_id, (userTotalAttempts.get(row.user_id) ?? 0) + row.attempts)

    // 教科別集計
    if (!subjectMap.has(row.user_id)) subjectMap.set(row.user_id, new Map())
    const subj = row.subject as Subject
    if (!SUBJECTS.includes(subj)) continue
    const prev = subjectMap.get(row.user_id)!.get(subj) ?? { attempts: 0, correct: 0 }
    subjectMap.get(row.user_id)!.set(subj, {
      attempts: prev.attempts + row.attempts,
      correct:  prev.correct  + row.correct,
    })
  }

  /* ③ 総合偏差値・順位・パーセンタイルを計算 */
  const overallResult = await calcAndSaveOverall(profiles, userTotalAttempts)

  /* ④ 教科別偏差値・順位・パーセンタイルを計算 */
  const subjectResults: Record<string, unknown> = {}
  for (const subj of SUBJECTS) {
    subjectResults[subj] = await calcAndSaveSubject(subj, subjectMap, profiles.length)
  }

  return { overall: overallResult, subjects: subjectResults }
}

// ─── 総合偏差値算出・保存 ─────────────────────────────────
async function calcAndSaveOverall(
  profiles: { id: string; exp: number; deviation_score: number | null }[],
  userTotalAttempts: Map<string, number>,
) {
  const phase = getPhase(profiles.length)
  const prior = { mean: PRIOR_MEAN_OVERALL, std: PRIOR_STD_OVERALL }

  // フェーズ3 は回答数不足ユーザーを除外
  const eligible = phase === 3
    ? profiles.filter(p => (userTotalAttempts.get(p.id) ?? 0) >= MIN_ATTEMPTS)
    : profiles

  const scores = eligible.map(p => p.exp)
  const actual  = calcStats(scores)
  const eff     = effectiveStats(actual, prior, eligible.length, phase)

  // national_stats に保存
  await supabaseAdmin.from('national_stats').insert({
    subject: 'all',
    total_users: eligible.length,
    mean_score:    round2(eff.mean),
    std_deviation: round2(eff.std),
    calculation_phase: phase,
  })

  // 偏差値・順位・パーセンタイルを計算
  const ranked = eligible
    .map(p => ({
      id:             p.id,
      prevDeviation:  p.deviation_score,  // 前回値を保持
      deviation:      calcDeviation(p.exp, eff.mean, eff.std),
    }))
    .sort((a, b) => b.deviation - a.deviation)

  const total = ranked.length
  const eligibleSet = new Set(eligible.map(p => p.id))

  // バッチ更新（50件ずつ）
  const BATCH = 50
  for (let i = 0; i < ranked.length; i += BATCH) {
    const batch = ranked.slice(i, i + BATCH)
    for (const u of batch) {
      const rank = ranked.indexOf(u) + 1
      await supabaseAdmin.from('user_profiles').update({
        prev_deviation_score: u.prevDeviation,
        deviation_score:      u.deviation,
        national_rank:        rank,
        percentile:           calcPercentile(rank, total),
      }).eq('id', u.id)
    }
  }

  // 除外ユーザーはリセット
  const excluded = profiles.filter(p => !eligibleSet.has(p.id))
  for (let i = 0; i < excluded.length; i += BATCH) {
    for (const p of excluded.slice(i, i + BATCH)) {
      await supabaseAdmin.from('user_profiles').update({
        prev_deviation_score: p.deviation_score,  // リセット前の値を prev に退避
        deviation_score:      null,
        national_rank:        null,
        percentile:           null,
      }).eq('id', p.id)
    }
  }

  return {
    phase,
    total_users: profiles.length,
    scored_users: eligible.length,
    effective_mean: round2(eff.mean),
    effective_std:  round2(eff.std),
  }
}

// ─── 教科別偏差値算出・保存 ───────────────────────────────
async function calcAndSaveSubject(
  subject: Subject,
  subjectMap: Map<string, Map<Subject, { attempts: number; correct: number }>>,
  totalUserCount: number,
) {
  // 教科に回答実績があるユーザーのみ対象
  const entries: { userId: string; score: number }[] = []
  for (const [userId, subjData] of subjectMap.entries()) {
    const s = subjData.get(subject)
    if (s && s.attempts > 0) {
      entries.push({ userId, score: round2((s.correct / s.attempts) * 100) })
    }
  }

  if (entries.length === 0) return { scored_users: 0 }

  const phase = getPhase(entries.length)  // 教科ごとの解答者数でフェーズ判定
  const prior  = { mean: PRIOR_MEAN_SUBJECT, std: PRIOR_STD_SUBJECT }
  const actual = calcStats(entries.map(e => e.score))
  const eff    = effectiveStats(actual, prior, entries.length, phase)

  // national_stats（教科別）に保存
  await supabaseAdmin.from('national_stats').insert({
    subject,
    total_users:   entries.length,
    mean_score:    round2(eff.mean),
    std_deviation: round2(eff.std),
    calculation_phase: phase,
  })

  // 偏差値・順位・パーセンタイルを計算してソート
  const ranked = entries
    .map(e => ({
      userId:    e.userId,
      deviation: calcDeviation(e.score, eff.mean, eff.std),
    }))
    .sort((a, b) => b.deviation - a.deviation)

  const total = ranked.length
  const BATCH = 50

  // user_subject_scores を upsert
  for (let i = 0; i < ranked.length; i += BATCH) {
    const batch = ranked.slice(i, i + BATCH)
    for (const u of batch) {
      const rank = ranked.indexOf(u) + 1

      // 前回値を取得
      const { data: existing } = await supabaseAdmin
        .from('user_subject_scores')
        .select('deviation_score')
        .eq('user_id', u.userId)
        .eq('subject', subject)
        .maybeSingle()

      await supabaseAdmin.from('user_subject_scores').upsert({
        user_id:              u.userId,
        subject,
        prev_deviation_score: existing?.deviation_score ?? null,
        deviation_score:      u.deviation,
        national_rank:        rank,
        percentile:           calcPercentile(rank, total),
        updated_at:           new Date().toISOString(),
      }, { onConflict: 'user_id,subject' })
    }
  }

  return {
    phase,
    scored_users:   entries.length,
    effective_mean: round2(eff.mean),
    effective_std:  round2(eff.std),
  }
}
