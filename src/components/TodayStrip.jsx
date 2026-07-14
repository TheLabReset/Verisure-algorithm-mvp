// Franja "Hoy" bajo el header (DESIGN §6.2).
// - Radar: versión completa (tinte --verisure-tint + borde izq. rojo) con la carita
//   de MAIA (la alerta origina el mensaje, §6.1) + píldora + titular.
// - Otros módulos: píldora "N alertas hoy" + titular + "Ver en Radar →".
// - Sin alertas: neutra y serena.
import { ArrowRight } from 'lucide-react'
import MaiaFace from '../modules/maia/MaiaFace'

export default function TodayStrip({ moduleId, today, onGoToRadar }) {
  const { alertCount, headline } = today
  const hasAlerts = alertCount > 0

  if (!hasAlerts) {
    return (
      <div className="rounded-card bg-surface px-4 py-3 text-sm text-ink-2 shadow-card">
        Sin estrenos de la competencia en el período. SOI estable.
      </div>
    )
  }

  const pill = (
    <span className="shrink-0 rounded-pill bg-surface px-2.5 py-1 text-xs font-semibold text-verisure-deep">
      {alertCount} {alertCount === 1 ? 'novedad' : 'novedades'} en el período
    </span>
  )

  if (moduleId === 'radar') {
    return (
      <div className="flex items-center gap-3 rounded-card border-l-4 border-verisure bg-verisure-tint px-4 py-3 text-sm text-ink">
        <MaiaFace state="alerta" size={28} />
        {pill}
        {headline ? <span className="min-w-0">{headline}</span> : null}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-card bg-verisure-tint px-4 py-3 text-sm text-ink">
      <div className="flex min-w-0 items-center gap-3">
        {pill}
        <span className="truncate">{headline || 'Novedad de competencia en el Radar'}</span>
      </div>
      <button
        type="button"
        onClick={onGoToRadar}
        className="flex min-h-[44px] shrink-0 items-center gap-1 font-semibold text-verisure-deep"
      >
        Ver en Radar <ArrowRight size={15} aria-hidden="true" />
      </button>
    </div>
  )
}
