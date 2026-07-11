// Provee los datos del día una sola vez a todo el árbol (franja "Hoy" + módulos).
// Carga vía el cliente único; en fuente caída degrada sin crashear (banner honesto).
import { createContext, useContext, useEffect, useState } from 'react'
import {
  getRegistros,
  getRegistrosDigital,
  getTrends,
  getContexto,
  checkSource,
} from './client'
import { latestDay } from './derive'

const DataCtx = createContext(null)

const EMPTY = {
  loading: true,
  sourceDown: false,
  sourceMessage: null,
  registros: [],
  digital: [],
  trends: null,
  contexto: null,
  day: null,
}

export function DataProvider({ children }) {
  const [state, setState] = useState(EMPTY)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const src = await checkSource()
      // Cargamos lo que haya; cada fuente degrada por separado (no tumba al resto).
      const [registros, digital, trends, contexto] = await Promise.all([
        getRegistros().catch(() => []),
        getRegistrosDigital().catch(() => []),
        getTrends().catch(() => null),
        getContexto().catch(() => null),
      ])
      if (!alive) return
      setState({
        loading: false,
        sourceDown: !src.ok,
        sourceMessage: src.ok ? null : src.message,
        registros,
        digital,
        trends,
        contexto,
        day: latestDay(registros),
      })
    })()
    return () => {
      alive = false
    }
  }, [])

  return <DataCtx.Provider value={state}>{children}</DataCtx.Provider>
}

export function useData() {
  const v = useContext(DataCtx)
  if (!v) throw new Error('useData debe usarse dentro de <DataProvider>')
  return v
}
