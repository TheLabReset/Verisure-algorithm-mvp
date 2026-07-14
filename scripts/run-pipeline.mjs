// Pipeline de datos de The Algorithm (Fase 7 · data real Integrametrics).
// PUBLICA en public/data/ un CONTRATO digerible que el frontend fetchea:
//   algorithm.json → contrato agregado { meta, daily, pieces, ooh, events, digital }
//                    (serie temporal + entidades únicas con assets; ~120 KB, no 32 MB)
//   export.csv     → grid spot-a-spot en dimensiones compartidas con el BI (§A.7)
//   meta.json      → { generated, source, firstDay, lastDay, days, registros } salud/frescura
//   trends.json · contexto.json · catalogos.json → capas EXTERNAS (Trends/BCRP/SIDPOL) aún
//                    servidas de fixtures honestos hasta que aterricen sus conectores (§B.6)
//
// Dos modos:
//   • BACKFILL  (PIPELINE_START set): reconstruye TODO el rango → reescribe el contrato + CSV.
//   • INCREMENTAL (por defecto en CI): ventana de 7 días incluyendo hoy → mergeAlgorithm
//     idempotente sobre el contrato commiteado (upsert por clave, sin duplicar) + CSV de la
//     ventana reemplazado en su rango. Llamadas ligeras (~7 días, no todo 2026).
//
// Fuente: fixtures deterministas por defecto. Con DATA_SOURCE=live + INTEGRAMETRICS_TOKEN,
// ATL sale de /registros (paginado por día, filtrado a Verisure+Prosegur) y digital de
// /registros-digital (sin filtro server-side → se filtra por subsector en cliente).
// El token vive SOLO aquí (Node); jamás en el bundle del navegador (governance §B.2).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildAlgorithm, mergeAlgorithm } from '../src/data/aggregate.js'
import { registrosToCSV } from '../src/data/csvExport.js'
import { fetchRegistros, fetchRegistrosDigital } from '../src/data/integrametrics.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const FX = join(ROOT, 'src', 'data', 'fixtures')
const OUT = join(ROOT, 'public', 'data')
const readFx = (f) => JSON.parse(readFileSync(join(FX, f), 'utf8'))
const readOut = (f) => (existsSync(join(OUT, f)) ? JSON.parse(readFileSync(join(OUT, f), 'utf8')) : null)

const token = process.env.INTEGRAMETRICS_TOKEN || null
const wantLive = process.env.DATA_SOURCE === 'live' && Boolean(token)

// Set competitivo del producto = Verisure + Prosegur (Hunter=B2B y Securitas=seguros
// quedan fuera; validado contra la API). ATL se filtra server-side por NOMBRE de marca.
const BRANDS = (process.env.PIPELINE_BRANDS || 'VERISURE,PROSEGUR')
  .split(',').map((s) => s.trim()).filter(Boolean)
// Digital NO acepta filtros server-side → se filtra en cliente por subsector de seguridad.
const SEC_RE = /SEGURIDAD/i
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
  if (!wantLive) {
    return { registros: readFx('registros.json'), digital: readFx('registros-digital.json'), source: 'fixtures', isBackfill: true }
  }
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

  // Capas externas (fixtures honestos hasta que aterricen sus conectores).
  write('trends.json', readFx('trends.json'))
  write('contexto.json', readFx('contexto.json'))
  write('catalogos.json', readFx('catalogos.json'))

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
}

main().catch((e) => {
  console.error('❌ pipeline falló:', e.message)
  process.exit(1)
})
