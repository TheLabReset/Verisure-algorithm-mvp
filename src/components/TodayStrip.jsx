// Franja "Hoy" bajo el header (DESIGN §6.2).
// - Radar: versión completa (tinte --verisure-tint + borde izq. rojo) cuando hay alerta.
// - Otros módulos: versión neutra compacta "N alertas hoy →" (link al Radar).
// - Sin alertas: neutra y serena.
import { ArrowRight } from 'lucide-react'

export default function TodayStrip({ moduleId, today, onGoToRadar }) {
  const { alertCount, headline } = today
  const hasAlerts = alertCount > 0

  // Sin alertas: serena en cualquier módulo.
  if (!hasAlerts) {
    return (
      <div className="rounded-inner bg-surface px-4 py-3 text-sm text-ink-2">
        Sin movimientos relevantes de la competencia hoy. SOI estable.
      </div>
    )
  }

  // Radar con alertas: versión completa, dosis de rojo concentrada.
  if (moduleId === 'radar') {
    return (
      <div className="rounded-inner bg-verisure-tint px-4 py-3 text-sm text-ink border-l-4 border-verisure">
        <span className="font-semibold text-verisure-deep">
          {alertCount} {alertCount === 1 ? 'alerta' : 'alertas'} hoy
        </span>
        {headline ? <span className="ml-2">{headline}</span> : null}
      </div>
    )
  }

  // Otros módulos con alertas: neutra compacta con link al Radar.
  return (
    <button
      type="button"
      onClick={onGoToRadar}
      className="flex w-full items-center justify-between rounded-inner bg-surface px-4 py-3 text-left text-sm text-ink-2"
    >
      <span>
        <span className="font-semibold text-ink">{alertCount}</span>{' '}
        {alertCount === 1 ? 'alerta' : 'alertas'} hoy
      </span>
      <ArrowRight size={16} aria-hidden="true" />
    </button>
  )
}
