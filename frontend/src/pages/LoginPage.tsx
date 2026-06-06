import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Monogram, CornerDiamonds } from '../components/LibraryUI'
import styles from './LoginPage.module.css'

type Step = 'login' | 'signup'

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
  id:          string
  label:       string
  sublabel?:   string
  type:        'text' | 'password'
  value:       string
  onChange:    (v: string) => void
  placeholder?: string
  minLength?:  number
  maxLength?:  number
  autoComplete?: string
  required?:   boolean
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
function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button className={styles.submitBtn} type="submit" disabled={loading}>
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
   LoginPage コンポーネント
   ══════════════════════════════════════════════════ */
export default function LoginPage() {
  const [step,     setStep]     = useState<Step>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  /* ── モード切り替え ── */
  function switchStep(next: Step) {
    setStep(next)
    setError(null)
    setUsername('')
    setPassword('')
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

  /* ── 新規登録処理 ── */
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (username.trim().length < 2) {
      setError('ユーザーネームは2文字以上にしてください')
      return
    }
    setError(null)
    setLoading(true)
    const internalEmail = await usernameToInternalEmail(username)
    const code = generateRecoveryCode()

    const { data, error: signupError } = await supabase.auth.signUp({ email: internalEmail, password })
    if (signupError) { setError(translateError(signupError.message)); setLoading(false); return }
    if (!data.user)  { setError('登録に失敗しました。もう一度お試しください'); setLoading(false); return }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({ id: data.user.id, username: username.trim(), avatar_id: 'cat', recovery_code: code })

    if (profileError) {
      if (profileError.code === '23505') {
        setError('このユーザーネームはすでに使われています')
        await supabase.auth.admin?.deleteUser(data.user.id).catch(() => null)
      } else {
        setError('プロフィールの作成に失敗しました: ' + profileError.message)
      }
      setLoading(false)
      return
    }

    sessionStorage.setItem(RECOVERY_CODE_KEY, code)
    setLoading(false)
  }

  /* ══════════════════════════════════════════════════
     レンダリング
  ══════════════════════════════════════════════════ */
  return (
    <div className={styles.page}>

      {/* ── 二重罫線フレーム ── */}
      <div className={styles.frame}>
        <CornerDiamonds size={6} inset={-3} />

        {/* ── ヘッダー ── */}
        <div className={styles.header}>
          <span className={styles.anno}>Est.  2026</span>
          <Monogram size={62} glyph="MA" italic />
          <h1 className={styles.title}>MATHACA</h1>
          <p className={styles.subtitle}>共通テスト　攻略の書</p>
        </div>

        {/* ── タブ ── */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${step === 'login' ? styles.tabActive : ''}`}
            onClick={() => switchStep('login')}
          >
            ログイン
          </button>
          <button
            type="button"
            className={`${styles.tab} ${step === 'signup' ? styles.tabActive : ''}`}
            onClick={() => switchStep('signup')}
          >
            新規登録
          </button>
        </div>

        {/* ── エラー帯 ── */}
        {error && <ErrorBar message={error} />}

        {/* ── フォーム ── */}
        <form
          className={styles.form}
          onSubmit={step === 'login' ? handleLogin : handleSignup}
        >
          <LibField
            id="username"
            label="ユーザーネーム"
            sublabel={step === 'signup' ? '2文字以上・後で変更可' : undefined}
            type="text"
            value={username}
            onChange={setUsername}
            placeholder={step === 'login' ? 'まなびくん' : '例：まなびくん'}
            maxLength={20}
            autoComplete="username"
            required
          />
          <LibField
            id="password"
            label="パスワード"
            sublabel={step === 'signup' ? '6文字以上' : undefined}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            minLength={step === 'signup' ? 6 : undefined}
            autoComplete={step === 'login' ? 'current-password' : 'new-password'}
            required
          />
          <SubmitButton
            loading={loading}
            label={step === 'login' ? '入　門' : '学　籍　を　得　る'}
          />
        </form>

      </div>
    </div>
  )
}
