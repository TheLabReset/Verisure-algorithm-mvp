import { useState } from 'react'
import { MODULES, DEFAULT_MODULE, TODAY_PLACEHOLDER } from '../data/modules'
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

export default function AppShell() {
  const [active, setActive] = useState(DEFAULT_MODULE)
  const ActiveView = VIEWS[active]
  const activeModule = MODULES.find((m) => m.id === active)

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
        <p className="text-sm text-ink-3">Datos del {TODAY_PLACEHOLDER.date}</p>
      </header>

      {/* ── Navegación de módulos ──────────────────────────── */}
      <nav
        aria-label="Módulos"
        className="mx-auto mt-4 max-w-shell border-b border-line px-4 sm:px-8"
      >
        <ul className="scroll-x-fade flex gap-1">
          {MODULES.map((m) => {
            const isActive = m.id === active
            return (
              <li key={m.id} className="shrink-0">
                <button
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setActive(m.id)}
                  className={`-mb-px min-h-[44px] px-4 py-2 text-base transition-colors ${
                    isActive
                      ? 'border-b-2 border-verisure font-semibold text-ink'
                      : 'border-b-2 border-transparent text-ink-2 hover:text-ink'
                  }`}
                >
                  {m.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ── Contenido ──────────────────────────────────────── */}
      <main className="mx-auto max-w-shell px-4 py-5 sm:px-8">
        <TodayStrip
          moduleId={active}
          today={TODAY_PLACEHOLDER}
          onGoToRadar={() => setActive('radar')}
        />

        {/* Frescura por fuente del módulo (DESIGN §2) */}
        <p className="mt-5 mb-3 text-xs text-ink-3">{activeModule.freshness}</p>

        <ActiveView />
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="mx-auto mt-8 max-w-shell border-t border-line px-4 py-6 text-xs text-ink-3 sm:px-8">
        The Algorithm by Reset · Verisure Perú · inteligencia externa outside-in ·
        actualizado hoy 6:00 a. m.
      </footer>
    </div>
  )
}
