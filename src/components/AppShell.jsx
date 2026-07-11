import { useMemo, useState } from 'react'
import { MODULES, DEFAULT_MODULE } from '../data/modules'
import { useData } from '../data/DataContext'
import { detectNewPieces, soiComparison } from '../data/derive'
import { buildTodayHeadline } from '../modules/radar/radarUtils'
import { fmtDayFull } from '../modules/radar/dateLabels'
import Banner from './ui/Banner'
import TodayStrip from './TodayStrip'
import RadarModule from '../modules/radar/RadarModule'
import DemandaModule from '../modules/demanda/DemandaModule'
import ContextoModule from '../modules/contexto/ContextoModule'
import MaiaModule from '../modules/maia/MaiaModule'

const VIEWS = {
  radar: RadarModule,
  demanda: DemandaModule,
  contexto: ContextoModule,
  maia: MaiaModule,
}

function demoParam() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('demo')
}

export default function AppShell() {
  const [active, setActive] = useState(DEFAULT_MODULE)
  const { loading, sourceDown, sourceMessage, registros, day } = useData()
  const ActiveView = VIEWS[active]
  const activeModule = MODULES.find((m) => m.id === active)
  const demo = demoParam()

  // Franja "Hoy" desde datos reales (DESIGN §6.2): piezas nuevas + SOI del día.
  // En fuente caída no afirmamos alertas "de hoy" (el banner ya explica el snapshot).
  const today = useMemo(() => {
    if (!day || !registros.length || demo === 'empty' || demo === 'sourcedown' || sourceDown) {
      return { date: fmtDayFull(day) || '—', alertCount: 0, headline: null }
    }
    const newPieces = detectNewPieces(registros, day)
    const soi = soiComparison(registros, day)
    return {
      date: fmtDayFull(day),
      alertCount: newPieces.length,
      headline: buildTodayHeadline(newPieces, soi),
    }
  }, [registros, day, demo, sourceDown])

  return (
    <div className="min-h-full bg-base text-ink">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-shell flex-col gap-4 px-4 pt-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p
            className="font-wordmark leading-none tracking-wide text-ink whitespace-nowrap"
            style={{ fontSize: 'clamp(20px, 6vw, 32px)' }}
          >
            THE ALGORITHM
          </p>
          <p className="mt-1 text-sm text-ink-2">by Reset · Verisure Perú</p>
        </div>
        <p className="text-sm text-ink-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
          Datos del {today.date}
        </p>
      </header>

      {/* ── Navegación de módulos: tabs píldora, bajo el wordmark ──── */}
      <nav aria-label="Módulos" className="mx-auto mt-5 max-w-shell px-4 sm:px-8">
        <div className="nav-pills">
          {MODULES.map((m) => (
            <button
              key={m.id}
              type="button"
              className="nav-pill"
              aria-current={m.id === active ? 'page' : undefined}
              onClick={() => setActive(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Contenido ──────────────────────────────────────── */}
      <main className="mx-auto max-w-shell px-4 py-5 sm:px-8">
        {(sourceDown || demo === 'sourcedown') && !loading ? (
          <Banner
            message={
              sourceMessage ||
              'Integrametrics sin respuesta. Mostrando el último snapshot disponible. Reintento automático cada 30 min.'
            }
          />
        ) : null}

        <TodayStrip moduleId={active} today={today} onGoToRadar={() => setActive('radar')} />

        {/* Frescura por fuente del módulo (DESIGN §2). Si la fuente está caída no
            afirmamos frescura: el banner ya explica que es un snapshot anterior. */}
        {!sourceDown && demo !== 'sourcedown' ? (
          <p className="mt-5 mb-3 text-xs text-ink-2">{activeModule.freshness}</p>
        ) : (
          <div className="mt-5" />
        )}

        <ActiveView />
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="mx-auto mt-8 max-w-shell border-t border-line px-4 py-6 text-xs text-ink-2 sm:px-8">
        The Algorithm by Reset · Verisure Perú · inteligencia externa outside-in ·
        actualizado hoy 6:00 a. m.
      </footer>
    </div>
  )
}
