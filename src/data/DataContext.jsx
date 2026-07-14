// Provee el CONTRATO (public/data/algorithm.json) + estado de rango de fecha a todo el
// árbol. El date-picker mueve {from,to}; los módulos derivan sus vistas del contrato con
// views.js. En fuente caída degrada sin crashear (banner honesto, DESIGN §7).
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getAlgorithm, getTrends, getContexto, checkSource } from './client'
import { contractRange } from './views'

const DataCtx = createContext(null)

// Rango por defecto: últimos N días del contrato (ventana de trabajo del analista).
const DEFAULT_WINDOW = 30
function defaultRange(contract) {
  const { min, max } = contractRange(contract)
  if (!max) return { from: null, to: null }
  const d = new Date(`${max}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - (DEFAULT_WINDOW - 1))
  const from = d.toISOString().slice(0, 10)
  return { from: min && from < min ? min : from, to: max }
}

export function DataProvider({ children }) {
  const [state, setState] = useState({
    loading: true, sourceDown: false, sourceMessage: null,
    contract: null, trends: null, contexto: null,
  })
  const [range, setRange] = useState({ from: null, to: null })

  useEffect(() => {
    let alive = true
    ;(async () => {
      const src = await checkSource()
      const [contract, trends, contexto] = await Promise.all([
        getAlgorithm().catch(() => null),
        getTrends().catch(() => null),
        getContexto().catch(() => null),
      ])
      if (!alive) return
      setState({
        loading: false,
        sourceDown: !src.ok || !contract,
        sourceMessage: src.ok ? null : src.message,
        contract, trends, contexto,
      })
      if (contract) setRange(defaultRange(contract))
    })()
    return () => { alive = false }
  }, [])

  const bounds = useMemo(() => contractRange(state.contract), [state.contract])

  const value = useMemo(() => ({
    ...state,
    range,
    setRange,
    bounds,
    // Día ancla del rango = fin del rango (para "jugada del día", frescura).
    day: range.to || bounds.max,
  }), [state, range, bounds])

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}

export function useData() {
  const v = useContext(DataCtx)
  if (!v) throw new Error('useData debe usarse dentro de <DataProvider>')
  return v
}
