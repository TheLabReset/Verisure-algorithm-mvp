// Pipeline de datos de The Algorithm: baja lo nuevo de Integrametrics y publica en public/data/ lo que lee el panel.
//   algorithm.json → contrato agregado { meta, daily, pieces, ooh, events, digital }
//   export.csv     → grilla emisión por emisión, con las dimensiones que comparte con el BI del cliente
//   medios.json    → cada emisión de cada marca (canal, programa, versión, tipo, hora), armado desde export.csv
//   meta.json      → { generated, source, firstDay, lastDay, days, registros, mode }
//   vigiladas.json → lo de las marcas vigiladas (src/cliente.js), con la misma forma del contrato más sus emisiones:
//                    solo la capa 1 lo lee. Nada de ellas entra a los archivos de arriba
//
// Dos modos:
//   • BACKFILL  (PIPELINE_START): reconstruye todo el rango y reescribe el contrato y el CSV.
//   • INCREMENTAL (por omisión): los últimos 7 días, incluido hoy, con merge idempotente sobre lo commiteado.
//
// Sin INTEGRAMETRICS_TOKEN el pipeline falla en rojo: un workflow que no puede hacer su trabajo no puede quedar verde
// (docs/produccion-actions.md). El token vive solo acá, en Node; nunca en el bundle del navegador.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildAlgorithm, mergeAlgorithm } from '../src/fuentes/agregado.js'
import { registrosToCSV } from '../src/fuentes/exportCsv.js'
import { fetchRegistros, fetchRegistrosDigital } from '../src/fuentes/integrametrics.js'
import { armarMedios } from './armar-medios.mjs'
import { mediosDesdeCsv, mezclarMedios } from '../src/fuentes/medios.js'
import { CLIENTE } from '../src/cliente.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'data')
const leerDe = (dir, f) => (existsSync(join(dir, f)) ? JSON.parse(readFileSync(join(dir, f), 'utf8')) : null)

// Marcas que se siguen: la propia y su competencia, con su nombre en Integrametrics (src/cliente.js).
// ATL se filtra en el servidor por marca; digital no acepta filtros y se filtra acá por subsector y marca.
const BRANDS = (process.env.PIPELINE_BRANDS || [CLIENTE.marcaFuente, ...CLIENTE.competencia.map((c) => c.marcaFuente)].join(','))
  .split(',').map((s) => s.trim()).filter(Boolean)
const SEC_RE = new RegExp(CLIENTE.subsectores.map((s) => s.split(' ')[0]).filter((x, i, a) => a.indexOf(x) === i).join('|'), 'i')
const BRAND_RE = new RegExp(BRANDS.join('|'), 'i')
// Las vigiladas van por su nombre exacto, en cualquier subsector: se bajan en el mismo pedido y se separan al llegar
const VIGILADAS = new Set((CLIENTE.vigiladas || []).map((v) => v.marcaFuente))
const PRINCIPALES = new Set(BRANDS)
const conNombre = (r) => ({ ...r, maname: String(r.maname || '').trim() })
const esVigilada = (r) => VIGILADAS.has(String(r.maname || '').trim())
// vigiladas.json con la forma que lee la vista; uno viejo o roto se rearma desde la ventana, sin frenar lo principal
const vigiladasValido = (v) => Boolean(v?.meta && Array.isArray(v.daily) && Array.isArray(v.pieces) && Array.isArray(v.events) && Array.isArray(v.ooh)
  && Array.isArray(v.digital?.pieces) && Array.isArray(v.digital?.daily) && v.medios?.emisiones && v.medios?.dic)

// ATL: cada registro trae ~150 campos (decenas de audiencia vacíos). Guardamos SOLO
// los que consumen la agregación/export → el año pasa de ~150 MB a lo justo.
const KEEP_ATL = [
  'id_unico', 'maname', 'fecha', 'rinversion', 'rinversion_dolares', 'hour', 'minute',
  'mname', 'gname', 'tname', 'mabierta_cable', 'vname', 'id_versiones_unica', 'franja',
  'duraseg', 'rfile', 'nuevas_versiones', 'primera_emision_comercial', 'primera_emision_version',
  'latitud', 'longitud', 'direccion', 'localidad', 'ciuname', 'progname', 'genname',
]
const KEEP_DIG = [
  'fecha', 'impresiones', 'inversion_dolares', 'inversion_moneda_local', 'maname',
  'ssname', 'medio_digital', 'version', 'advertisement',
]
const slim = (keep) => (r) => { const o = {}; for (const k of keep) if (r[k] !== undefined) o[k] = r[k]; return o }

