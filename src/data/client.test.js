// El cliente del navegador consume el CONTRATO publicado en /data/ vía fetch.
// Governance: nunca importa Integrametrics ni lee el token (eso vive en el pipeline).
import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { getAlgorithm, getTrends, getMeta, checkSource } from './client.js'

const HERE = dirname(fileURLToPath(import.meta.url))

const meta = { generated: '2026-07-13T06:00:00-05:00', source: 'live', firstDay: '2026-01-01', lastDay: '2026-07-13', days: 193, registros: 45624 }
const algorithm = { meta, daily: [], pieces: [], ooh: [], events: [], digital: { daily: [], pieces: [] } }
const RESP = {
  '/data/algorithm.json': algorithm,
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

test('getAlgorithm: fetchea /data/algorithm.json (contrato con meta + capas)', async () => {
  const a = await getAlgorithm()
  assert.ok(a.meta && a.daily && a.digital, 'contrato con meta/daily/digital')
  assert.equal(a.meta.lastDay, '2026-07-13')
})

test('getTrends: fetchea /data/trends.json', async () => {
  const t = await getTrends()
  assert.ok(Array.isArray(t.keywords))
})

test('checkSource: snapshot presente → ok:true con la fuente del meta', async () => {
  const s = await checkSource()
  assert.equal(s.ok, true)
  assert.equal(s.source, 'live')
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
