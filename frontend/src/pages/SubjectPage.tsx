import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { RECOVERY_CODE_KEY } from './LoginPage'
import { Flourish, Monogram, CornerDiamonds } from '../components/LibraryUI'
import { useQueryClient } from '@tanstack/react-query'
import type { UserProfile } from '../types/database'
import styles from './SubjectPage.module.css'

/* ── コース定義 ── */
type CourseStatus = 'active' | 'preparing'

const MATH_COURSES: {
  id: string
  label: string
  units: number
  questions: number
  status: CourseStatus
  schoolType: 'junior_high' | 'high_school'
}[] = [
  /* ── 高校数学 ── */
  { id: '1A', label: '数学Ⅰ・A', units: 44, questions: 1320, status: 'active', schoolType: 'high_school' },
  { id: '2B', label: '数学Ⅱ・B', units: 38, questions: 1140, status: 'active', schoolType: 'high_school' },
  { id: 'C',  label: '数学Ｃ',   units: 11, questions: 330,  status: 'active', schoolType: 'high_school' },
  /* ── 中学数学 ── */
  { id: '中1', label: '中学1年',  units: 7,  questions: 210,  status: 'active', schoolType: 'junior_high' },
  { id: '中2', label: '中学2年',  units: 7,  questions: 210,  status: 'active', schoolType: 'junior_high' },
  { id: '中3', label: '中学3年',  units: 8,  questions: 240,  status: 'active', schoolType: 'junior_high' },
]

/* ── EXP テーブル ── */
const LEVEL_EXP_TABLE: Record<number, number> = {
  1: 0, 2: 100, 3: 250, 4: 450, 5: 700,
  6: 1000, 7: 1350, 8: 1750, 9: 2200, 10: 2700,
}

function getExpForLevel(level: number): number {
  return LEVEL_EXP_TABLE[level] ?? level * 500
}

