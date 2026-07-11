// Índice de Amenaza DIY (DEMANDA) — cámaras solas como sustituto del servicio monitoreado.
// Gauge sobrio de un solo arco (DESIGN §5) en --caution; + 3 componentes con su fuente.
import { formatSoles } from '../../utils/format'

// Arco de gauge 0–100 (semicírculo). Devuelve el path del arco parcial.
function arcPath(cx, cy, r, frac) {
  const a0 = Math.PI // 180° (izquierda)
  const a1 = Math.PI - frac * Math.PI // recorre hacia 0° (derecha)
  const x0 = cx + r * Math.cos(a0)
  const y0 = cy + r * Math.sin(a0)
  const x1 = cx + r * Math.cos(a1)
  const y1 = cy + r * Math.sin(a1)
  const large = frac > 0.5 ? 1 : 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`
}

function Component({ label, value, sub }) {
  return (
    <div className="rounded-inner border border-line p-3">
      <p className="text-xs text-ink-2">{label}</p>
      <p className="mt-0.5 text-base font-semibold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub ? <p className="text-xs text-ink-2">{sub}</p> : null}
    </div>
  )
}

// Título derivado del índice (no hardcodeado): el título afirma sobre el dato.
function diyTitle(idx, delta) {
  const rising = delta != null && delta > 0
  if (idx >= 70) return 'Amenaza DIY alta y creciente'
  if (idx >= 40) return `Amenaza DIY contenida${rising ? ', pero subiendo' : ''}`
  return 'Amenaza DIY baja'
}

export default function DiyThreatGauge({ diy }) {
  if (!diy) return null
  const idx = diy.index ?? 0
  const delta = diy.deltaSemana
  const c = diy.components || {}
  const cx = 110
  const cy = 110
  const r = 88

  return (
    <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl text-ink sm:text-2xl">{diyTitle(idx, delta)}</h3>
        {delta != null && delta !== 0 ? (
          <span className="rounded-pill px-2.5 py-1 text-xs font-semibold" style={{ background: 'var(--wash)', color: 'var(--caution)' }}>
            {delta > 0 ? '+' : '−'}{Math.abs(delta)} pts esta semana
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-ink-2">Índice de Amenaza DIY (hazlo-tú-mismo) · 0–100 · cámaras solas como sustituto</p>

      <div className="mt-4 grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
        <svg viewBox="0 0 220 130" width="220" style={{ maxWidth: '100%' }} role="img" aria-label={`Índice de amenaza DIY ${idx} de 100`}>
          <path d={arcPath(cx, cy, r, 1)} fill="none" stroke="var(--wash)" strokeWidth="16" strokeLinecap="round" />
          <path d={arcPath(cx, cy, r, idx / 100)} fill="none" stroke="var(--caution)" strokeWidth="16" strokeLinecap="round" />
          <text x={cx} y={cy - 6} fontSize="40" fill="var(--ink)" textAnchor="middle" style={{ fontVariantNumeric: 'tabular-nums', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{idx}</text>
          <text x={cx} y={cy + 16} fontSize="13" fill="var(--ink-2)" textAnchor="middle">de 100</text>
        </svg>

        <div className="grid gap-3 sm:grid-cols-3">
          <Component label="Búsquedas «cámara wifi»" value={`+${c.busquedas_camara_wifi_growth_90d ?? 0}%`} sub="90 días · Trends" />
          <Component label="Precio mediano marketplace" value={formatSoles(c.precio_mediano_marketplace)} sub={`${c.precio_delta_vs_abr ?? 0}% vs. abr`} />
          <Component label="Pauta DIY detectada" value={`${formatSoles(c.pauta_diy_moneda_local ? Math.round(c.pauta_diy_moneda_local / 30 * 7) : 0)}/sem`} sub="Integrametrics · estimado" />
        </div>
      </div>

      <p className="mt-4 border-t border-line pt-3 text-xs text-ink-2">
        Marcas monitoreadas: {(c.marcas_monitoreadas || []).join(', ')} · rayado = estimado
      </p>
    </section>
  )
}
