// Capa DIGITAL (Integrametrics /registros-digital) — donde la competencia SÍ pelea.
// SOI digital por marca (todo estimado → rayado) + impresiones del período, junto a la
// galería de piezas digitales con su ARTE real (imágenes de Facebook/Google, video, etc).
// Reencuadre honesto: en ATL Verisure domina; en digital Prosegur compite de verdad.
import Capsula from '../../components/ui/Capsula'
import AdMuseum from './AdMuseum'
import { formatSoles, formatCompact, formatPercent } from '../../utils/format'
import { assignBrandStyle, brandDisplay } from './radarUtils'

export default function DigitalPanel({ soi, pieces = [], periodLabel = '' }) {
  const brands = assignBrandStyle(soi?.brands || [])
  if (!brands.length && !pieces.length) return null

  const comp = soi?.brands?.find((b) => !b.isVerisure)
  const title = comp && comp.share >= 10
    ? `${brandDisplay(comp.maname)} pelea el ${formatPercent(comp.share, 0)} de la inversión digital`
    : 'Inversión digital de la categoría'

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
      <section className="flex h-full flex-col rounded-card bg-surface p-5 shadow-card sm:p-6">
        <h3 className="font-display text-xl text-ink sm:text-2xl">{title}</h3>
        <p className="mt-1 text-sm text-ink-2">
          Share of investment digital · {periodLabel}
          {soi?.impresiones ? ` · ${formatCompact(soi.impresiones, 1)} impresiones` : ''}
        </p>
        <div className="mt-6 space-y-5">
          {brands.map((b) => (
            <Capsula key={b.maname} label={b.display} share={b.share} value={formatSoles(b.investment)}
                     color={b.color} pattern="hatched" emphasis={b.emphasis} />
          ))}
        </div>
        <p className="mt-auto pt-5 text-sm text-ink-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <span className="font-semibold text-ink">Total digital {formatSoles(soi?.total || 0)}</span>
        </p>
        <p className="mt-3 border-t border-line pt-3 text-xs text-ink-2">
          rayado = estimado (Integrametrics · Meta/Google/YouTube) · el reparto digital es más disputado que el ATL
        </p>
      </section>

      {pieces.length ? (
        <AdMuseum pieces={pieces} title="Ad Museum digital" subtitle={`${pieces.length} piezas digitales · ordenadas por inversión`} />
      ) : <div />}
    </div>
  )
}
