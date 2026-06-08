import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { UserProfile } from '../types/database'
import styles from './QuizPage.module.css'
import { MathText } from '../components/MathText'
import { AIChat } from '../components/AIChat'  // TODO: AI チャット機能（準備完了・非表示中）

/* ══════════════════════════════════════════════════
   型定義
   ══════════════════════════════════════════════════ */
interface Choice {
  label: string
  text: string
}

interface Question {
  id: string
  unit: string
  subject?: string    // チャレンジモード用（弱点克服・小さな共テ）
  subunit?: string    // チャレンジモード用
  difficulty: 'basic' | 'standard' | 'exam'
  question: string
  choices: Choice[]
  correct: string
}

/* ── チャレンジモード判定 ── */
function isChallengeSubject(s: string | undefined): boolean {
  return s === 'weakpoint' || s === 'minikyotei'
}

/* ── 選択肢をシャッフルして正解ラベルを更新する ── */
function shuffleChoices(q: Question): Question {
  const labels = ['A', 'B', 'C', 'D'] as const
  const correctText = q.choices.find(c => c.label === q.correct)?.text ?? ''
  const shuffled = [...q.choices]
    .sort(() => Math.random() - 0.5)
    .map((c, i) => ({ ...c, label: labels[i] ?? c.label }))
  const newCorrect = shuffled.find(c => c.text === correctText)?.label ?? q.correct
  return { ...q, choices: shuffled, correct: newCorrect }
}

interface ExplanationEntry {
  lead: string
  steps?: string | string[]
  common_mistakes?: string | string[]
  tips?: string | string[]
}
type Explanations = Record<string, ExplanationEntry>

type StageResult = 'correct' | 'wrong' | null
type Phase = 'playing' | 'answered' | 'explaining' | 'reviewed' | 'finished'

/* ── ラベル変換（A→I, B→II, C→III, D→IV） ── */
const ROMAN: Record<string, string> = { A: 'I', B: 'II', C: 'III', D: 'IV' }

/* ── EXP テーブル（難易度別） ── */
/* ── EXP テーブル（ゲーミフィケーション部仕様に準拠） ── */
const EXP_GAIN: Record<string, number> = {
  basic:    8,
  standard: 12,
  exam:     20,
}

/* ── レベルアップに必要な累計 EXP ── */
const LEVEL_EXP_TABLE: Record<number, number> = {
  1: 0, 2: 100, 3: 250, 4: 450, 5: 700,
  6: 1000, 7: 1350, 8: 1750, 9: 2200, 10: 2700,
}

function getExpForLevel(level: number): number {
  return LEVEL_EXP_TABLE[level] ?? level * 500
}

/* ══════════════════════════════════════════════════
   モック問題（curriculum/ に実データが揃うまで使用）
   CLAUDE.md 設計哲学：思考プロセスを選択肢で示す
   ══════════════════════════════════════════════════ */
