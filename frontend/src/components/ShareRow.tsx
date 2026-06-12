/**
 * ShareRow — SNSシェアボタン
 * モバイル: Web Share API (native sheet)
 * デスクトップ: X / LINE ボタン
 */
import styles from './ShareRow.module.css'

interface Props {
  text: string   // シェアするテキスト（URL は自動付与）
}

const APP_URL = 'https://quiz-study-app-omega.vercel.app'

export function ShareRow({ text }: Props) {
  const fullText = `${text}\n${APP_URL}`

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: fullText })
    }
  }

  const xUrl   = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(text)}`

  /* Web Share API が使えるか（モバイルSafari / Chrome） */
  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div className={styles.row}>
      {canShare ? (
        <button className={styles.shareBtn} onClick={() => { void handleNativeShare() }}>
          <span className={styles.shareIcon}>📤</span>
          シェアする
        </button>
      ) : (
        <>
          <a
            className={`${styles.shareBtn} ${styles.xBtn}`}
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className={styles.xIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X でシェア
          </a>
          <a
            className={`${styles.shareBtn} ${styles.lineBtn}`}
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.shareIcon}>💬</span>
            LINE でシェア
          </a>
        </>
      )}
    </div>
  )
}
