/**
 * useProfile — ログイン中ユーザーのプロフィールを取得・キャッシュする
 * ログイン時にストリーク（連続日数）を自動更新する
 */
import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../types/database'

export function useProfile(userId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery<UserProfile>({
    queryKey: ['profile', userId],
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 5,
    retryDelay: 500,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId!)
        .single()
      if (error) throw error
      return data
    },
  })

  /* ── ストリーク更新（プロフィール取得後に1度だけ実行） ── */
  useEffect(() => {
    const profile = query.data
    if (!userId || !profile) return

    const todayJST = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
    ).toISOString().slice(0, 10) // "YYYY-MM-DD"

    // 今日すでに更新済みなら何もしない
    if (profile.last_login_date === todayJST) return

    const lastDate = profile.last_login_date
      ? new Date(profile.last_login_date)
      : null

    const yesterday = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
    )
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    // 昨日ログインしていれば連続、それ以外はリセット
    const newStreak =
      lastDate && profile.last_login_date === yesterdayStr
        ? profile.streak_days + 1
        : 1

    supabase
      .from('user_profiles')
      .update({
        streak_days:     newStreak,
        last_login_date: todayJST,
      })
      .eq('id', userId)
      .then(({ error }) => {
        if (error) {
          console.error('ストリーク更新失敗:', error)
          return
        }
        // キャッシュを楽観的に更新
        queryClient.setQueryData<UserProfile>(['profile', userId], prev =>
          prev ? { ...prev, streak_days: newStreak, last_login_date: todayJST } : prev
        )
      })
  // profile.id が確定したときだけ実行（ログイン直後の1回）
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, query.data?.id])

  return query
}
