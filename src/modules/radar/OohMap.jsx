// Mapa OOH (blueprint RADAR): base clara esquemática de Lima (sin tiles/API key),
// puntos ∝ inversión mensual estimada, color por marca (Verisure rojo, competencia gris),
// y toggle de capa de riesgo por distrito (SIDPOL). La proyección lat/long es real; las
// zonas de riesgo se ubican de forma ESQUEMÁTICA (sin geocodificación en Fase 2).
import { useState } from 'react'
import { brandDisplay } from './radarUtils'

const W = 640
const H = 360
// Bounding box aproximado de Lima Metropolitana.
const BBOX = { latMin: -12.18, latMax: -11.95, lngMin: -77.15, lngMax: -76.88 }
const project = (lat, lng) => ({
  x: ((lng - BBOX.lngMin) / (BBOX.lngMax - BBOX.lngMin)) * W,
  y: ((BBOX.latMax - lat) / (BBOX.latMax - BBOX.latMin)) * H,
})

// Zonas de riesgo esquemáticas (posición aproximada N/E; tamaño ∝ denuncias).
const RISK_SCHEMATIC = [
  { name: 'SJL', x: 470, y: 120 },
  { name: 'Los Olivos', x: 300, y: 70 },
  { name: 'Ate', x: 520, y: 210 },
  { name: 'Comas', x: 360, y: 55 },
]

function brandColor(maname) {
  const m = maname.toUpperCase()
  if (m.includes('VERISURE')) return 'var(--verisure)'
  if (m.includes('PROSEGUR')) return 'var(--ink)'
  return 'var(--ink-3)'
}

export default function OohMap({ points = [], risk = [], degraded = false }) {
  const [showRisk, setShowRisk] = useState(false)

  const maxInv = Math.max(1, ...points.map((p) => p.investment))
  const r = (inv) => 4 + Math.sqrt(inv / maxInv) * 12

  const counts = {}
  for (const p of points) counts[p.maname] = (counts[p.maname] || 0) + 1

  // Insight derivado del dato: distrito con más inversión OOH.
  const byLoc = {}
  for (const p of points) if (p.localidad) byLoc[p.localidad] = (byLoc[p.localidad] || 0) + p.investment
  const topLoc = Object.entries(byLoc).sort((a, b) => b[1] - a[1])[0]?.[0]
  const titleCase = (s) =>
    s.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase())
  const title = topLoc
    ? `${titleCase(topLoc)} concentra la inversión rival en vía pública`
    : 'Inversión rival en vía pública'

  const maxDen = Math.max(1, ...risk.map((d) => d.denuncias || 0))
  const riskByName = Object.fromEntries(risk.map((d) => [d.distrito, d.denuncias]))

  return (
    <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-display text-xl text-ink sm:text-2xl">{title}</h3>
          <p className="mt-1 text-sm text-ink-2">
            {points.length} paneles · tamaño del punto = inversión mensual estimada
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowRisk((s) => !s)}
          aria-pressed={showRisk}
          className="min-h-[44px] rounded-pill border border-line px-4 text-sm font-semibold text-ink hover:bg-[color:var(--wash)]"
          style={showRisk ? { background: 'var(--wash)' } : undefined}
        >
          Capa: riesgo por distrito {showRisk ? '·on' : ''}
        </button>
      </div>

      <div className="overflow-hidden rounded-inner" style={{ background: 'var(--wash)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Mapa OOH de Lima con paneles por competidor" style={{ display: 'block' }}>
          {/* océano (izquierda) */}
          <rect x="0" y="0" width={W * 0.16} height={H} fill="var(--line)" />
          <text x="12" y="24" fontSize="12" fill="var(--ink-2)">océano Pacífico</text>
          {/* avenidas esquemáticas */}
          <line x1={W * 0.16} y1={H * 0.5} x2={W} y2={H * 0.44} stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="2 4" />
          <text x={W * 0.62} y={H * 0.44 - 6} fontSize="11" fill="var(--ink-2)">Av. Javier Prado</text>
          <line x1={W * 0.45} y1="0" x2={W * 0.4} y2={H} stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="2 4" />
          <text x={W * 0.4 + 6} y="16" fontSize="11" fill="var(--ink-2)">Panamericana N.</text>

          {/* capa de riesgo (toggle) */}
          {showRisk
            ? RISK_SCHEMATIC.map((z) => {
                const den = riskByName[z.name] || 0
                if (!den) return null
                const rr = 16 + Math.sqrt(den / maxDen) * 34
                return (
                  <g key={z.name}>
                    <circle cx={z.x} cy={z.y} r={rr} fill="var(--caution)" opacity="0.14" />
                    <text x={z.x} y={z.y} fontSize="11" fill="var(--caution)" textAnchor="middle">{z.name}</text>
                  </g>
                )
              })
            : null}

          {/* paneles OOH */}
          {points.map((p, i) => {
            const { x, y } = project(p.lat, p.lng)
            const c = brandColor(p.maname)
            // Fuente caída: puntos punteados (contorno, sin relleno) — DESIGN §2.
            if (degraded) {
              return <circle key={i} cx={x} cy={y} r={r(p.investment)} fill="none" stroke={c} strokeWidth="1.5" strokeDasharray="2 2" />
            }
            return <circle key={i} cx={x} cy={y} r={r(p.investment)} fill={c} opacity={p.isVerisure ? 0.9 : 0.7} />
          })}
        </svg>
      </div>

      {/* leyenda: conteo por marca */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
        {Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([m, c]) => (
            <span key={m} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-pill" style={{ background: brandColor(m) }} />
              {brandDisplay(m)} ({c})
            </span>
          ))}
        {showRisk ? (
          <span className="inline-flex items-center gap-1.5 text-ink-2">
            <span className="inline-block h-2.5 w-2.5 rounded-pill" style={{ background: 'var(--caution)', opacity: 0.4 }} />
            riesgo por distrito (SIDPOL)
          </span>
        ) : null}
      </div>
    </section>
  )
}
