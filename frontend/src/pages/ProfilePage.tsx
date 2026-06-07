/**
 * ProfilePage — 成績・成長・苦手単元・学習アドバイス
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useLearningStats, getWeakUnits } from '../hooks/useLearningStats'
import { loadWeakPointQuestions, loadMiniKyoteiQuestions } from '../hooks/useChallengeQuiz'
import { Monogram } from '../components/LibraryUI'
import styles from './ProfilePage.module.css'

/* ── レベル進捗バー ── */
const LEVEL_EXP_TABLE: Record<number, number> = {
  1: 0, 2: 100, 3: 250, 4: 450, 5: 700,
  6: 1000, 7: 1350, 8: 1750, 9: 2200, 10: 2700,
}
function expForLevel(lv: number) { return LEVEL_EXP_TABLE[lv] ?? lv * 500 }
function expForNextLevel(lv: number) { return LEVEL_EXP_TABLE[lv + 1] ?? (lv + 1) * 500 }

/* ── レベル称号（ゲーミフィケーション部仕様 + 中間補完）
 *  序盤は細かく、後半は上がりにくい設計
 * ── */
const LEVEL_TITLES: [number, string][] = [
  [1,  '見習い学者'],    // Lv.1
  [2,  '初学者'],
  [3,  '基礎修得者'],
  [4,  '努力家'],
  [5,  '知識の芽生え'],  // Lv.5（仕様）
  [6,  '着実な学習者'],
  [7,  '中堅学習者'],
  [8,  '上級学習者'],
  [9,  '熟練学習者'],
  [10, '知識の探求者'],  // Lv.10（仕様）
  [13, '優秀な学習者'],
  [16, '知識の担い手'],
  [20, '優秀な研究者'],  // Lv.20（仕様）
  [25, '知識の達人'],
  [30, '博識の守護者'],  // Lv.30（仕様）
  [38, '学問の賢者'],
  [45, '智慧の継承者'],
  [50, '知の伝道師'],    // Lv.50（仕様）
  [60, '学の大家'],
  [70, '叡智の探求者'],
  [80, '知識の巨人'],
  [90, '共通テストの英雄'],
  [99, '共通テスト覇者'], // Lv.99（仕様）
]

function getLevelTitle(level: number): string {
  let title = LEVEL_TITLES[0]![1]
  for (const [threshold, name] of LEVEL_TITLES) {
    if (level >= threshold) title = name
    else break
  }
  return title
}

/* ── 教科の日本語名 ── */
const SUBJECT_LABEL: Record<string, string> = {
  math: '数学', english: '英語', japanese: '国語',
  science: '理科', social: '社会', math_a: '数学A',
  math_b: '数学B', math_c: '数学C',
}

/* manifest から subunit スラッグ → 日本語名マップを構築 */
async function fetchSubunitNames(subjects: string[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {}
  await Promise.all(
    subjects.map(async subject => {
      try {
        const res = await fetch(`/curriculum/${subject}/manifest.json`)
        if (!res.ok) return
        const data = await res.json()
        for (const entry of data.entries ?? []) {
          if (entry.subunit && entry.name) {
            map[entry.subunit] = entry.name
          }
        }
      } catch {
        // manifest が存在しない教科は無視
      }
    })
  )
  return map
}

/* ── アドバイス生成（ルールベース） ── */
function generateAdvice(
  weakUnits: ReturnType<typeof getWeakUnits>,
  stats: { subunit: string; subject: string; attempts: number; correct: number; last_practiced?: string | null }[],
  streakDays: number,
  totalAttempts: number,
  subunitNames: Record<string, string>
): string[] {
  const tips: string[] = []

  /* ① ストリーク系アドバイス */
  if (totalAttempts > 0) {
    if (streakDays >= 30) {
      tips.push(`${streakDays}日連続学習中！素晴らしい習慣が身についています🏆`)
    } else if (streakDays >= 7) {
      tips.push(`${streakDays}日連続学習中！この調子で継続しましょう🔥`)
    } else if (streakDays >= 2) {
      tips.push(`${streakDays}日連続学習中！リズムが出てきましたね。`)
    }
  }

  /* ② 最も苦手な単元（正答率が低く、試行3回以上） */
  const worst = weakUnits[0]
  if (worst) {
    const name = subunitNames[worst.subunit] ?? worst.subunit
    const rate = Math.round((worst.correct / worst.attempts) * 100)
    if (rate < 40) {
      tips.push(`「${name}」でつまずいています（正答率${rate}%）。もう一度基礎から解き直してみましょう。`)
    } else {
      tips.push(`「${name}」の正答率が${rate}%です。あと少し！集中して練習すれば伸びます。`)
    }
  }

  /* ③ 長らく練習していない単元（最終学習が7日以上前） */
  const now = Date.now()
  const neglected = [...stats]
    .filter(s => s.last_practiced && now - new Date(s.last_practiced).getTime() > 7 * 24 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.last_practiced!).getTime() - new Date(b.last_practiced!).getTime())[0]
  if (neglected && neglected.subunit !== worst?.subunit) {
    const name = subunitNames[neglected.subunit] ?? neglected.subunit
    const daysSince = Math.floor((now - new Date(neglected.last_practiced!).getTime()) / (24 * 60 * 60 * 1000))
    tips.push(`「${name}」を${daysSince}日間練習していません。忘れる前に復習しましょう。`)
  }

  /* ④ 得意単元（正答率80%以上・10問以上） */
  const strong = [...stats]
    .filter(s => s.attempts >= 10 && (s.correct / s.attempts) >= 0.8)
    .sort((a, b) => (b.correct / b.attempts) - (a.correct / a.attempts))[0]
  if (strong) {
    const name = subunitNames[strong.subunit] ?? strong.subunit
    const rate = Math.round((strong.correct / strong.attempts) * 100)
    tips.push(`「${name}」は正答率${rate}%と得意です！standard・exam難易度にも挑戦してみましょう。`)
  }

  /* ⑤ データ不足時のフォールバック */
  if (tips.length === 0) {
    tips.push(totalAttempts === 0
      ? 'まずは問題を解いてみましょう！データが溜まると詳しいアドバイスが表示されます。'
      : '順調に学習が進んでいます！このペースを維持しましょう。'
    )
  }

  return tips
}

