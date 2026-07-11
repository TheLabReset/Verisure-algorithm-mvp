// SOI del día por competidor (DESIGN §5): cápsulas de magnitud con vocabulario de honestidad.
// Verisure sólido (pauta operada por Reset, confirmada); competencia rayada (estimado Integrametrics).
// El título AFIRMA el insight (líder de presión), no nombra el eje (DESIGN §3).
import Capsula from '../../components/ui/Capsula'
import { formatSoles } from '../../utils/format'
import { assignBrandStyle, buildSoiInsight, brandDisplay, signPts } from './radarUtils'
import { fmtDayLong } from './dateLabels'

export default function SoiCapsules({ soi, dotted = false }) {
  const brands = assignBrandStyle(soi?.brands || [], dotted ? { pattern: 'dotted' } : undefined)

  const deltas = (soi?.brands || [])
    .filter((b) => b.deltaPts !== undefined && b.deltaPts !== 0)
    .map((b) => `${brandDisplay(b.maname)} ${signPts(b.deltaPts)}`)

  return (
    <section className="flex h-full flex-col rounded-card bg-surface p-5 shadow-card sm:p-6">
      <h3 className="font-display text-xl text-ink sm:text-2xl">
        {dotted ? 'SOI de ayer — sin dato fresco de Integrametrics' : buildSoiInsight(soi)}
      </h3>
      <p className="mt-1 text-sm text-ink-2">
        {dotted
          ? `Snapshot ${fmtDayLong(soi?.day)} · punteado = sin dato de hoy`
          : `Share of investment del día · ${fmtDayLong(soi?.day)}`}
      </p>

      <div className="mt-6 space-y-5">
        {brands.map((b) => (
          <Capsula
            key={b.maname}
            label={b.display}
            share={b.share}
            value={formatSoles(b.investment)}
            color={b.color}
            pattern={b.pattern}
            emphasis={b.emphasis}
          />
        ))}
      </div>

      <p className="mt-auto pt-5 text-sm text-ink-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {deltas.length > 0 && !dotted ? (
          <>
            <span className="text-ink-2">vs. semana pasada:</span> {deltas.join(' · ')} ·{' '}
          </>
        ) : null}
        <span className="font-semibold text-ink">Total del día {formatSoles(soi?.total || 0)}</span>
      </p>

      <p className="mt-3 border-t border-line pt-3 text-xs text-ink-2">
        sólido = confirmado (pauta operada por Reset) · rayado = estimado (Integrametrics)
      </p>
    </section>
  )
}
