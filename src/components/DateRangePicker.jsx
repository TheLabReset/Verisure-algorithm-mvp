// Selector de rango de fecha (Fase 7). Mueve {from,to} del contexto → todos los módulos
// recalculan sus vistas (SOI, presión, deltas) sobre la ventana elegida. Presets rápidos
// (7/30/90 días · todo) + inputs nativos accesibles, acotados al rango del contrato.
import { fmtDayLong } from '../modules/radar/dateLabels'

const PRESETS = [
  { key: 7, label: '7 días' },
  { key: 30, label: '30 días' },
  { key: 90, label: '90 días' },
  { key: 'all', label: 'Todo' },
]

function clampISO(iso, min, max) {
  if (min && iso < min) return min
  if (max && iso > max) return max
  return iso
}
function minusDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - (n - 1))
  return d.toISOString().slice(0, 10)
}

export default function DateRangePicker({ bounds, range, setRange }) {
  const { min, max } = bounds || {}
  if (!min || !max || !range?.from) return null

  const applyPreset = (key) => {
    if (key === 'all') return setRange({ from: min, to: max })
    setRange({ from: clampISO(minusDays(max, key), min, max), to: max })
  }
  const spanDays = Math.round((new Date(`${range.to}T00:00:00Z`) - new Date(`${range.from}T00:00:00Z`)) / 86400000) + 1
  const activePreset = range.to === max
    ? (range.from === min ? 'all' : PRESETS.find((p) => p.key === spanDays)?.key ?? null)
    : null

  const onFrom = (e) => { const v = clampISO(e.target.value, min, max); setRange({ from: v > range.to ? range.to : v, to: range.to }) }
  const onTo = (e) => { const v = clampISO(e.target.value, min, max); setRange({ from: range.from, to: v < range.from ? range.from : v }) }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card bg-surface px-4 py-3 shadow-card">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Rango rápido">
        {PRESETS.map((p) => {
          const on = activePreset === p.key
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => applyPreset(p.key)}
              aria-pressed={on}
              className="min-h-[36px] rounded-pill border border-line px-3 text-xs font-semibold"
              style={on ? { background: 'var(--ink)', color: 'var(--base)', borderColor: 'var(--ink)' } : { color: 'var(--ink-2)' }}
            >
              {p.label}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-2">
        <label className="flex items-center gap-1.5">
          <span className="sr-only">Desde</span>
          <input type="date" value={range.from} min={min} max={max} onChange={onFrom}
                 className="min-h-[36px] rounded-inner border border-line bg-base px-2 text-ink" style={{ fontVariantNumeric: 'tabular-nums' }} />
        </label>
        <span aria-hidden="true">→</span>
        <label className="flex items-center gap-1.5">
          <span className="sr-only">Hasta</span>
          <input type="date" value={range.to} min={min} max={max} onChange={onTo}
                 className="min-h-[36px] rounded-inner border border-line bg-base px-2 text-ink" style={{ fontVariantNumeric: 'tabular-nums' }} />
        </label>
      </div>
      <p className="text-xs text-ink-2">
        {spanDays} {spanDays === 1 ? 'día' : 'días'} · {fmtDayLong(range.from)} – {fmtDayLong(range.to)}
      </p>
    </div>
  )
}
