// Vistas del contrato: cortes por rango, SOI/deltas, digital y score.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildAlgorithm } from './aggregate.js'
import { soiInRange, soiComparison, pressureInRange, piecesInRange, oohInRange, eventsInRange, digitalSoi, deltas, priorWindow, opportunityScore } from './views.js'

const REG = [
  { id_unico: 1, maname: 'VERISURE', fecha: '2026-07-01 09:00:00', rinversion: 1000, gname: 'TV ABIERTA', mabierta_cable: 1, tname: 'SPOT', vname: 'A', id_versiones_unica: 10, franja: 'DIA', rfile: 'https://x/a.mp4', nuevas_versiones: 'NUEVO' },
  { id_unico: 2, maname: 'PROSEGUR', fecha: '2026-07-01 12:00:00', rinversion: 1000, gname: 'VIA PUBLICA', tname: 'TORRE', vname: 'B', id_versiones_unica: 20, latitud: -12.1, longitud: -77.0, rfile: 'https://x/b.jpg' },
  { id_unico: 3, maname: 'VERISURE', fecha: '2026-07-10 09:00:00', rinversion: 3000, gname: 'RADIO', tname: 'SPOT RADIO', vname: 'C', id_versiones_unica: 30, franja: 'DIA', rfile: 'https://x/c.mp3' },
]
const DIG = [
  { fecha: '2026-07-01', maname: 'VERISURE', inversion_moneda_local: 100, impresiones: 10, medio_digital: 'FACEBOOK', version: 'V', advertisement: 'https://x/d.jpg' },
  { fecha: '2026-07-10', maname: 'PROSEGUR', inversion_moneda_local: 400, impresiones: 40, medio_digital: 'FACEBOOK', version: 'P', advertisement: 'https://x/e.jpg' },
]
const C = buildAlgorithm(REG, DIG, { source: 'test' })

test('soiInRange: agrega por marca y calcula share', () => {
  const s = soiInRange(C, '2026-07-01', '2026-07-01')
  assert.equal(s.total, 2000)
  assert.equal(s.brands.find((b) => b.isVerisure).share, 50)
})

test('soiInRange: acota por rango (excluye fuera de ventana)', () => {
  const s = soiInRange(C, '2026-07-10', '2026-07-10')
  assert.equal(s.total, 3000)
  assert.equal(s.brands.length, 1)
  assert.equal(s.brands[0].maname, 'VERISURE')
})

test('priorWindow: ventana previa de igual longitud, contigua', () => {
  const pw = priorWindow('2026-07-08', '2026-07-14') // 7 días
  assert.equal(pw.len, 7)
  assert.equal(pw.to, '2026-07-07')
  assert.equal(pw.from, '2026-07-01')
})

test('soiComparison: deltaPts vs. período anterior', () => {
  const s = soiComparison(C, '2026-07-10', '2026-07-10')
  assert.ok(s.brands[0].deltaPts !== undefined)
})

test('pressureInRange / piecesInRange / oohInRange / eventsInRange: cortan por rango', () => {
  assert.equal(pressureInRange(C, '2026-07-01', '2026-07-01').length, 1)
  assert.equal(oohInRange(C, '2026-07-01', '2026-07-31').length, 1)
  assert.equal(oohInRange(C, '2026-06-01', '2026-06-30').length, 0) // panel de julio, fuera del rango
  assert.equal(eventsInRange(C, '2026-07-01', '2026-07-05').length, 1)
  // pieza C (radio, 2026-07-10) no solapa 2026-07-01..02
  const p = piecesInRange(C, '2026-07-01', '2026-07-02').map((x) => x.key)
  assert.ok(!p.includes(30))
})

test('digitalSoi: agrega spend/impresiones por marca en rango', () => {
  const d = digitalSoi(C, '2026-07-01', '2026-07-31')
  assert.equal(d.total, 500)
  assert.equal(d.impresiones, 50)
})

test('deltas: expone totales ATL/digital y newPieces del período', () => {
  const d = deltas(C, '2026-07-01', '2026-07-31')
  assert.equal(d.atlTotal, 5000)
  assert.equal(d.digitalTotal, 500)
  assert.equal(d.newPieces, 1)
})

test('opportunityScore: 0–100 con ipc/imc', () => {
  const s = opportunityScore(C, { keywords: [] }, {}, '2026-07-01', '2026-07-31')
  assert.ok(s.score >= 0 && s.score <= 100)
  assert.ok(s.ipc >= 0 && s.ipc <= 100)
  assert.ok(s.imc >= 0 && s.imc <= 100)
})