function getExpProgress(profile: UserProfile): number {
  const currentLevelExp = getExpForLevel(profile.level)
  const nextLevelExp    = getExpForLevel(profile.level + 1)
  if (nextLevelExp <= currentLevelExp) return 100
  return Math.min(
    100,
    Math.round(((profile.exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100)
  )
}

/* ══════════════════════════════════════════════════
   サブコンポーネント：コースバッジ
   ══════════════════════════════════════════════════ */
function CourseBadge({ label }: { label: string }) {
  // バッジ内は「数学」プレフィックスを省略（Ⅰ・A / Ⅱ・B / Ｃ）
  const shortLabel = label.replace(/^数学/, '')
  return (
    <div className={styles.crest}>
      <div className={styles.crestInner} />
      <span className={styles.crestName}>{shortLabel}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   サブコンポーネント：EXP バー
   ══════════════════════════════════════════════════ */
function ExpBar({ progress }: { progress: number }) {
  return (
    <div className={styles.expTrack}>
      <div
        className={styles.expFill}
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      {/* 5分割の白目盛り */}
      {[20, 40, 60, 80].map(p => (
        <div key={p} className={styles.expTick} style={{ left: `${p}%` }} />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   サブコンポーネント：復元コードモーダル
   ══════════════════════════════════════════════════ */
function RecoveryModal({ code, onClose }: { code: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard 非対応環境は無視
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        {/* 四隅ひし形 */}
        <CornerDiamonds size={6} inset={3} />
        {/* 内側二重罫線 */}
        <div className={styles.modalFrameOuter} />
        <div className={styles.modalFrameInner} />

        <div className={styles.modalContent}>
          <span className={styles.modalBienvenue}>WELCOME</span>
          <Monogram size={50} glyph="SQ" italic />
          <h2 className={styles.modalTitle}>登録完了</h2>
          <Flourish width={100} thickness={0.75} diamondSize={6} />
          <p className={styles.modalDesc}>
            この鍵は<span className={styles.modalEmph}>パスワードを忘れた時</span>に<br />
            学籍を取り戻す唯一の手段です
          </p>

          {/* 鍵カード */}
          <div className={styles.keyCard}>
            <CornerDiamonds size={5} inset={-2.5} color="var(--sq-burgundy)" />
            <span className={styles.keyCardLabel}>RECOVERY  ·  CODE</span>
            <p className={styles.keyCode}>{code}</p>
            <button type="button" className={styles.copyBtn} onClick={handleCopy}>
              {copied ? '写し取りました' : '写し取る'}
            </button>
          </div>

          <p className={styles.modalWarning}>
            <em>この画面を閉じると<br />二度と表示されません</em>
          </p>

          <button type="button" className={styles.modalConfirmBtn} onClick={onClose}>
            <span className={styles.submitInner} />
            書き留めた
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   SubjectPage コンポーネント
   ══════════════════════════════════════════════════ */
export default function SubjectPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  /* ── 新規登録直後：復元コードモーダル ── */
  const [newRecoveryCode, setNewRecoveryCode] = useState<string | null>(null)

  useEffect(() => {
    const code = sessionStorage.getItem(RECOVERY_CODE_KEY)
    if (code) setNewRecoveryCode(code)
  }, [])

  /* ── プロフィール取得 ── */
  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery<UserProfile>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!user,
    retry: 2,
    retryDelay: 800,
  })

  const queryClient = useQueryClient()

  /* ── ログアウト ── */
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  /* ── 学校種別の選択（インライン） ── */
  const [selectingSchool, setSelectingSchool] = useState(false)
  const [schoolSaving, setSchoolSaving] = useState(false)

  async function handleSchoolSelect(type: 'junior_high' | 'high_school') {
    if (!user) return
    setSchoolSaving(true)
    const { error, count } = await supabase
      .from('user_profiles')
      .update({ school_type: type })
      .eq('id', user.id)
      .select('id', { count: 'exact', head: true })
    if (!error && count === 0) {
      await supabase.from('user_profiles').insert({
        id: user.id, username: 'ユーザー', avatar_id: 'cat', school_type: type,
      })
    }
    await queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
    setSelectingSchool(false)
    setSchoolSaving(false)
  }

  const expProgress = profile ? getExpProgress(profile) : 0
  const currentExp  = profile?.exp ?? 0
  const currentLv   = profile?.level ?? 1
  const nextLvExp   = getExpForLevel(currentLv + 1)
  const expRemain   = Math.max(0, nextLvExp - currentExp)
  const initial     = profile?.username?.[0]?.toUpperCase() ?? 'S'

  /* ── school_type でコースを絞り込む ── */
  const visibleCourses = profile?.school_type
    ? MATH_COURSES.filter(c => c.schoolType === profile.school_type)
    : []

  /* school_type が未設定かどうか（ロード完了後に判定） */
  const needsSchoolType = !profileLoading && (profileError || !profile?.school_type)
  const schoolTypeLabel = profile?.school_type === 'junior_high' ? '中学生' : profile?.school_type === 'high_school' ? '高校生' : null

  return (
    <div className={styles.page}>

      {/* ══ ヘッダー ══ */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Monogram size={28} glyph="MA" italic />
          <div>
            <p className={styles.headerTitle}>MathAca</p>
            <p className={styles.headerAnno}>数学専門演習アプリ</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {schoolTypeLabel && (
            <button
              className={styles.logoutBtn}
              onClick={() => setSelectingSchool(true)}
              style={{ fontSize: '0.75rem', opacity: 0.7 }}
            >
              {schoolTypeLabel}
            </button>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            退室する
          </button>
        </div>
      </header>

      {/* ══ コンテンツ統計バナー ══ */}
      <div className={styles.statsBanner}>
        <span className={styles.statsItem}>1A <em>44単元</em></span>
        <span className={styles.statsDot}>·</span>
        <span className={styles.statsItem}>2B <em>38単元</em></span>
        <span className={styles.statsDot}>·</span>
        <span className={styles.statsItem}>C <em>11単元</em></span>
        <span className={styles.statsDot}>·</span>
        <span className={styles.statsItem}><em>2,790問</em> 収録</span>
      </div>

      <div className={styles.inner}>

        {/* ══ ユーザーカード ══ */}
        <div className={styles.userCard}>
          <CornerDiamonds size={5} inset={-2.5} />
          <Monogram size={58} glyph={initial} italic={false} />
          <div className={styles.userInfo}>
            <p className={styles.userName}>
              {profile?.username ?? 'まなびくん'}
            </p>
            <p className={styles.userGradus}>
              <em>Level</em>
              <span className={styles.userLevel}>{currentLv}</span>
            </p>
            <ExpBar progress={expProgress} />
            <div className={styles.expDetails}>
              <span>{currentExp} EXP</span>
              <span>次の階位まで {expRemain}</span>
            </div>
          </div>
        </div>

        {/* ══ セクションヘッダー ══ */}
        <div className={styles.sectionHeader}>
          <p className={styles.sectionIndex}>MATHEMATICS  ·  数学</p>
          <Flourish width={70} thickness={0.4} diamondSize={4} color="var(--sq-burgundy-hair)" />
          <p className={styles.sectionTitle}>
            {needsSchoolType || selectingSchool ? 'あなたは？' : 'コースを選ぶ'}
          </p>
        </div>

        {/* ══ 学校種別インライン選択（未設定 or 変更中） ══ */}
        {(needsSchoolType || selectingSchool) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 4px' }}>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(200,180,138,0.6)', margin: 0 }}>
              ランキングは中学生・高校生で独立して集計されます
            </p>
            {[
              { type: 'junior_high' as const, label: '中学生', note: '中1〜中3', emoji: '📚' },
              { type: 'high_school' as const, label: '高校生', note: '高1〜高3', emoji: '🎓' },
            ].map(opt => (
              <button
                key={opt.type}
                disabled={schoolSaving}
                onClick={() => handleSchoolSelect(opt.type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '20px 20px', background: 'rgba(30,20,10,0.7)',
                  border: '1px solid rgba(201,168,106,0.3)', cursor: 'pointer',
                  color: '#c8b48a', fontFamily: 'inherit', textAlign: 'left',
                  fontSize: '1rem', letterSpacing: '0.05em',
                  opacity: schoolSaving ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>{opt.emoji}</span>
                <span style={{ fontWeight: 700 }}>{opt.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(200,180,138,0.55)', marginLeft: 4 }}>{opt.note}</span>
                <span style={{ marginLeft: 'auto' }}>›</span>
              </button>
            ))}
          </div>
        )}

        {/* ══ コースリスト（school_type 設定済み） ══ */}
        {!needsSchoolType && !selectingSchool && (
          <div className={styles.subjectList}>
            {visibleCourses.map((course, i) => {
              const isActive = course.status === 'active'
              return (
                <button
                  key={course.id}
                  className={[
                    styles.subjectRow,
                    i === 0 ? styles.subjectRowFirst : '',
                    !isActive ? styles.subjectRowDisabled : '',
                  ].join(' ')}
                  style={{ animationDelay: `${i * 0.08}s` }}
                  onClick={() => isActive && navigate('/course/math?course=' + course.id)}
                  disabled={!isActive}
                >
                  <CourseBadge label={course.label} />
                  <div className={styles.courseInfo}>
                    {isActive
                      ? <span className={styles.courseStats}>{course.units}単元 · {course.questions.toLocaleString()}問</span>
                      : <span className={styles.courseStats}>準備中</span>
                    }
                  </div>
                  <div className={styles.dotLeader} />
                  <span className={styles.subjectStatus}>
                    {isActive ? '学習可能' : '準備中'}
                  </span>
                  <span className={styles.subjectArrow}>
                    {isActive ? '›' : ''}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* ══ 塾導線バナー ══ */}
        <a
          href="https://eureka-ukiha.com"
          className={styles.eurekaBanner}
          target="_blank"
          rel="noopener noreferrer"
        >
          <CornerDiamonds size={5} inset={-2.5} color="var(--sq-burgundy)" />
          <div className={styles.eurekaBannerInner} />
          <div className={styles.eurekaContent}>
            <p className={styles.eurekaEyebrow}>INDIVIDUAL  ·  TUTORING</p>
            <p className={styles.eurekaTitle}>個別指導学習塾 EUREKA</p>
            <Flourish width={60} thickness={0.4} diamondSize={4} color="var(--sq-burgundy-hair)" />
            <p className={styles.eurekaDesc}>オンライン個別指導　お問い合わせはこちら</p>
          </div>
          <span className={styles.eurekaArrow}>›</span>
        </a>

        {/* ══ フッター ══ */}
        <div className={styles.footer}>
          <Flourish width={70} thickness={0.4} diamondSize={4} color="var(--sq-burgundy-hair)" />
          <p className={styles.footerLatin}><em>Nulla dies sine linea</em></p>
          <p className={styles.footerJp}>一日一線——毎日続けよ</p>
        </div>
      </div>

      {/* ══ 復元コードモーダル ══ */}
      {newRecoveryCode && (
        <RecoveryModal
          code={newRecoveryCode}
          onClose={() => {
            setNewRecoveryCode(null)
            sessionStorage.removeItem(RECOVERY_CODE_KEY)
          }}
        />
      )}

    </div>
  )
}
