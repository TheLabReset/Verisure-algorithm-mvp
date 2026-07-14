// RADAR — la pantalla que vende. Consume el CONTRATO (algorithm.json) y el rango del
// date-picker; compone: jugada del día (estreno más reciente del período con su arte),
// SOI ATL, timeline de presión, capa digital (SOI + Ad Museum digital), Ad Museum ATL y
// mapa OOH Leaflet con la arte de cada panel. Estados diseñados (DESIGN §7); se pueden
// forzar con ?demo=loading|empty|sourcedown.
import { useMemo } from 'react'
import { useData } from '../../data/DataContext'
import {
  soiComparison, pressureInRange, piecesInRange, oohInRange, eventsInRange, digitalSoi,
} from '../../data/views'
import Skeleton from '../../components/ui/Skeleton'
import PlayOfTheDay from './PlayOfTheDay'
import SoiCapsules from './SoiCapsules'
import PressureTimeline from './PressureTimeline'
import AdMuseum from './AdMuseum'
import DigitalPanel from './DigitalPanel'
import OohMap from './OohMap'
import { brandDisplay, tnameShort } from './radarUtils'
import { fmtDayLong, fmtDayShort } from './dateLabels'

function demoParam() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('demo')
}

// Etiqueta corta de la última detección (para el estado vacío del hero).
function detectionLabel(ev) {
  if (!ev) return null
  const canal = ev.mname ? ` en ${ev.mname}` : ''
  const dur = ev.duraseg ? ` ${ev.duraseg} s` : ''
  return `${fmtDayLong(ev.fecha)} · ${brandDisplay(ev.maname)} · ${tnameShort(ev.tname)}${dur}${canal}`
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
  const { loading, sourceDown, contract, range } = useData()
  const demo = demoParam()
  const { from, to } = range || {}
  const periodLabel = from && to ? `${fmtDayShort(from)} – ${fmtDayShort(to)}` : ''

  const view = useMemo(() => {
    if (!contract || !from || !to) return null
    const events = eventsInRange(contract, from, to)
    const atlPieces = piecesInRange(contract, from, to)
    // Jugada del día = estreno más reciente del período, enriquecido con inversión y medio.
    let play = null
    if (events.length) {
      const ev = events[0]
      const match = atlPieces.find((p) => p.maname === ev.maname && p.vname === ev.vname)
      play = { ...ev, medio: 'ATL', spend: match ? match.spend : null }
    }
    // Última detección para el estado vacío: el estreno más reciente del contrato entero.
    const lastEver = (contract.events || [])[0]
    return {
      soi: soiComparison(contract, from, to),
      pressure: pressureInRange(contract, from, to),
      atlPieces,
      digitalSoi: digitalSoi(contract, from, to),
      digitalPieces: piecesInRange(contract, from, to, 'digital'),
      ooh: oohInRange(contract, from, to),
      events,
      play,
      lastDetection: detectionLabel(play || lastEver),
    }
  }, [contract, from, to])

  if (demo === 'loading' || (loading && !view)) return <RadarSkeleton />
  if (!view) return <PlayOfTheDay piece={null} lastDetection={null} />

  const isEmpty = demo === 'empty'
  const isDown = demo === 'sourcedown' || sourceDown
  const play = isEmpty || isDown ? null : view.play

  // Eventos anotados sobre el timeline (estrenos del período).
  const events = view.events.slice(0, 3).map((e) => ({
    fecha: e.fecha, maname: e.maname, label: `${tnameShort(e.tname)} · ${fmtDayShort(e.fecha)}`,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <PlayOfTheDay piece={play} lastDetection={view.lastDetection} />
        <SoiCapsules soi={view.soi} periodLabel={periodLabel} dotted={isDown} />
      </div>
      <PressureTimeline pressure={view.pressure} events={events} periodLabel={periodLabel} degraded={isDown} />
      <DigitalPanel soi={view.digitalSoi} pieces={view.digitalPieces} periodLabel={periodLabel} />
      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <AdMuseum pieces={view.atlPieces} title="Ad Museum" subtitle={`${view.atlPieces.length} piezas ATL activas · ordenadas por inversión`} />
        <OohMap points={view.ooh} />
      </div>
    </div>
  )
}