// Ventana [start, end] en fechas locales. Backfill: desde `inicio` hasta `hoy`.
// Incremental: los últimos `ventana` días (incluido hoy) para no encarecer las llamadas; si la data commiteada
// termina antes (el pipeline estuvo apagado), arranca el día siguiente a su último día, para no dejar un hueco.
function resolveWindow({ hoy, inicio, ventana, ultimoDia }) {
  const end = hoy || new Date().toISOString().slice(0, 10)
  let start = inicio
  const isBackfill = Boolean(start)
  if (!start) {
    const d = new Date(`${end}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() - (ventana - 1))
    start = d.toISOString().slice(0, 10)
    if (ultimoDia) {
      const sig = new Date(`${ultimoDia}T00:00:00Z`)
      sig.setUTCDate(sig.getUTCDate() + 1)
      const desde = sig.toISOString().slice(0, 10)
      if (desde < start) start = desde
    }
  }
  return { start, end, isBackfill }
}

// Digital en vivo: paginar por día (misma lógica que ATL) y filtrar a seguridad V/P.
async function fetchDigitalWindow(start, end, token, fetchImpl) {
  const out = []
  let d = start
  let guard = 0
  while (d <= end && guard < 400) {
    const rows = await fetchRegistrosDigital({ token, startDate: `${d} 00:00:00`, endDate: `${d} 23:59:59`, fetchImpl })
    if (Array.isArray(rows)) {
      for (const r of rows) if (esVigilada(r) || (SEC_RE.test(r.ssname || '') && BRAND_RE.test(r.maname || ''))) out.push(slim(KEEP_DIG)(esVigilada(r) ? conNombre(r) : r))
    }
    const dt = new Date(`${d}T00:00:00Z`); dt.setUTCDate(dt.getUTCDate() + 1); d = dt.toISOString().slice(0, 10)
    guard += 1
  }
  return out
}

async function loadData({ token, fetchImpl, hoy, inicio, ventana, ultimoDia }) {
  if (!token) throw new Error('falta INTEGRAMETRICS_TOKEN: sin token no hay data nueva, y el contrato commiteado no se toca')
  const { start, end, isBackfill } = resolveWindow({ hoy, inicio, ventana, ultimoDia })
  const rawAtl = await fetchRegistros({
    token, startDate: `${start} 00:00:00`, endDate: `${end} 23:59:59`, filters: { maname: [...BRANDS, ...VIGILADAS] }, fetchImpl,
  })
  const atl = rawAtl.map(slim(KEEP_ATL)).map(conNombre)
  const digital = await fetchDigitalWindow(start, end, token, fetchImpl)
  // las vigiladas se separan acá: el contrato, el CSV del BI y medios.json siguen siendo solo de la marca y su
  // competencia. ATL va por lista blanca: si la fuente devolviera otra marca (una variante del nombre), no entra
  return {
    registros: atl.filter((r) => PRINCIPALES.has(r.maname)), digital: digital.filter((r) => !esVigilada(r)),
    vigiladas: { registros: atl.filter(esVigilada), digital: digital.filter(esVigilada) },
    source: 'live', isBackfill, start, end,
  }
}

// Reemplaza en el CSV commiteado las filas cuya fecha ∈ [start,end] por las frescas
// (idempotente: reejecutar la misma ventana no duplica). El backfill también: lo de antes de su ventana (el año
// anterior, que va al BI del cliente) se queda.
function mergeCsv(out, freshCsv, start, end) {
  const prev = existsSync(join(out, 'export.csv')) ? readFileSync(join(out, 'export.csv'), 'utf8') : ''
  if (!prev) return freshCsv
  const [freshHeader, ...freshRows] = freshCsv.split('\n')
  const prevLines = prev.split('\n')
  const header = prevLines[0] || freshHeader
  const inWindow = (line) => { const f = line.slice(0, 10); return f >= start && f <= end }
  const kept = prevLines.slice(1).filter((l) => l && !inWindow(l))
  return [header, ...kept, ...freshRows.filter(Boolean)].join('\n')
}

// Una corrida completa. Todo se inyecta (token, fetch, carpeta, fechas) para poder probarla de punta a punta
export async function correrPipeline({ token, fetchImpl = fetch, out = OUT, hoy, inicio, ventana = 7, stamp = null, log = console.log, avisoVigiladas = join(ROOT, '.vigiladas-error') } = {}) {
  const base = leerDe(out, 'algorithm.json')
  const { registros, digital, vigiladas, source, isBackfill, start, end } = await loadData({ token, fetchImpl, hoy, inicio, ventana, ultimoDia: base?.meta?.lastDay })
  if (!registros.length) throw new Error('pipeline: sin registros en la ventana, nada que publicar')

  const fresh = buildAlgorithm(registros, digital, { source, generated: stamp })
  mkdirSync(out, { recursive: true })
  const write = (name, data) => writeFileSync(join(out, name), typeof data === 'string' ? data : JSON.stringify(data))

  // Contrato: merge idempotente sobre lo commiteado, en incremental y en backfill: los días de la ventana se
  // reemplazan y los de antes se quedan. Para rehacer todo desde cero se borra el contrato antes de correr.
  const algorithm = base ? mergeAlgorithm(base, fresh) : fresh
  write('algorithm.json', algorithm)

  // CSV spot-a-spot (BI) — merge por ventana en incremental.
  write('export.csv', mergeCsv(out, registrosToCSV(registros), start, end))

  // Canales, programas, horas y días: salen del CSV ya mergeado, sin otra llamada a la API
  const medios = armarMedios(out)

  // Vigiladas: la misma agregación y el mismo merge idempotente, en su propio archivo; sus emisiones salen de sus
  // registros (no tienen CSV) y se reemplazan por ventana, como el CSV. `historia` dice desde qué día se tiene data de
  // cada vigilada (una agregada después o un archivo rearmado empiezan en esta ventana): la vista no llama «primera
  // aparición» a lo que se ve el primer día de su historia. Si algo de esto falla, lo principal ya está escrito: se
  // avisa (el workflow queda en rojo al final) y no se frena la data del día
  let vig = null, vigiladasError = null
  try {
    let baseVig = null
    try { baseVig = leerDe(out, 'vigiladas.json') } catch { baseVig = null }
    if (baseVig && !vigiladasValido(baseVig)) { log('   vigiladas.json con otra forma: se rearma desde esta ventana'); baseVig = null }
    const freshVig = buildAlgorithm(vigiladas.registros, vigiladas.digital, { source, generated: stamp })
    vig = baseVig ? mergeAlgorithm(baseVig, freshVig) : freshVig
    const historia = Object.fromEntries([...VIGILADAS].map((m) => { const b = baseVig?.meta?.historia?.[m]; return [m, b && b < start ? b : start] }))
    const { brands, ...meta } = vig.meta // eslint-disable-line no-unused-vars
    vig.meta = { ...meta, generated: algorithm.meta.generated, ventana: { desde: start, hasta: end }, marcas: [...VIGILADAS], historia }
    vig.medios = mezclarMedios(baseVig?.medios, mediosDesdeCsv(registrosToCSV(vigiladas.registros)), start, end)
    write('vigiladas.json', vig)
  } catch (e) {
    vigiladasError = e.message
    log(`::error::vigiladas.json no se actualizó (${e.message}). La data principal sí.`)
    try { writeFileSync(avisoVigiladas, e.message) } catch { /* el aviso es lo de menos */ }
  }

  const meta = { generated: algorithm.meta.generated, source, firstDay: algorithm.meta.firstDay, lastDay: algorithm.meta.lastDay, days: algorithm.meta.days.length, registros: registros.length, mode: isBackfill ? 'backfill' : 'incremental' }
  write('meta.json', meta)

  log(`✅ pipeline (${source} · ${meta.mode}) · ${algorithm.meta.firstDay}→${algorithm.meta.lastDay}`)
  log(`   ${algorithm.meta.days.length} días · ${algorithm.pieces.length} piezas · ${algorithm.ooh.length} OOH · ${algorithm.events.length} estrenos`)
  log(`   medios.json · ${Object.values(medios.emisiones).reduce((s, x) => s + x.length, 0)} emisiones`)
  if (vig) log(`   vigiladas.json · ${vigiladas.registros.length} registros ATL y ${vigiladas.digital.length} digitales en la ventana · ${vig.pieces.length} piezas ATL, ${vig.digital.pieces.length} digitales y ${vig.ooh.length} paneles en total`)
  return { algorithm, medios, meta, vigiladas: vig, vigiladasError }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  correrPipeline({
    token: process.env.INTEGRAMETRICS_TOKEN || null,
    hoy: process.env.PIPELINE_DAY, inicio: process.env.PIPELINE_START,
    ventana: Number(process.env.PIPELINE_WINDOW || 7), stamp: process.env.PIPELINE_STAMP || null,
  }).catch((e) => {
    console.error('❌ pipeline falló:', e.message)
    process.exit(1)
  })
}
