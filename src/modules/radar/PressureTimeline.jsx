// Presión competitiva 30 días (DESIGN §5): líneas con UNA serie enfatizada (Verisure rojo),
// competencia en grises, eventos anotados como puntos con etiqueta. SVG propio: sin grid
// pesado, etiquetas directas al final de cada línea (no leyenda lejana). Baseline en 0.
import { fmtDayShort } from './dateLabels'
import { brandDisplay } from './radarUtils'

const W = 820
const H = 240
const PAD = { top: 24, right: 92, bottom: 28, left: 12 }

function seriesFor(pressure, maname) {
  return pressure.map((p) => p.byBrand?.[maname] || 0)
}

function insight(pressure) {
  if (!pressure?.length) return 'Inversión diaria estimada'
  const brands = new Set()
  pressure.forEach((p) => Object.keys(p.byBrand || {}).forEach((b) => brands.add(b)))
  const half = Math.floor(pressure.length / 2)
  const trend = {}
  for (const b of brands) {
    const s = seriesFor(pressure, b)
    const early = s.slice(0, half).reduce((a, c) => a + c, 0) / Math.max(1, half)
    const late = s.slice(half).reduce((a, c) => a + c, 0) / Math.max(1, s.length - half)
    trend[b] = late - early
  }
  const sorted = [...brands].sort((a, b) => trend[b] - trend[a])
  const riser = sorted[0]
  const faller = sorted[sorted.length - 1]
  if (!riser || trend[riser] <= 0) return 'Inversión diaria estimada · últimos 30 días'
  return `La presión de ${brandDisplay(riser)} crece desde fines de junio${
    faller && trend[faller] < 0 ? `; ${brandDisplay(faller)} se apaga` : ''
  }`
}

export default function PressureTimeline({ pressure = [], events = [], degraded = false }) {
  if (!pressure.length) return null
  const brands = new Set()
  pressure.forEach((p) => Object.keys(p.byBrand || {}).forEach((b) => brands.add(b)))
  const brandList = [...brands]

  const max = Math.max(
    1,
    ...pressure.flatMap((p) => Object.values(p.byBrand || {}).map((v) => Number(v) || 0)),
  )
  const n = pressure.length
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const x = (i) => PAD.left + (n === 1 ? 0 : (i / (n - 1)) * innerW)
  const y = (v) => PAD.top + innerH - (v / max) * innerH

  // stroke = color de la línea (gris de rampa para competencia); label = color del texto
  // de la etiqueta directa, siempre legible (AA) aunque la línea sea gris claro.
  const styleOf = (maname) => {
    const m = maname.toUpperCase()
    if (m.includes('VERISURE')) return { stroke: 'var(--verisure)', label: 'var(--verisure)', width: 2.5 }
    if (m.includes('PROSEGUR')) return { stroke: 'var(--ink)', label: 'var(--ink)', width: 1.75 }
    return { stroke: 'var(--ink-3)', label: 'var(--ink-2)', width: 1.5 }
  }

  const dateIdx = (fecha) => pressure.findIndex((p) => p.fecha === (fecha || '').slice(0, 10))

  return (
    <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <h3 className="font-display text-xl text-ink sm:text-2xl">{insight(pressure)}</h3>
      <p className="mt-1 text-sm text-ink-2">Inversión diaria estimada · últimos 30 días</p>

      <div className="scroll-x-fade mt-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ minWidth: 520, display: 'block' }}
          role="img"
          aria-label="Inversión diaria estimada por competidor, últimos 30 días"
        >
          {/* baseline sutil (única línea de referencia, DESIGN §5) */}
          <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} stroke="var(--line)" strokeWidth="1" />

          {brandList.map((b) => {
            const st = styleOf(b)
            const pts = seriesFor(pressure, b).map((v, i) => `${x(i)},${y(v)}`).join(' ')
            const lastV = seriesFor(pressure, b)[n - 1]
            return (
              <g key={b}>
                <polyline points={pts} fill="none" stroke={st.stroke} strokeWidth={st.width} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={degraded ? '4 3' : undefined} />
                {/* etiqueta directa al final */}
                <text x={PAD.left + innerW + 8} y={y(lastV) + 4} fontSize="12" fill={st.label} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {brandDisplay(b)}
                </text>
              </g>
            )
          })}

          {/* eventos anotados */}
          {events.map((ev, k) => {
            const i = dateIdx(ev.fecha)
            if (i < 0) return null
            const v = pressure[i].byBrand?.[ev.maname] || max * 0.5
            return (
              <g key={k}>
                <circle cx={x(i)} cy={y(v)} r="3.5" fill="var(--ink)" />
                <text x={x(i)} y={y(v) - 8} fontSize="12" fill="var(--ink-2)" textAnchor="middle">
                  {ev.label}
                </text>
              </g>
            )
          })}

          {/* eje X: 5 marcas de fecha */}
          {[...new Set([0, Math.floor((n - 1) / 4), Math.floor((n - 1) / 2), Math.floor((3 * (n - 1)) / 4), n - 1])].map((i) => (
            <text key={i} x={x(i)} y={H - 8} fontSize="12" fill="var(--ink-2)" textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {fmtDayShort(pressure[i].fecha)}
            </text>
          ))}
        </svg>
      </div>
    </section>
  )
}