const MOCK_QUESTIONS: Question[] = [
  {
    id: 'math-001',
    unit: '二次方程式',
    difficulty: 'basic',
    question: '2次方程式 x² - 5x + 6 = 0 を解くための最初のアプローチとして正しいものはどれか。',
    choices: [
      { label: 'A', text: '両辺を x で割り x - 5 + 6/x = 0 に変形してから、xの値を探す' },
      { label: 'B', text: '「積が 6、和が 5 になる2整数」を探し (x - 2)(x - 3) = 0 と因数分解 → x = 2, 3' },
      { label: 'C', text: '解の公式 x = (5 ± √(25 - 24)) / 2 に直接代入して計算する' },
      { label: 'D', text: 'x(x - 5) = -6 と変形し、左辺に x = 1, 2, 3… を順番に代入して試す' },
    ],
    correct: 'B',
  },
  {
    id: 'eng-001',
    unit: '時制：過去完了',
    difficulty: 'standard',
    question: '"She had already left when I arrived." で had left（過去完了形）が使われている理由として正しいものはどれか。',
    choices: [
      { label: 'A', text: 'already という副詞があるときは動詞を必ず完了形にするルールがあるから' },
      { label: 'B', text: '「私が着いた（過去）」より前に「彼女が去った」という、さらに過去の出来事を表すためにhad + 過去分詞を使うから' },
      { label: 'C', text: 'She が三人称単数のとき、過去形は had + 過去分詞にしなければならないから' },
      { label: 'D', text: 'left は不規則動詞なので、過去を表すときは必ず had をつけるというルールがあるから' },
    ],
    correct: 'B',
  },
  {
    id: 'math-002',
    unit: '三角比',
    difficulty: 'standard',
    question: 'sin θ = 3/5 で 90° < θ < 180° のとき、cos θ を求める手順として正しいものはどれか。',
    choices: [
      { label: 'A', text: 'sin²θ + cos²θ = 1 に代入 → cos²θ = 1 - 9/25 = 16/25 → θ は第2象限より cos θ = -4/5' },
      { label: 'B', text: 'sin²θ + cos²θ = 1 に代入 → cos²θ = 16/25 → cos θ = +4/5（正の値をとると判断）' },
      { label: 'C', text: 'cos θ = 1 - sin θ = 1 - 3/5 = 2/5 と直接引き算で求める' },
      { label: 'D', text: 'cos θ = sin θ ÷ tan θ を使い、第2象限で tan θ は負なので cos θ も負と判断して -3/5' },
    ],
    correct: 'A',
  },
  {
    id: 'kokugo-001',
    unit: '古文：副詞の意味',
    difficulty: 'basic',
    question: '「春はあけぼの。やうやう白くなりゆく山際…」（枕草子）の「やうやう」の意味と、この場面での働きを正しく説明しているものはどれか。',
    choices: [
      { label: 'A', text: '「急に・突然」という意味で、夜明けの変化が素早く起きる様子を強調している' },
      { label: 'B', text: '「だんだんと・しだいに」という意味で、空が白んでいく変化がゆっくり進む様子を表している' },
      { label: 'C', text: '「やっと・ようやく」という意味で、長い夜がやっと明けた安堵感を表現している' },
      { label: 'D', text: '「いつのまにか」という意味で、気がついたら夜が明けていた様子を描いている' },
    ],
    correct: 'B',
  },
  {
    id: 'social-001',
    unit: '歴史：明治維新',
    difficulty: 'standard',
    question: '明治政府が「廃藩置県（1871年）」を実施した主な目的の説明として最も適切なものはどれか。',
    choices: [
      { label: 'A', text: '藩ごとにバラバラだった税制・軍事権を中央政府に一本化し、近代統一国家としての支配力を確立するため' },
      { label: 'B', text: '江戸幕府の幕藩体制を形式的に残しつつ、各藩の自治権を拡大して地方分権を進めるための改革として' },
      { label: 'C', text: '各地の藩主（大名）を東京に集めることで、地方での反乱リスクをなくして天皇を守る目的で' },
      { label: 'D', text: '西洋列強の求めに応じて、日本を複数の独立した州（県）に分割統治する連邦制を導入するため' },
    ],
    correct: 'A',
  },
  {
    id: 'math-003',
    unit: '確率',
    difficulty: 'standard',
    question: '1つのサイコロを2回投げたとき「少なくとも1回は6が出る」確率を求める方針として正しいものはどれか。',
    choices: [
      { label: 'A', text: '直接「1回目か2回目に6が出る」場合を数えると重複が起きるので、余事象「1度も6が出ない」確率（(5/6)²）を1から引く方が確実' },
      { label: 'B', text: '1回目に6が出る確率 1/6 と、2回目に6が出る確率 1/6 を足して 2/6 = 1/3 と計算する' },
      { label: 'C', text: '2回投げるので試行回数が2倍になる。よって 1/6 × 2 = 1/3 と求める' },
      { label: 'D', text: '全事象 6² = 36 通りのうち「両方6」の1通りだけを数えるので 1/36 と求める' },
    ],
    correct: 'A',
  },
  {
    id: 'eng-002',
    unit: '不定詞：to の用法',
    difficulty: 'basic',
    question: '"I went to the store to buy milk." の to buy の用法と、その判断根拠として正しいものはどれか。',
    choices: [
      { label: 'A', text: '名詞的用法。「牛乳を買うこと」が went の目的語になっているから' },
      { label: 'B', text: '形容詞的用法。to buy が直前の the store を修飾し「牛乳を買うべきお店」という意味になるから' },
      { label: 'C', text: '副詞的用法（目的）。「牛乳を買うために」という行動の目的を表し、went を修飾しているから' },
      { label: 'D', text: '副詞的用法（結果）。「行った結果として牛乳を買った」という意味で、結果を表す用法として使われているから' },
    ],
    correct: 'C',
  },
  {
    id: 'science-001',
    unit: '化学：イオン化傾向',
    difficulty: 'exam',
    question: '「鉄（Fe）の釘を硫酸銅（CuSO₄）水溶液に入れると、釘の表面に銅が付着する」現象の理由として正しいものはどれか。',
    choices: [
      { label: 'A', text: 'Fe は Cu よりイオン化傾向が大きいため Fe が溶けて Fe²⁺ になり、Cu²⁺ が電子を受け取って Cu として析出するから' },
      { label: 'B', text: 'Cu は Fe よりイオン化傾向が大きいため Cu²⁺ が優先的に電子を放出し、Fe の表面に付着するから' },
      { label: 'C', text: '硫酸銅水溶液が酸性なので Fe が溶け、Fe と Cu が化合して FeCu という合金になるから' },
      { label: 'D', text: '鉄は温度が上がると銅を引き寄せる磁性をもつため、Cu²⁺ イオンが引き付けられて表面に付着するから' },
    ],
    correct: 'A',
  },
  {
    id: 'math-004',
    unit: '数列：等差数列',
    difficulty: 'standard',
    question: '初項 3、公差 4 の等差数列の第 n 項を求めるとき、正しい式の導き方はどれか。',
    choices: [
      { label: 'A', text: '第1項から第n項まで公差4をn回足すので、aₙ = 3 + 4n と表せる' },
      { label: 'B', text: '第1項（n=1）から数えて n-1 回だけ公差4を足すので、aₙ = 3 + 4(n - 1) = 4n - 1 と表せる' },
      { label: 'C', text: '公差が4で初項が3なので、初項×公差の形 aₙ = 3 × 4^(n-1) と表せる（等比数列の公式を使う）' },
      { label: 'D', text: '初項3と公差4の平均をとって、aₙ = (3 + 4) / 2 × n = 3.5n と表せる' },
    ],
    correct: 'B',
  },
  {
    id: 'kokugo-002',
    unit: '現代文：文章構造の読み取り',
    difficulty: 'exam',
    question: '説明文を読むとき「筆者の主張（結論）」を素早く見つけるための最も有効な方法はどれか。',
    choices: [
      { label: 'A', text: '最初の段落だけを精読する。説明文では必ず冒頭に結論が書かれるルールがあるから' },
      { label: 'B', text: '「しかし」「ところが」「つまり」「したがって」などの接続詞に注目する。逆接の後や結論を示す接続詞の直後に主張が置かれやすいから' },
      { label: 'C', text: '文章全体を2回通読し、最も長い段落を見つける。字数が多い段落ほど筆者が力を入れた主張を含むから' },
      { label: 'D', text: '各段落の最後の文だけを読む。日本語の文章では必ず段落末に結論文が来るという構造があるから' },
    ],
    correct: 'B',
  },
]

