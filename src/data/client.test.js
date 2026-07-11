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
