import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MathText } from '../components/MathText'
import styles from './PreviewPage.module.css'

/* ══════════════════════════════════════════════════
   無料体験ページ（ログイン不要・公開ページ）

   目的：
   ・ログインなしで誰でも（人間も検索/広告クローラーも）
     実際の問題と解説を見られる公開コンテンツを提供する
   ・AdSense 審査対象になり得る、実質のあるコンテンツページ
   ・curriculum/math/1A/quadratic-functions/quadratic-maxima-and-minima
     の検証済み問題を題材に、basic / standard / exam を1問ずつ紹介
   ══════════════════════════════════════════════════ */

interface Choice {
  label: string
  text: string
}

interface PreviewQuestion {
  id: string
  difficulty: 'basic' | 'standard' | 'exam'
  difficultyLabel: string
  unit: string
  question: string
  choices: Choice[]
  correct: string
  lead: string
  steps: string[]
  tip: string
}

const ROMAN: Record<string, string> = { A: 'I', B: 'II', C: 'III', D: 'IV' }

const QUESTIONS: PreviewQuestion[] = [
  {
    id: 'mm-001',
    difficulty: 'basic',
    difficultyLabel: 'Basic',
    unit: '数学IA・2次関数の最大最小',
    question: 'y = x² - 4x + 1 を平方完成して最小値を求める途中式として正しいのはどれか。',
    choices: [
      { label: 'A', text: 'y=(x-2)²-4+1=(x-2)²-3 → 最小値=-3' },
      { label: 'B', text: 'y=(x-2)²+1 → 最小値=1' },
      { label: 'C', text: 'y=(x+2)²-3 → 最小値=-3' },
      { label: 'D', text: 'y=(x-2)²-1 → 最小値=-1' },
    ],
    correct: 'A',
    lead: '平方完成とは「x² + bx + c の形の式を、(x-p)² + q の形に書き換える」操作のこと。この形にすると、頂点の座標が (p, q) だと一目でわかるようになる。',
    steps: [
      'x²-4x の部分だけに注目し、xの係数「-4」を半分にした「-2」を使って (x-2)² を作る。展開すると (x-2)² = x²-4x+4 なので、もとの式より 4 だけ多い。',
      'その分を帳尻合わせするために、後ろの定数から 4 を引く。y=(x-2)²-4+1 となり、まとめると y=(x-2)²-3。',
      '(x-2)² は必ず0以上の値になるので、y が一番小さくなるのは (x-2)²=0 のとき、つまり x=2 のとき。そのとき y=-3。よって最小値は -3。',
    ],
    tip: '選択肢Bは「-4」の処理を忘れて定数をそのまま残してしまったミス。選択肢Cは頂点の符号を +2 でなく -2 と間違えたミス。平方完成の途中式は「展開して元の式と一致するか」を必ず自分で確かめると事故が減る。',
  },
  {
    id: 'mm-013',
    difficulty: 'standard',
    difficultyLabel: 'Standard',
    unit: '数学IA・2次関数の最大最小（定義域あり）',
    question: 'y = -x² + 4x = -(x-2)² + 4 で頂点は (2, 4)。定義域 -1 ≤ x ≤ 3 で頂点が定義域内にあるかを確認するとき、正しい判断はどれか。',
    choices: [
      { label: 'A', text: '-1 ≤ 2 ≤ 3 なので頂点が定義域内 → 最大値は頂点の y = 4' },
      { label: 'B', text: '下に凸なので端点 x=-1 か x=3 で最大 → x=3 のとき y=3' },
      { label: 'C', text: '頂点が定義域外なので端点で最大 → x=-1 のとき y=-5' },
      { label: 'D', text: '-1 ≤ 2 ≤ 3 なので頂点が定義域内 → 最大値は頂点の y = 2' },
    ],
    correct: 'A',
    lead: '定義域（xの範囲）が指定された最大・最小問題では、まず「グラフの頂点が、その範囲の中に入っているかどうか」を確認するのが最初の一手になる。頂点が範囲の中にあれば、そこが最大値または最小値の候補になる。',
    steps: [
      'この式は上に凸（x²の係数が-1でマイナス）のグラフなので、頂点が最大値の候補になる。頂点のx座標は2。',
      '定義域は -1 ≤ x ≤ 3。2はこの範囲に含まれているか確認する → -1 ≤ 2 ≤ 3 は成り立つので、頂点は定義域の中にある。',
      '上に凸で頂点が定義域内にあるなら、その頂点のy座標がそのまま最大値になる。頂点は (2, 4) なので、最大値は 4。',
    ],
    tip: 'もし頂点のx座標が定義域からはみ出していたら、話は変わる。その場合は頂点ではなく、定義域の両端（この問題ならx=-1とx=3）のy座標を実際に計算して比べる必要がある。「頂点が範囲内か外か」で解き方が分岐する、という点がこのタイプの問題の核心。',
  },
  {
    id: 'mm-021',
    difficulty: 'exam',
    difficultyLabel: 'Exam',
    unit: '数学IA・2次関数の最大最小（文字係数）',
    question: 'y = x² - 2ax + a の最小値はどれか。',
    choices: [
      { label: 'A', text: 'a - a²' },
      { label: 'B', text: 'a²' },
      { label: 'C', text: '-a' },
      { label: 'D', text: 'a' },
    ],
    correct: 'A',
    lead: 'xの係数に文字（この問題では a）が入っていても、平方完成の手順自体は数字のときとまったく同じ。「x の係数を半分にして2乗する」という操作を、数字の代わりに文字式のまま行うだけでよい。',
    steps: [
      'x²-2ax の部分に注目し、xの係数「-2a」を半分にした「-a」を使って (x-a)² を作る。展開すると (x-a)²=x²-2ax+a² なので、もとの式より a² だけ多い。',
      'その分を定数項から引いて帳尻を合わせる。y=(x-a)²-a²+a となる。',
      '(x-a)² は必ず0以上なので、y が最小になるのは (x-a)²=0 のとき、つまり x=a のとき。そのとき y=-a²+a、これを並べ替えると a-a²。よって最小値は a-a²。',
    ],
    tip: '文字係数の問題を怖がる受験生は多いが、「係数を半分にして2乗し、その分を引く」という平方完成の手順そのものは文字でも数字でも変わらない。慣れないうちは a に具体的な数（a=2など）を代入して答えが合うか検算すると、計算ミスに気づきやすい。',
  },
]

