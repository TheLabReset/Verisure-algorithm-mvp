// "La jugada del día" — card ancla oscura (--ink), el ÚNICO momento dramático del Radar
// (DESIGN §4/§6). Muestra el ESTRENO más reciente del período (pieza nueva detectada) con
// su ARTE real (video/audio/imagen), inversión acumulada estimada (rayado = Integrametrics)
// y tono EPPM. Si no hay estreno en el período: estado vacío útil con la última detección.
import { Sparkles } from 'lucide-react'
import { formatSoles } from '../../utils/format'
import AssetView from '../../components/AssetView'
import { brandDisplay, formatHora } from './radarUtils'
import { fmtDayLong } from './dateLabels'

export default function PlayOfTheDay({ piece, lastDetection }) {
  // Estado vacío: sin estrenos en el período.
  if (!piece) {
    return (
      <section className="rounded-card bg-ink p-6 text-base sm:p-8" style={{ color: 'var(--base)' }}>
        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-3)' }}>La jugada del día</p>
        <p className="mt-3 font-display text-2xl">Sin piezas nuevas de la competencia en el período</p>
        <p className="mt-2 text-sm" style={{ color: 'var(--ink-3)' }}>
          {lastDetection ? `Última detección: ${lastDetection}.` : 'Aún sin detecciones registradas.'}{' '}
          El monitoreo corre cada mañana a las 6:00 a. m.
        </p>
      </section>
    )
  }

  const marca = brandDisplay(piece.maname)
  const hhmm = formatHora(piece.fecha)
  const fecha = fmtDayLong(piece.fecha)

  return (
    <section className="flex h-full flex-col rounded-card bg-ink p-6 text-base sm:p-8" style={{ color: 'var(--base)' }}>
      <AssetView asset={piece.asset} medio={piece.medio} alt={`${marca} — ${piece.vname}`} label={piece.tone} />
      <p className="mt-2 text-xs" style={{ color: 'var(--ink-3)' }}>
        {piece.tname}
        {piece.duraseg ? ` · ${piece.duraseg} s` : ''} · arte captada de la emisión
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold" style={{ background: 'var(--verisure)', color: 'var(--surface)' }}>
          <Sparkles size={13} aria-hidden="true" /> NUEVA · {fecha}{hhmm ? ` ${hhmm}` : ''}
        </span>
        <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-3)' }}>La jugada del día</span>
      </div>

      <p className="mt-3 font-display text-2xl leading-tight sm:text-3xl">«{piece.vname}»</p>
      <p className="mt-2 text-sm" style={{ color: 'var(--ink-3)' }}>
        {marca} · {piece.tname}
        {piece.duraseg ? ` ${piece.duraseg} s` : ''}
        {piece.mname ? ` · primera emisión en ${piece.mname}` : ''}
        {piece.franja ? `, franja ${piece.franja}` : ''}
      </p>

      <div className="mt-auto flex flex-wrap items-end gap-x-8 gap-y-3 pt-5">
        {piece.spend != null ? (
          <div>
            <p className="text-xs" style={{ color: 'var(--ink-3)' }}>Inversión acumulada estimada</p>
            <p className="font-display text-2xl" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatSoles(piece.spend)}</p>
            <p className="text-xs" style={{ color: 'var(--ink-3)' }}>rayado = estimado · Integrametrics</p>
          </div>
        ) : null}
        <div>
          <p className="text-xs" style={{ color: 'var(--ink-3)' }}>Tono EPPM</p>
          <p className="text-base font-semibold">{piece.tone || '—'}</p>
        </div>
      </div>
    </section>
  )
}
