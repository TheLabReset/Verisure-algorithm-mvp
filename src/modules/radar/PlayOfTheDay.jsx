// "La jugada del día" — card ancla oscura (--ink), el ÚNICO momento dramático del Radar
// (DESIGN §4/§6). Muestra la pieza NUEVA detectada hoy con su captura (rfile), inversión
// estimada (rayado = Integrametrics) y tono EPPM. Si no hay novedad: estado vacío útil.
import { Play, Sparkles } from 'lucide-react'
import { formatSoles } from '../../utils/format'
import { brandDisplay, formatHora } from './radarUtils'

function VideoThumb() {
  // Placeholder de captura de emisión (rfile es un .mp4/.jpg; no se reproduce en el dashboard).
  return (
    <div
      className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-inner"
      style={{ background: 'var(--ink)' }}
    >
      {/* barras diagonales sutiles para leer "captura de video" sin imagen real */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, var(--ink-3) 0, var(--ink-3) 1px, transparent 1px, transparent 8px)',
        }}
        aria-hidden="true"
      />
      <div
        className="relative flex h-12 w-12 items-center justify-center rounded-pill"
        style={{ background: 'var(--verisure)', color: 'var(--surface)' }}
      >
        <Play size={22} fill="currentColor" aria-hidden="true" />
      </div>
    </div>
  )
}

export default function PlayOfTheDay({ piece, lastDetection }) {
  // Estado vacío: sin piezas nuevas hoy.
  if (!piece) {
    return (
      <section className="rounded-card bg-ink p-6 text-base sm:p-8" style={{ color: 'var(--base)' }}>
        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-3)' }}>
          La jugada del día
        </p>
        <p className="mt-3 font-display text-2xl">Sin piezas nuevas de la competencia hoy</p>
        <p className="mt-2 text-sm" style={{ color: 'var(--ink-3)' }}>
          {lastDetection
            ? `Última detección: ${lastDetection}.`
            : 'Aún sin detecciones registradas.'}{' '}
          El monitoreo corre cada mañana a las 6:00 a. m.
        </p>
      </section>
    )
  }

  const marca = brandDisplay(piece.maname)
  const hhmm = formatHora(piece.fecha)

  // Orientación retrato (mockup): captura arriba a todo el ancho, texto debajo.
  return (
    <section className="flex h-full flex-col rounded-card bg-ink p-6 text-base sm:p-8" style={{ color: 'var(--base)' }}>
      <VideoThumb />
      <p className="mt-2 text-xs" style={{ color: 'var(--ink-3)' }}>
        {piece.tname}
        {piece.duraseg ? ` · ${piece.duraseg} s` : ''} · captura automática de emisión
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className="inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold"
          style={{ background: 'var(--verisure)', color: 'var(--surface)' }}
        >
          <Sparkles size={13} aria-hidden="true" /> NUEVA · detectada hoy {hhmm}
        </span>
        <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-3)' }}>
          La jugada del día
        </span>
      </div>

      <p className="mt-3 font-display text-2xl leading-tight sm:text-3xl">«{piece.vname}»</p>
      <p className="mt-2 text-sm" style={{ color: 'var(--ink-3)' }}>
        {marca} · {piece.tname}
        {piece.duraseg ? ` ${piece.duraseg} s` : ''} · primera emisión en {piece.mname}, franja{' '}
        {piece.franja}
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-3">
        <div>
          <p className="text-xs" style={{ color: 'var(--ink-3)' }}>
            Inversión estimada del día
          </p>
          <p className="font-display text-2xl" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatSoles(piece.rinversion)}
          </p>
          <p className="text-xs" style={{ color: 'var(--ink-3)' }}>
            rayado = estimado · Integrametrics
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--ink-3)' }}>
            Tono EPPM
          </p>
          <p className="text-base font-semibold">{piece.eppm || '—'}</p>
        </div>
      </div>
    </section>
  )
}
