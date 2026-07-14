// Mapa OOH real (Opción A · Leaflet + OpenStreetMap). Paneles geolocalizados de la
// competencia (lat/long reales de Integrametrics), radio ∝ inversión estimada, color por
// marca (Verisure rojo, competencia gris). Al hacer clic: la ARTE del panel (foto/video)
// + marca, dirección, tipo e inversión. Marcadores vectoriales (sin PNG externos).
import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import AssetView from '../../components/AssetView'
import { brandDisplay } from './radarUtils'
import { formatSoles } from '../../utils/format'
import { fmtDayShort } from './dateLabels'

function brandColor(maname) {
  const m = (maname || '').toUpperCase()
  if (m.includes('VERISURE')) return 'var(--verisure)'
  if (m.includes('PROSEGUR')) return '#3B3F46' // gris oscuro de la rampa --ink
  return '#8A9099'
}
// Leaflet dibuja en SVG y no entiende var(--…) → resolvemos a hex por marca.
const hexOf = (m) => {
  const u = (m || '').toUpperCase()
  if (u.includes('VERISURE')) return '#E30613'
  if (u.includes('PROSEGUR')) return '#3B3F46'
  return '#8A9099'
}

const titleCase = (s = '') => s.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase())

export default function OohMap({ points = [] }) {
  const clean = useMemo(
    () => points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng) && Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180),
    [points],
  )
  const maxInv = Math.max(1, ...clean.map((p) => p.investment || 0))
  const radius = (inv) => 6 + Math.sqrt((inv || 0) / maxInv) * 16

  const counts = {}
  for (const p of clean) counts[p.maname] = (counts[p.maname] || 0) + 1

  // Insight derivado: localidad con más inversión OOH.
  const byLoc = {}
  for (const p of clean) if (p.localidad) byLoc[p.localidad] = (byLoc[p.localidad] || 0) + (p.investment || 0)
  const topLoc = Object.entries(byLoc).sort((a, b) => b[1] - a[1])[0]?.[0]
  const title = topLoc ? `${titleCase(topLoc)} concentra la inversión en vía pública` : 'Paneles en vía pública'

  const center = useMemo(() => {
    if (!clean.length) return [-12.06, -77.04] // Lima centro
    const lat = clean.reduce((s, p) => s + p.lat, 0) / clean.length
    const lng = clean.reduce((s, p) => s + p.lng, 0) / clean.length
    return [lat, lng]
  }, [clean])

  if (!clean.length) {
    return (
      <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
        <h3 className="font-display text-xl text-ink sm:text-2xl">Vía pública</h3>
        <p className="mt-1 text-sm text-ink-2">Sin paneles OOH en el período seleccionado.</p>
      </section>
    )
  }

  return (
    <section className="flex h-full flex-col rounded-card bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-3">
        <h3 className="font-display text-xl text-ink sm:text-2xl">{title}</h3>
        <p className="mt-1 text-sm text-ink-2">
          {clean.length} {clean.length === 1 ? 'panel' : 'paneles'} · tamaño del punto = inversión estimada · clic para ver la arte
        </p>
      </div>

      <div className="overflow-hidden rounded-inner" style={{ height: 360 }}>
        <MapContainer center={center} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: 'var(--wash)' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {clean.map((p, i) => (
            <CircleMarker
              key={`${p.lat},${p.lng},${p.vname},${i}`}
              center={[p.lat, p.lng]}
              radius={radius(p.investment)}
              pathOptions={{ color: hexOf(p.maname), fillColor: hexOf(p.maname), fillOpacity: p.isVerisure ? 0.85 : 0.6, weight: 1.5 }}
            >
              <Tooltip direction="top" offset={[0, -4]}>
                <span style={{ fontWeight: 600 }}>{brandDisplay(p.maname)}</span> · {titleCase(p.localidad || p.direccion || '')}
              </Tooltip>
              <Popup maxWidth={280} minWidth={240}>
                <div style={{ width: 240 }}>
                  <AssetView asset={p.asset} medio="OOH" alt={`Panel ${brandDisplay(p.maname)}`} label={p.tipo ? titleCase(p.tipo) : 'Vía pública'} />
                  <p style={{ margin: '8px 0 0', fontWeight: 600, color: 'var(--ink)' }}>{brandDisplay(p.maname)}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--ink-2)' }}>«{p.vname}»</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-2)' }}>
                    {titleCase(p.direccion || p.localidad || 'Lima')}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatSoles(p.investment)} estimado · última aparición {fmtDayShort(p.lastFecha)}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
        {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([m, c]) => (
          <span key={m} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-pill" style={{ background: brandColor(m) }} />
            {brandDisplay(m)} ({c})
          </span>
        ))}
      </div>
      <p className="mt-3 border-t border-line pt-3 text-xs text-ink-2">
        Vía pública de la competencia · Integrametrics (estimado) · mapa © OpenStreetMap
      </p>
    </section>
  )
}
