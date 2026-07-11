// Cápsula de magnitud horizontal (DESIGN §4/§5) con vocabulario de honestidad (DESIGN §2):
//   pattern="solid"   → dato confirmado (pauta operada por Reset)  → fill pleno
//   pattern="hatched" → dato ESTIMADO (Integrametrics)             → rayado 45°
//   pattern="dotted"  → sin dato fresco / proyección               → contorno dashed
// El color lo pasa el llamador por token: Verisure = var(--verisure); competidores en
// grises de --ink (Prosegur el más oscuro), nunca un color por marca.
import { formatPercent } from '../../utils/format'

function fillStyle(pattern, color) {
  if (pattern === 'dotted') {
    return { background: 'transparent', border: `1.5px dashed ${color}` }
  }
  if (pattern === 'hatched') {
    return {
      backgroundColor: 'transparent',
      backgroundImage: `repeating-linear-gradient(45deg, ${color} 0, ${color} 2px, transparent 2px, transparent 5px)`,
    }
  }
  return { background: color }
}

export default function Capsula({ label, share, value, color, pattern = 'solid', deltaPts, emphasis }) {
  const pct = Math.max(0, Math.min(100, Number(share) || 0))
  const delta =
    deltaPts === undefined || deltaPts === null || deltaPts === 0
      ? null
      : `${deltaPts > 0 ? '+' : ''}${deltaPts} pts`
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className={`text-sm ${emphasis ? 'font-semibold text-ink' : 'text-ink-2'}`}>{label}</span>
        <span className="text-sm text-ink-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value ? <span className="font-semibold text-ink">{value}</span> : null}
          {value ? ' · ' : ''}
          {formatPercent(pct, 0)}
          {delta ? (
            <span style={{ color: deltaPts > 0 ? 'var(--ink-2)' : 'var(--ink-3)' }}> · {delta}</span>
          ) : null}
        </span>
      </div>
      <div
        className="h-3.5 w-full overflow-hidden rounded-pill"
        style={{ background: 'var(--wash)' }}
        role="img"
        aria-label={`${label}: ${formatPercent(pct, 0)}`}
      >
        <div className="h-full rounded-pill" style={{ width: `${pct}%`, ...fillStyle(pattern, color) }} />
      </div>
    </div>
  )
}
