// Pipeline de datos de The Algorithm: baja lo nuevo de Integrametrics y publica en public/data/ lo que lee el panel.
//   algorithm.json → contrato agregado { meta, daily, pieces, ooh, events, digital }
//   export.csv     → grilla emisión por emisión, con las dimensiones que comparte con el BI del cliente
//   medios.json    → canales, programas, horas y días por mes y marca, armado desde export.csv
//   meta.json      → { generated, source, firstDay, lastDay, days, registros, mode }
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
import { CLIENTE } from '../src/cliente.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'data')
const readOut = (f) => (existsSync(join(OUT, f)) ? JSON.parse(readFileSync(join(OUT, f), 'utf8')) : null)

const token = process.env.INTEGRAMETRICS_TOKEN || null

// Marcas que se siguen: la propia y su competencia, con su nombre en Integrametrics (src/cliente.js).
// ATL se filtra en el servidor por marca; digital no acepta filtros y se filtra acá por subsector y marca.
const BRANDS = (process.env.PIPELINE_BRANDS || [CLIENTE.marcaFuente, ...CLIENTE.competencia.map((c) => c.marcaFuente)].join(','))
  .split(',').map((s) => s.trim()).filter(Boolean)
const SEC_RE = new RegExp(CLIENTE.subsectores.map((s) => s.split(' ')[0]).filter((x, i, a) => a.indexOf(x) === i).join('|'), 'i')
const BRAND_RE = new RegExp(BRANDS.join('|'), 'i')

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

// Ventana [start, end] en fechas locales. Backfill: PIPELINE_START..PIPELINE_DAY.
// Incremental: últimos WINDOW_DAYS (incl. hoy) para no encarecer las llamadas.
const WINDOW_DAYS = Number(process.env.PIPELINE_WINDOW || 7)
function resolveWindow() {
  const end = process.env.PIPELINE_DAY || new Date().toISOString().slice(0, 10)
  let start = process.env.PIPELINE_START
  const isBackfill = Boolean(start)
  if (!start) {
    const d = new Date(`${end}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() - (WINDOW_DAYS - 1))
    start = d.toISOString().slice(0, 10)
  }
  return { start, end, isBackfill }
}

// Digital en vivo: paginar por día (misma lógica que ATL) y filtrar a seguridad V/P.
async function fetchDigitalWindow(start, end) {
  const out = []
  let d = start
  let guard = 0
  while (d <= end && guard < 400) {
    const rows = await fetchRegistrosDigital({ token, startDate: `${d} 00:00:00`, endDate: `${d} 23:59:59` })
    if (Array.isArray(rows)) {
      for (const r of rows) if (SEC_RE.test(r.ssname || '') && BRAND_RE.test(r.maname || '')) out.push(slim(KEEP_DIG)(r))
    }
    const dt = new Date(`${d}T00:00:00Z`); dt.setUTCDate(dt.getUTCDate() + 1); d = dt.toISOString().slice(0, 10)
    guard += 1
  }
  return out
}

async function loadData() {
  if (!token) throw new Error('falta INTEGRAMETRICS_TOKEN: sin token no hay data nueva, y el contrato commiteado no se toca')
  const { start, end, isBackfill } = resolveWindow()
  const rawAtl = await fetchRegistros({
    token, startDate: `${start} 00:00:00`, endDate: `${end} 23:59:59`, filters: { maname: BRANDS },
  })
  const digital = await fetchDigitalWindow(start, end)
  return { registros: rawAtl.map(slim(KEEP_ATL)), digital, source: 'live', isBackfill, start, end }
}

// Reemplaza en el CSV commiteado las filas cuya fecha ∈ [start,end] por las frescas
// (idempotente: reejecutar la misma ventana no duplica). Backfill reescribe entero.
function mergeCsv(freshCsv, isBackfill, start, end) {
  if (isBackfill) return freshCsv
  const prev = existsSync(join(OUT, 'export.csv')) ? readFileSync(join(OUT, 'export.csv'), 'utf8') : ''
  if (!prev) return freshCsv
  const [freshHeader, ...freshRows] = freshCsv.split('\n')
  const prevLines = prev.split('\n')
  const header = prevLines[0] || freshHeader
  const inWindow = (line) => { const f = line.slice(0, 10); return f >= start && f <= end }
  const kept = prevLines.slice(1).filter((l) => l && !inWindow(l))
  return [header, ...kept, ...freshRows.filter(Boolean)].join('\n')
}

async function main() {
  const { registros, digital, source, isBackfill, start, end } = await loadData()
  if (!registros.length) throw new Error('pipeline: sin registros en la ventana, nada que publicar')

  const generated = process.env.PIPELINE_STAMP || null
  const fresh = buildAlgorithm(registros, digital, { source, generated })

  mkdirSync(OUT, { recursive: true })
  const write = (name, data) =>
    writeFileSync(join(OUT, name), typeof data === 'string' ? data : JSON.stringify(data))

  // Contrato: backfill reescribe; incremental hace merge idempotente sobre lo commiteado.
  const base = isBackfill ? null : readOut('algorithm.json')
  const algorithm = base ? mergeAlgorithm(base, fresh) : fresh
  write('algorithm.json', algorithm)

  // CSV spot-a-spot (BI) — merge por ventana en incremental.
  const csv = mergeCsv(registrosToCSV(registros), isBackfill, start, end)
  write('export.csv', csv)

  // Canales, programas, horas y días: salen del CSV ya mergeado, sin otra llamada a la API
  const medios = armarMedios()

  write('meta.json', {
    generated: algorithm.meta.generated,
    source,
    firstDay: algorithm.meta.firstDay,
    lastDay: algorithm.meta.lastDay,
    days: algorithm.meta.days.length,
    registros: registros.length,
    mode: isBackfill ? 'backfill' : 'incremental',
  })

  const topBrand = algorithm.daily.at(-1)?.brands
  const lead = topBrand ? Object.entries(topBrand).sort((a, b) => b[1].spend - a[1].spend)[0]?.[0] : '—'
  console.log(`✅ pipeline (${source} · ${isBackfill ? 'backfill' : 'incremental'}) · ${algorithm.meta.firstDay}→${algorithm.meta.lastDay}`)
  console.log(`   ${algorithm.meta.days.length} días · ${algorithm.pieces.length} piezas · ${algorithm.ooh.length} OOH · ${algorithm.events.length} estrenos · líder ${lead}`)
  console.log(`   medios.json · ${Object.keys(medios.meses).length} meses`)
}

main().catch((e) => {
  console.error('❌ pipeline falló:', e.message)
  process.exit(1)
})
