// Share of Search vs Share of Investment (DEMANDA, análisis ESOV automatizado).
// Slope chart: dos columnas (búsqueda | inversión), una línea por marca. Verisure
// enfatizado (rojo); competencia en grises. El título AFIRMA el insight (DESIGN §3).
import { brandDisplay } from '../radar/radarUtils'
import { formatPercent } from '../../utils/format'

const W = 640
const H = 300
const PAD = { top: 40, bottom: 28, leftLbl: 120, rightLbl: 120 }
const LX = PAD.leftLbl
const RX = W - PAD.rightLbl

function styleOf(maname) {
  const m = maname.toUpperCase()
  if (m.includes('VERISURE')) return { color: 'var(--verisure)', label: 'var(--verisure)', width: 2.5 }
  if (m.includes('PROSEGUR')) return { color: 'var(--ink)', label: 'var(--ink)', width: 1.75 }
  return { color: 'var(--ink-3)', label: 'var(--ink-2)', width: 1.5 }
}

function insight(rows) {
  const v = rows.find((r) => r.isVerisure)
  if (!v) return 'Share of search vs. share of investment'
  if (v.gap > 3) return `Buscan a Verisure más de lo que Verisure invierte`
  if (v.gap < -3) return `Verisure invierte por encima de su búsqueda`
  return `Verisure: búsqueda e inversión equilibradas`
}

export default function SearchVsInvestmentSlope({ rows = [] }) {
  if (!rows.length) return null
  const max = Math.max(50, ...rows.flatMap((r) => [r.search, r.investment]))
  const y = (v) => PAD.top + (H - PAD.top - PAD.bottom) * (1 - v / max)

  const verisure = rows.find((r) => r.isVerisure)
  const prosegur = rows.find((r) => r.maname.toUpperCase().includes('PROSEGUR'))

  return (
    <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <h3 className="font-display text-xl text-ink sm:text-2xl">{insight(rows)}</h3>
      <p className="mt-1 text-sm text-ink-2">
        Share of search vs. share of investment · SoS = Google Trends · SoI = Integrametrics · últimos 30 días
      </p>

      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 480, display: 'block' }} role="img" aria-label="Share of search versus share of investment por competidor">
          <text x={LX} y="24" fontSize="12" fill="var(--ink-2)" textAnchor="middle" style={{ letterSpacing: '.04em' }}>SHARE OF SEARCH</text>
          <text x={RX} y="24" fontSize="12" fill="var(--ink-2)" textAnchor="middle" style={{ letterSpacing: '.04em' }}>SHARE OF INVESTMENT</text>

          {rows.map((r) => {
            const st = styleOf(r.maname)
            return (
              <g key={r.maname}>
                <line x1={LX} y1={y(r.search)} x2={RX} y2={y(r.investment)} stroke={st.color} strokeWidth={st.width} />
                <circle cx={LX} cy={y(r.search)} r="3.5" fill={st.color} />
                <circle cx={RX} cy={y(r.investment)} r="3.5" fill={st.color} />
                <text x={LX - 10} y={y(r.search) + 4} fontSize="12" fill={st.label} textAnchor="end" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {brandDisplay(r.maname)} {formatPercent(r.search, 0)}
                </text>
                <text x={RX + 10} y={y(r.investment) + 4} fontSize="12" fill={st.label} textAnchor="start" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatPercent(r.investment, 0)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-4 space-y-1 text-sm text-ink-2">
        {verisure ? (
          <p>
            <span className="font-semibold text-ink">Verisure — {Math.abs(verisure.gap)} pts de brecha.</span>{' '}
            La demanda de marca existe; la inversión no la acompaña.
          </p>
        ) : null}
        {prosegur && prosegur.gap < 0 ? (
          <p>
            <span className="font-semibold text-ink">Prosegur</span> invierte {Math.abs(prosegur.gap)} pts por encima de lo que la gente lo busca: compra presencia.
          </p>
        ) : null}
      </div>

      <p className="mt-3 border-t border-line pt-3 text-xs text-ink-2">
        SoS = share of search (Google Trends) · SoI = share of investment estimado (Integrametrics)
      </p>
    </section>
  )
}
