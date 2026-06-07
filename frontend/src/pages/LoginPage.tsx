import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Monogram, CornerDiamonds } from '../components/LibraryUI'
import type { SchoolType } from '../components/SchoolTypeSelector'
import styles from './LoginPage.module.css'

type Step = 'login' | 'signup' | 'school_select'

/* sessionStorage のキー（SubjectPage と共有） */
export const RECOVERY_CODE_KEY = 'sq_new_recovery_code'

/* ══════════════════════════════════════════════════
   ユーザーネームから内部メアドを生成（決定論的）
   ══════════════════════════════════════════════════ */
async function usernameToInternalEmail(username: string): Promise<string> {
  const normalized = username.trim().toLowerCase()
  const encoder    = new TextEncoder()
  const data       = encoder.encode(normalized)
  const hashBuf    = await crypto.subtle.digest('SHA-256', data)
  const hashHex    = Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return `sq${hashHex.substring(0, 18)}@studyquest.internal`
}

/* ══════════════════════════════════════════════════
   復元コードを生成（例: ABCD-EFGH）
   ══════════════════════════════════════════════════ */
function generateRecoveryCode(): string {
  const chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const random = new Uint8Array(8)
  crypto.getRandomValues(random)
  const raw = Array.from(random)
    .map(b => chars[b % chars.length])
    .join('')
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`
}

/* ══════════════════════════════════════════════════
   エラーメッセージを日本語に変換
   ══════════════════════════════════════════════════ */
function translateError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'ユーザーネームまたはパスワードが違います'
  if (message.includes('User already registered'))
    return 'このユーザーネームはすでに使われています'
  if (message.includes('Password should be at least'))
    return 'パスワードは6文字以上にしてください'
  if (message.includes('duplicate key') || message.includes('unique'))
    return 'このユーザーネームはすでに使われています'
  return 'エラーが発生しました。もう一度お試しください'
}

/* ══════════════════════════════════════════════════
   サブコンポーネント：入力フィールド
   ══════════════════════════════════════════════════ */
interface LibFieldProps {
  id:           string
  label:        string
  sublabel?:    string
  type:         'text' | 'password'
  value:        string
  onChange:     (v: string) => void
  placeholder?: string
  minLength?:   number
  maxLength?:   number
  autoComplete?: string
  required?:    boolean
}

function LibField({
  id, label, sublabel, type, value, onChange, placeholder, minLength, maxLength, autoComplete, required,
}: LibFieldProps) {
  return (
    <div className={styles.fieldWrap}>
      <div className={styles.fieldLabelRow}>
        <label htmlFor={id} className={styles.fieldLabel}>{label}</label>
        {sublabel && <span className={styles.fieldSublabel}>{sublabel}</span>}
      </div>
      <input
        id={id}
        className={`${styles.input} ${type === 'password' ? styles.inputPassword : ''}`}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        autoComplete={autoComplete}
        required={required}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════
   サブコンポーネント：エラー帯
   ══════════════════════════════════════════════════ */
function ErrorBar({ message }: { message: string }) {
  return (
    <div className={styles.errorBar}>
      <span className={styles.errorDiamond} aria-hidden="true" />
      <span className={styles.errorText}>{message}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   サブコンポーネント：送信ボタン
   ══════════════════════════════════════════════════ */
function SubmitButton({ loading, label, disabled }: { loading: boolean; label: string; disabled?: boolean }) {
  return (
    <button className={styles.submitBtn} type="submit" disabled={loading || disabled}>
      <span className={styles.submitInner} />
      {loading
        ? <><Spinner />処　理　中</>
        : label}
    </button>
  )
}

function Spinner() {
  return <span className={styles.spinner} aria-hidden="true" />
}

/* ══════════════════════════════════════════════════
   サブコンポーネント：学校種別カード
   ══════════════════════════════════════════════════ */
const SCHOOL_CARDS = [
  {
    type:   'junior_high' as SchoolType,
    emoji:  '📚',
    label:  '中学生',
    note:   '中1〜中3',
    color:  '#7090b0',
    glow:   'rgba(112, 144, 176, 0.35)',
    border: 'rgba(112, 144, 176, 0.6)',
  },
  {
    type:   'high_school' as SchoolType,
    emoji:  '🎓',
    label:  '高校生',
    note:   '高1〜高3',
    color:  '#e0c07a',
    glow:   'rgba(224, 192, 122, 0.35)',
    border: 'rgba(224, 192, 122, 0.6)',
  },
] as const

interface SchoolSelectProps {
  selected:  SchoolType | null
  onSelect:  (t: SchoolType) => void
  onBack:    () => void
  onConfirm: () => void
  loading:   boolean
  error:     string | null
}

function SchoolSelect({ selected, onSelect, onBack, onConfirm, loading, error }: SchoolSelectProps) {
  return (
    <div className={styles.schoolSelectWrap}>
      <p className={styles.schoolHeading}>あなたは？</p>
      <p className={styles.schoolSub}>ランキングは中学生・高校生で<br />独立して集計されます</p>

      <div className={styles.schoolCardRow}>
        {SCHOOL_CARDS.map(c => {
          const active = selected === c.type
          return (
            <button
              key={c.type}
              type="button"
              className={`${styles.schoolCard} ${active ? styles.schoolCardActive : ''}`}
              style={{
                '--sc-color':  c.color,
                '--sc-glow':   c.glow,
                '--sc-border': c.border,
              } as React.CSSProperties}
              onClick={() => onSelect(c.type)}
            >
              <span className={styles.schoolEmoji}>{c.emoji}</span>
              <span className={styles.schoolLabel}>{c.label}</span>
              <span className={styles.schoolNote}>{c.note}</span>
              {active && <span className={styles.schoolCheck} aria-hidden="true">✓</span>}
            </button>
          )
        })}
      </div>

      {error && <ErrorBar message={error} />}

      <button
        type="button"
        className={styles.submitBtn}
        disabled={!selected || loading}
        onClick={onConfirm}
      >
        <span className={styles.submitInner} />
        {loading
          ? <><Spinner />登　録　中</>
          : selected ? '学　籍　を　得　る' : '選択してください'}
      </button>

      <button type="button" className={styles.backLink} onClick={onBack}>
        ← もどる
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   LoginPage コンポーネント
   ══════════════════════════════════════════════════ */
export default function LoginPage() {
  const [step,       setStep]       = useState<Step>('login')
  const [username,   setUsername]   = useState('')
  const [password,   setPassword]   = useState('')
  const [schoolType, setSchoolType] = useState<SchoolType | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  /* ── タブ切り替え ── */
  function switchTab(next: 'login' | 'signup') {
    setStep(next)
    setError(null)
    setUsername('')
    setPassword('')
    setSchoolType(null)
  }

  /* ── ログイン処理 ── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) { setError('ユーザーネームを入力してください'); return }
    setError(null)
    setLoading(true)
    const internalEmail = await usernameToInternalEmail(username)
    const { error } = await supabase.auth.signInWithPassword({ email: internalEmail, password })
    setLoading(false)
    if (error) setError(translateError(error.message))
  }

  /* ── 新規登録フォーム → 学校種別選択へ進む ── */
  function handleSignupNext(e: React.FormEvent) {
    e.preventDefault()
    if (username.trim().length < 2) { setError('ユーザーネームは2文字以上にしてください'); return }
    if (password.length < 6)        { setError('パスワードは6文字以上にしてください'); return }
    setError(null)
    setStep('school_select')
  }

  /* ── 学校種別確定 → 実際の登録処理 ── */
  async function handleSignupConfirm() {
    if (!schoolType) return
    setError(null)
    setLoading(true)
    const internalEmail = await usernameToInternalEmail(username)
    const code = generateRecoveryCode()

    const { data, error: signupError } = await supabase.auth.signUp({ email: internalEmail, password })
    if (signupError) { setError(translateError(signupError.message)); setLoading(false); return }
    if (!data.user)  { setError('登録に失敗しました。もう一度お試しください'); setLoading(false); return }

    const { error: prof