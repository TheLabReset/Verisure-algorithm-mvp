// El cliente del navegador consume el SNAPSHOT publicado en /data/ vía fetch.
// Governance: nunca importa Integrametrics ni lee el token (eso vive en el pipeline).
import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { getRegistros, getTrends, getMeta, checkSource, applyFilters } from './client.js'

const HERE = dirname(fileURLToPath(import.meta.url))

const meta = { generated: '2026-07-10T06:00:00-05:00', source: 'fixtures', day: '2026-07-10', registros: 3 }
const registros = [
  { maname: 'PROSEGUR ALARMS', fecha: '2026-07-10 09:00:00', tname: 'SPOT TV' },
  { maname: 'VERISURE', fecha: '2026-07-10 10:00:00', tname: 'SPOT TV' },
  { maname: 'SECURITAS', fecha: '2026-07-11 10:00:00', tname: 'SPOT RADIO' },
]
const RESP = {
  '/data/registros.json': registros,
  '/data/trends.json': { keywords: [] },
  '/data/meta.json': meta,
}

let origFetch
beforeEach(() => {
  origFetch = global.fetch
  global.fetch = async (url) => {
    const path = String(url).replace(/^https?:\/\/[^/]+/, '')
    if (path in RESP) return { ok: true, status: 200, json: async () => RESP[path] }
    return { ok: false, status: 404, json: async () => ({}) }
  }
})
afterEach(() => {
  global.fetch = origFetch
})

test('getRegistros: fetchea /data/registros.json y aplica el intervalo semiabierto', async () => {
  const r = await getRegistros({ startDate: '2026-07-10 00:00:00', endDate: '2026-07-11 00:00:00' })
  assert.equal(r.length, 2)
  assert.deepEqual(r.map((x) => x.maname), ['PROSEGUR ALARMS', 'VERISURE'])
})

test('getTrends: fetchea /data/trends.json', async () => {
  const t = await getTrends()
  assert.ok(Array.isArray(t.keywords))
})

test('checkSource: snapshot presente → ok:true con la fuente del meta', async () => {
  const s = await checkSource()
  assert.equal(s.ok, true)
  assert.equal(s.source, 'fixtures')
})

test('checkSource: snapshot ausente → ok:false con mensaje honesto (no lanza)', async () => {
  global.fetch = async () => ({ ok: false, status: 404, json: async () => ({}) })
  const s = await checkSource()
  assert.equal(s.ok, false)
  assert.match(s.message, /snapshot/i)
})

test('getMeta: ausente → null (no lanza)', async () => {
  global.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) })
  assert.equal(await getMeta(), null)
})

test('governance: el cliente del navegador no importa Integrametrics ni lee el token', () => {
  const src = readFileSync(join(HERE, 'client.js'), 'utf8')
  assert.doesNotMatch(src, /from ['"][^'"]*integrametrics/i, 'no debe importar integrametrics')
  assert.doesNotMatch(src, /process\.env/, 'no debe leer variables de entorno de Node')
})

// ── applyFilters: mismo contrato que Integrametrics (semiabierto + OR) ──
const ROWS = [
  { maname: 'PROSEGUR ALARMS', fecha: '2026-07-09 23:59:59', tname: 'SPOT TV' },
  { maname: 'VERISURE', fecha: '2026-07-10 00:00:00', tname: 'SPOT TV' },
  { maname: 'SECURITAS', fecha: '2026-07-10 12:00:00', tname: 'SPOT RADIO' },
  { maname: 'PROSEGUR ALARMS', fecha: '2026-07-11 00:00:00', tname: 'SPOT TV' },
]

test('applyFilters: intervalo SEMIABIERTO [start,end) — start inclusivo, end exclusivo', () => {
  const r = applyFilters(ROWS, { startDate: '2026-07-10 00:00:00', endDate: '2026-07-11 00:00:00' })
  assert.equal(r.length, 2)
  assert.deepEqual(r.map((x) => x.maname), ['VERISURE', 'SECURITAS'])
})

test('applyFilters: filtro por valor único', () => {
  const r = applyFilters(ROWS, { filters: { tname: 'SPOT RADIO' } })
  assert.equal(r.length, 1)
  assert.equal(r[0].maname, 'SECURITAS')
})

test('applyFilters: filtro por array = OR (IN)', () => {
  const r = applyFilters(ROWS, { filters: { maname: ['VERISURE', 'SECURITAS'] } })
  assert.equal(r.length, 2)
})

test('applyFilters: sin filtros → devuelve todo', () => {
  assert.equal(applyFilters(ROWS, {}).length, 4)
})
