// El cliente en modo LIVE sin token debe fallar de forma MANEJADA (banner honesto),
// nunca crashear. Fijamos la fuente por env ANTES de importar el módulo.
import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATA_SOURCE = 'live'
delete process.env.INTEGRAMETRICS_TOKEN

const client = await import('./client.js')

test('DATA_SOURCE=live se resuelve como live', () => {
  assert.equal(client.isLive, true)
  assert.equal(client.DATA_SOURCE, 'live')
})

test('checkSource live sin token → ok:false con mensaje honesto (no lanza)', async () => {
  const r = await client.checkSource()
  assert.equal(r.ok, false)
  assert.equal(r.source, 'live')
  assert.match(r.message, /Integrametrics/)
})

test('getRegistros live sin token → rechaza (el llamador maneja y muestra banner)', async () => {
  await assert.rejects(() =>
    client.getRegistros({ startDate: '2026-07-10 00:00:00', endDate: '2026-07-11 00:00:00' }),
  )
})

// ── applyFilters: mismo contrato que live (semiabierto + OR), testeado en puro ──
const ROWS = [
  { maname: 'PROSEGUR ALARMS', fecha: '2026-07-09 23:59:59', tname: 'SPOT TV' },
  { maname: 'VERISURE', fecha: '2026-07-10 00:00:00', tname: 'SPOT TV' },
  { maname: 'SECURITAS', fecha: '2026-07-10 12:00:00', tname: 'SPOT RADIO' },
  { maname: 'PROSEGUR ALARMS', fecha: '2026-07-11 00:00:00', tname: 'SPOT TV' },
]

test('applyFilters: intervalo SEMIABIERTO [start,end) — start inclusivo, end exclusivo', () => {
  const r = client.applyFilters(ROWS, {
    startDate: '2026-07-10 00:00:00',
    endDate: '2026-07-11 00:00:00',
  })
  // incluye 00:00:00 del 10 (inclusivo), excluye 23:59:59 del 9 y 00:00:00 del 11 (exclusivo)
  assert.equal(r.length, 2)
  assert.deepEqual(r.map((x) => x.maname), ['VERISURE', 'SECURITAS'])
})

test('applyFilters: filtro por valor único', () => {
  const r = client.applyFilters(ROWS, { filters: { tname: 'SPOT RADIO' } })
  assert.equal(r.length, 1)
  assert.equal(r[0].maname, 'SECURITAS')
})

test('applyFilters: filtro por array = OR (IN)', () => {
  const r = client.applyFilters(ROWS, { filters: { maname: ['VERISURE', 'SECURITAS'] } })
  assert.equal(r.length, 2)
})

test('applyFilters: sin filtros → devuelve todo', () => {
  assert.equal(client.applyFilters(ROWS, {}).length, 4)
})
