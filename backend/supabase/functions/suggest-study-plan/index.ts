/**
 * suggest-study-plan
 * ──────────────────
 * 認証済みユーザーの学習履歴から「今週の重点単元」を最大3件返す。
 * ルールベース（AI不使用）。
 *
 * GET /functions/v1/suggest-study-plan
 * Authorization: Bearer <supabase_anon_key>  + ログイン済み JWT
 *
 * レスポンス:
 * {
 *   plans: [
 *     { subject, unit, subunit, reason, priority }
 *   ]
 * }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
)

Deno.serve(async (req) => {
  /* JWT 認証 */
  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!jwt) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    /* 直近2週間の学習統計を取得 */
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

    const { data: stats, error } = await supabase
      .from('learning_stats')
      .select('*')
      .eq('user_id', user.id)
      .gte('last_practiced', twoWeeksAgo)

    if (error) throw error

    const candidates: {
      subject: string
      unit: string
      subunit: string
      reason: string
      priority: number
    }[] = []

    for (const s of (stats ?? [])) {
      if (s.attempts === 0) continue
      const rate = s.correct / s.attempts

      /* 優先度1: 正答率 60% 未満 */
      if (rate < 0.6) {
        candidates.push({
          subject:  s.subject,
          unit:     s.unit,
          subunit:  s.subunit,
          reason:   `正答率 ${Math.round(rate * 100)}% — 集中的に復習しましょう`,
          priority: 1,
        })
        continue
      }

      /* 優先度2: 最終学習から 7 日以上 */
      if (s.last_practiced) {
        const daysSince = (Date.now() - new Date(s.last_practiced).getTime()) / (1000 * 60 * 60 * 24)
        if (daysSince >= 7) {
          candidates.push({
            subject:  s.subject,
            unit:     s.unit,
            subunit:  s.subunit,
            reason:   `${Math.floor(daysSince)}日間学習していません — 忘却防止のため復習を`,
            priority: 2,
          })
        }
      }
    }

    /* 優先度順にソートし、上位3件を返す */
    const plans = candidates
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3)

    return new Response(
      JSON.stringify({ plans }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('suggest-study-plan error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
