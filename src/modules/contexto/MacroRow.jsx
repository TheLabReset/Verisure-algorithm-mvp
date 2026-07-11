// Fila macro (CONTEXTO) — BCRP, como texto con deltas. Sin color de "bueno/malo"
// (la dirección macro no es inherentemente positiva/negativa): deltas en --ink-2.
import { formatES } from '../../utils/format'

function delta(v, suf = '%') {
  if (v === undefined || v === null) return null
  if (v === 0) return 'sin cambio'
  return `${v > 0 ? '+' : '−'}${formatES(Math.abs(v), 1)}${suf}`
}

function Cell({ label, value, sub }) {
  return (
    <div className="rounded-inner border border-line p-4">
      <p className="text-xs text-ink-2">{label}</p>
      <p className="mt-1 font-display text-2xl text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-ink-2">{sub}</p> : null}
    </div>
  )
}

export default function MacroRow({ macro }) {
  if (!macro) return null
  const tc = macro.tipo_cambio || {}
  const cc = macro.confianza_consumidor || {}
  const ee = macro.expectativa_economia || {}
  const inf = macro.inflacion_12m || {}
  return (
    <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <h3 className="font-display text-xl text-ink sm:text-2xl">Contexto macro del día</h3>
      <p className="mt-1 text-sm text-ink-2">{macro.fuente} · normaliza el reporting EUR/USD/PEN y el precio del hardware DIY importado</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Cell label="Tipo de cambio" value={`S/ ${formatES(tc.value, 2)}`} sub={`${delta(tc.delta_semana_pct)} en la semana`} />
        <Cell label="Confianza del consumidor" value={formatES(cc.value, 1)} sub={`${delta(cc.delta_vs_mes_pct, ' pts')} vs. junio`} />
        <Cell label="Expectativa de economía" value={formatES(ee.value, 1)} sub={`${delta(ee.delta, ' pts')} · tramo ${ee.tramo || ''}`} />
        <Cell label="Inflación 12 meses" value={`${formatES(inf.value, 1)}%`} sub={`${delta(inf.delta_pts, ' pts')} vs. mayo`} />
      </div>
    </section>
  )
}
