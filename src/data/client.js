// Cliente de datos del navegador (Fase 4). Lee el SNAPSHOT PUBLICADO en /data/,
// que escribe el pipeline (`scripts/run-pipeline.mjs`): dry-run sobre fixtures o
// Integrametrics live. Contrato único de datos: el frontend SIEMPRE fetchea JSON ya
// publicado y nunca habla con Integrametrics ni ve el token (governance §B.2 del
// blueprint). Interfaz estable: getRegistros / getRegistrosDigital / getCatalogos /
// getTrends / getContexto / checkSource.

// Respeta un base path distinto de '/' (Vite lo inyecta en build).
const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/'

async function loadPublished(name) {
  const res = await fetch(`${BASE}data/${name}.json`)
  if (!res.ok) throw new Error(`${name}.json no disponible (${res.status})`)
  return res.json()
}

// Filtro local con el MISMO contrato que Integrametrics: intervalo SEMIABIERTO
// [startDate, endDate) y filtros por campo (valor único o array = OR). Exportado
// para testear la lógica en puro. El snapshot publicado ya viene acotado al día,
// pero mantener el filtro preserva el contrato para llamadas parametrizadas.
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
  return applyFilters(await loadPublished('registros'), filtros)
}

export async function getRegistrosDigital(filtros = {}) {
  const { startDate, endDate } = filtros
  return applyFilters(await loadPublished('registros-digital'), {
    // registros-digital sólo tiene 'fecha' (YYYY-MM-DD)
    startDate: startDate?.slice(0, 10),
    endDate: endDate?.slice(0, 10),
  })
}

export async function getCatalogos() {
  return loadPublished('catalogos')
}

export async function getTrends() {
  return loadPublished('trends')
}

export async function getContexto() {
  return loadPublished('contexto')
}

// Metadatos de la corrida del pipeline ({ generated, source, day, registros }).
export async function getMeta() {
  try {
    return await loadPublished('meta')
  } catch {
    return null
  }
}

// Chequeo de salud/frescura para el banner honesto (DESIGN §7). Sin lanzar:
// si el snapshot no carga, ok:false con mensaje honesto.
export async function checkSource() {
  try {
    const meta = await loadPublished('meta')
    return { source: meta.source || 'snapshot', ok: true, meta }
  } catch {
    return {
      source: 'snapshot',
      ok: false,
      message:
        'No se pudo cargar el snapshot de datos del día. Mostrando lo último disponible. Reintento automático.',
    }
  }
}
