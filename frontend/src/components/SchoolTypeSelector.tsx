/**
 * SchoolTypeSelector — 中学生 / 高校生 を選択するオーバーレイ
 * ・新規登録ステップ内での利用（embedded モード）
 * ・ログイン済みで school_type 未設定の既存ユーザー向けフルスクリーンモーダル
 */
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import type { UserProfile } from '../types/database'
import styles from './SchoolTypeSelector.module.css'

export type SchoolType = 'junior_high' | 'high_school'

interface Props {
  /** embedded=true のとき: モーダル枠なし・コールバックのみ */
  embedded?: boolean
  /** 選択後に呼ばれる（embedded 用） */
  onSelect?: (type: SchoolType) => void
  /** フルスクリーンモーダル用: ユーザーID を渡して DB 保存もここで行う */
  userId?: string
  /** DB 保存完了後のコールバック */
  onSaved?: () => void
}

export default function SchoolTypeSelector({ embedded, onSelect, userId, onSaved }: Props) {
  const [selected, setSelected] = useState<SchoolType | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const queryClient = useQueryClient()

  async function handleConfirm() {
    if (!selected) return
    if (embedded && onSelect) {
      onSelect(selected)
      return
    }
    if (!userId) return
    setLoading(true)
    setError(null)
    // まず UPDATE を試みる（既存プロフィール）
    const { data: updatedRows, error: updateErr } = await supabase
      .from('user_profiles')
      .update({ school_type: selected })
      .eq('id', userId)
      .select('id')
    const count = updatedRows?.length ?? 0

    // プロフィールが存在しない場合は最低限 INSERT する
    if (!updateErr && count === 0) {
      await supabase.from('user_profiles').insert({
        id: userId,
        username: 'ユーザー',
        avatar_id: 'cat',
        school_type: selected,
      })
    }
    setLoading(false)
    if (updateErr) {
      setError('保存に失敗しました。もう一度お試しください')
      return
    }
    // キャッシュを更新して再レンダリングを促す
    queryClient.setQueryData<UserProfile>(['profile', userId], prev =>
      prev ? { ...prev, school_type: selected } : { ...({} as UserProfile), id: userId, school_type: selected }
    )
    queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    onSaved?.()
  }

  const cards = [
    {
      type:    'junior_high' as SchoolType,
      label:   '中学生',
      emoji:   '📚',
      note:    '中1〜中3',
      color:   '#7090b0',
      glow:    'rgba(112, 144, 176, 0.35)',
      border:  'rgba(112, 144, 176, 0.6)',
    },
    {
      type:    'high_school' as SchoolType,
      label:   '高校生',
      emoji:   '🎓',
      note:    '高1〜高3',
      color:   '#e0c07a',
      glow:    'rgba(224, 192, 122, 0.35)',
      border:  'rgba(224, 192, 122, 0.6)',
    },
  ] as const

  const inner = (
    <div className={styles.inner}>
      <p className={styles.heading}>あなたは？</p>
      <p className={styles.sub}>ランキングは中学生・高校生で独立して集計されます</p>

      <div className={styles.cardRow}>
        {cards.map(c => {
          const isActive = selected === c.type
          return (
            <button
              key={c.type}
              type="button"
              className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
              style={{
                '--card-color':  c.color,
                '--card-glow':   c.glow,
                '--card-border': c.border,
              } as React.CSSProperties}
              onClick={() => setSelected(c.type)}
            >
              <span className={styles.cardEmoji}>{c.emoji}</span>
              <span className={styles.cardLabel}>{c.label}</span>
              <span className={styles.cardNote}>{c.note}</span>
              {isActive && <span className={styles.cardCheck} aria-hidden="true">✓</span>}
            </button>
          )
        })}
      </div>

      {error && (
        <p className={styles.error}>{error}</p>
      )}

      <button
        type="button"
        className={styles.confirmBtn}
        disabled={!selected || loading}
        onClick={handleConfirm}
      >
        {loading ? '保　存　中…' : selected ? '決　定' : '選択してください'}
      </button>
    </div>
  )

  if (embedded) return inner

  /* フルスクリーンモーダル（既存ユーザー向け）
     createPortal で document.body に直接マウントし stacking context の影響を排除 */
  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalDeco} aria-hidden="true">◆</div>
        {inner}
      </div>
    </div>,
    document.body
  )
}
