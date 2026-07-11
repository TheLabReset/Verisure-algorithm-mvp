// Fila macro (CONTEXTO) — BCRP, como métricas planas en línea (mockup): label, valor
// y delta, sin cajas por celda ni título. El delta se colorea en --positive solo cuando
// la dirección es favorable para la categoría (confianza ↑, inflación ↓); el resto neutro.
import { formatES } from '../../utils/format'

function delta(v, suf = '%') {
  if (v === undefined || v === null) return null
  if (v === 0) return 'sin cambio'
  return `${v > 0 ? '+' : '−'}${formatES(Math.abs(v), 1)}${suf}`
}

function Cell({ label, value, sub, positive }) {
  return (
    <div>
      <p className="text-xs text-ink-2">{label}</p>
      <p className="mt-1 font-display text-2xl text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub ? (
        <p className="mt-0.5 text-xs" style={{ color: positive ? 'var(--positive)' : 'var(--ink-2)' }}>{sub}</p>
      ) : null}
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
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        <Cell
          label="Tipo de cambio"
          value={`S/ ${formatES(tc.value, 2)}`}
          sub={`${delta(tc.delta_semana_pct)}${tc.periodo ? ` en ${tc.periodo}` : ''}`}
        />
        <Cell
          label="Confianza del consumidor"
          value={formatES(cc.value, 1)}
          sub={`${delta(cc.delta_vs_mes_pct, ' pts')}${cc.periodo ? ` vs. ${cc.periodo}` : ''}`}
          positive={cc.delta_vs_mes_pct > 0}
        />
        <Cell
          label="Expectativa de economía (BCRP)"
          value={formatES(ee.value, 1)}
          sub={`${delta(ee.delta, ' pts')} · tramo ${ee.tramo || ''}`}
        />
        <Cell
          label="Inflación 12 meses"
          value={`${formatES(inf.value, 1)}%`}
          sub={`${delta(inf.delta_pts, ' pts')}${inf.periodo ? ` vs. ${inf.periodo}` : ''}`}
          positive={inf.delta_pts < 0}
        />
      </div>
      <p className="mt-4 text-xs text-ink-2">
        Fuente: {macro.fuente}
        {macro.fuente === 'BCRP' ? ' (Banco Central de Reserva)' : ''} · normaliza el reporting EUR/USD/PEN y el precio del hardware DIY importado
      </p>
    </section>
  )
}
