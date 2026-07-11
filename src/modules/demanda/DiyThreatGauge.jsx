// Índice de Amenaza DIY (DEMANDA) — cámaras solas como sustituto del servicio monitoreado.
// Gauge sobrio de un solo arco (DESIGN §5) en --caution, ~270° con hueco inferior; debajo,
// los 3 componentes como filas (label izq · valor der) con su fuente.
import { formatSoles } from '../../utils/format'

// Punto polar en coordenadas SVG (y hacia abajo; 0°=E, 90°=S).
function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}
// Arco de gauge: parte en 135° (abajo-izq) y barre en sentido horario `sweep` grados.
function arcPath(cx, cy, r, frac) {
  const START = 135
  const SWEEP = 270 * Math.max(0, Math.min(1, frac))
  const [x0, y0] = polar(cx, cy, r, START)
  const [x1, y1] = polar(cx, cy, r, START + SWEEP)
  const large = SWEEP > 180 ? 1 : 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`
}

function Row({ label, value, sub }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <p className="text-sm text-ink-2">{label}</p>
      <p className="shrink-0 text-right text-sm font-semibold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
        {sub ? <span className="ml-1.5 font-normal text-ink-2">· {sub}</span> : null}
      </p>
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
  const cy = 108
  const r = 84

  return (
    <section className="flex h-full flex-col rounded-card bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl text-ink sm:text-2xl">{diyTitle(idx, delta)}</h3>
        {delta != null && delta !== 0 ? (
          <span className="rounded-pill px-2.5 py-1 text-xs font-semibold" style={{ background: 'var(--wash)', color: 'var(--caution)' }}>
            {delta > 0 ? '+' : '−'}{Math.abs(delta)} pts esta semana
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-ink-2">Índice de Amenaza DIY (hazlo-tú-mismo) · 0–100 · cámaras solas como sustituto</p>

      <div className="mt-4 flex justify-center">
        <svg viewBox="0 0 220 200" width="220" style={{ maxWidth: '100%' }} role="img" aria-label={`Índice de amenaza DIY ${idx} de 100`}>
          <path d={arcPath(cx, cy, r, 1)} fill="none" stroke="var(--wash)" strokeWidth="16" strokeLinecap="round" />
          <path d={arcPath(cx, cy, r, idx / 100)} fill="none" stroke="var(--caution)" strokeWidth="16" strokeLinecap="round" />
          <text x={cx} y={cy - 4} fontSize="44" fill="var(--ink)" textAnchor="middle" style={{ fontVariantNumeric: 'tabular-nums', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{idx}</text>
          <text x={cx} y={cy + 20} fontSize="13" fill="var(--ink-2)" textAnchor="middle">de 100</text>
        </svg>
      </div>

      <div className="mt-2 divide-y divide-line border-t border-line">
        <Row label="Búsquedas «cámara wifi»" value={`+${c.busquedas_camara_wifi_growth_90d ?? 0}%`} sub="90 días · Trends" />
        <Row label="Precio mediano marketplace" value={formatSoles(c.precio_mediano_marketplace)} sub={`${c.precio_delta_vs_abr ?? 0}% vs. abr`} />
        <Row label="Pauta DIY detectada" value={`${formatSoles(c.pauta_diy_moneda_local ? Math.round((c.pauta_diy_moneda_local / 30) * 7) : 0)}/sem`} sub="Integrametrics · estimado" />
      </div>

      <p className="mt-auto pt-4 text-xs text-ink-2">
        Marcas monitoreadas: {(c.marcas_monitoreadas || []).join(', ')} · rayado = estimado
      </p>
    </section>
  )
}
