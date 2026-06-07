import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Flourish, CornerDiamonds } from '../components/LibraryUI'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import styles from './CoursePage.module.css'

interface SubunitEntry {
  path: string
  course: string
  unit: string
  subunit: string
  name: string
  en: string
  questionCount: number
}
interface UnitGroup { unit: string; subunits: SubunitEntry[] }
interface CourseGroup { course: string; units: UnitGroup[] }
interface Manifest { subject: string; entries: SubunitEntry[]; tree: CourseGroup[] }
type Difficulty = 'basic' | 'standard' | 'exam'

const COURSE_LABEL: Record<string, string> = {
  '1A': '数学1A', '2B': '数学2B',
  '3': '数学3', 'C': '数学C', '_': '全単元',
  '中1': '中学1年', '中2': '中学2年', '中3': '中学3年',
}

const UNIT_JP: Record<string, string> = {
  // 高校数学
  'quadratic-functions': '二次関数',
  'combinatorics': '場合の数と確率',
  'data-analysis': 'データの分析',
  'geometry-and-measure': '図形と計量',
  'geometry-properties': '図形の性質',
  'logic-and-sets': '集合と論証',
  'number-theory': '整数の性質',
  'numbers-and-expressions': '数と式',
  'probability': '確率',
  'calculus-basics': '微分・積分',
  'coordinate-geometry': '図形と方程式',
  'exponential-logarithm': '指数・対数',
  'exponential-and-logarithmic-functions': '指数・対数関数',
  'expressions-and-proofs': '式と証明',
  'sequences': '数列',
  'statistical-inference': '統計的推測',
  'trigonometry': '三角関数',
  'trigonometric-functions': '三角関数',
  'vectors': 'ベクトル',
  'curves-and-complex-plane': '曲線と複素数平面',
  'statistics': '統計',
  'reading': '読解',
  'listening': 'リスニング',
  'modern-reading': '現代文',
  'classical': '古典文法',
  'kanbun': '漢文',
  // 中学数学
  'numbers': '数と計算',
  'letters-and-expressions': '文字と式',
  'equations': '方程式',
  'functions': '関数',
  'plane-geometry': '平面図形',
  'solid-geometry': '空間図形',
  'data-utilization': 'データの活用',
  'polynomial-calculations': '式の計算',
  'simultaneous-equations': '連立方程式',
  'linear-functions': '一次関数',
  'parallel-and-congruence': '平行と合同',
  'triangles-quadrilaterals': '三角形と四角形',
  'probability-jr': '確率',
  'polynomials': '多項式',
  'square-roots': '平方根',
  'quadratic-equations': '二次方程式',
  'quadratic-functions-jr': '関数y=ax²',
  'similar-figures': '図形の相似',
  'circles': '円',
  'pythagorean-theorem': '三平方の定理',
  'sampling': '標本調査',
}

const DIFFICULTY_META: Record<Difficulty, { jp: string; desc: string }> = {
  basic:    { jp: '基礎',   desc: '概念の理解・導入' },
  standard: { jp: '標準',   desc: '共通テスト典型問題' },
  exam:     { jp: '実戦',   desc: '応用・統合問題' },
}

const DIFFICULTIES: Difficulty[] = ['basic', 'standard', 'exam']

// key: "unit/subunit" → { attempts, correct }
type StatsMap = Map<string, { attempts: number; correct: number }>

