// Estacionalidad de la categoría (CONTEXTO) — tira de 12 meses con picos resaltados.
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
// Zonas pico (índices de mes 0–11): jul–ago (vacacional) y nov–dic (navideño).
const PEAKS = [
  { from: 6, to: 7, label: 'jul–ago: pico vacacional' },
  { from: 10, to: 11, label: 'nov–dic: pico navideño' },
]

export default function Seasonality({ estacionalidad }) {
  if (!estacionalidad) return null
  return (
    <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <h3 className="font-display text-xl text-ink sm:text-2xl">Julio abre la ventana de Fiestas Patrias</h3>
      <p className="mt-1 text-sm text-ink-2">Estacionalidad de la categoría</p>

      <div className="mt-4 flex gap-1">
        {MESES.map((m, i) => {
          const inPeak = PEAKS.some((p) => i >= p.from && i <= p.to)
          return (
            <div key={m} className="flex-1 text-center">
              <div className="h-8 rounded-inner" style={{ background: inPeak ? 'var(--caution)' : 'var(--wash)', opacity: inPeak ? 0.85 : 1 }} />
              <span className="mt-1 block text-xs text-ink-2">{m}</span>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-sm text-ink-2">{estacionalidad.nota}.</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        {(estacionalidad.picos || []).map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-pill" style={{ background: 'var(--caution)', opacity: 0.85 }} />
            {p}
          </span>
        ))}
      </div>
    </section>
  )
}
