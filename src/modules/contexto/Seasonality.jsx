// Estacionalidad de la categoría (CONTEXTO) — tira de 12 meses con picos resaltados.
// Picos y título se DERIVAN del fixture (estacionalidad.picos, meses 0-indexados) y del
// mes vigente (day): el título afirma sobre la posición estacional real, no es fijo.
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MESES_LARGOS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// Rango legible de un pico a partir de sus meses ("jul–ago"), derivado de los índices.
const rango = (meses) =>
  meses.length > 1 ? `${MESES[meses[0]]}–${MESES[meses[meses.length - 1]]}` : MESES[meses[0]]

// Título derivado: mes vigente + relación con el próximo/actual pico.
function seasonTitle(monthIdx, picos) {
  if (monthIdx == null || !picos.length) return 'Estacionalidad de la categoría'
  const mes = MESES_LARGOS[monthIdx]
  const enPico = picos.find((p) => monthIdx >= p.meses[0] && monthIdx <= p.meses[p.meses.length - 1])
  if (enPico) return `${mes} ${monthIdx === enPico.meses[0] ? 'abre' : 'sostiene'} el ${enPico.etiqueta} de la categoría`
  const prox = picos
    .map((p) => ({ etiqueta: p.etiqueta, faltan: (p.meses[0] - monthIdx + 12) % 12 }))
    .sort((a, b) => a.faltan - b.faltan)[0]
  return `${mes}: faltan ${prox.faltan} ${prox.faltan === 1 ? 'mes' : 'meses'} para el ${prox.etiqueta}`
}

export default function Seasonality({ estacionalidad, day }) {
  if (!estacionalidad) return null
  const picos = estacionalidad.picos || []
  const monthIdx = day && day.length >= 7 ? Number(day.slice(5, 7)) - 1 : null

  return (
    <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <h3 className="font-display text-xl text-ink sm:text-2xl">{seasonTitle(monthIdx, picos)}</h3>
      <p className="mt-1 text-sm text-ink-2">Estacionalidad de la categoría</p>

      <div className="mt-4 flex gap-1">
        {MESES.map((m, i) => {
          const inPeak = picos.some((p) => i >= p.meses[0] && i <= p.meses[p.meses.length - 1])
          const isNow = i === monthIdx
          return (
            <div key={m} className="flex-1 text-center">
              <div className="h-8 rounded-inner" style={{ background: inPeak ? 'var(--caution)' : 'var(--data-grey-floor)', outline: isNow ? '2px solid var(--ink)' : 'none', outlineOffset: '1px' }} />
              <span className={`mt-1 block text-xs ${isNow ? 'font-semibold text-ink' : 'text-ink-2'}`}>{m}</span>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-sm text-ink-2">{estacionalidad.nota}.</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        {picos.map((p) => (
          <span key={p.etiqueta} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-pill" style={{ background: 'var(--caution)', opacity: 0.85 }} />
            {rango(p.meses)}: {p.etiqueta}
          </span>
        ))}
      </div>
    </section>
  )
}
