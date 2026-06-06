/**
 * useLearningStats — ユーザーの単元別学習統計を取得する
 */
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { LearningStats } from '../types/database'

export function useLearningStats(userId: string | undefined) {
  return useQuery<LearningStats[]>({
    queryKey: ['learningStats', userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_stats')
        .select('*')
        .eq('user_id', userId!)
        .order('last_practiced', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

/** 正答率が低い順に上位 N 件を返す（苦手単元） */
export function getWeakUnits(stats: LearningStats[], n = 5) {
  return [...stats]
    .filter(s => s.attempts >= 3)                        // 試行回数が少なすぎる単元は除外
    .sort((a, b) => {
      const rateA = a.correct / a.attempts
      const rateB = b.correct / b.attempts
      return rateA - rateB
    })
    .slice(0, n)
}

/** 教科ごとの正答率を集計する */
export function calcSubjectRates(stats: LearningStats[]) {
  const map: Record<string, { attempts: number; correct: number }> = {}
  for (const s of stats) {
    if (!map[s.subject]) map[s.subject] = { attempts: 0, correct: 0 }
    map[s.subject]!.attempts += s.attempts
    map[s.subject]!.correct  += s.correct
  }
  return Object.entries(map).map(([subject, v]) => ({
    subject,
    rate: v.attempts === 0 ? 0 : Math.round((v.correct / v.attempts) * 100),
    attempts: v.attempts,
  }))
}
