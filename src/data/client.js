// Cliente de datos ÚNICO de The Algorithm (Fase 1).
// Interfaz estable: getRegistros / getRegistrosDigital / getCatalogos / getTrends / getContexto.
// Implementación dual conmutada por UNA variable de entorno:
//   VITE_DATA_SOURCE=fixtures (default) → lee src/data/fixtures/ (bundle code-split).
//   VITE_DATA_SOURCE=live               → Integrametrics (Bearer token de env de Node).
//
// Governance: el token vive SOLO en Node (pipeline, process.env.INTEGRAMETRICS_TOKEN),
// nunca en el bundle del navegador. Por eso en el browser el modo live falla de forma
// manejada (sin token) y la UI muestra un banner honesto — nunca crashea.
import {
  fetchRegistros,
  fetchRegistrosDigital,
  fetchCatalogo,
} from './integrametrics.js'

// Vite reemplaza import.meta.env.VITE_DATA_SOURCE en build; en Node es undefined y cae a process.env.
const SOURCE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DATA_SOURCE) ||
  (typeof process !== 'undefined' && process.env && process.env.DATA_SOURCE) ||
  'fixtures'

// El token NUNCA se lee de una var VITE_ (quedaría en el bundle). Solo de Node.
const TOKEN =
  (typeof process !== 'undefined' && process.env && process.env.INTEGRAMETRICS_TOKEN) || null

export const DATA_SOURCE = SOURCE
export const isLive = SOURCE === 'live'

async function loadFixture(name) {
  // Import dinámico: Vite lo resuelve como chunk aparte (no infla el bundle principal).
  // NOTA: el modo fixtures es browser-only (Vite bundlea el JSON). En Node se usa el
  // modo live o los tests leen los fixtures por fs; por eso no lleva `with {type:'json'}`.
  const mod = await import(`./fixtures/${name}.json`)
  return mod.default ?? mod
}

// Filtro local en modo fixtures para reflejar el contrato de live:
// intervalo SEMIABIERTO [startDate, endDate) y filtros por campo (valor o array = OR).
// Exportado para poder testear la lógica sin depender del import de JSON del navegador.
export function applyFilters(rows, filtros = {}) {
  const { startDate, endDate, filters } = filtros
  return rows.filter((r) => {
    if (startDate && r.fecha < startDate) return false
    if (endDate && r.fecha >= endDate) return false
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        const vals = Array.isArray(v) ? v : [v]
        if (!vals.includes(r[k])) return false
      }
    }
    return true
  })
}

export async function getRegistros(filtros = {}) {
  if (!isLive) return applyFilters(await loadFixture('registros'), filtros)
  const { startDate, endDate, filters } = filtros
  return fetchRegistros({ token: TOKEN, startDate, endDate, filters })
}

export async function getRegistrosDigital(filtros = {}) {
  if (!isLive) {
    const { startDate, endDate } = filtros
    return applyFilters(await loadFixture('registros-digital'), {
      // registros-digital sólo tiene 'fecha' (YYYY-MM-DD)
      startDate: startDate?.slice(0, 10),
      endDate: endDate?.slice(0, 10),
    })
  }
  const { startDate, endDate } = filtros
  return fetchRegistrosDigital({ token: TOKEN, startDate, endDate })
}

export async function getCatalogos() {
  if (!isLive) return loadFixture('catalogos')
  // En live, los catálogos se piden por endpoint; los post-/categorias están PENDIENTES
  // de verificación con token (se modelan {id,name}).
  const [marcas, programas] = await Promise.all([
    fetchCatalogo({ token: TOKEN, name: 'marcas' }),
    fetchCatalogo({ token: TOKEN, name: 'programas' }),
  ])
  return { marcas, programas }
}

// Trends y Contexto NO son Integrametrics (Google Trends / SIDPOL / BCRP / prensa).
// En fixtures salen del fixture; en live, del JSON pre-agregado que escribe el pipeline.
export async function getTrends() {
  if (!isLive) return loadFixture('trends')
  const res = await fetch('/data/trends.json')
  if (!res.ok) throw new Error('trends.json no disponible')
  return res.json()
}

export async function getContexto() {
  if (!isLive) return loadFixture('contexto')
  const res = await fetch('/data/contexto.json')
  if (!res.ok) throw new Error('contexto.json no disponible')
  return res.json()
}

// Chequeo de salud de la fuente para decidir el banner honesto (DESIGN §7).
// Devuelve { source, ok, message } sin lanzar.
export async function checkSource() {
  try {
    if (!isLive) {
      await loadFixture('trends')
      return { source: SOURCE, ok: true }
    }
    // live: una consulta mínima; sin token o sin red → ok:false con mensaje honesto.
    await getRegistros({
      startDate: '2026-07-10 00:00:00',
      endDate: '2026-07-10 00:00:01',
    })
    return { source: SOURCE, ok: true }
  } catch (e) {
    return {
      source: SOURCE,
      ok: false,
      message:
        'Integrametrics sin respuesta. Mostrando el último snapshot disponible. Reintento automático cada 30 min.',
    }
  }
}
