// Tendencia de interés de búsqueda (DEMANDA) — Google Trends Perú, índice 0–100.
// Tres series: categoría «alarma para casa» (enfatizada) vs Verisure vs Prosegur.
// El título afirma el insight (crecimiento + estacionalidad).
import { fmtDayShort } from '../radar/dateLabels'

const W = 720
const H = 220
const PAD = { top: 20, right: 16, bottom: 26, left: 16 }

export default function SearchTrend({ trends }) {
  const cat = trends?.series_alarma_casa || []
  const veri = trends?.series_marca?.VERISURE || []
  const pro = trends?.series_marca?.PROSEGUR || []
  const kw = (trends?.keywords || []).find((k) => k.keyword === 'alarma para casa')
  if (!cat.length) return null

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const n = cat.length
  const x = (i) => PAD.left + (n === 1 ? 0 : (i / (n - 1)) * innerW)
  // Escala al rango de datos (con margen) para que las 3 series usen toda la altura.
  const vals = [...cat, ...veri, ...pro].map((p) => p.value)
  const lo = Math.min(...vals)
  const hi = Math.max(...vals)
  const m = (hi - lo) * 0.15 || 1
  const yLo = Math.max(0, lo - m)
  const yHi = hi + m
  const y = (v) => PAD.top + innerH - ((v - yLo) / (yHi - yLo)) * innerH
  const lineOf = (serie) => serie.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')

  const series = [
    { key: 'categoría', pts: lineOf(cat), color: 'var(--ink)', width: 2.25 },
    { key: 'Verisure', pts: lineOf(veri), color: 'var(--verisure)', width: 2 },
    { key: 'Prosegur', pts: lineOf(pro), color: 'var(--ink-3)', width: 1.75 },
  ].filter((s) => s.pts)

  const growth = kw ? kw.growth_90d : null
  const ticks = [...new Set([0, Math.floor((n - 1) / 2), n - 1])]

  return (
    <section className="flex h-full flex-col rounded-card bg-surface p-5 shadow-card sm:p-6">
      <h3 className="font-display text-xl text-ink sm:text-2xl">
        «Alarma para casa»{growth != null ? ` crece ${growth}% en 90 días` : ''} y entra a su pico estacional
      </h3>
      <p className="mt-1 text-sm text-ink-2">Interés de búsqueda · Google Trends Perú · índice 0–100</p>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-[3px] w-4 rounded-pill" style={{ background: s.color }} />
            {s.key}
          </span>
        ))}
      </div>

      <div className="scroll-x-fade mt-3 flex flex-1 items-center">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 480, display: 'block' }} role="img" aria-label="Interés de búsqueda: categoría, Verisure y Prosegur, índice 0 a 100">
          <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} stroke="var(--line)" strokeWidth="1" />
          {series.map((s) => (
            <polyline key={s.key} points={s.pts} fill="none" stroke={s.color} strokeWidth={s.width} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {ticks.map((i) => (
            <text key={i} x={x(i)} y={H - 6} fontSize="12" fill="var(--ink-2)" textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {fmtDayShort(cat[i].fecha)}
            </text>
          ))}
        </svg>
      </div>
    </section>
  )
}
