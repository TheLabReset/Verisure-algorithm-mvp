import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  computeSOI,
  detectNewPieces,
  pressureSeries,
  diyIndex,
  computeIPC,
  computeIMC,
  opportunityScore,
  latestDay,
  soiComparison,
  adMuseumPieces,
  oohPoints,
  classifyEPPM,
  brandKey,
  investmentShare,
  searchVsInvestment,
} from './derive.js'

const FX = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')
const read = (f) => JSON.parse(readFileSync(join(FX, f), 'utf8'))
const registros = read('registros.json')
const digital = read('registros-digital.json')
const trends = read('trends.json')
const contexto = read('contexto.json')
const DAY = '2026-07-10'

// ── Test de oro: SOI del jue 10 jul reproduce el mockup (46/33/21) ────
test('SOI gold: último día = mockup (46,1/33,3/20,6 · S/256.800)', () => {
  const soi = computeSOI(registros, DAY)
  assert.equal(soi.total, 256800)
  const byName = Object.fromEntries(soi.brands.map((b) => [b.maname, b.share]))
  assert.equal(byName['PROSEGUR ALARMS'], 46.1)
  assert.equal(byName['VERISURE'], 33.3)
  assert.equal(byName['SECURITAS'], 20.6)
  // Verisure marcado, competidores no
  assert.equal(soi.brands.find((b) => b.maname === 'VERISURE').isVerisure, true)
  assert.equal(soi.brands.find((b) => b.maname === 'PROSEGUR ALARMS').isVerisure, false)
  // ordenado desc por inversión
  assert.equal(soi.brands[0].maname, 'PROSEGUR ALARMS')
})

// ── Detección de pieza NUEVA (alerta same-day) ────────────────────────
test('detectNewPieces: hoy hay 1 NUEVA de Prosegur "Nada es seguro, salvo tu hogar"', () => {
  const nuevas = detectNewPieces(registros, DAY)
  assert.equal(nuevas.length, 1)
  assert.equal(nuevas[0].maname, 'PROSEGUR ALARMS')
  assert.equal(nuevas[0].vname, 'Nada es seguro, salvo tu hogar')
  assert.equal(nuevas[0].mname, 'AMÉRICA TV')
  assert.equal(nuevas[0].franja, 'PRIME')
  assert.ok(nuevas[0].rfile) // link al video para la alerta
})

// ── Serie de presión 30d ──────────────────────────────────────────────
test('pressureSeries: 30 puntos, fechas ascendentes, último = 256.800', () => {
  const s = pressureSeries(registros, DAY, 30)
  assert.equal(s.length, 30)
  assert.equal(s[29].fecha, DAY)
  assert.equal(s[29].total, 256800)
  for (let i = 1; i < s.length; i++) assert.ok(s[i].fecha > s[i - 1].fecha)
})

// ── Índice DIY = 58 (mockup) ──────────────────────────────────────────
test('diyIndex: = 58 (coherente con el mockup)', () => {
  const d = diyIndex(trends, digital)
  assert.equal(d.index, 58)
  assert.deepEqual(d.components.marcas_monitoreadas, ['Ezviz', 'Imou', 'TP-Link Tapo'])
})

// ── IPC / IMC / Opportunity Score cerca del mockup (64/79/72) ─────────
test('IPC/IMC/Score reproducen el mockup dentro de tolerancia', () => {
  const ipc = computeIPC(registros, DAY)
  const imc = computeIMC(trends, contexto)
  const { score } = opportunityScore(registros, trends, contexto, DAY)
  assert.equal(ipc, 64) // mockup 64
  assert.ok(imc >= 76 && imc <= 80, `IMC ${imc} fuera de [76,80]`) // mockup 79
  assert.ok(score >= 70 && score <= 74, `Score ${score} fuera de [70,74]`) // mockup 72
})

// ── Casos borde ───────────────────────────────────────────────────────
test('borde: día sin registros → total 0, sin marcas, sin crash', () => {
  const soi = computeSOI(registros, '2020-01-01')
  assert.equal(soi.total, 0)
  assert.deepEqual(soi.brands, [])
  assert.deepEqual(detectNewPieces(registros, '2020-01-01'), [])
})

test('borde: empate exacto → shares 50/50', () => {
  const tie = [
    { maname: 'A', fecha: '2026-07-10 10:00:00', rinversion: 1000, nuevas_versiones: '' },
    { maname: 'B', fecha: '2026-07-10 11:00:00', rinversion: 1000, nuevas_versiones: '' },
  ]
  const soi = computeSOI(tie, DAY)
  assert.equal(soi.total, 2000)
  assert.equal(soi.brands[0].share, 50)
  assert.equal(soi.brands[1].share, 50)
})

test('borde: mes incompleto (pocos días) → serie del largo pedido con ceros', () => {
  const few = registros.filter((r) => r.fecha.startsWith('2026-07-10'))
  const s = pressureSeries(few, DAY, 5)
  assert.equal(s.length, 5)
  assert.equal(s[4].total, 256800)
  assert.equal(s[0].total, 0) // días previos sin data → 0, no crash
})

