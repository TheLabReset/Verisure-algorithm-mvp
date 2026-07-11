// RADAR — la pantalla que vende. Cablea la capa de datos (fixtures/live) y compone:
// jugada del día, SOI cápsulas, timeline 30d, Ad Museum y mapa OOH. Estados diseñados
// (DESIGN §7): cargando (skeleton), vacío (sin novedad), fuente caída (series punteadas).
// Los estados se pueden forzar para demo con ?demo=loading|empty|sourcedown.
import { useMemo } from 'react'
import { useData } from '../../data/DataContext'
import {
  soiComparison,
  detectNewPieces,
  pressureSeries,
  adMuseumPieces,
  oohPoints,
} from '../../data/derive'
import Skeleton from '../../components/ui/Skeleton'
import PlayOfTheDay from './PlayOfTheDay'
import SoiCapsules from './SoiCapsules'
import PressureTimeline from './PressureTimeline'
import AdMuseum from './AdMuseum'
import OohMap from './OohMap'
import { brandDisplay, tnameShort } from './radarUtils'
import { fmtDayLong } from './dateLabels'

function demoParam() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('demo')
}

function lastDetectionLabel(registros, day) {
  let best = null
  for (const r of registros) {
    if (r.nuevas_versiones !== 'NUEVO') continue
    if (r.fecha.slice(0, 10) >= day) continue
    if (!best || r.fecha > best.fecha) best = r
  }
  if (!best) return null
  const canal = best.mname ? ` en ${best.mname}` : ''
  const dur = best.duraseg ? ` ${best.duraseg} s` : ''
  return `${fmtDayLong(best.fecha)} · ${brandDisplay(best.maname)} · ${tnameShort(best.tname)}${dur}${canal}`
}

function RadarSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  )
}

export default function RadarModule() {
  const { loading, sourceDown, registros, contexto, day } = useData()
  const demo = demoParam()

  const view = useMemo(() => {
    if (!day || !registros.length) return null
    return {
      soi: soiComparison(registros, day),
      newPieces: detectNewPieces(registros, day),
      pressure: pressureSeries(registros, day, 30),
      museum: adMuseumPieces(registros),
      ooh: oohPoints(registros),
      lastDetection: lastDetectionLabel(registros, day),
    }
  }, [registros, day])

  // Estado de carga.
  if (demo === 'loading' || (loading && !view)) return <RadarSkeleton />

  // Sin datos (fuente caída dura, sin snapshot).
  if (!view) {
    return (
      <PlayOfTheDay piece={null} lastDetection={null} />
    )
  }

  const isEmpty = demo === 'empty'
  const isDown = demo === 'sourcedown' || sourceDown
  const newPieces = isEmpty ? [] : view.newPieces
  const piece = newPieces[0] || null

  const events = []
  if (piece) events.push({ fecha: view.day || day, label: 'Spot · hoy', maname: piece.maname })
  const lastOoh = view.ooh[view.ooh.length - 1]
  if (lastOoh) {
    // ancla un evento OOH en su día (si existe en la serie)
    const oohReg = registros.find((r) => r.tname === 'VÍA PÚBLICA' && r.maname === lastOoh.maname)
    if (oohReg) events.push({ fecha: oohReg.fecha, label: 'OOH', maname: lastOoh.maname })
  }

  const riskDistritos = contexto?.criminalidad?.distritos || []

  return (
    <div className="space-y-6">
      <PlayOfTheDay piece={piece} lastDetection={view.lastDetection} />
      <SoiCapsules soi={view.soi} dotted={isDown} />
      <PressureTimeline pressure={view.pressure} events={events} degraded={isDown} />
      <AdMuseum pieces={view.museum} />
      <OohMap points={view.ooh} risk={riskDistritos} degraded={isDown} />
    </div>
  )
}
