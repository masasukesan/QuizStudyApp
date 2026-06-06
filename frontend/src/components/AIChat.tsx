import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './AIChat.module.css'
import { MathText } from './MathText'

interface Choice {
  label: string
  text: string
}

interface AIChatProps {
  question: string
  choices: Choice[]
  correctLabel: string
  /** explanations.json の lead + steps を結合した文字列 */
  explanationText: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AIChat({ question, choices, correctLabel, explanationText }: AIChatProps) {
  const [open,     setOpen]     = useState(false)
  const [input,    setInput]    = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // 新しいメッセージが来たら自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // 問題が変わったらリセット
  useEffect(() => {
    setMessages([])
    setInput('')
    setOpen(false)
  }, [question])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          userMessage: trimmed,
          questionContext: {
            question,
            choices,
            correct: correctLabel,
            explanation: explanationText,
          },
        },
      })

      if (error) throw error

      const answer = (data as { answer: string }).answer
      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠ AIへの接続に失敗しました。しばらくしてから再度お試しください。' },
      ])
      console.error('ai-chat error:', e)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className={styles.wrap}>
      {/* トグルボタン */}
      <button
        className={`${styles.toggleBtn} ${open ? styles.toggleOpen : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        🤖 AIに質問する {open ? '▲' : '▼'}
      </button>

      {/* チャットエリア */}
      {open && (
        <div className={styles.chatBox}>
          {/* メッセージ一覧 */}
          <div className={styles.messages}>
            {messages.length === 0 && (
              <p className={styles.placeholder}>
                この問題について、わからないことを質問してみよう！
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.aiBubble}`}
              >
                {msg.role === 'assistant'
                  ? <MathText text={msg.content} />
                  : msg.content
                }
              </div>
            ))}
            {loading && (
              <div className={`${styles.bubble} ${styles.aiBubble} ${styles.loadingBubble}`}>
                <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* 入力欄 */}
          <div className={styles.inputRow}>
            <input
              className={styles.input}
              type="text"
              placeholder="質問を入力…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className={styles.sendBtn}
              onClick={() => void handleSend()}
              disabled={loading || !input.trim()}
            >
              送信
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