test('borde: fuente caída (data vacía) → derivadores devuelven ceros, no lanzan', () => {
  assert.equal(computeSOI([], DAY).total, 0)
  assert.equal(computeIPC([], DAY), 0)
  assert.equal(diyIndex({ diy: {} }, []).index, 0)
})

test('detectNewPieces: múltiples nuevas el mismo día, ordenadas por hora', () => {
  const rows = [
    { maname: 'SECURITAS', fecha: '2026-07-10 18:00:00', nuevas_versiones: 'NUEVO', vname: 'B' },
    { maname: 'PROSEGUR ALARMS', fecha: '2026-07-10 09:41:00', nuevas_versiones: 'NUEVO', vname: 'A' },
    { maname: 'VERISURE', fecha: '2026-07-10 12:00:00', nuevas_versiones: '', vname: 'C' },
  ]
  const n = detectNewPieces(rows, '2026-07-10')
  assert.equal(n.length, 2) // solo las 2 con NUEVO
  assert.deepEqual(n.map((p) => p.vname), ['A', 'B']) // orden por fecha ascendente
})

test('detectNewPieces: NUEVO en día no-último solo aparece en ese día', () => {
  const rows = [
    { maname: 'PROSEGUR ALARMS', fecha: '2026-07-05 10:00:00', nuevas_versiones: 'NUEVO', vname: 'X' },
  ]
  assert.equal(detectNewPieces(rows, '2026-07-10').length, 0) // no es el día 5
  assert.equal(detectNewPieces(rows, '2026-07-05').length, 1)
})

// ── Derivadores del Radar (Fase 2) ────────────────────────────────────
test('latestDay: día más reciente de los registros', () => {
  assert.equal(latestDay(registros), DAY)
  assert.equal(latestDay([]), null)
})

test('soiComparison: deltas vs. N días atrás (Prosegur sube, Securitas baja)', () => {
  const c = soiComparison(registros, DAY, 7)
  const d = Object.fromEntries(c.brands.map((b) => [b.maname, b.deltaPts]))
  assert.ok(d['PROSEGUR ALARMS'] > 0, 'Prosegur debe subir')
  assert.ok(d['SECURITAS'] <= 0, 'Securitas debe caer o mantenerse')
  assert.equal(c.total, 256800)
})

test('adMuseumPieces: agrupa por versión (piezas ≪ emisiones), inversión acumulada', () => {
  const m = adMuseumPieces(registros)
  assert.ok(m.length > 0 && m.length < registros.length, 'piezas deben agrupar emisiones')
  // ordenadas por primera emisión desc
  for (let i = 1; i < m.length; i++) assert.ok(m[i - 1].firstEmission >= m[i].firstEmission)
  // la pieza NUEVA de hoy existe con su inversión
  const nueva = m.find((p) => p.vname === 'Nada es seguro, salvo tu hogar')
  assert.ok(nueva && nueva.totalInvestment >= 84300)
})

test('oohPoints: solo vía pública con lat/long', () => {
  const pts = oohPoints(registros)
  assert.ok(pts.length > 0)
  assert.ok(pts.every((p) => p.lat != null && p.lng != null))
})

test('classifyEPPM: heurística de tono', () => {
  assert.equal(classifyEPPM('Nada es seguro, salvo tu hogar'), 'miedo → alivio')
  assert.equal(classifyEPPM('Tu negocio, siempre atendido'), 'eficacia')
  assert.equal(classifyEPPM('Respuesta en segundos'), 'alivio')
})

// ── Derivadores de DEMANDA (Fase 3) ───────────────────────────────────
test('brandKey: normaliza marca a clave corta', () => {
  assert.equal(brandKey('PROSEGUR ALARMS'), 'PROSEGUR')
  assert.equal(brandKey('VERISURE'), 'VERISURE')
})

test('investmentShare: shares suman ~100 y ordenados desc', () => {
  const s = investmentShare(registros)
  const total = s.reduce((a, b) => a + b.share, 0)
  assert.ok(Math.abs(total - 100) < 1.5, `shares suman ${total}`)
  for (let i = 1; i < s.length; i++) assert.ok(s[i - 1].share >= s[i].share)
})

test('searchVsInvestment: cruza SoS (Trends) con SoI, calcula gap; Verisure con brecha +', () => {
  const rows = searchVsInvestment(registros, trends)
  const v = rows.find((r) => r.isVerisure)
  assert.equal(v.search, 44) // del fixture share_of_search
  assert.ok(v.gap > 0, 'Verisure: búsqueda por encima de inversión (gap +)')
  const pros = rows.find((r) => r.maname.includes('PROSEGUR'))
  assert.ok(pros.gap < 0, 'Prosegur: invierte por encima de su búsqueda (gap −)')
})
