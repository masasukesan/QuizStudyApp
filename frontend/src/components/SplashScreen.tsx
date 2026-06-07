/**
 * SplashScreen — アプリ起動時に魔法陣を全画面表示してフェードアウト
 */
import { useEffect, useState } from 'react'
import MagicCircle from './MagicCircle'

interface Props {
  onDone: () => void
}

export default function SplashScreen({ onDone }: Props) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // 1.2秒後にフェードアウト開始
    const fadeTimer = setTimeout(() => setFading(true), 1200)
    // フェードアウト完了後（0.6秒）に非表示
    const doneTimer = setTimeout(() => onDone(), 1800)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div style={{
      position:        'fixed',
      inset:           0,
      backgroundColor: '#f8f3e7',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      zIndex:          9999,
      opacity:         fading ? 0 : 1,
      transition:      'opacity 0.6s ease',
      pointerEvents:   'none',
    }}>
      <MagicCircle />
    </div>
  )
}