export default function PreviewPage() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)

  const q = QUESTIONS[index]
  const answered = selected !== null
  const isCorrect = selected === q?.correct

  function handleSelect(label: string) {
    if (answered) return
    setSelected(label)
  }

  function handleNext() {
    if (index + 1 >= QUESTIONS.length) {
      setFinished(true)
      return
    }
    setIndex(i => i + 1)
    setSelected(null)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>MATHACA</span>
        <button className={styles.headerLoginBtn} onClick={() => navigate('/login')}>
          ログイン
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.intro}>
          <p className={styles.introLabel}>無料体験・登録不要</p>
          <h1 className={styles.introTitle}>MATHACAの問題を<br />3問だけ、そのまま試す</h1>
          <p className={styles.introDesc}>
            MATHACAは、共通テスト・高校受験対策のための4択クイズ学習アプリです。
            このページでは実際に配信している問題と解説を、登録なしでそのまま体験できます。
            まずは数学「2次関数の最大・最小」から、難易度の異なる3問をどうぞ。
          </p>
        </section>

        {!finished && q && (
          <section className={styles.quizCard} key={q.id}>
            <div className={styles.quizMeta}>
              <span className={`${styles.diffBadge} ${styles['diff' + q.difficulty]}`}>{q.difficultyLabel}</span>
              <span className={styles.unitTag}>{q.unit}</span>
              <span className={styles.counter}>{index + 1} / {QUESTIONS.length}</span>
            </div>

            <p className={styles.questionText}><MathText text={q.question} /></p>

            <div className={styles.choices}>
              {q.choices.map(choice => {
                let stateClass = ''
                if (answered) {
                  if (choice.label === q.correct) stateClass = styles.choiceCorrect
                  else if (choice.label === selected) stateClass = styles.choiceWrong
                  else stateClass = styles.choiceDim
                }
                return (
                  <button
                    key={choice.label}
                    className={`${styles.choiceBtn} ${stateClass}`}
                    onClick={() => handleSelect(choice.label)}
                    disabled={answered}
                  >
                    <span className={styles.choiceLabel}>{ROMAN[choice.label] ?? choice.label}</span>
                    <span className={styles.choiceText}><MathText text={choice.text} /></span>
                  </button>
                )
              })}
            </div>

            {answered && (
              <div className={styles.explanation}>
                <div className={`${styles.resultBadge} ${isCorrect ? styles.resultCorrect : styles.resultWrong}`}>
                  {isCorrect ? '✓ 正解' : `✗ 不正解（正解は ${ROMAN[q.correct]}）`}
                </div>
                <p className={styles.expLead}><MathText text={q.lead} /></p>
                <div className={styles.expSteps}>
                  {q.steps.map((s, i) => (
                    <div key={i} className={styles.expStep}>
                      <span className={styles.expStepNum}>{i + 1}</span>
                      <span className={styles.expStepText}><MathText text={s} /></span>
                    </div>
                  ))}
                </div>
                <div className={styles.expTip}>
                  <span className={styles.expTipLabel}>💡 ポイント</span>
                  <p><MathText text={q.tip} /></p>
                </div>
                <button className={styles.nextBtn} onClick={handleNext}>
                  {index + 1 >= QUESTIONS.length ? '体験を終える' : '次の問題へ →'}
                </button>
              </div>
            )}
          </section>
        )}

        {finished && (
          <section className={styles.ctaCard}>
            <p className={styles.ctaEyebrow}>体験おつかれさま</p>
            <h2 className={styles.ctaTitle}>これは全体のごく一部です</h2>
            <p className={styles.ctaDesc}>
              MATHACAには数学・英語・国語・理科・社会の主要単元それぞれに、
              basic・standard・exam 各10問、合計30問の演習と解説が揃っています。
              無料登録すると、EXP・レベル・全国ランキングと一緒に続けて学習できます。
            </p>
            <button className={styles.ctaBtn} onClick={() => navigate('/login')}>
              無料ではじめる →
            </button>
            <p className={styles.ctaSub}>登録は30秒。メールアドレス不要。</p>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerName}>MATHACA</p>
        <div className={styles.footerLinks}>
          <a href="https://mathaca-lp.vercel.app/column.html" className={styles.footerLink}>学習コラム</a>
          <span className={styles.footerSep}>|</span>
          <a href="https://mathaca-lp.vercel.app/privacy.html" className={styles.footerLink}>プライバシーポリシー</a>
          <span className={styles.footerSep}>|</span>
          <a href="https://mathaca-lp.vercel.app/contact.html" className={styles.footerLink}>お問い合わせ</a>
        </div>
        <p className={styles.footerCopy}>© 2026 MATHACA. All rights reserved.</p>
      </footer>
    </div>
  )
}
