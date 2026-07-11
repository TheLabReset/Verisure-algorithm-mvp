// Daily Brief (MAIA) — la ÚNICA card oscura ancla por vista (DESIGN §4/§6.1).
// Redactado por el compositor `composeBrief` a partir de los hechos del día
// (SOI, piezas nuevas, DIY, Score). La carita entra en estado "alerta" cuando
// el brief nace de un movimiento de competencia. Voz de analista, sin exageración.
import MaiaFace from './MaiaFace'
import { fmtDayFull } from '../radar/dateLabels'

// Texto claro sobre card oscura: blanco cálido para el cuerpo, blanco atenuado
// para metadatos (ambos derivados de tokens, con contraste AA holgado sobre --ink).
const BODY = 'var(--base)'
const MUTED = 'color-mix(in srgb, var(--base) 66%, transparent)'

export default function DailyBrief({ brief }) {
  if (!brief) return null
  const fecha = fmtDayFull(brief.day)

  return (
    <section className="rounded-card p-6 shadow-card sm:p-7" style={{ background: 'var(--ink)' }}>
      <div className="flex items-start gap-3">
        <MaiaFace state={brief.alerta ? 'alerta' : 'reposo'} size={44} />
        <div className="min-w-0">
          <p className="text-xs" style={{ color: MUTED, letterSpacing: '.02em' }}>
            MAIA · Daily Brief{fecha ? ` · ${fecha}` : ''}
          </p>
          <h3 className="mt-0.5 font-display text-xl sm:text-2xl" style={{ color: 'var(--surface)' }}>
            {brief.headline}
          </h3>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {brief.paragraphs.map((p, i) => (
          <p key={i} className="text-sm sm:text-base" style={{ color: BODY, lineHeight: 1.6 }}>
            {p}
          </p>
        ))}
      </div>

      <p className="mt-5 pt-3 text-xs" style={{ color: MUTED, borderTop: '1px solid color-mix(in srgb, var(--base) 18%, transparent)' }}>
        Redactado por MAIA a partir de las fuentes del día · cada frase se apoya en un dato, sin exageración.
      </p>
    </section>
  )
}