/* ══════════════════════════════════════════════════
   ProfilePage コンポーネント
   ══════════════════════════════════════════════════ */
export default function ProfilePage() {
  const navigate   = useNavigate()
  const { user }   = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id)
  const { data: stats = [], isLoading: statsLoading } = useLearningStats(user?.id)

  /* subunit スラッグ → 日本語名マップ */
  const [subunitNames, setSubunitNames] = useState<Record<string, string>>({})

  /* ── チャレンジモード（Hooks は early return より前に宣言必須） ── */
  const [challengeLoading, setChallengeLoading] = useState<'weakpoint' | 'minikyotei' | null>(null)
  const [challengeError, setChallengeError] = useState<string | null>(null)

  useEffect(() => {
    if (stats.length === 0) return
    const subjects = [...new Set(stats.map(s => s.subject))]
    fetchSubunitNames(subjects).then(setSubunitNames)
  }, [stats])

  if (profileLoading || statsLoading) {
    return (
      <div className={styles.loadingWrap}>
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!profile) {
    return <div className={styles.error}>プロフィールが見つかりません</div>
  }

  async function handleWeakPoint() {
    setChallengeError(null)
    setChallengeLoading('weakpoint')
    try {
      const questions = await loadWeakPointQuestions(stats)
      if (questions.length === 0) {
        setChallengeError('苦手単元のデータがまだありません。まずは各単元で3問以上解いてみましょう！')
        return
      }
      navigate('/quiz/weakpoint', { state: { questions } })
    } catch {
      setChallengeError('問題の読み込みに失敗しました。もう一度お試しください。')
    } finally {
      setChallengeLoading(null)
    }
  }

  async function handleMiniKyotei() {
    setChallengeError(null)
    setChallengeLoading('minikyotei')
    try {
      const questions = await loadMiniKyoteiQuestions()
      if (questions.length === 0) {
        setChallengeError('問題データが見つかりませんでした。')
        return
      }
      navigate('/quiz/minikyotei', { state: { questions } })
    } catch {
      setChallengeError('問題の読み込みに失敗しました。もう一度お試しください。')
    } finally {
      setChallengeLoading(null)
    }
  }

  const totalAttempts = stats.reduce((s, r) => s + r.attempts, 0)
  const totalCorrect  = stats.reduce((s, r) => s + r.correct, 0)
  const overallRate   = totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100)

  const weakUnits    = getWeakUnits(stats)

  const adviceTips   = generateAdvice(weakUnits, stats, profile.streak_days, totalAttempts, subunitNames)

  const currentLevelExp = expForLevel(profile.level)
  const nextLevelExp    = expForNextLevel(profile.level)
  const expProgress     = profile.level >= 10
    ? 100
    : Math.round(((profile.exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100)

  return (
    <div className={styles.page}>
      {/* ヘッダー */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/subject')}>
          ← もどる
        </button>
        <h1 className={styles.title}>マイページ</h1>
      </header>

      {/* プロフィールカード */}
      <section className={styles.profileCard}>
        <Monogram size={64} glyph={profile.username?.[0]?.toUpperCase() ?? 'U'} italic={false} />
        <div className={styles.profileInfo}>
          <p className={styles.username}>{profile.username}</p>
          <p className={styles.levelBadge}>Lv.{profile.level}</p>
        </div>
        <p className={styles.titleBadge}>{getLevelTitle(profile.level)}</p>
      </section>

      {/* チャレンジモード */}
      <section className={`${styles.card} ${styles.challengeCard}`}>
        <p className={styles.cardLabel}>⚔️ チャレンジモード</p>
        <div className={styles.challengeRow}>
          <button
            className={`${styles.challengeBtn} ${styles.challengeBtnWeak}`}
            onClick={() => { void handleWeakPoint() }}
            disabled={challengeLoading !== null}
          >
            {challengeLoading === 'weakpoint' ? (
              <span className={styles.challengeSpinner} />
            ) : (
              <span className={styles.challengeIcon}>🎯</span>
            )}
            <span className={styles.challengeBtnLabel}>弱点克服</span>
            <span className={styles.challengeBtnSub}>苦手から10問</span>
          </button>
          <button
            className={`${styles.challengeBtn} ${styles.challengeBtnMini}`}
            onClick={() => { void handleMiniKyotei() }}
            disabled={challengeLoading !== null}
          >
            {challengeLoading === 'minikyotei' ? (
              <span className={styles.challengeSpinner} />
            ) : (
              <span className={styles.challengeIcon}>📝</span>
            )}
            <span className={styles.challengeBtnLabel}>小さな共テ</span>
            <span className={styles.challengeBtnSub}>全範囲から10問</span>
          </button>
        </div>
        {challengeError && (
          <p className={styles.challengeError}>{challengeError}</p>
        )}
      </section>

      {/* EXP バー */}
      <section className={styles.card}>
        <p className={styles.cardLabel}>EXP</p>
        <div className={styles.expTrack}>
          <div
            className={styles.expFill}
            style={{ width: `${expProgress}%` }}
            role="progressbar"
            aria-valuenow={expProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          {[25, 50, 75].map(p => (
            <div key={p} className={styles.expTick} style={{ left: `${p}%` }} />
          ))}
        </div>
        <div className={styles.expDetails}>
          <span>{profile.exp} EXP</span>
          <span>
            {profile.level < 10
              ? `Lv.${profile.level} → ${nextLevelExp - profile.exp} 残`
              : 'MAX LEVEL'}
          </span>
        </div>
      </section>

      {/* 総合成績 */}
      <section className={styles.card}>
        <p className={styles.cardLabel}>総合成績</p>
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <p className={styles.statNum}>{totalAttempts}</p>
            <p className={styles.statCaption}>総回答数</p>
          </div>
          <div className={styles.statBox}>
            <p className={styles.statNum}>{totalCorrect}</p>
            <p className={styles.statCaption}>正解数</p>
          </div>
          <div className={styles.statBox}>
            <p className={`${styles.statNum} ${overallRate >= 70 ? styles.good : overallRate >= 50 ? styles.mid : styles.bad}`}>
              {overallRate}%
            </p>
            <p className={styles.statCaption}>正答率</p>
          </div>
          <div className={styles.statBox}>
            <p className={styles.statNum}>{profile.streak_days}</p>
            <p className={styles.statCaption}>連続日数🔥</p>
          </div>
        </div>
      </section>


      {/* 苦手単元 */}
      {weakUnits.length > 0 && (
        <section className={styles.card}>
          <p className={styles.cardLabel}>⚠️ 苦手な単元</p>
          {weakUnits.map(u => {
            const rate = Math.round((u.correct / u.attempts) * 100)
            return (
              <div key={u.id} className={styles.weakRow}>
                <div>
                  <p className={styles.weakSubunit}>
                    {subunitNames[u.subunit] ?? u.subunit}
                  </p>
                  <p className={styles.weakMeta}>
                    {SUBJECT_LABEL[u.subject] ?? u.subject}
                  </p>
                </div>
                <p className={styles.weakRate}>{rate}%</p>
              </div>
            )
          })}
        </section>
      )}

      {/* 学習アドバイス */}
      <section className={`${styles.card} ${styles.adviceCard}`}>
        <p className={styles.cardLabel}>💡 学習アドバイス</p>
        {adviceTips.map((tip, i) => (
          <p key={i} className={styles.adviceTip}>• {tip}</p>
        ))}
      </section>

      {/* 最近学習した単元 */}
      {stats.length > 0 && (
        <section className={styles.card}>
          <p className={styles.cardLabel}>最近の学習</p>
          {stats.slice(0, 5).map(s => {
            const rate = Math.round((s.correct / s.attempts) * 100)
            return (
              <div key={s.id} className={styles.recentRow}>
                <div>
                  <p className={styles.recentSubunit}>
                    {subunitNames[s.subunit] ?? s.subunit}
                  </p>
                  <p className={styles.recentMeta}>
                    {SUBJECT_LABEL[s.subject] ?? s.subject}
                  </p>
                </div>
                <div className={styles.recentRight}>
                  <p className={`${styles.recentRate} ${rate >= 70 ? styles.good : rate >= 50 ? styles.mid : styles.bad}`}>
                    {rate}%
                  </p>
                  <p className={styles.recentAttempts}>{s.attempts}問</p>
                </div>
              </div>
            )
          })}
        </section>
      )}

      <div className={styles.bottomSpacer} />
    </div>
  )
}
                                                                