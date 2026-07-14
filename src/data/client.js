// Cliente de datos del navegador (Fase 7). Lee el CONTRATO agregado publicado en /data/
// por el pipeline (`scripts/run-pipeline.mjs`): fixtures deterministas o Integrametrics live.
// Contrato único: el frontend SIEMPRE fetchea JSON ya publicado y nunca habla con
// Integrametrics ni ve el token (governance §B.2). El contrato (algorithm.json) trae la
// serie diaria + entidades únicas con assets — el navegador ya no descarga registros crudos.

// Respeta un base path distinto de '/' (Vite lo inyecta en build).
const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/'

async function loadPublished(name) {
  const res = await fetch(`${BASE}data/${name}.json`)
  if (!res.ok) throw new Error(`${name}.json no disponible (${res.status})`)
  return res.json()
}

// Contrato agregado { meta, daily, pieces, ooh, events, digital }.
export async function getAlgorithm() {
  return loadPublished('algorithm')
}

// Capas externas (Trends/BCRP/SIDPOL) — fixtures honestos hasta que aterricen sus conectores.
export async function getTrends() {
  return loadPublished('trends')
}
export async function getContexto() {
  return loadPublished('contexto')
}
export async function getCatalogos() {
  return loadPublished('catalogos')
}

// Metadatos de la corrida ({ generated, source, firstDay, lastDay, days, registros }).
export async function getMeta() {
  try { return await loadPublished('meta') } catch { return null }
}

// Chequeo de salud/frescura para el banner honesto (DESIGN §7). Sin lanzar.
export async function checkSource() {
  try {
    const meta = await loadPublished('meta')
    return { source: meta.source || 'snapshot', ok: true, meta }
  } catch {
    return {
      source: 'snapshot', ok: false,
      message: 'No se pudo cargar el snapshot de datos. Mostrando lo último disponible. Reintento automático.',
    }
  }
}
