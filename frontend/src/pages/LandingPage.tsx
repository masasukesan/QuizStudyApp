import { useNavigate } from 'react-router-dom'
import styles from './LandingPage.module.css'

const FEATURES = [
  {
    icon: '📖',
    title: '4択クイズで実力を磨く',
    desc: '共通テスト・高校受験対策に特化した問題を、4択クイズ形式でスキマ時間に演習できます。',
  },
  {
    icon: '🏆',
    title: 'レベルアップでやる気継続',
    desc: '問題を解くたびにEXPが溜まり、レベルアップ。バッジや称号で成長を実感できます。',
  },
  {
    icon: '📊',
    title: '全国ランキングで競い合う',
    desc: '中学生・高校生別のランキングで全国のライバルと切磋琢磨。順位が勉強の原動力になります。',
  },
  {
    icon: '🧮',
    title: '数学・英語・理科など多教科',
    desc: '数学（数学I・A・II・B・C）・英語・理科・社会など、共通テスト全教科に対応予定。',
  },
  {
    icon: '💡',
    title: 'わかりやすい解説',
    desc: '全問に丁寧な解説付き。「なぜその答えになるか」を中学生でも理解できる言葉で説明します。',
  },
  {
    icon: '📱',
    title: 'スマホで気軽に学習',
    desc: 'モバイルファーストの設計で、電車の中やちょっとした隙間時間に気軽に勉強できます。',
  },
]

const SUBJECTS = [
  { label: '数学IA', color: '#7090b0', icon: '∑' },
  { label: '数学IIB', color: '#7090b0', icon: '∫' },
  { label: '数学C', color: '#7090b0', icon: '∏' },
  { label: '英語', color: '#5a9a78', icon: 'A' },
  { label: '国語', color: '#b87490', icon: '文' },
  { label: '理科', color: '#b89020', icon: '⚗' },
  { label: '社会', color: '#8878a8', icon: '🌏' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>

      {/* ── ヒーロー ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.monogram}>MA</div>
          <h1 className={styles.heroTitle}>MATHACA</h1>
          <p className={styles.heroSub}>共通テスト・高校受験対策</p>
          <p className={styles.heroTagline}>
            繰り返し解いて、<br />
            本番で点を取る。
          </p>
          <p className={styles.heroDesc}>
            MATHACAは、4択クイズ形式で楽しく学べる無料の学習アプリです。
            数学・英語・理科など共通テスト全教科に対応し、
            ゲーミフィケーションでやる気を継続させます。
          </p>
          <div className={styles.heroBtns}>
            <button className={styles.btnPrimary} onClick={() => navigate('/login')}>
              無料ではじめる
            </button>
            <button className={styles.btnSecondary} onClick={() => navigate('/login')}>
              ログイン
            </button>
          </div>
        </div>
      </section>

      {/* ── 教科一覧 ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>対応教科</h2>
        <p className={styles.sectionDesc}>共通テスト・高校受験の主要教科を網羅</p>
        <div className={styles.subjectGrid}>
          {SUBJECTS.map(s => (
            <div key={s.label} className={styles.subjectChip} style={{ borderColor: s.color, color: s.color }}>
              <span className={styles.subjectIcon}>{s.icon}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 特徴 ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>MATHACAの特徴</h2>
        <p className={styles.sectionDesc}>勉強が苦手な子でも続けられる仕組み</p>
        <div className={styles.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 使い方 ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>使い方</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNum}>1</div>
            <div>
              <h3 className={styles.stepTitle}>無料アカウント作成</h3>
              <p className={styles.stepDesc}>メールアドレス不要。ユーザーネームとパスワードだけで30秒で登録できます。</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>2</div>
            <div>
              <h3 className={styles.stepTitle}>教科・単元を選ぶ</h3>
              <p className={styles.stepDesc}>数学・英語・理科など、勉強したい教科と単元を選択します。</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>3</div>
            <div>
              <h3 className={styles.stepTitle}>クイズに挑戦！</h3>
              <p className={styles.stepDesc}>4択クイズを解いてEXPを獲得。全問解き終わると結果と詳しい解説が表示されます。</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>4</div>
            <div>
              <h3 className={styles.stepTitle}>ランキングを確認</h3>
              <p className={styles.stepDesc}>全国ランキングで自分の順位を確認。ライバルに負けないよう毎日学習しましょう。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>さあ、始めよう</h2>
        <p className={styles.ctaDesc}>完全無料・登録30秒。今すぐ共通テスト対策をはじめよう。</p>
        <button className={styles.btnPrimary} onClick={() => navigate('/login')}>
          無料ではじめる →
        </button>
      </section>

      {/* ── フッター ── */}
      <footer className={styles.footer}>
        <p className={styles.footerName}>MATHACA</p>
        <div className={styles.footerLinks}>
          <a href="/privacy" className={styles.footerLink}>プライバシーポリシー</a>
          <span className={styles.footerSep}>|</span>
          <a href="/terms" className={styles.footerLink}>利用規約</a>
          <span className={styles.footerSep}>|</span>
          <a href="/login" className={styles.footerLink}>ログイン</a>
        </div>
        <p className={styles.footerCopy}>© 2026 MATHACA. All rights reserved.</p>
      </footer>
    </div>
  )
}
