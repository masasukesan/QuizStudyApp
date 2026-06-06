/**
 * RankingPage — 全国順位・偏差値の表示
 */
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import type { NationalStats } from '../types/database'
import styles from './RankingPage.module.css'

/* 偏差値に対応する色・ラベル（Dark Codex テーマ） */
function getDeviationLabel(score: number) {
  if (score >= 70) return { label: 'S', color: '#e0c07a', bg: 'transparent' }
  if (score >= 65) return { label: 'A', color: '#5ab87a', bg: 'transparent' }
  if (score >= 55) return { label: 'B', color: '#7090b0', bg: 'transparent' }
  if (score >= 45) return { label: 'C', color: '#a890c8', bg: 'transparent' }
  return { label: 'D', color: 'rgba(201,168,106,0.4)', bg: 'transparent' }
}

/* 順位の表示 */
function rankDisplay(rank: number) {
  return `${rank}位`
}

export default function RankingPage() {
  const navigate = useNavigate()
  const { user }  = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id)

  /* 最新の全国統計を取得 */
  const { data: nationalStats } = useQuery<NationalStats[]>({
    queryKey: ['nationalStats'],
    staleTime: 60 * 60_000, // 1時間キャッシュ
    queryFn: async () => {
      const { data, error } = await supabase
        .from('national_stats')
        .select('*')
        .eq('subject', 'all')
        .order('calculated_at', { ascending: false })
        .limit(10)
      if (error) throw error
      return data ?? []
    },
  })

  if (profileLoading) {
    return (
      <div className={styles.loadingWrap}>
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!profile) {
    return <div className={styles.error}>プロフィールが見つかりません</div>
  }

  const devScore = profile.deviation_score
  const rank     = profile.national_rank
  const devInfo  = devScore != null ? getDeviationLabel(devScore) : null

  /* 最新の全国統計（全教科合計）を取得 */
  const latestStat = nationalStats && nationalStats.length > 0 ? nationalStats[0] : null

  /* フェーズ判定: 1/2 は参考値期間（<100人）*/
  const phase       = latestStat?.calculation_phase ?? 1
  const isReference = phase < 3

  return (
    <div className={styles.page}>
      {/* ヘッダー */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/profile')}>
          ← もどる
        </button>
        <h1 className={styles.title}>全国ランキング</h1>
        <div style={{ width: 60 }} />
      </header>

      {/* 偏差値カード */}
      <section className={styles.heroCard}>
        <p className={styles.heroLabel}>あなたの偏差値</p>
        {devScore != null && devInfo ? (
          <>
            <div className={styles.deviationWrap}>
              <span className={styles.deviationScore}>{devScore.toFixed(1)}</span>
              <span
                className={styles.deviationGrade}
                style={{ color: devInfo.color, background: devInfo.bg }}
              >
                {devInfo.label}
              </span>
            </div>
            {isReference ? (
              <p className={styles.heroSub}>偏差値 {devScore.toFixed(1)}（※参考値）</p>
            ) : (
              <p className={styles.heroSub}>偏差値 {devScore.toFixed(1)}</p>
            )}
          </>
        ) : (
          <div className={styles.noDataWrap}>
            <p className={styles.noDataMain}>データ集計中</p>
            <p className={styles.noDataSub}>問題を解くと偏差値が算出されます</p>
          </div>
        )}
      </section>

      {/* 全国順位カード */}
      <section className={styles.card}>
        <p className={styles.cardLabel}>全国順位</p>
        {!isReference && rank != null ? (
          <div className={styles.rankWrap}>
            <p className={styles.rankDisplay}>{rankDisplay(rank)}</p>
            {latestStat && (
              <p className={styles.rankSub}>全{latestStat.total_users.toLocaleString()}人中</p>
            )}
          </div>
        ) : (
          <p className={styles.pending}>
            {isReference ? '参加者が増えると確定します' : '集計待ち（毎日0:00に更新）'}
          </p>
        )}
      </section>

      {/* 全国統計サマリー */}
      {latestStat && (
        <section className={styles.card}>
          <p className={styles.cardLabel}>全国平均</p>
          <div className={styles.nationalGrid}>
            <div className={styles.nationalBox}>
              <p className={styles.nationalNum}>{latestStat.total_users.toLocaleString()}</p>
              <p className={styles.nationalCaption}>参加人数</p>
            </div>
            <div className={styles.nationalBox}>
              <p className={styles.nationalNum}>{latestStat.mean_score.toFixed(1)}</p>
              <p className={styles.nationalCaption}>平均スコア</p>
            </div>
            <div className={styles.nationalBox}>
              <p className={styles.nationalNum}>{latestStat.std_deviation.toFixed(1)}</p>
              <p className={styles.nationalCaption}>標準偏差</p>
            </div>
          </div>
          <p className={styles.calcAt}>
            最終更新: {new Date(latestStat.calculated_at).toLocaleString('ja-JP', {
              month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </section>
      )}

      {/* 偏差値の見方 */}
      <section className={styles.card}>
        <p className={styles.cardLabel}>偏差値の見方</p>
        <div className={styles.gradeTable}>
          {[
            { grade: 'S', range: '70以上', color: '#e0c07a', note: 'トップ2.3%' },
            { grade: 'A', range: '65〜69', color: '#5ab87a', note: '上位6.7%' },
            { grade: 'B', range: '55〜64', color: '#7090b0', note: '上位31%' },
            { grade: 'C', range: '45〜54', color: '#a890c8', note: '平均帯' },
            { grade: 'D', range: '44以下', color: 'rgba(201,168,106,0.4)', note: '要復習' },
          ].map(g => (
            <div key={g.grade} className={styles.gradeRow}>
              <span className={styles.gradeTag} style={{ color: g.color }}>
                {g.grade}
              </span>
              <span className={styles.gradeRange}>{g.range}</span>
              <span className={styles.gradeNote}>{g.note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 更新タイミングの説明 */}
      <section className={`${styles.card} ${styles.infoCard}`}>
        <p className={styles.infoText}>
          偏差値・順位は毎日 0:00 に自動更新されます。<br/>
          問題を解くほど集計に反映され、より正確な偏差値が算出されます。
        </p>
        {isReference && (
          <p className={styles.infoText} style={{ marginTop: '0.5rem', opacity: 0.7 }}>
            ※ 現在は参加者が少ないため、偏差値は仮の参考値です。<br/>
            全国のデータが集まるにつれて、より正確な値になります。
          </p>
        )}
      </section>

      <div className={styles.bottomSpacer} />
    </div>
  )
}
