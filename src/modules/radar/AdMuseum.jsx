// Ad Museum — galería creativa viva (blueprint RADAR): grid 2×2 de piezas con
// primera emisión, canales e inversión acumulada estimada, y tono EPPM. Ordenada por
// primera emisión (más recientes primero). "Ver todo" expande de 4 a todas.
import { useState } from 'react'
import { Play, AudioLines, RectangleHorizontal, Smartphone } from 'lucide-react'
import { formatSoles } from '../../utils/format'
import { brandDisplay } from './radarUtils'
import { fmtDayShort } from './dateLabels'

// Ícono de formato derivado del tipo/canal de la pieza (neutro, no color por marca).
function formatIcon(p) {
  const t = (p.tname || '').toUpperCase()
  const ch = [...(p.channels || []), ...(p.tipos || [])].join(' ').toUpperCase()
  if (t.includes('VÍA') || t.includes('OOH') || ch.includes('OOH') || ch.includes('VÍA')) return RectangleHorizontal
  if (/META|YOUTUBE|DIGITAL|TIKTOK|\bFB\b|\bIG\b/.test(ch)) return Smartphone
  if (t.includes('RADIO') || /\bRADIO\b|RPP|EXITOSA/.test(ch)) return AudioLines
  return Play
}

// Miniatura clara con ilustración de formato + píldora de tono (callout) e ícono.
function Thumb({ piece }) {
  const Icon = formatIcon(piece)
  return (
    <div
      className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-inner"
      style={{ background: 'var(--wash)' }}
    >
      <Icon size={30} strokeWidth={1.5} style={{ color: 'var(--ink-3)' }} aria-hidden="true" />
      {/* Ícono de formato pequeño, arriba-derecha */}
      <span
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-pill"
        style={{ background: 'var(--surface)', color: 'var(--ink-2)' }}
      >
        <Icon size={12} strokeWidth={2} aria-hidden="true" />
      </span>
      {/* Píldora de tono EPPM, abajo-izquierda */}
      <span
        className="absolute bottom-2 left-2 rounded-pill px-2 py-0.5 text-xs font-medium"
        style={{ background: 'var(--surface)', color: 'var(--ink-2)' }}
      >
        {piece.eppm}
      </span>
    </div>
  )
}

export default function AdMuseum({ pieces = [] }) {
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? pieces : pieces.slice(0, 4)

  if (!pieces.length) return null

  return (
    <section className="flex h-full flex-col rounded-card bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-display text-xl text-ink sm:text-2xl">Ad Museum</h3>
          <p className="mt-1 text-sm text-ink-2">
            {pieces.length} piezas activas · ordenadas por primera emisión
          </p>
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {shown.map((p) => (
          <article key={p.key}>
            <Thumb piece={p} />
            <p className="mt-2 text-sm text-ink">
              <span className="font-semibold">{brandDisplay(p.maname)}</span> · «{p.vname}»
            </p>
            <p className="mt-1 text-xs text-ink-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {fmtDayShort(p.firstEmission)} · {p.channels.slice(0, 2).join(', ') || p.tipos[0] || '—'} ·{' '}
              {formatSoles(p.totalInvestment)} acum.
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
