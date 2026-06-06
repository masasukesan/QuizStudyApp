/**
 * LibraryUI.tsx — 古典書斎テーマの共通装飾コンポーネント
 *
 * Flourish       ─◆─  区切り装飾
 * Monogram       二重円の紋章（SQ ロゴ / ユーザーイニシャル）
 * CornerDiamonds 四隅のひし形装飾
 */

import type { CSSProperties } from 'react'

/* ══════════════════════════════════════════════════
   Flourish ─◆─
   ══════════════════════════════════════════════════ */
interface FlourishProps {
  width?:      number
  thickness?:  number
  diamondSize?: number
  color?:      string
  className?:  string
}

export function Flourish({
  width       = 130,
  thickness   = 0.75,
  diamondSize = 6,
  color       = 'var(--sq-burgundy)',
  className,
}: FlourishProps) {
  const style: CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          width,
    margin:         '0 auto',
    gap:            6,
  }
  const lineStyle: CSSProperties = {
    flex:       1,
    height:     thickness,
    background: color,
  }
  const diamondStyle: CSSProperties = {
    width:      diamondSize,
    height:     diamondSize,
    background: color,
    transform:  'rotate(45deg)',
    flexShrink: 0,
  }
  return (
    <div style={style} className={className}>
      <div style={lineStyle} />
      <div style={diamondStyle} />
      <div style={lineStyle} />
    </div>
  )
}

/* ══════════════════════════════════════════════════
   Monogram — 魔法陣紋章（SVGベース）
   ══════════════════════════════════════════════════ */
interface MonogramProps {
  size?:   number
  glyph?:  string   /* 中央に表示する文字（省略時は "SQ"） */
  italic?: boolean
}

export function Monogram({ size = 62, glyph = 'SQ', italic = true }: MonogramProps) {
  const C = 50  // SVG viewBox の中心座標（100×100）
  const fontSize = glyph.length > 1
    ? Math.round(size * 0.28)
    : Math.round(size * 0.32)

  /* r=角度deg で座標を計算 */
  function pt(r: number, deg: number): [number, number] {
    const a = (deg - 90) * Math.PI / 180
    return [C + r * Math.cos(a), C + r * Math.sin(a)]
  }
  function poly(r: number, n: number, offset = 0): string {
    return Array.from({ length: n }, (_, i) => {
      const [x, y] = pt(r, (i * 360) / n + offset)
      return `${x},${y}`
    }).join(' ')
  }

  /* 8方向の放射線 */
  const radials = Array.from({ length: 8 }, (_, i) => {
    const [x1, y1] = pt(16, i * 45)
    const [x2, y2] = pt(40, i * 45)
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="rgba(123,46,46,0.18)" strokeWidth={0.4} />
  })

  /* リング上の小ドット */
  function ringDots(r: number, n: number, dotR: number, color: string) {
    return Array.from({ length: n }, (_, i) => {
      const [x, y] = pt(r, (i * 360) / n)
      return <circle key={i} cx={x} cy={y} r={dotR} fill={color} />
    })
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* SVG 魔法陣レイヤー */}
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        {/* 外枠円 */}
        <circle cx={C} cy={C} r={48} fill="none" stroke="rgba(123,46,46,0.55)" strokeWidth={0.8} />
        {/* 外リング（破線） */}
        <circle cx={C} cy={C} r={44} fill="none" stroke="rgba(201,168,106,0.30)" strokeWidth={0.5} strokeDasharray="2 5" />
        {/* 中リング */}
        <circle cx={C} cy={C} r={38} fill="none" stroke="rgba(123,46,46,0.18)" strokeWidth={0.5} />
        {/* 内リング */}
        <circle cx={C} cy={C} r={28} fill="none" stroke="rgba(201,168,106,0.22)" strokeWidth={0.5} strokeDasharray="1.5 4" />
        {/* 最内リング */}
        <circle cx={C} cy={C} r={18} fill="none" stroke="rgba(123,46,46,0.15)" strokeWidth={0.4} />

        {/* 放射線 */}
        {radials}

        {/* 六芒星（上向き・下向き三角形） */}
        <polygon points={poly(38, 3, 0)}   fill="none" stroke="rgba(201,168,106,0.22)" strokeWidth={0.5} />
        <polygon points={poly(38, 3, 180)} fill="none" stroke="rgba(201,168,106,0.22)" strokeWidth={0.5} />

        {/* 正方形（45°） */}
        <polygon points={poly(26, 4, 45)} fill="none" stroke="rgba(123,46,46,0.14)" strokeWidth={0.4} />

        {/* 装飾ドット */}
        {ringDots(48, 12, 0.9, 'rgba(123,46,46,0.22)')}
        {ringDots(38, 6,  1.5, 'rgba(201,168,106,0.40)')}
        {ringDots(18, 8,  0.7, 'rgba(123,46,46,0.18)')}

        {/* 六芒星頂点の菱形 */}
        {Array.from({ length: 6 }, (_, i) => {
          const [x, y] = pt(38, i * 60)
          return (
            <polygon key={i}
              points={`${x},${y-2} ${x+1.2},${y} ${x},${y+2} ${x-1.2},${y}`}
              fill="rgba(201,168,106,0.45)"
            />
          )
        })}

        {/* 中心飾り */}
        <circle cx={C} cy={C} r={2.5} fill="none" stroke="rgba(201,168,106,0.35)" strokeWidth={0.5} />
        <circle cx={C} cy={C} r={1}   fill="rgba(201,168,106,0.40)" />
      </svg>

      {/* グリフテキスト（中央） */}
      <span style={{
        position:      'absolute',
        inset:         0,
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
        fontFamily:    'var(--font-serif-en)',
        fontSize:      fontSize,
        fontWeight:    500,
        fontStyle:     italic ? 'italic' : 'normal',
        color:         'var(--sq-burgundy)',
        letterSpacing: glyph.length > 1 ? 1 : 0,
        lineHeight:    1,
        userSelect:    'none',
      }}>
        {glyph}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   CornerDiamonds — 四隅の回転ひし形
   親要素は position: relative が必要
   ══════════════════════════════════════════════════ */
interface CornerDiamondsProps {
  size?:  number   /* ひし形の一辺 px */
  inset?: number   /* 親辺からのオフセット（負値で外にはみ出す） */
  color?: string
}

export function CornerDiamonds({
  size  = 6,
  inset = -3,
  color = 'var(--sq-burgundy)',
}: CornerDiamondsProps) {
  const base: CSSProperties = {
    position:  'absolute',
    width:     size,
    height:    size,
    background: color,
    transform: 'rotate(45deg)',
  }
  return (
    <>
      <span style={{ ...base, top: inset, left: inset }} aria-hidden="true" />
      <span style={{ ...base, top: inset, right: inset }} aria-hidden="true" />
      <span style={{ ...base, bottom: inset, left: inset }} aria-hidden="true" />
      <span style={{ ...base, bottom: inset, right: inset }} aria-hidden="true" />
    </>
  )
}
