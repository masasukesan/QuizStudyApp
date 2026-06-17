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

import { createElement } from 'react'
import katex from 'katex'

type Segment =
  | { type: 'text';   content: string }
  | { type: 'inline'; content: string }
  | { type: 'block';  content: string }

function parseMath(text: string): Segment[] {
  const segments: Segment[] = []
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

interface MathTextProps {
  text: string
}

export function MathText({ text }: MathTextProps) {
  if (text == null) return null
  const segments = parseMath(String(text))

  return createElement(
    'span',
    null,
    ...segments.map((seg, i) => {
      if (seg.type === 'text') {
        // \n---\n を <hr> に変換して英文ブロックを視覚的に区切る
        const parts = seg.content.split(/\n---\n/)
        if (parts.length === 1) {
          return createElement('span', { key: i }, seg.content)
        }
        const nodes = parts.flatMap((part, j) =>
          j === 0
            ? [createElement('span', { key: 't' + j }, part)]
            : [
                createElement('hr', { key: 'hr' + j, style: { border: 'none', borderTop: '1px solid currentColor', opacity: 0.25, margin: '6px 0' } }),
                createElement('span', { key: 't' + j }, part),
              ]
        )
        return createElement('span', { key: i }, ...nodes)
      }

      const html = katex.renderToString(seg.content, {
        displayMode: seg.type === 'block',
        throwOnError: false,
        output: 'html',
      })

      return createElement('span', {
        key: i,
        dangerouslySetInnerHTML: { __html: html },
        style: seg.type === 'block'
          ? { display: 'block', textAlign: 'center', margin: '0.5em 0', overflowX: 'auto' }
          : undefined,
      })
    })
  )
}
