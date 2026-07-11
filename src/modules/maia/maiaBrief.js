// Compositor del Daily Brief de MAIA — voz de analista sobria, en español.
// PURO y determinista: compone la nota del día a partir de hechos ya derivados
// (SOI, piezas nuevas, amenaza DIY, Opportunity Score). Cero prosa hardcodeada:
// cada frase afirma sobre un dato. Testeable con node:test.
import { brandDisplay } from '../radar/radarUtils.js'
import { formatPercent, ptsLabel } from '../../utils/format.js'

// Delta de share de Verisure vs. hace una semana → frase honesta.
function deltaFrase(pts) {
  if (pts == null || pts === 0) return ', estable en la semana'
  const u = ptsLabel(pts)
  return pts > 0 ? `, ${pts} ${u} más que hace una semana` : `, ${Math.abs(pts)} ${u} menos que hace una semana`
}

// Lectura estratégica derivada de Score/IPC/IMC (EPPM: cuándo pisar eficacia/alivio).
function lecturaScore({ score, ipc, imc }) {
  const momento = imc >= 70 ? `momento de categoría alto (IMC ${imc})` : imc >= 45 ? `momento de categoría templado (IMC ${imc})` : `momento de categoría bajo (IMC ${imc})`
  const presion = ipc >= 60 ? `presión competitiva fuerte (IPC ${ipc})` : ipc >= 35 ? `presión competitiva media (IPC ${ipc})` : `presión competitiva baja (IPC ${ipc})`
  const accion = score >= 70 ? 'ventana para pisar eficacia y alivio' : score >= 45 ? 'conviene selectividad por franja y territorio' : 'conviene conservar y observar'
  return `${momento} con ${presion}; ${accion}`
}

export function composeBrief({ day, soi, newPieces = [], diy, score, contexto } = {}) {
  const paragraphs = []
  const brands = soi?.brands || []
  const leader = brands[0]
  const veri = brands.find((b) => b.isVerisure)
  const comp = newPieces.find((p) => !p.isVerisure)

  // 1. Movimiento creativo del día.
  if (comp) {
    paragraphs.push(
      `${brandDisplay(comp.maname)} abrió el día con una pieza nueva (tono ${comp.eppm}); ` +
        `primera emisión detectada hoy, es la señal a vigilar.`,
    )
  } else if (newPieces.length) {
    paragraphs.push('Verisure estrenó pieza hoy y la competencia no movió creatividades nuevas.')
  } else {
    paragraphs.push('Sin piezas nuevas de competencia hoy: el tablero creativo se mantiene estable.')
  }

  // 2. Reparto de inversión del día (SOI).
  if (leader && veri) {
    if (leader.isVerisure) {
      paragraphs.push(`Verisure lidera la inversión del día con ${formatPercent(veri.share, 0)}${deltaFrase(veri.deltaPts)}.`)
    } else {
      paragraphs.push(
        `En inversión del día, ${brandDisplay(leader.maname)} lidera con ${formatPercent(leader.share, 0)} y ` +
          `Verisure queda en ${formatPercent(veri.share, 0)}${deltaFrase(veri.deltaPts)}.`,
      )
    }
  }

  // 3. Amenaza DIY (sustitución por cámaras solas).
  if (diy && diy.index != null) {
    const d = diy.deltaSemana
    const mov = d > 0 ? ` y sube ${d} ${ptsLabel(d)} en la semana` : d < 0 ? ` y cede ${Math.abs(d)} ${ptsLabel(d)} en la semana` : ''
    paragraphs.push(
      `La amenaza DIY marca ${diy.index}/100${mov}: las cámaras solas siguen ganando terreno como sustituto de bajo costo.`,
    )
  }

  // 4. Lectura estratégica (Opportunity Score).
  if (score && score.score != null) {
    paragraphs.push(`El Opportunity Score cierra en ${score.score}: ${lecturaScore(score)}.`)
  }

  const headline = comp ? `${brandDisplay(comp.maname)} movió primero` : 'Jornada sin piezas nuevas de competencia'
  const alerta = Boolean(comp)
  return { day, headline, paragraphs, alerta }
}
