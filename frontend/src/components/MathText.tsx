/**
 * MathText — KaTeX 数式レンダリングコンポーネント
 *
 * 使い方：
 *   <MathText text={question.question} />
 *   <MathText text={choice.text} />
 *
 * 対応記法：
 *   - インライン数式: $a_n = a \cdot r^{n-1}$
 *   - ブロック数式:   $$S_n = \frac{a(r^n-1)}{r-1}$$
 *   - 通常テキスト:   そのまま表示
 *
 * ⚠ CLAUDE.md 必須ルール：
 *   問題文・選択肢・解説テキストはすべて必ずこのコンポーネントを使う。
 *   {text} による直接レンダリング禁止。
 */

import katex from 'katex'

/* ────────────────────────────────────────────────────────── */
/*  型定義                                                    */
/* ────────────────────────────────────────────────────────── */
type Segment =
  | { type: 'text';   content: string }
  | { type: 'inline'; content: string }
  | { type: 'block';  content: string }

/* ────────────────────────────────────────────────────────── */
/*  パーサー（$$...$$ → block, $...$ → inline, その他 → text）  */
/* ────────────────────────────────────────────────────────── */
function parseMath(text: string): Segment[] {
  const segments: Segment[] = []
  // $$...$$ を先にマッチさせてから $...$ をマッチ（順序重要）
  const pattern = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    if (match[1] !== undefined) {
      segments.push({ type: 'block', content: match[1] })
    } else if (match[2] !== undefined) {
      segments.push({ type: 'inline', content: match[2] })
    }
    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return segments
}

/* ────────────────────────────────────────────────────────── */
/*  コンポーネント                                             */
/* ────────────────────────────────────────────────────────── */
interface MathTextProps {
  text: string
}

export function MathText({ text }: MathTextProps) {
  // text が undefined/null の場合はクラッシュせずに空を返す（JSON欠損・型ズレのフォールバック）
  if (text == null) return null
  const segments = parseMath(String(text))

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <span key={i}>{seg.content}</span>
        }

        const html = katex.renderToString(seg.content, {
          displayMode: seg.type === 'block',
          throwOnError: false,  // 構文エラーでもクラッシュしない
          output: 'html',
        })

        return (
          <span
            key={i}
            dangerouslySetInnerHTML={{ __html: html }}
            style={
              seg.type === 'block'
                ? { display: 'block', textAlign: 'center', margin: '0.5em 0', overflowX: 'auto' }
                : undefined
            }
          />
        )
      })}
    </>
  )
}
