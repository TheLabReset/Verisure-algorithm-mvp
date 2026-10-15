// Cliente REST de Integrametrics (modo source=live).
// Doc: docs/Documentación API Integra Metrics.pdf
//  - Base: https://pe.integra-metrics.com/api/rest/v1 · Header Authorization: Bearer <token>
//  - Todos los endpoints son GET.
//  - /registros: intervalo SEMIABIERTO [startDate, endDate) en HORA LOCAL; máx 90.000 registros.
//  - Sin parámetro de página en /registros → paginamos partiendo el intervalo por ventanas de día.
//
// Diseño de governance: en el navegador NO hay token (jamás client-side). El token vive
// solo en el pipeline (Node, process.env.INTEGRAMETRICS_TOKEN). Sin token, live falla de
// forma manejada y el dashboard muestra un banner honesto (nunca crashea).

export const INTEGRAMETRICS_BASE = 'https://pe.integra-metrics.com/api/rest/v1'

export class IntegrametricsError extends Error {
  constructor(message, cause) {
    super(message)
    this.name = 'IntegrametricsError'
    this.cause = cause
  }
}

function buildUrl(base, path, params = {}) {
  const url = new URL(base.replace(/\/$/, '') + path)
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue
    url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v))
  }
  return url.toString()
}

// Suma d días a un 'YYYY-MM-DD' (hora local, sin dependencias de zona del sistema).
function addDays(isoDate, d) {
  const [y, m, day] = isoDate.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, day))
  dt.setUTCDate(dt.getUTCDate() + d)
  return dt.toISOString().slice(0, 10)
}

// Genera ventanas [start, end) que cubren [startDate, endDate) sin exceder un día cada una.
// endDate es EXCLUSIVO (semiabierto). Paginación por día para no topar el límite de 90.000.
// Maneja también intervalos sub-día (una sola ventana [start, end)).
export function dayWindows(startDate, endDate) {
  const windows = []
  let curStart = startDate
  let guard = 0
  while (curStart < endDate && guard < 3660) {
    const nextDayStart = `${addDays(curStart.slice(0, 10), 1)} 00:00:00`
    const winEnd = nextDayStart < endDate ? nextDayStart : endDate
    windows.push({ start: curStart, end: winEnd })
    curStart = winEnd
    guard += 1
  }
  return windows
}

async function getJSON(url, token, fetchImpl) {
  if (!token) {
    throw new IntegrametricsError('Falta INTEGRAMETRICS_TOKEN (sin credencial no se puede consultar live)')
  }
  let res
  try {
    res = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}` } })
  } catch (e) {
    throw new IntegrametricsError('Red no disponible al consultar Integrametrics', e)
  }
  if (!res.ok) {
    throw new IntegrametricsError(`Integrametrics respondió ${res.status}`)
  }
  return res.json()
}

// GET /registros paginado por día. filters se envía como JSON (objeto).
export async function fetchRegistros({ base = INTEGRAMETRICS_BASE, token, startDate, endDate, filters, fetchImpl }) {
  const f = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null)
  if (!f) throw new IntegrametricsError('No hay implementación de fetch disponible')
  const out = []
  for (const w of dayWindows(startDate, endDate)) {
    const url = buildUrl(base, '/registros', { startDate: w.start, endDate: w.end, filters })
    const batch = await getJSON(url, token, f)
    if (Array.isArray(batch)) out.push(...batch)
  }
  return out
}

export async function fetchRegistrosDigital({ base = INTEGRAMETRICS_BASE, token, startDate, endDate, fetchImpl }) {
  const f = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null)
  if (!f) throw new IntegrametricsError('No hay implementación de fetch disponible')
  const url = buildUrl(base, '/registros-digital', { startDate, endDate })
  return getJSON(url, token, f)
}

export async function fetchCatalogo({ base = INTEGRAMETRICS_BASE, token, name, params, fetchImpl }) {
  const f = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null)
  if (!f) throw new IntegrametricsError('No hay implementación de fetch disponible')
  const url = buildUrl(base, `/${name}`, params)
  return getJSON(url, token, f)
}
