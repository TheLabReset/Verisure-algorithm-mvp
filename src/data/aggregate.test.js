// Agregación registros → contrato: EXACTITUD aditiva (inversión/conteos) e IDEMPOTENCIA
// del merge por claves estables (no duplica al reejecutar la misma ventana).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildAlgorithm, mergeAlgorithm, assetOf } from './aggregate.js'

const REG = [
  { id_unico: 1, maname: 'VERISURE', fecha: '2026-07-01 09:00:00', rinversion: 1000, gname: 'TV ABIERTA', mabierta_cable: 1, mname: 'LATINA', tname: 'SPOT', vname: 'PROTEGE TU HOGAR', id_versiones_unica: 10, franja: 'DIA', rfile: 'https://x/a.mp4', nuevas_versiones: 'NUEVO', progname: 'NOTICIERO' },
  { id_unico: 2, maname: 'VERISURE', fecha: '2026-07-01 20:00:00', rinversion: 500, gname: 'TV ABIERTA', mabierta_cable: 1, mname: 'AMERICA', tname: 'SPOT', vname: 'PROTEGE TU HOGAR', id_versiones_unica: 10, franja: 'PRIME', rfile: 'https://x/a.mp4', nuevas_versiones: '' },
  { id_unico: 3, maname: 'PROSEGUR', fecha: '2026-07-01 12:00:00', rinversion: 300, gname: 'VIA PUBLICA', tname: 'TORRE UNIPOLAR', vname: 'ALARMA PROSEGUR', id_versiones_unica: 20, latitud: -12.1, longitud: -77.0, direccion: 'Av X', localidad: 'Miraflores', rfile: 'https://x/p.jpg' },
  { id_unico: 4, maname: 'PROSEGUR', fecha: '2026-07-02 12:00:00', rinversion: 200, gname: 'VIA PUBLICA', tname: 'TORRE UNIPOLAR', vname: 'ALARMA PROSEGUR', id_versiones_unica: 20, latitud: -12.1, longitud: -77.0, direccion: 'Av X', localidad: 'Miraflores', rfile: 'https://x/p.jpg' },
]
const DIG = [
  { fecha: '2026-07-01', maname: 'VERISURE', inversion_moneda_local: 400, impresiones: 1000, medio_digital: 'FACEBOOK', version: 'V1', advertisement: 'https://x/d1.jpg' },
  { fecha: '2026-07-01', maname: 'PROSEGUR', inversion_moneda_local: 100, impresiones: 500, medio_digital: 'FACEBOOK', version: 'P1', advertisement: 'https://x/d2.jpg' },
]

test('assetOf: clasifica por extensión', () => {
  assert.equal(assetOf('https://x/a.mp4').kind, 'video')
  assert.equal(assetOf('https://x/a.mp3').kind, 'audio')
  assert.equal(assetOf('https://x/a.jpg').kind, 'image')
  assert.equal(assetOf('https://youtu.be/abc').kind, 'link')
  assert.equal(assetOf(null), null)
})

test('buildAlgorithm: inversión diaria es aditiva y exacta', () => {
  const a = buildAlgorithm(REG, DIG, { source: 'test' })
  const jul1 = a.daily.find((d) => d.fecha === '2026-07-01')
  assert.equal(jul1.brands.VERISURE.spend, 1500)
  assert.equal(jul1.brands.PROSEGUR.spend, 300)
  const totalDaily = a.daily.reduce((s, d) => s + Object.values(d.brands).reduce((x, b) => x + b.spend, 0), 0)
  const totalRaw = REG.reduce((s, r) => s + r.rinversion, 0)
  assert.equal(totalDaily, totalRaw)
})

test('buildAlgorithm: dedup de piezas por id_versiones_unica con rollup', () => {
  const a = buildAlgorithm(REG, DIG, { source: 'test' })
  const p = a.pieces.find((x) => x.key === 10)
  assert.equal(p.spots, 2)
  assert.equal(p.spend, 1500)
  assert.equal(p.asset.kind, 'video')
})

test('buildAlgorithm: OOH por lat/lng con asset; estrenos por NUEVO', () => {
  const a = buildAlgorithm(REG, DIG, { source: 'test' })
  assert.equal(a.ooh.length, 1) // mismo panel/creativo colapsado
  assert.equal(a.ooh[0].spend, 500)
  assert.equal(a.events.length, 1)
  assert.equal(a.events[0].maname, 'VERISURE')
})

test('buildAlgorithm: digital diario + piezas', () => {
  const a = buildAlgorithm(REG, DIG, { source: 'test' })
  const d = a.digital.daily.find((x) => x.fecha === '2026-07-01')
  assert.equal(d.brands.VERISURE.spend, 400)
  assert.equal(a.digital.pieces.length, 2)
})

test('mergeAlgorithm: idempotente (merge consigo mismo no duplica)', () => {
  const a = buildAlgorithm(REG, DIG, { source: 'test' })
  const m = mergeAlgorithm(a, a)
  assert.equal(m.daily.length, a.daily.length)
  assert.equal(m.pieces.length, a.pieces.length)
  assert.equal(m.ooh.length, a.ooh.length)
  assert.equal(m.events.length, a.events.length)
})

test('mergeAlgorithm: upsert reescribe el día, no lo suma dos veces', () => {
  const base = buildAlgorithm(REG, DIG, { source: 'test' })
  // Ventana fresca: sólo 2026-07-01 con inversión distinta (corrección) → debe reescribir.
  const fresh = buildAlgorithm(
    [{ id_unico: 9, maname: 'VERISURE', fecha: '2026-07-01 09:00:00', rinversion: 9999, gname: 'RADIO', tname: 'SPOT RADIO', vname: 'X', id_versiones_unica: 99 }],
    [], { source: 'test' },
  )
  const m = mergeAlgorithm(base, fresh)
  const jul1 = m.daily.find((d) => d.fecha === '2026-07-01')
  assert.equal(jul1.brands.VERISURE.spend, 9999) // reescrito, no 1500+9999
  const jul2 = m.daily.find((d) => d.fecha === '2026-07-02')
  assert.ok(jul2, 'días fuera de la ventana fresca se conservan')
})
