import { lazy, Suspense, useMemo, useState } from 'react'
import { MODULES, DEFAULT_MODULE } from '../data/modules'
import { useData } from '../data/DataContext'
import { soiComparison, eventsInRange } from '../data/views'
import { buildTodayHeadline } from '../modules/radar/radarUtils'
import { fmtDayFull } from '../modules/radar/dateLabels'
import Banner from './ui/Banner'
import TodayStrip from './TodayStrip'
import DateRangePicker from './DateRangePicker'
import Skeleton from './ui/Skeleton'

// Carga diferida por módulo: cada vista es su propio chunk (DESIGN §11 / performance).
const RadarModule = lazy(() => import('../modules/radar/RadarModule'))
const DemandaModule = lazy(() => import('../modules/demanda/DemandaModule'))
const ContextoModule = lazy(() => import('../modules/contexto/ContextoModule'))
const MaiaModule = lazy(() => import('../modules/maia/MaiaModule'))

const VIEWS = { radar: RadarModule, demanda: DemandaModule, contexto: ContextoModule, maia: MaiaModule }

function ModuleFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

function demoParam() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('demo')
}

export default function AppShell() {
  const [active, setActive] = useState(DEFAULT_MODULE)
  const { loading, sourceDown, sourceMessage, contract, range, setRange, bounds, day } = useData()
  const ActiveView = VIEWS[active]
  const activeModule = MODULES.find((m) => m.id === active)
  const demo = demoParam()

  // Franja de novedad desde datos reales (DESIGN §6.2): estrenos del período + SOI.
  // En fuente caída no afirmamos novedad (el banner ya explica el snapshot).
  const today = useMemo(() => {
    const { from, to } = range || {}
    if (!contract || !from || !to || demo === 'empty' || demo === 'sourcedown' || sourceDown) {
      return { date: fmtDayFull(bounds.max) || '—', alertCount: 0, headline: null }
    }
    const events = eventsInRange(contract, from, to)
    const soi = soiComparison(contract, from, to)
    const newPieces = events.map((e) => ({ ...e, eppm: e.tone }))
    return {
      date: fmtDayFull(bounds.max),
      alertCount: newPieces.length,
      headline: buildTodayHeadline(newPieces, soi),
    }
  }, [contract, range, bounds, demo, sourceDown])

  return (
    <div className="min-h-full bg-base text-ink">
      <header className="mx-auto flex max-w-shell flex-col gap-4 px-4 pt-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="font-wordmark leading-none tracking-wide text-ink whitespace-nowrap" style={{ fontSize: 'clamp(20px, 6vw, 32px)' }}>
            THE ALGORITHM
          </p>
          <p className="mt-1 text-sm text-ink-2">by Reset · Verisure Perú</p>
        </div>
        <p className="text-sm text-ink-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
          Datos al {today.date}
        </p>
      </header>

      <nav aria-label="Módulos" className="mx-auto mt-5 max-w-shell px-4 sm:px-8">
        <div className="nav-pills">
          {MODULES.map((m) => (
            <button key={m.id} type="button" className="nav-pill" aria-current={m.id === active ? 'page' : undefined} onClick={() => setActive(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-shell px-4 py-5 sm:px-8">
        {(sourceDown || demo === 'sourcedown') && !loading ? (
          <Banner message={sourceMessage || 'Integrametrics sin respuesta. Mostrando el último snapshot disponible. Reintento automático cada 30 min.'} />
        ) : null}

        {/* Date-picker: mueve el rango que consumen todos los módulos. */}
        {contract && !sourceDown && demo !== 'sourcedown' ? (
          <div className="mb-4">
            <DateRangePicker bounds={bounds} range={range} setRange={setRange} />
          </div>
        ) : null}

        <TodayStrip moduleId={active} today={today} onGoToRadar={() => setActive('radar')} />

        {!sourceDown && demo !== 'sourcedown' ? (
          <p className="mt-5 mb-3 text-xs text-ink-2">{activeModule.freshness}</p>
        ) : (
          <div className="mt-5" />
        )}

        <Suspense fallback={<ModuleFallback />}>
          <ActiveView />
        </Suspense>
      </main>

      <footer className="mx-auto mt-8 max-w-shell border-t border-line px-4 py-6 text-xs text-ink-2 sm:px-8">
        The Algorithm by Reset · Verisure Perú · inteligencia externa outside-in · datos Integrametrics
      </footer>
    </div>
  )
}
