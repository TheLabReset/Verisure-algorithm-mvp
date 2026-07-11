// Daily Brief (MAIA) — la ÚNICA card oscura ancla por vista (DESIGN §4/§6.1).
// Redactado por `composeBrief` a partir de los hechos del día (SOI, piezas nuevas,
// DIY, Score). Eyebrow con fecha + tiempo de lectura estimado; al pie, las fuentes
// que MAIA leyó. Voz de analista, sin exageración.
import { fmtDayFull } from '../radar/dateLabels'

// Texto claro sobre card oscura (contraste AA holgado sobre --ink).
const BODY = 'var(--base)'
const MUTED = 'color-mix(in srgb, var(--base) 66%, transparent)'
const SOURCES = ['Integrametrics', 'Google Trends', 'SIDPOL', 'BCRP', 'prensa', 'marketplaces']

export default function DailyBrief({ brief }) {
  if (!brief) return null
  const fecha = (fmtDayFull(brief.day) || '').split(' ').slice(0, 3).join(' ').toUpperCase()
  // Tiempo de lectura estimado (~3 palabras/seg), redondeado a 5 s.
  const words = brief.paragraphs.join(' ').split(/\s+/).filter(Boolean).length
  const secs = Math.max(20, Math.round(words / 3 / 5) * 5)

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
        {brief.paragraphs.map((p, i) => (
          <p key={i} className="text-sm sm:text-base" style={{ color: BODY, lineHeight: 1.6 }}>
            {p}
          </p>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap gap-x-2 gap-y-1 pt-5 text-xs" style={{ color: MUTED, borderTop: '1px solid color-mix(in srgb, var(--base) 18%, transparent)', paddingTop: '0.75rem' }}>
        {SOURCES.map((s, i) => (
          <span key={s}>
            {s}
            {i < SOURCES.length - 1 ? ' ·' : ''}
          </span>
        ))}
      </div>
    </section>
  )
}
