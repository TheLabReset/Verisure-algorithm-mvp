// Utilidades de presentación del Radar. Verisure se enfatiza en rojo; la competencia
// va en escala de grises de --ink (el líder el más oscuro), nunca un color por marca (DESIGN §1).
import { formatPercent, formatSoles } from '../../utils/format'

// Rampa de grises para competidores, por tokens (no bajar del piso de dato #C9CDD4).
export const GRAY_RAMP = ['var(--ink)', 'var(--ink-3)', 'var(--ink-2)']

export function brandDisplay(maname = '') {
  const m = maname.toUpperCase()
  if (m.includes('VERISURE')) return 'Verisure'
  if (m.includes('PROSEGUR')) return 'Prosegur'
  if (m.includes('SECURITAS')) return 'Securitas'
  // Title-case genérico
  return maname.charAt(0) + maname.slice(1).toLowerCase()
}

// Asigna color y patrón de honestidad a las marcas del SOI (ya ordenadas por inversión desc).
// Verisure = sólido rojo (pauta operada por Reset, confirmada); competidores = rayado gris (estimado).
export function assignBrandStyle(brands, { pattern } = {}) {
  let gi = 0
  return brands.map((b) => {
    if (b.isVerisure) {
      return { ...b, display: brandDisplay(b.maname), color: 'var(--verisure)', pattern: pattern || 'solid', emphasis: true }
    }
    const color = GRAY_RAMP[Math.min(gi, GRAY_RAMP.length - 1)]
    gi += 1
    return { ...b, display: brandDisplay(b.maname), color, pattern: pattern || 'hatched', emphasis: false }
  })
}

const FRANJA_LABEL = {
  PRIME: 'el prime',
  DIA: 'el día',
  NOCHE: 'la noche',
  MADRUGADA: 'la madrugada',
}

export function formatHora(fecha = '') {
  const t = fecha.slice(11, 16) // "09:41"
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h < 12 ? 'a. m.' : 'p. m.'
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`
}
const horaOf = formatHora

// Etiqueta corta del tipo de aviso para copy fluido ("spot", no "spot tv").
export function tnameShort(tname = '') {
  const t = tname.toUpperCase()
  if (t === 'SPOT TV') return 'spot'
  if (t === 'SPOT RADIO') return 'spot de radio'
  if (t === 'VÍA PÚBLICA') return 'pieza de vía pública'
  return (tname || 'pieza').toLowerCase()
}

// Delta con signo tipográfico (− real, no guion).
export function signPts(pts) {
  if (pts === undefined || pts === null || pts === 0) return null
  return `${pts > 0 ? '+' : '−'}${Math.abs(pts)} pts`
}

// Titular de la franja "Hoy" (Radar) desde la pieza nueva + SOI. null si no hay novedad.
export function buildTodayHeadline(newPieces, soi) {
  if (!newPieces || newPieces.length === 0) return null
  const p = newPieces[0]
  const shareOf = Object.fromEntries((soi?.brands || []).map((b) => [b.maname, b.share]))
  const marca = brandDisplay(p.maname)
  const franja = FRANJA_LABEL[p.franja] || 'la franja'
  const dur = p.duraseg ? ` de ${p.duraseg} s` : ''
  const hora = horaOf(p.fecha)
  const meShare = shareOf[p.maname] != null ? `${formatPercent(shareOf[p.maname], 0)}` : null
  const veriShare = shareOf['VERISURE'] != null ? `${formatPercent(shareOf['VERISURE'], 0)}` : null
  let s = `${marca} lanzó un ${tnameShort(p.tname)}${dur} en ${franja} de ${p.mname}`
  if (hora) s += ` (${hora})`
  if (meShare) s += ` y su share of investment del día sube a ${meShare}`
  s += '.'
  if (veriShare) s += ` Verisure queda en ${veriShare}.`
  return s
}

// Insight (título de card SOI): el líder de la presión del día.
export function buildSoiInsight(soi) {
  if (!soi?.brands?.length) return 'Sin inversión detectada hoy'
  const top = soi.brands[0]
  return `${brandDisplay(top.maname)} concentró ${formatPercent(top.share, 0)} de la presión de hoy`
}

export function totalLine(soi) {
  return `Total del día ${formatSoles(soi?.total || 0)}`
}
