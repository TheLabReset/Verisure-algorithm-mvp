// Motor de respuestas de MAIA (chat) — PURO y determinista. Responde preguntas
// sobre la data del día a partir de los hechos ya derivados (SOI, piezas nuevas,
// DIY, Score). Sin latencias artificiales, sin inventar cifras: si no hay dato
// para responder, lo dice. La conversación abierta con LLM (Netlify Function que
// proxea la API de Anthropic; la key jamás vive en el bundle) se activa aparte.
import { brandDisplay } from '../radar/radarUtils.js'
import { formatSoles, formatPercent, ptsLabel } from '../../utils/format.js'

// Preguntas sugeridas (chips) — cada una tiene una respuesta derivada del día.
export const SUGGESTED = [
  '¿Cuánto invirtió Prosegur hoy?',
  '¿Qué piezas nuevas hay hoy?',
  '¿Cómo va Verisure en SOI?',
  '¿Cómo está el Opportunity Score?',
  '¿Y la amenaza DIY?',
]

const FALLBACK =
  'Puedo responder sobre la inversión del día, las piezas nuevas, el SOI, la amenaza DIY y el Opportunity Score. ' +
  'Para conversación abierta sobre cualquier corte de la data, MAIA se conecta a la API de Anthropic vía una Netlify Function ' +
  '(se activa al configurar la key). Hoy estoy en modo demostración.'

function brandRow(brands, needle) {
  return (brands || []).find((b) => brandDisplay(b.maname).toUpperCase().includes(needle))
}

function invAnswer(brands, needle) {
  const b = brandRow(brands, needle)
  if (!b) return `No veo inversión de ${needle.toLowerCase()} en el corte de hoy.`
  return `${brandDisplay(b.maname)} invirtió ${formatSoles(b.investment)} hoy, el ${formatPercent(b.share, 0)} de la categoría.`
}

// Clasifica la pregunta libre en una intención conocida (o null).
export function detectIntent(text = '') {
  const t = text.toLowerCase()
  if (/prosegur/.test(t)) return 'inv_prosegur'
  if (/securitas/.test(t)) return 'inv_securitas'
  if (/(pieza|creativ|spot|nuev)/.test(t)) return 'nuevas'
  if (/(score|oportun|opportunity)/.test(t)) return 'score'
  if (/(diy|c[aá]mara|hazlo)/.test(t)) return 'diy'
  if (/(verisure|soi|share|posici)/.test(t)) return 'soi_verisure'
  return null
}

function answerIntent(intent, facts) {
  const brands = facts.soi?.brands || []
  const veri = brands.find((b) => b.isVerisure)
  switch (intent) {
    case 'inv_prosegur':
      return invAnswer(brands, 'PROSEGUR')
    case 'inv_securitas':
      return invAnswer(brands, 'SECURITAS')
    case 'nuevas': {
      const np = facts.newPieces || []
      if (!np.length) return 'Sin piezas nuevas de competencia hoy: el tablero creativo se mantiene estable.'
      const list = np.map((p) => `${brandDisplay(p.maname)} (${p.tname.toLowerCase()}, tono ${p.eppm})`).join('; ')
      return `Hoy detecté ${np.length} ${np.length === 1 ? 'pieza nueva' : 'piezas nuevas'}: ${list}.`
    }
    case 'score': {
      const s = facts.score
      if (!s) return 'Aún no tengo el Score del día.'
      return `El Opportunity Score está en ${s.score} (IMC ${s.imc}, IPC ${s.ipc}): ${s.score >= 70 ? 'momento favorable para pisar eficacia y alivio' : s.score >= 45 ? 'oportunidad moderada, selectividad por franja' : 'oportunidad baja, conservar y observar'}.`
    }
    case 'diy': {
      const d = facts.diy
      if (!d || d.index == null) return 'No tengo el índice DIY del día.'
      const mov = d.deltaSemana > 0 ? `, +${d.deltaSemana} ${ptsLabel(d.deltaSemana)} en la semana` : d.deltaSemana < 0 ? `, ${d.deltaSemana} ${ptsLabel(d.deltaSemana)} en la semana` : ''
      return `La amenaza DIY marca ${d.index}/100${mov}: cámaras solas ganando terreno como sustituto de bajo costo.`
    }
    case 'soi_verisure': {
      if (!veri) return 'No veo a Verisure en el corte de hoy.'
      const leader = brands[0]
      const pos = leader && !leader.isVerisure ? ` ${brandDisplay(leader.maname)} lidera con ${formatPercent(leader.share, 0)}.` : ' Verisure lidera hoy.'
      const delta = veri.deltaPts > 0 ? ` (+${veri.deltaPts} ${ptsLabel(veri.deltaPts)} vs. hace una semana)` : veri.deltaPts < 0 ? ` (${veri.deltaPts} ${ptsLabel(veri.deltaPts)} vs. hace una semana)` : ''
      return `Verisure tiene ${formatPercent(veri.share, 0)} del share of investment de hoy${delta}.${pos}`
    }
    default:
      return null
  }
}

// Respuesta de MAIA a una pregunta. { text, grounded }: grounded=true cuando la
// respuesta salió de un dato del día; false cuando es el mensaje de alcance.
export function maiaAnswer(question, facts = {}) {
  const intent = detectIntent(question)
  if (intent) {
    const a = answerIntent(intent, facts)
    if (a) return { text: a, grounded: true }
  }
  return { text: FALLBACK, grounded: false }
}
