/**
 * MagicCircle — 背景装飾の幾何学的魔法陣（SVG）
 * 中世アカデミー世界観のための背景エフェクト
 */
import styles from './MagicCircle.module.css'

const CX = 180
const CY = 180

/* ── 補助関数 ── */
function pt(r: number, deg: number): [number, number] {
  const a = (deg - 90) * Math.PI / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

function polygonPoints(r: number, n: number, offset = 0): string {
  return Array.from({ length: n }, (_, i) => {
    const [x, y] = pt(r, (i * 360) / n + offset)
    return `${x},${y}`
  }).join(' ')
}

export default function MagicCircle() {
  /* 12本の放射線（30°ごと） */
  const radials = Array.from({ length: 12 }, (_, i) => {
    const [x1, y1] = pt(44, i * 30)
    const [x2, y2] = pt(168, i * 30)
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="rgba(123,46,46,0.045)" strokeWidth={0.5} />
  })

  /* 環状の点（各リング上） */
  function ringDots(r: number, n: number, size: number, fill: string) {
    return Array.from({ length: n }, (_, i) => {
      const [x, y] = pt(r, (i * 360) / n)
      return <circle key={i} cx={x} cy={y} r={size} fill={fill} />
    })
  }

  /* 六芒星（2つの正三角形） */
  const tri1 = polygonPoints(145, 3, 0)   // 上向き
  const tri2 = polygonPoints(145, 3, 180) // 下向き（回転）

  /* 内側の正方形（45°傾き） */
  const sq1 = polygonPoints(90, 4, 0)
  const sq2 = polygonPoints(90, 4, 45)

  /* 外側の八角形 */
  const oct = polygonPoints(162, 8, 0)

  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg
        viewBox="0 0 360 360"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
      >
        {/* ── リング群 ── */}
        <circle cx={CX} cy={CY} r={170} fill="none" stroke="rgba(123,46,46,0.09)" strokeWidth={0.6} />
        <circle cx={CX} cy={CY} r={162} fill="none" stroke="rgba(201,168,106,0.10)" strokeWidth={0.4} strokeDasharray="2 10" />
        <circle cx={CX} cy={CY} r={145} fill="none" stroke="rgba(123,46,46,0.07)" strokeWidth={0.5} />
        <circle cx={CX} cy={CY} r={110} fill="none" stroke="rgba(123,46,46,0.07)" strokeWidth={0.5} />
        <circle cx={CX} cy={CY} r={90}  fill="none" stroke="rgba(201,168,106,0.08)" strokeWidth={0.4} strokeDasharray="1.5 6" />
        <circle cx={CX} cy={CY} r={72}  fill="none" stroke="rgba(123,46,46,0.06)" strokeWidth={0.4} />
        <circle cx={CX} cy={CY} r={44}  fill="none" stroke="rgba(123,46,46,0.07)" strokeWidth={0.5} />
        <circle cx={CX} cy={CY} r={20}  fill="none" stroke="rgba(201,168,106,0.10)" strokeWidth={0.4} />

        {/* ── 放射線 ── */}
        {radials}

        {/* ── 八角形（外側） ── */}
        <polygon points={oct} fill="none" stroke="rgba(201,168,106,0.09)" strokeWidth={0.5} />

        {/* ── 六芒星 ── */}
        <polygon points={tri1} fill="none" stroke="rgba(201,168,106,0.14)" strokeWidth={0.7} />
        <polygon points={tri2} fill="none" stroke="rgba(201,168,106,0.14)" strokeWidth={0.7} />

        {/* ── 二重正方形（内側） ── */}
        <polygon points={sq1} fill="none" stroke="rgba(123,46,46,0.07)" strokeWidth={0.5} />
        <polygon points={sq2} fill="none" stroke="rgba(123,46,46,0.07)" strokeWidth={0.5} />

        {/* ── 装飾ドット ── */}
        {ringDots(170, 12, 1.8, 'rgba(123,46,46,0.10)')}
        {ringDots(145, 6,  3.0, 'rgba(201,168,106,0.22)')}
        {ringDots(110, 12, 1.4, 'rgba(123,46,46,0.10)')}
        {ringDots(72,  6,  2.0, 'rgba(201,168,106,0.15)')}
        {ringDots(44,  12, 1.0, 'rgba(123,46,46,0.09)')}

        {/* ── 六芒星の頂点マーク（小菱形） ── */}
        {Array.from({ length: 6 }, (_, i) => {
          const [x, y] = pt(145, i * 60)
          return (
            <polygon
              key={i}
              points={`${x},${y - 4} ${x + 2.5},${y} ${x},${y + 4} ${x - 2.5},${y}`}
              fill="rgba(201,168,106,0.28)"
            />
          )
        })}

        {/* ── 中心飾り ── */}
        <circle cx={CX} cy={CY} r={5}   fill="none" stroke="rgba(201,168,106,0.22)" strokeWidth={0.6} />
        <circle cx={CX} cy={CY} r={2}   fill="rgba(201,168,106,0.25)" />
        <circle cx={CX} cy={CY} r={0.8} fill="rgba(123,46,46,0.30)" />
      </svg>
    </div>
  )
}