/* ══════════════════════════════════════════════════
   定数
   ══════════════════════════════════════════════════ */
const TOTAL_QUESTIONS = 10
const TIME_LIMIT      = 60  // 秒

/* ══════════════════════════════════════════════════
   フィードバック用サブコンポーネント
   ══════════════════════════════════════════════════ */

/** ワックスシール本体 */
function WaxSeal({ correct }: { correct: boolean }) {
  return (
    <div className={`${styles.waxSeal} ${correct ? styles.waxSealCorrect : styles.waxSealWrong}`}>
      <div className={styles.waxSealRing1} />
      <div className={styles.waxSealRing2} />
      <span className={styles.waxSealKanji}>{correct ? '正' : '誤'}</span>
    </div>
  )
}


/** フィードバックオーバーレイ全体 */
function FeedbackOverlay({
  correct,
  combo,
  selected,
  correctLabel,
  expGain,
}: {
  correct: boolean
  combo: number
  selected: string | null
  correctLabel: string
  expGain: number
}) {
  const timedOut = selected === null

  return (
    <div className={styles.feedbackOverlay}>
      <div className={styles.feedbackGroup}>

        {/* 正解時のみ：光レイヤー3枚 */}
        {correct && (
          <>
            <div className={styles.feedbackAura}      aria-hidden="true" />
            <div className={styles.feedbackGlowInner} aria-hidden="true" />
          </>
        )}

        {/* 印章＋テキスト */}
        <div className={styles.feedbackContent}>
          <WaxSeal correct={correct} />

          <div className={styles.feedbackCaption}>
            <p className={`${styles.feedbackWord} ${correct ? styles.feedbackWordGlow : ''}`}>
              {correct ? 'CORRECT' : 'INCORRECT'}
            </p>
            <p className={`${styles.feedbackJp} ${correct ? styles.feedbackJpGlow : ''}`}>
              {correct ? '正解' : timedOut ? '時間切れ' : '不正解'}
            </p>
            {correct && (
              <p className={styles.feedbackExp}>+ {expGain} EXP</p>
            )}
            {correct && combo >= 2 && (
              <p className={styles.feedbackCombo}>🔥 {combo} Combo!</p>
            )}
            {!correct && (
              <p className={styles.feedbackAnswer}>
                Answer: <em>{ROMAN[correctLabel] ?? correctLabel}</em>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   QuizPage コンポーネント
   ══════════════════════════════════════════════════ */
export default function QuizPage() {
  const navigate          = useNavigate()
  const { subject }       = useParams<{ subject: string }>()
  const [searchParams]    = useSearchParams()
  const { user }          = useAuth()
  const queryClient       = useQueryClient()
  const location          = useLocation()

  /* チャレンジモード（location.state から事前ロード済み問題を取得） */
  const challengeMode = isChallengeSubject(subject)
  type LocationState = { questions?: Question[] } | null
  const preloadedQuestions = (location.state as LocationState)?.questions ?? null

  /* ── curriculum パスと難易度 ── */
  const curriculumPath = searchParams.get('path') ?? ''
  const urlDifficulty  = (searchParams.get('difficulty') ?? 'basic') as Question['difficulty']

  /* path から unit / subunit を抽出（例: "1A/quadratic-functions/quadratic-equations"） */
  const pathParts   = curriculumPath.split('/').filter(Boolean)
  const unitSlug    = pathParts.length >= 3 ? pathParts[1] : pathParts[0] ?? ''
  const subunitSlug = pathParts.length >= 3 ? pathParts[2] : pathParts[1] ?? pathParts[0] ?? ''

  /* ── 問題ロード ── */
  const [questions,        setQuestions]        = useState<Question[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [explanations,     setExplanations]     = useState<Explanations>({})

  useEffect(() => {
    setQuestionsLoading(true)

    /* ── チャレンジモード：location.state から問題を取得 ── */
    if (challengeMode) {
      if (preloadedQuestions && preloadedQuestions.length > 0) {
        setQuestions(preloadedQuestions.map(q => shuffleChoices(q)))
      } else {
        setQuestions(MOCK_QUESTIONS.slice(0, TOTAL_QUESTIONS))
      }
      setQuestionsLoading(false)
      return
    }

    const src = curriculumPath
      ? `/curriculum/${subject}/${curriculumPath}/questions.json`
      : null

    if (!src) {
      /* パスなし（直接アクセス）→ モックにフォールバック */
      setQuestions(MOCK_QUESTIONS.slice(0, TOTAL_QUESTIONS))
      setQuestionsLoading(false)
      return
    }

    fetch(src)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((data: { questions?: Omit<Question, 'unit'>[] } | Omit<Question, 'unit'>[]) => {
        /* questions.json は { questions: [...] } 形式かフラット配列の両方に対応 */
        const allQ: Omit<Question, 'unit'>[] =
          Array.isArray(data) ? data : ((data as { questions?: Omit<Question, 'unit'>[] }).questions ?? [])
        const filtered = allQ.filter(q => q.difficulty === urlDifficulty)
        const shuffled = [...filtered].sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, TOTAL_QUESTIONS)

        /* ── 選択肢をシャッフルして正解ラベルも更新 ── */
        const withShuffledChoices = selected.map(q => {
          const labels = ['A', 'B', 'C', 'D'] as const
          const correctText = q.choices.find(c => c.label === q.correct)?.text ?? ''
          const shuffledChoices = [...q.choices].sort(() => Math.random() - 0.5)
            .map((c, i) => ({ ...c, label: labels[i] ?? c.label }))
          const newCorrect = shuffledChoices.find(c => c.text === correctText)?.label ?? q.correct
          return { ...q, choices: shuffledChoices, correct: newCorrect, unit: subunitSlug }
        })
        setQuestions(withShuffledChoices)
      })
      .catch(e => {
        console.error('問題読み込み失敗:', e)
        setQuestions(MOCK_QUESTIONS.slice(0, TOTAL_QUESTIONS))
      })
      .finally(() => setQuestionsLoading(false))
  // subject / curriculumPath / urlDifficulty / challengeMode が変わったときのみ再取得
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, curriculumPath, urlDifficulty, challengeMode])

  /* ── 解説データの読み込み ── */
  useEffect(() => {
    if (!curriculumPath || !subject) return
    const src = `/curriculum/${subject}/${curriculumPath}/explanations.json`
    fetch(src)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((data: Explanations) => setExplanations(data))
      .catch(() => setExplanations({}))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, curriculumPath])

  /* ── ユーザープロフィール（EXP計算用） ── */
  const { data: profile } = useQuery<UserProfile>({
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
  })

  /* ── ゲーム状態 ── */
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stageResults, setStageResults] = useState<StageResult[]>(
    Array(TOTAL_QUESTIONS).fill(null)
  )
  const [selected,    setSelected]    = useState<string | null>(null)
  const [phase,       setPhase]       = useState<Phase>('playing')
  const [isCorrect,   setIsCorrect]   = useState<boolean | null>(null)
  const [combo,       setCombo]       = useState(0)
  const [maxCombo,    setMaxCombo]    = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft,    setTimeLeft]    = useState(TIME_LIMIT)
  const [showComboPop, setShowComboPop] = useState(false)

  /* ── DB 連携用 ── */
  const [sessionExpGain, setSessionExpGain] = useState(0)
  const [levelUpInfo,    setLevelUpInfo]    = useState<{ from: number; to: number } | null>(null)
  const [expSaved,       setExpSaved]       = useState(false)

  /* ── 問題ロード時にステージ数をリセット ── */
  useEffect(() => {
    if (questions.length > 0) {
      setStageResults(Array(Math.min(questions.length, TOTAL_QUESTIONS)).fill(null))
    }
  }, [questions])

  const totalQ   = Math.min(questions.length || TOTAL_QUESTIONS, TOTAL_QUESTIONS)
  const question = questions[currentIndex] ?? MOCK_QUESTIONS[0]
  const timerRatio = timeLeft / TIME_LIMIT

  /* ── タイマーの色（緑 → 黄 → 赤） ── */
  const timerColor = timerRatio > 0.6
    ? 'var(--correct)'
    : timerRatio > 0.3
      ? '#FBBF24'
      : '#F87171'

  /* ── タイマー：setTimeout チェーンで管理 ── */
  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft <= 0) {
      processAnswer(null)
      return
    }
    const id = setTimeout(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase])

  /* ── 回答処理 ── */
  const processAnswer = useCallback((label: string | null) => {
    if (phase !== 'playing') return

    const correct = label !== null && label === question.correct

    setSelected(label)
    setIsCorrect(correct)
    setPhase('answered')

    /* ステージ結果を更新 */
    setStageResults(prev => {
      const next = [...prev]
      next[currentIndex] = correct ? 'correct' : 'wrong'
      return next
    })

    /* 回答を DB に保存（タイムアウトは selected_label が不定のためスキップ） */
    if (label !== null && user) {
      const timeTaken = Math.max(0, TIME_LIMIT - timeLeft)

      /* チャレンジモードは問題ごとの subject/unit/subunit を使用 */
      const subj = challengeMode
        ? (question.subject ?? subject ?? '')
        : (subject ?? '')
      const unitVal = challengeMode
        ? question.unit
        : (unitSlug || question.unit)
      const subunitVal = challengeMode
        ? (question.subunit ?? question.unit)
        : (subunitSlug || question.unit)

      /* quiz_answers に保存 */
      supabase.from('quiz_answers').insert({
        user_id:        user.id,
        question_id:    question.id,
        subject:        subj,
        unit:           unitVal,
        subunit:        subunitVal,
        selected_label: label,
        is_correct:     correct,
        time_taken_sec: timeTaken,
      }).then(({ error }) => {
        if (error) console.error('quiz_answers 保存失敗:', error)
      })

      /* learning_stats を upsert（単元別の正答率集計） */
      supabase.rpc('upsert_learning_stats', {
        p_user_id:    user.id,
        p_subject:    subj,
        p_unit:       unitVal,
        p_subunit:    subunitVal,
        p_is_correct: correct,
        p_time_sec:   timeTaken,
      }).then(({ error }) => {
        if (error) console.error('learning_stats 更新失敗:', error)
      })
    }

    /* コンボ処理 + EXP 加算 */
    if (correct) {
      const gain = EXP_GAIN[question.difficulty] ?? 10
      setSessionExpGain(prev => prev + gain)
      setCombo(prev => {
        const next = prev + 1
        setMaxCombo(m => Math.max(m, next))
        return next
      })
      setCorrectCount(c => c + 1)
      setShowComboPop(true)
      setTimeout(() => setShowComboPop(false), 800)
    } else {
      setCombo(0)
    }

    /* 1.4秒後に解説フェーズへ（光アニメーション後に解説を表示） */
    setTimeout(() => {
      setPhase('explaining')
    }, 1400)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, question, currentIndex])

  /* ── クイズ終了時：EXP と level を DB に保存 ── */
  useEffect(() => {
    if (phase !== 'finished' || expSaved || !user || !profile) return
    setExpSaved(true)

    /* ボーナスEXP計算（ゲーミフィケーション部仕様） */
    let bonus = 0
    if (correctCount >= totalQ) bonus += 30          // 全問正解ボーナス
    if (maxCombo >= 5)          bonus += 15          // 連続5問正解ボーナス
    const totalGain = sessionExpGain + bonus

    if (totalGain === 0) return

    const newExp   = profile.exp + totalGain
    let   newLevel = profile.level
    while (newLevel < 10 && newExp >= getExpForLevel(newLevel + 1)) {
      newLevel++
    }
    const prevLevel = profile.level

    supabase
      .from('user_profiles')
      .update({ exp: newExp, level: newLevel })
      .eq('id', user.id)
      .then(({ error }) => {
        if (error) { console.error('EXP 更新失敗:', error); return }
        /* SubjectPage のキャッシュも更新 */
        queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
        if (newLevel > prevLevel) {
          setLevelUpInfo({ from: prevLevel, to: newLevel })
        }
      })
  }, [phase, expSaved, user, profile, sessionExpGain, queryClient])

  /* ── 選択肢クリック ── */
  function handleSelect(label: string) {
    if (phase !== 'playing') return
    processAnswer(label)
  }

  /* ── 解説確認後：次の問題へ進む ── */
  function handleNextQuestion() {
    if (currentIndex + 1 >= totalQ) {
      setPhase('finished')
    } else {
      setCurrentIndex(i => i + 1)
      setSelected(null)
      setIsCorrect(null)
      setTimeLeft(TIME_LIMIT)
      setPhase('playing')
    }
  }

  /* ── もう一度 ── */
  function handleRetry() {
    /* 問題を再シャッフル */
    setQuestions(prev => [...prev].sort(() => Math.random() - 0.5))
    setCurrentIndex(0)
    setStageResults(Array(totalQ).fill(null))
    setSelected(null)
    setPhase('playing')
    setIsCorrect(null)
    setCombo(0)
    setMaxCombo(0)
    setCorrectCount(0)
    setTimeLeft(TIME_LIMIT)
    setSessionExpGain(0)
    setLevelUpInfo(null)
    setExpSaved(false)
  }

  /* ══════════════════════════════════════════════════
     問題ロード中
     ══════════════════════════════════════════════════ */
  if (questionsLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>問題を読み込み中…</p>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════
     結果画面
     ══════════════════════════════════════════════════ */
  if (phase === 'finished') {
    const stars = correctCount >= totalQ * 0.9 ? 3 : correctCount >= totalQ * 0.6 ? 2 : correctCount >= totalQ * 0.4 ? 1 : 0
    return (
      <div className={styles.page}>
        <div className={styles.resultScreen}>
          <p className={styles.resultEmoji}>
            {stars === 3 ? '🏆' : stars === 2 ? '🎉' : stars === 1 ? '👍' : '💪'}
          </p>
          <p className={styles.resultTitle}>
            {stars === 3 ? '完璧！！' : stars === 2 ? 'よくできました！' : stars === 1 ? 'もう少し！' : 'ドンマイ！'}
          </p>

          {/* 星評価 */}
          <div className={styles.stars}>
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className={i < stars ? styles.starOn : styles.starOff}
                style={{ animationDelay: `${i * 0.15}s` }}
              >★</span>
            ))}
          </div>

          <p className={styles.scoreText}>
            {correctCount} <span className={styles.scoreDivider}>/</span> {totalQ} 正解
          </p>

          {maxCombo >= 3 && (
            <p className={styles.comboResult}>🔥 最大 {maxCombo} コンボ！</p>
          )}

          {/* EXP 獲得表示（ボーナス込み） */}
          {(() => {
            let bonus = 0
            if (correctCount >= totalQ) bonus += 30
            if (maxCombo >= 5)          bonus += 15
            const total = sessionExpGain + bonus
            if (total === 0) return null
            return (
              <>
                <p className={styles.resultExp}>+ {total} EXP 獲得！</p>
                {correctCount >= totalQ && <p className={styles.feedbackCombo}>🏆 全問正解ボーナス +30</p>}
                {maxCombo >= 5 && <p className={styles.feedbackCombo}>🔥 5連続ボーナス +15</p>}
              </>
            )
          })()}

          {/* レベルアップ通知 */}
          {levelUpInfo && (
            <div className={styles.levelUpBadge}>
              <span className={styles.levelUpEmoji}>🎊</span>
              <span>Level Up！</span>
              <span className={styles.levelUpNumbers}>
                {levelUpInfo.from} <span className={styles.levelUpArrow}>→</span> {levelUpInfo.to}
              </span>
            </div>
          )}

          {/* ステージ結果ドット（小） */}
          <div className={styles.resultDots}>
            {stageResults.map((r, i) => (
              <span
                key={i}
                className={`${styles.resultDot} ${r === 'correct' ? styles.rdCorrect : styles.rdWrong}`}
              />
            ))}
          </div>

          <div className={styles.resultBtns}>
            <button className={styles.retryBtn} onClick={handleRetry}>
              もう一度 🔄
            </button>
            <button className={styles.backBtn} onClick={() => navigate(challengeMode ? '/profile' : (curriculumPath ? `/course/${subject}` : '/subject'))}>
              {challengeMode ? 'マイページへ' : (curriculumPath ? '単元選択へ' : '教科選択へ')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════
     クイズ画面
     ══════════════════════════════════════════════════ */
  return (
    <div className={styles.page}>

      {/* ── ヘッダー（教科名 + 戻るボタン） ── */}
      <header className={styles.header}>
        <button className={styles.backIcon} onClick={() => navigate(challengeMode ? '/profile' : (curriculumPath ? `/course/${subject}` : '/subject'))}>
          ‹ Back
        </button>
        {combo >= 2 && phase === 'playing' && (
          <div className={`${styles.comboBadge} ${showComboPop ? styles.comboPop : ''}`}>
            🔥 {combo} Combo
          </div>
        )}
        <span className={styles.subjectLabel}>
          {{
            math: '数学', english: 'English', japanese: '国語',
            kokugo: '国語', science: '理科', social: '社会',
            weakpoint: '弱点克服', minikyotei: '小さな共テ',
          }[subject ?? ''] ?? 'Quiz'}
        </span>
      </header>

      {/* ── ステージマップ ── */}
      <div className={styles.stageMap}>
        {stageResults.map((result, i) => (
          <div
            key={i}
            className={[
              styles.dot,
              result === 'correct'                     ? styles.dotCorrect  : '',
              result === 'wrong'                       ? styles.dotWrong    : '',
              result === null && i === currentIndex    ? styles.dotCurrent  : '',
              result === null && i > currentIndex      ? styles.dotPending  : '',
            ].join(' ')}
          >
            {result === 'correct' && '✓'}
            {result === 'wrong'   && '✗'}
          </div>
        ))}
      </div>

      {/* ── 問題カード ── */}
      <div className={`${styles.questionCard} ${phase === 'answered' && !isCorrect ? styles.questionShake : ''}`}>

        {/* タイマーゲージ */}
        <div className={styles.timerTrack}>
          <div
            className={styles.timerBar}
            style={{
              width:      `${timerRatio * 100}%`,
              background: timerColor,
              transition: 'width 1s linear, background 0.4s ease',
            }}
          />
        </div>

        {/* メタ情報 */}
        <div className={styles.questionMeta}>
          <span className={styles.unitTag}>{question.unit}</span>
          <span className={styles.questionCounter}>
            {currentIndex + 1}<span className={styles.counterSep}>/</span>{TOTAL_QUESTIONS}
          </span>
        </div>

        {/* タイマー秒数 */}
        <div className={styles.timerSec} style={{ color: timerColor }}>
          {timeLeft}
        </div>

        {/* 問題文 */}
        <p className={styles.questionText}><MathText text={question.question} /></p>
      </div>

      {/* ── 選択肢 ── */}
      <div className={styles.choices}>
        {question.choices.map(choice => {
          /* 回答後の状態クラス */
          let stateClass = ''
          if (phase === 'answered' || phase === 'reviewed') {
            if (choice.label === question.correct) stateClass = styles.choiceCorrect
            else if (choice.label === selected)    stateClass = styles.choiceWrong
            else                                   stateClass = styles.choiceDim
          }

          const isChoiceCorrect = stateClass === styles.choiceCorrect
          const isChoiceWrong   = stateClass === styles.choiceWrong

          return (
            <button
              key={choice.label}
              className={`${styles.choiceBtn} ${stateClass}`}
              onClick={() => handleSelect(choice.label)}
              disabled={phase !== 'playing'}
            >
              <span className={`${styles.choiceLabel} ${isChoiceCorrect ? styles.labelCorrect : isChoiceWrong ? styles.labelWrong : ''}`}>
                {ROMAN[choice.label] ?? choice.label}
              </span>
              <span className={styles.choiceText}><MathText text={choice.text} /></span>
            </button>
          )
        })}
      </div>

      {/* ── フィードバックオーバーレイ（ワックスシール） ── */}
      {phase === 'answered' && isCorrect !== null && (
        <FeedbackOverlay
          correct={isCorrect}
          combo={combo}
          selected={selected}
          correctLabel={question.correct}
          expGain={EXP_GAIN[question.difficulty] ?? 10}
        />
      )}

      {/* ── 問題に戻った後の「次の問題へ」ボタン ── */}
      {phase === 'reviewed' && (
        <div className={styles.reviewedNextRow}>
          <div className={styles.expBtnRow}>
            <button className={styles.expCloseBtn} onClick={() => setPhase('explaining')}>
              解説を見る
            </button>
            <button className={styles.nextBtn} onClick={handleNextQuestion}>
              {currentIndex + 1 >= totalQ ? '結果を見る' : '次の問題へ →'}
            </button>
          </div>
        </div>
      )}

      {/* ── 解説パネル（回答後にスライドイン） ── */}
      {phase === 'explaining' && (
        <div className={styles.explanationOverlay}>
          <div className={styles.explanationPanel}>

            {/* 正解 / 不正解 バッジ */}
            <div className={`${styles.expResultBadge} ${isCorrect ? styles.expBadgeCorrect : styles.expBadgeWrong}`}>
              <span className={styles.expBadgeIcon}>{isCorrect ? '✓' : '✗'}</span>
              <span className={styles.expBadgeText}>{isCorrect ? '正解' : (selected === null ? '時間切れ' : '不正解')}</span>
              {isCorrect && (
                <span className={styles.expBadgeExp}>+{EXP_GAIN[question.difficulty] ?? 10} EXP</span>
              )}
              {!isCorrect && (
                <span className={styles.expBadgeAnswer}>
                  正解：<em>{ROMAN[question.correct] ?? question.correct}</em>
                </span>
              )}
            </div>

            {/* 解説本文 */}
            {(() => {
              const exp = explanations[question.id]
              if (!exp) {
                return <p className={styles.expNoData}>（この問題の解説は準備中です）</p>
              }
              // string/string[] 両形式に対応（データ不整合への防御）
              const toArr = (v?: string | string[]): string[] =>
                Array.isArray(v) ? v : v ? [v] : []
              const steps         = toArr(exp.steps)
              const commonMistakes = toArr(exp.common_mistakes)
              const tips          = toArr(exp.tips)
              return (
                <div className={styles.expBody}>
                  {/* リード文 */}
                  <p className={styles.expLead}><MathText text={exp.lead} /></p>

                  {/* ステップ */}
                  {steps.length > 0 && (
                    <div className={styles.expSteps}>
                      {steps.map((s, i) => (
                        <div key={i} className={styles.expStep}>
                          <span className={styles.expStepNum}>{i + 1}</span>
                          <span className={styles.expStepText}><MathText text={s} /></span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* よくある間違い */}
                  {commonMistakes.length > 0 && (
                    <div className={styles.expMistakes}>
                      <p className={styles.expMistakesLabel}>⚠ よくある間違い</p>
                      {commonMistakes.map((m, i) => (
                        <p key={i} className={styles.expMistakeItem}><MathText text={m} /></p>
                      ))}
                    </div>
                  )}

                  {/* ポイント */}
                  {tips.length > 0 && (
                    <div className={styles.expTips}>
                      <p className={styles.expTipsLabel}>💡 ポイント</p>
                      {tips.map((t, i) => (
                        <p key={i} className={styles.expTipItem}><MathText text={t} /></p>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* AI チャット（準備完了・非表示中）有効化: false → true に変更 */}
            {false && (() => {
              const exp = explanations[question.id]
              const explanationText = exp
                ? [exp.lead, ...(exp.steps ?? [])].join(' ')
                : ''
              const correctChoice = question.choices.find(c => c.label === question.correct)
              return (
                <AIChat
                  question={question.question}
                  choices={question.choices}
                  correctLabel={correctChoice?.text ?? question.correct}
                  explanationText={explanationText}
                />
              )
            })()}

            {/* ボタン群 */}
            <div className={styles.expBtnRow}>
              <button className={styles.expCloseBtn} onClick={() => setPhase('reviewed')}>
                問題に戻る
              </button>
              <button className={styles.nextBtn} onClick={handleNextQuestion}>
                {currentIndex + 1 >= totalQ ? '結果を見る' : '次の問題へ'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
