// Denuncias por distrito (CONTEXTO) — SIDPOL, mes visible + nota de rezago (~45 días).
// Barras de magnitud; el título afirma el insight (concentración). DESIGN §2/§3.
import { formatThousands } from '../../utils/format'

const MESES = { '01': 'enero', '02': 'febrero', '03': 'marzo', '04': 'abril', '05': 'mayo', '06': 'junio', '07': 'julio', '08': 'agosto', '09': 'septiembre', '10': 'octubre', '11': 'noviembre', '12': 'diciembre' }

function mesLabel(periodo = '') {
  const [y, m] = periodo.split('-')
  return m ? `${MESES[m]} ${y}` : periodo
}

export default function CrimeDistricts({ criminalidad }) {
  if (!criminalidad?.distritos?.length) return null
  const distritos = criminalidad.distritos
  const max = Math.max(...distritos.map((d) => d.denuncias))
  const totalTop = distritos.reduce((s, d) => s + d.denuncias, 0)
  const totalAll = totalTop + (criminalidad.resto_distritos?.denuncias || 0)
  const top3 = distritos.slice(0, 3).map((d) => d.distrito).join(', ')
  const top3Sum = distritos.slice(0, 3).reduce((s, d) => s + d.denuncias, 0)
  const top3Frac = totalAll > 0 ? top3Sum / totalAll : 0
  const fracLabel =
    top3Frac >= 0.45 ? 'casi la mitad' : top3Frac >= 0.28 ? 'un tercio' : 'una parte importante'
  const restoCount = criminalidad.resto_distritos?.count || 0
  const restoDenuncias = criminalidad.resto_distritos?.denuncias || 0

  return (
    <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl text-ink sm:text-2xl">
          {top3} concentran {fracLabel} de las denuncias de {mesLabel(criminalidad.periodo).split(' ')[0]}
        </h3>
        {restoCount > 0 ? (
          <span className="text-sm text-ink-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
            +{restoCount} distritos suman {formatThousands(restoDenuncias)}
          </span>
        ) : null}
      </div>
      <p className="mb-4 text-sm text-ink-2">
        Robo a vivienda y local · {criminalidad.fuente}
        {criminalidad.fuente === 'SIDPOL' ? ' (denuncias de la PNP)' : ''} ·{' '}
        {mesLabel(criminalidad.periodo)} (última publicación mensual)
      </p>

      <div className="space-y-2.5">
        {distritos.map((d, i) => (
          <div key={d.distrito} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm text-ink">{d.distrito}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-pill" style={{ background: 'var(--wash)' }}>
              <div className="h-full rounded-pill" style={{ width: `${(d.denuncias / max) * 100}%`, background: i < 3 ? 'var(--ink)' : 'var(--ink-3)' }} />
            </div>
            <span className="w-14 shrink-0 text-right text-sm font-semibold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatThousands(d.denuncias)}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-line pt-3 text-xs text-ink-2">
        Los distritos de mayor incidencia coinciden con la audiencia PyME de Lima Norte y Este.
        El dato llega con ~{criminalidad.rezago_dias ?? 45} días de rezago oficial.
      </p>
    </section>
  )
}
