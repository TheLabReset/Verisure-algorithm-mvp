// Tests de la lógica pura de MAIA: el Daily Brief y el motor de chat se apoyan
// SOLO en hechos derivados del fixture (determinista, seed 20260710).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { soiComparison, detectNewPieces, diyIndex, opportunityScore } from '../../data/derive.js'
import { composeBrief } from './maiaBrief.js'
import { maiaAnswer, detectIntent } from './maiaChat.js'

const FX = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data', 'fixtures')
const read = (f) => JSON.parse(readFileSync(join(FX, f), 'utf8'))
const registros = read('registros.json')
const digital = read('registros-digital.json')
const trends = read('trends.json')
const contexto = read('contexto.json')
const DAY = '2026-07-10'

function buildFacts() {
  const soi = soiComparison(registros, DAY)
  const newPieces = detectNewPieces(registros, DAY)
  const diy = diyIndex(trends, digital)
  const score = opportunityScore(registros, trends, contexto, DAY)
  const brief = composeBrief({ day: DAY, soi, newPieces, diy, score, contexto })
  return { day: DAY, soi, newPieces, diy, score, brief, contexto }
}

test('composeBrief: nota derivada con SOI, DIY y Score del día', () => {
  const { brief, diy, score } = buildFacts()
  assert.ok(Array.isArray(brief.paragraphs) && brief.paragraphs.length >= 3, 'al menos 3 párrafos')
  const all = brief.paragraphs.join(' ')
  // SOI dorado del día: Prosegur lidera (46%), Verisure 33%.
  assert.match(all, /Prosegur/)
  assert.match(all, /Verisure queda en 33\s*%/)
  // La amenaza DIY del día aparece con su índice.
  assert.match(all, new RegExp(`${diy.index}/100`))
  // El Score cierra el brief.
  assert.match(all, new RegExp(`Opportunity Score cierra en ${score.score}`))
  // Concordancia de plural: el delta de Verisure es −1 pt (singular), nunca "1 pts".
  assert.match(all, /\b1 pt (más|menos)/)
  assert.doesNotMatch(all, /\b1 pts\b/)
})

test('composeBrief: headline y alerta se derivan de las piezas nuevas', () => {
  const { brief, newPieces } = buildFacts()
  const comp = newPieces.find((p) => !p.isVerisure)
  if (comp) {
    assert.equal(brief.alerta, true)
    assert.match(brief.headline, /movió primero/)
  } else {
    assert.equal(brief.alerta, false)
    assert.match(brief.headline, /sin piezas nuevas/i)
  }
})

test('maiaAnswer: inversión de Prosegur sale del SOI del día', () => {
  const facts = buildFacts()
  const { text, grounded } = maiaAnswer('¿Cuánto invirtió Prosegur hoy?', facts)
  assert.equal(grounded, true)
  assert.match(text, /Prosegur/)
  assert.match(text, /S\/\s?[\d.]+/) // monto en soles con agrupación por punto
  assert.match(text, /46\s*%/)
})

test('maiaAnswer: DIY responde con el índice del día', () => {
  const facts = buildFacts()
  const { text, grounded } = maiaAnswer('¿y la amenaza DIY?', facts)
  assert.equal(grounded, true)
  assert.match(text, new RegExp(`${facts.diy.index}/100`))
})

test('maiaAnswer: pregunta fuera de alcance cae al mensaje honesto (no inventa)', () => {
  const facts = buildFacts()
  const { text, grounded } = maiaAnswer('¿cuál es la capital de Francia?', facts)
  assert.equal(grounded, false)
  assert.match(text, /modo demostración/i)
})

test('detectIntent: clasifica las intenciones conocidas', () => {
  assert.equal(detectIntent('cuánto gastó Prosegur'), 'inv_prosegur')
  assert.equal(detectIntent('muéstrame las piezas nuevas'), 'nuevas')
  assert.equal(detectIntent('cómo está el score'), 'score')
  assert.equal(detectIntent('índice diy'), 'diy')
  assert.equal(detectIntent('posición de Verisure'), 'soi_verisure')
  assert.equal(detectIntent('hola qué tal'), null)
})