export default function CoursePage() {
  const { subject = 'math' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [manifest,      setManifest]      = useState<Manifest | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [activeCourse,  setActiveCourse]  = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<SubunitEntry | null>(null)
  const [difficulty,    setDifficulty]    = useState<Difficulty>('basic')
  const [openUnit,      setOpenUnit]      = useState<string | null>(null)
  const [lastOpened,    setLastOpened]    = useState<string | null>(null)
  const [statsMap,      setStatsMap]      = useState<StatsMap>(new Map())

  const detailRef = useRef<HTMLDivElement>(null)
  const pageRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true); setError(null); setManifest(null)
    setSelectedEntry(null); setActiveCourse(null)
    fetch('/curriculum/' + subject + '/manifest.json')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() as Promise<Manifest> })
      .then(data => {
        setManifest(data)
        const requested = searchParams.get('course')
        const matched = requested && data.tree.find(c => c.course === requested)
        setActiveCourse(matched ? requested : data.tree[0]?.course ?? null)
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [subject])

  // 成績データ取得
  useEffect(() => {
    if (!user) return
    supabase
      .from('learning_stats')
      .select('unit, subunit, attempts, correct')
      .eq('user_id', user.id)
      .eq('subject', subject)
      .then(({ data }) => {
        if (!data) return
        const map: StatsMap = new Map()
        data.forEach(row => map.set(row.unit + '/' + row.subunit, { attempts: row.attempts, correct: row.correct }))
        setStatsMap(map)
      })
  }, [user, subject])

  const activeTree = manifest?.tree.find(c => c.course === activeCourse)

  useEffect(() => { setOpenUnit(null) }, [activeCourse])

  const toggleUnit = useCallback((unit: string) => {
    setOpenUnit(prev => (prev === unit ? null : unit))
    setLastOpened(prev => (prev === unit ? null : unit))
  }, [])

  useEffect(() => {
    if (!lastOpened) return
    const timer = setTimeout(() => {
      const groupEl = document.querySelector('[data-unit="' + lastOpened + '"]') as HTMLElement | null
      if (!groupEl) return
      const rect = groupEl.getBoundingClientRect()
      const visibleBottom = window.innerHeight - 80
      if (rect.bottom > visibleBottom) {
        const delta = rect.bottom - visibleBottom
        const page = pageRef.current
        if (page) page.scrollBy({ top: delta, behavior: 'smooth' })
        else window.scrollBy({ top: delta, behavior: 'smooth' })
      }
    }, 220)
    return () => clearTimeout(timer)
  }, [lastOpened])

  useEffect(() => {
    if (selectedEntry && detailRef.current)
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [selectedEntry])

  const handleStart = () => {
    if (!selectedEntry) return
    navigate('/quiz/' + subject + '?path=' + encodeURIComponent(selectedEntry.path) + '&difficulty=' + difficulty)
  }

  const canStart = selectedEntry && selectedEntry.questionCount > 0

  return (
    <div className={styles.page} ref={pageRef}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/subject')}>
          {'‹ ホーム'}
        </button>
        <div className={styles.headerTitle}>
          <span className={styles.headerJp}>MathAca</span>
          <span className={styles.headerEn}>Mathematics</span>
        </div>
      </header>

      <div className={styles.body}>
        {loading && (
          <div className={styles.loadState}>
            <div className={styles.loadSpinner} />
            <p>{'目次を読み込み中…'}</p>
          </div>
        )}
        {error && !loading && (
          <div className={styles.loadState}>
            <p className={styles.errorText}>{'データの取得に失敗しました。'}</p>
            <p className={styles.errorSub}>{error}</p>
          </div>
        )}
        {manifest && !loading && (
          <div className={styles.layout}>
            <div className={styles.treePane}>
              <CornerDiamonds size={4} inset={-2} />
              <p className={styles.treePaneTitle}>{'目次 · Index'}</p>
              {manifest.tree.length > 1 && (
                <div className={styles.courseTabs}>
                  {manifest.tree.map(cg => (
                    <button
                      key={cg.course}
                      className={styles.courseTab + (cg.course === activeCourse ? ' ' + styles.courseTabActive : '')}
                      onClick={() => { setActiveCourse(cg.course); setSelectedEntry(null) }}
                    >
                      {COURSE_LABEL[cg.course] ?? cg.course}
                    </button>
                  ))}
                </div>
              )}
              <div className={styles.unitList}>
                {activeTree?.units.map(ug => {
                  const isOpen = openUnit === ug.unit
                  return (
                    <div key={ug.unit} className={styles.unitGroup} data-unit={ug.unit}>
                      <button
                        className={styles.unitHeading}
                        onClick={() => toggleUnit(ug.unit)}
                        aria-expanded={isOpen}
                      >
                        <span className={styles.unitHeadingText}>{UNIT_JP[ug.unit] ?? ug.unit}</span>
                        <span className={styles.accordionIcon + (isOpen ? ' ' + styles.accordionIconOpen : '')}>
                          {'▾'}
                        </span>
                      </button>
                      {isOpen && (
                        <div className={styles.subunitList}>
                          {ug.subunits.map(entry => (
                            <button
                              key={entry.path}
                              className={
                                styles.subunitBtn +
                                (selectedEntry?.path === entry.path ? ' ' + styles.subunitBtnActive : '') +
                                (entry.questionCount === 0 ? ' ' + styles.subunitBtnDisabled : '')
                              }
                              onClick={() => { if (entry.questionCount > 0) setSelectedEntry(entry) }}
                              disabled={entry.questionCount === 0}
                              title={entry.questionCount === 0 ? '準備中' : entry.questionCount + '問'}
                            >
                              <span className={styles.subunitName}>{entry.name}</span>
                              {entry.questionCount > 0
                                ? (() => {
                                    const s = statsMap.get(entry.unit + '/' + entry.subunit)
                                    if (!s || s.attempts === 0) {
                                      return <span className={styles.statUntouched}>未着手</span>
                                    }
                                    const pct = Math.round((s.correct / s.attempts) * 100)
                                    const cls = pct >= 80 ? styles.statHigh : pct >= 60 ? styles.statMid : styles.statLow
                                    return <span className={cls}>{pct}%</span>
                                  })()
                                : <span className={styles.subunitCount}>準備中</span>
                              }
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            {selectedEntry && (
              <div className={styles.detailPane} ref={detailRef}>
                <div className={styles.detail}>
                  <CornerDiamonds size={4} inset={-2} />
                  <div className={styles.detailHeader}>
                    <h2 className={styles.detailName}>{selectedEntry.name}</h2>
                    <p className={styles.detailEn}>{selectedEntry.en}</p>
                    <p className={styles.detailCount}>{selectedEntry.questionCount} {'問収録'}</p>
                  </div>
                  <Flourish width={60} thickness={0.4} diamondSize={3.5} color="var(--sq-burgundy-hair)" />
                  <div className={styles.diffSection}>
                    <p className={styles.diffLabel}>{'難易度を選択'}</p>
                    <div className={styles.diffButtons}>
                      {DIFFICULTIES.map(d => (
                        <button
                          key={d}
                          className={styles.diffBtn + (difficulty === d ? ' ' + styles.diffBtnActive : '')}
                          onClick={() => setDifficulty(d)}
 