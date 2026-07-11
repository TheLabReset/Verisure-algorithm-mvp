// Tendencia de interés de búsqueda (DEMANDA) — Google Trends Perú, índice 0–100.
// Serie de la categoría enfatizada; el título afirma el insight (crecimiento + estacionalidad).
import { fmtDayShort } from '../radar/dateLabels'

const W = 720
const H = 220
const PAD = { top: 20, right: 16, bottom: 26, left: 16 }

export default function SearchTrend({ trends }) {
  const serie = trends?.series_alarma_casa || []
  const kw = (trends?.keywords || []).find((k) => k.keyword === 'alarma para casa')
  if (!serie.length) return null

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const n = serie.length
  const x = (i) => PAD.left + (n === 1 ? 0 : (i / (n - 1)) * innerW)
  const y = (v) => PAD.top + innerH - (v / 100) * innerH // índice 0–100
  const pts = serie.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')

  const growth = kw ? kw.growth_90d : null
  const ticks = [...new Set([0, Math.floor((n - 1) / 2), n - 1])]

  return (
    <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <h3 className="font-display text-xl text-ink sm:text-2xl">
        «Alarma para casa»{growth != null ? ` crece ${growth}% en 90 días` : ''} y entra a su pico estacional
      </h3>
      <p className="mt-1 text-sm text-ink-2">Interés de búsqueda · Google Trends Perú · índice 0–100</p>

      <div className="scroll-x-fade mt-4">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 480, display: 'block' }} role="img" aria-label="Interés de búsqueda de alarma para casa, índice 0 a 100">
          <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} stroke="var(--line)" strokeWidth="1" />
          <polyline points={pts} fill="none" stroke="var(--ink)" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
          <text x={PAD.left + innerW} y={y(serie[n - 1].value) - 8} fontSize="12" fill="var(--ink)" textAnchor="end" style={{ fontVariantNumeric: 'tabular-nums' }}>
            «alarma para casa»
          </text>
          {ticks.map((i) => (
            <text key={i} x={x(i)} y={H - 6} fontSize="12" fill="var(--ink-2)" textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {fmtDayShort(serie[i].fecha)}
            </text>
          ))}
        </svg>
      </div>
    </section>
  )
}
