// Daily Brief (MAIA) — la ÚNICA card oscura ancla por vista (DESIGN §4/§6.1).
// Redactado por `composeBrief` a partir de los hechos del día (SOI, piezas nuevas,
// DIY, Score). Eyebrow con fecha + tiempo de lectura; al pie, las fuentes que MAIA
// leyó y el CTA "Leer completo" (colapsa a 2 párrafos y expande). Voz de analista.
import { useState } from 'react'
import { fmtDayFull } from '../radar/dateLabels'

// Texto claro sobre card oscura (contraste AA holgado sobre --ink).
const BODY = 'var(--base)'
const MUTED = 'color-mix(in srgb, var(--base) 66%, transparent)'
const SOURCES = ['Integrametrics', 'Google Trends', 'SIDPOL', 'BCRP', 'prensa', 'marketplaces']

export default function DailyBrief({ brief }) {
  const [expanded, setExpanded] = useState(false)
  if (!brief) return null
  const fecha = (fmtDayFull(brief.day) || '').split(' ').slice(0, 3).join(' ').toUpperCase()
  const words = brief.paragraphs.join(' ').split(/\s+/).filter(Boolean).length
  const secs = Math.max(20, Math.round(words / 3 / 5) * 5)
  const collapsible = brief.paragraphs.length > 2
  const shown = expanded || !collapsible ? brief.paragraphs : brief.paragraphs.slice(0, 2)

  return (
    <section className="flex h-full flex-col rounded-card p-6 shadow-card sm:p-7" style={{ background: 'var(--ink)' }}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs" style={{ color: MUTED, letterSpacing: '.06em' }}>
          DAILY BRIEF{fecha ? ` · ${fecha}` : ''}
        </p>
        <p className="text-xs" style={{ color: MUTED }}>lectura de {secs} s</p>
      </div>

      <h3 className="mt-2 font-display text-xl sm:text-2xl" style={{ color: 'var(--surface)' }}>
        {brief.headline}
      </h3>

      <div className="mt-4 space-y-3">
        {shown.map((p, i) => (
          <p key={i} className="text-sm sm:text-base" style={{ color: BODY, lineHeight: 1.6 }}>
            {p}
          </p>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3" style={{ borderTop: '1px solid color-mix(in srgb, var(--base) 18%, transparent)', paddingTop: '0.75rem' }}>
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs" style={{ color: MUTED }}>
          {SOURCES.map((s, i) => (
            <span key={s}>
              {s}
              {i < SOURCES.length - 1 ? ' ·' : ''}
            </span>
          ))}
        </div>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex min-h-[44px] shrink-0 items-center text-xs font-semibold"
            style={{ color: 'var(--surface)' }}
          >
            {expanded ? '← Leer menos' : 'Leer completo →'}
          </button>
        ) : null}
      </div>
    </section>
  )
}
