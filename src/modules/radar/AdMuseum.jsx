// Ad Museum — galería creativa viva (blueprint RADAR): grid de piezas con su ARTE real
// (video/audio/imagen desde el contrato), marca, tono EPPM, primera emisión, canales e
// inversión acumulada estimada. Ordenada por inversión (más relevante primero). "Ver todo"
// expande. Sirve tanto piezas ATL como digitales (prop `pieces`).
import { useState } from 'react'
import { formatSoles } from '../../utils/format'
import AssetView from '../../components/AssetView'
import { brandDisplay } from './radarUtils'
import { fmtDayShort } from './dateLabels'

// Etiqueta de medio para la píldora sobre la arte.
function medioLabel(p) {
  if (p.medio === 'DIGITAL') return p.plataforma || 'Digital'
  const ch = (p.channels || [])[0]
  if (/RADIO|RPP|EXITOSA/i.test(ch || '') || p.franja === undefined) return ch || 'Radio'
  return ch || p.medio || 'TV'
}

export default function AdMuseum({ pieces = [], title = 'Ad Museum', subtitle }) {
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? pieces : pieces.slice(0, 4)
  if (!pieces.length) return null

  const sub = subtitle || `${pieces.length} ${pieces.length === 1 ? 'pieza activa' : 'piezas activas'} · ordenadas por inversión`

  return (
    <section className="flex h-full flex-col rounded-card bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-display text-xl text-ink sm:text-2xl">{title}</h3>
          <p className="mt-1 text-sm text-ink-2">{sub}</p>
        </div>
        {pieces.length > 4 ? (
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className="min-h-[44px] rounded-inner px-2 text-sm font-semibold text-ink underline-offset-4 hover:underline"
          >
            {showAll ? 'Ver menos' : `Ver todo (${pieces.length})`} →
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shown.map((p) => (
          <article key={p.key}>
            <AssetView asset={p.asset} medio={p.medio} label={p.tone} alt={`${brandDisplay(p.maname)} — ${p.vname}`} />
            <p className="mt-2 text-sm text-ink">
              <span className="font-semibold">{brandDisplay(p.maname)}</span> · «{p.vname}»
            </p>
            <p className="mt-1 text-xs text-ink-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {fmtDayShort(p.firstEmission)} · {medioLabel(p)} · {formatSoles(p.spend)} acum.
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
