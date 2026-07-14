// Pipeline diario de The Algorithm (blueprint §B.6).
// Carga la data del día, corre los derivadores y PUBLICA el snapshot en public/data/:
//   registros.json · registros-digital.json · catalogos.json · trends.json · contexto.json
//     → datasets crudos que el frontend fetchea (contrato único de datos)
//   algorithm.json → vistas derivadas agregadas (radar/demanda/contexto/maia)
//   export.csv     → dimensiones compartidas con el BI de Verisure (§A.7)
//   meta.json      → { generated, source, day, registros } para frescura y salud
//
// Fuente: dry-run DETERMINISTA sobre fixtures por defecto. Con DATA_SOURCE=live e
// INTEGRAMETRICS_TOKEN presentes, los registros salen de Integrametrics (paginado);
// Trends/BCRP/SIDPOL siguen desde fixtures hasta que aterricen sus scrapers (§B.6).
// El token vive SOLO aquí (Node), jamás en el bundle del navegador (governance §B.2).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  latestDay,
  soiComparison,
  detectNewPieces,
  pressureSeries,
  adMuseumPieces,
  oohPoints,
  searchVsInvestment,
  diyIndex,
  opportunityScore,
} from '../src/data/derive.js'
import { registrosToCSV } from '../src/data/csvExport.js'
import { composeBrief } from '../src/modules/maia/maiaBrief.js'
import { fetchRegistros } from '../src/data/integrametrics.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const FX = join(ROOT, 'src', 'data', 'fixtures')
const OUT = join(ROOT, 'public', 'data')
const readFx = (f) => JSON.parse(readFileSync(join(FX, f), 'utf8'))

const token = process.env.INTEGRAMETRICS_TOKEN || null
const wantLive = process.env.DATA_SOURCE === 'live' && Boolean(token)

// Set competitivo del producto = Verisure + Prosegur (Hunter=B2B y Securitas=seguros
// quedan fuera; validado contra la API). Se filtra por NOMBRE de marca (más chico que
// por subsector). `filters` usa nombres; `ssid`/`maid` no son campos filtrables.
const BRANDS = (process.env.PIPELINE_BRANDS || 'VERISURE,PROSEGUR')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

// Adelgazado: cada registro ATL trae ~150 campos (decenas de audiencia vacíos). Guardamos
// SOLO los que consumen los derivadores/export → el año completo pasa de ~150MB a ~12MB.
const KEEP = [
  'id_unico', 'maname', 'fecha', 'rinversion', 'rinversion_dolares', 'hour', 'minute',
  'mname', 'gname', 'tname', 'mabierta_cable', 'vname', 'id_versiones_unica', 'franja',
  'duraseg', 'rfile', 'nuevas_versiones', 'primera_emision_comercial', 'primera_emision_version',
  'latitud', 'longitud', 'direccion', 'localidad', 'ciuname', 'progname', 'genname',
]
const slim = (r) => {
  const o = {}
  for (const k of KEEP) if (r[k] !== undefined) o[k] = r[k]
  return o
}

async function loadRegistros() {
  if (!wantLive) return { registros: readFx('registros.json'), source: 'fixtures' }
  // Live: ventana [PIPELINE_START, PIPELINE_DAY]. Por defecto 30 días hasta hoy; para
  // backfill histórico se pasa PIPELINE_START (ej. 2026-01-01). fetchRegistros pagina
  // por día internamente para no topar el límite. Trends/contexto aún de fixtures.
  const end = process.env.PIPELINE_DAY || new Date().toISOString().slice(0, 10)
  let start = process.env.PIPELINE_START
  if (!start) {
    const d = new Date(`${end}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() - 30)
    start = d.toISOString().slice(0, 10)
  }
  const raw = await fetchRegistros({
    token,
    startDate: `${start} 00:00:00`,
    endDate: `${end} 23:59:59`,
    filters: { maname: BRANDS },
  })
  return { registros: raw.map(slim), source: 'live' }
}

async function main() {
  const { registros, source } = await loadRegistros()
  const digital = readFx('registros-digital.json')
  const catalogos = readFx('catalogos.json')
  const trends = readFx('trends.json')
  const contexto = readFx('contexto.json')

  const day = latestDay(registros)
  if (!day) throw new Error('pipeline: sin registros, no hay día que publicar')

  // ── Derivar todas las vistas (mismos derivadores puros que el frontend) ──
  const soi = soiComparison(registros, day)
  const newPieces = detectNewPieces(registros, day)
  const pressure = pressureSeries(registros, day, 30)
  const museum = adMuseumPieces(registros)
  const ooh = oohPoints(registros)
  const demanda = searchVsInvestment(registros, trends)
  const diy = diyIndex(trends, digital)
  const score = opportunityScore(registros, trends, contexto, day)
  const brief = composeBrief({ day, soi, newPieces, diy, score, contexto })

  // Timestamp determinista por defecto (6:00 a. m. Lima del día del dato); en CI se
  // pasa PIPELINE_STAMP con la hora real de la corrida.
  const generated = process.env.PIPELINE_STAMP || `${day}T06:00:00-05:00`

  const algorithm = {
    meta: { generated, source, day },
    radar: { soi, newPieces, pressure, museum, ooh },
    demanda: { searchVsInvestment: demanda, diy },
    contexto,
    maia: { score, brief },
  }

  const tipoCambio = contexto?.macro?.tipo_cambio?.value ?? null
  const csv = registrosToCSV(registros, { tipoCambio })

  mkdirSync(OUT, { recursive: true })
  const write = (name, data) =>
    writeFileSync(join(OUT, name), typeof data === 'string' ? data : JSON.stringify(data))

  write('registros.json', registros)
  write('registros-digital.json', digital)
  write('catalogos.json', catalogos)
  write('trends.json', trends)
  write('contexto.json', contexto)
  write('algorithm.json', algorithm)
  write('export.csv', csv)
  write('meta.json', { generated, source, day, registros: registros.length })

  console.log(`✅ pipeline (${source}) · día ${day} · ${registros.length} registros`)
  console.log(`   público en public/data/ · SOI líder ${soi.brands[0]?.maname} ${soi.brands[0]?.share}% · Score ${score.score}`)
}

main().catch((e) => {
  console.error('❌ pipeline falló:', e.message)
  process.exit(1)
})
