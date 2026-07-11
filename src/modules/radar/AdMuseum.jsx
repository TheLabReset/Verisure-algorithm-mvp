// Ad Museum — galería creativa viva (blueprint RADAR): timeline visual por pieza con
// primera emisión, canales e inversión acumulada estimada, y tono EPPM. Ordenada por
// primera emisión (más recientes primero). "Ver todo" expande de 12 a todas.
import { useState } from 'react'
import { Play } from 'lucide-react'
import { formatSoles } from '../../utils/format'
import { brandDisplay } from './radarUtils'
import { fmtDayShort } from './dateLabels'

function Thumb({ isVerisure }) {
  return (
    <div
      className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-inner"
      style={{ background: 'var(--ink)', color: 'var(--surface)' }}
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, var(--ink-3) 0, var(--ink-3) 1px, transparent 1px, transparent 7px)',
        }}
        aria-hidden="true"
      />
      <Play size={18} fill="currentColor" aria-hidden="true" style={isVerisure ? { color: 'var(--verisure)' } : undefined} />
    </div>
  )
}

export default function AdMuseum({ pieces = [] }) {
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? pieces : pieces.slice(0, 12)

  if (!pieces.length) return null

  return (
    <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-display text-xl text-ink sm:text-2xl">Ad Museum</h3>
          <p className="mt-1 text-sm text-ink-2">
            {pieces.length} piezas activas · ordenadas por primera emisión
          </p>
        </div>
        {pieces.length > 12 ? (
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className="min-h-[44px] rounded-inner px-2 text-sm font-semibold text-ink underline-offset-4 hover:underline"
          >
            {showAll ? 'Ver menos' : `Ver todo (${pieces.length})`} →
          </button>
        ) : null}
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))' }}
      >
        {shown.map((p) => (
          <article key={p.key} className="rounded-inner border border-line p-3">
            <Thumb isVerisure={p.isVerisure} />
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-3">{p.eppm}</p>
            <p className="mt-1 text-sm text-ink">
              <span className="font-semibold">{brandDisplay(p.maname)}</span> · «{p.vname}»
            </p>
            <p className="mt-1 text-xs text-ink-3" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {fmtDayShort(p.firstEmission)} · {p.channels.slice(0, 2).join(', ') || p.tipos[0] || '—'} ·{' '}
              {formatSoles(p.totalInvestment)} acum.
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
