// Vistas del producto DERIVADAS DEL CONTRATO (public/data/algorithm.json).
// El frontend ya no fetchea 32 MB de registros crudos: lee el contrato agregado
// (serie diaria + entidades únicas con assets) y estas funciones puras lo cortan por
// rango de fecha (date-picker) y calculan SOI, presión, deltas, museo, OOH y digital.
//
// Sin efectos, sin fechas del sistema → testeables. Verisure se marca isVerisure; el
// color lo aplica la UI (DESIGN §1). Vocabulario de honestidad intacto (§2).
export const VERISURE = 'VERISURE'
const round = (n, d = 0) => { const f = 10 ** d; return Math.round(n * f) / f }
const dOf = (f) => (f || '').slice(0, 10)
const isVeri = (m) => (m || '').toUpperCase().includes('VERISURE')

// ── Rango del contrato + utilidades de ventana ────────────────────────
export function contractRange(contract) {
  const days = contract?.meta?.days || []
  return { min: days[0] || null, max: days[days.length - 1] || null, days }
}
// Ventana previa de igual longitud (para deltas "vs. período anterior").
export function priorWindow(from, to) {
  const a = new Date(`${from}T00:00:00Z`)
  const b = new Date(`${to}T00:00:00Z`)
  const len = Math.round((b - a) / 86400000) + 1 // días inclusive
  const pb = new Date(a); pb.setUTCDate(pb.getUTCDate() - 1)
  const pa = new Date(pb); pa.setUTCDate(pa.getUTCDate() - (len - 1))
  return { from: pa.toISOString().slice(0, 10), to: pb.toISOString().slice(0, 10), len }
}
const inRange = (fecha, from, to) => { const d = dOf(fecha); return (!from || d >= from) && (!to || d <= to) }

// ── SOI agregado en rango (aditivo, exacto) ───────────────────────────
function sumDaily(daily, from, to) {
  const byBrand = new Map()
  let total = 0
  for (const row of daily) {
    if (!inRange(row.fecha, from, to)) continue
    for (const [b, v] of Object.entries(row.brands)) {
      byBrand.set(b, (byBrand.get(b) || 0) + (v.spend || 0))
      total += v.spend || 0
    }
  }
  return { byBrand, total }
}
export function soiInRange(contract, from, to) {
  const { byBrand, total } = sumDaily(contract?.daily || [], from, to)
  const brands = [...byBrand.entries()]
    .map(([maname, investment]) => ({
      maname, investment,
      share: total > 0 ? round((investment / total) * 100, 1) : 0,
      isVerisure: isVeri(maname),
    }))
    .sort((a, b) => b.investment - a.investment)
  return { from, to, total, brands }
}
// SOI del rango + deltaPts vs. ventana previa de igual longitud.
export function soiComparison(contract, from, to) {
  const now = soiInRange(contract, from, to)
  const pw = priorWindow(from, to)
  const before = soiInRange(contract, pw.from, pw.to)
  const beforeShare = Object.fromEntries(before.brands.map((b) => [b.maname, b.share]))
  const brands = now.brands.map((b) => ({ ...b, deltaPts: round(b.share - (beforeShare[b.maname] || 0), 0) }))
  return { ...now, brands, priorFrom: pw.from, priorTo: pw.to }
}

// ── Serie de presión (inversión diaria) en rango ──────────────────────
export function pressureInRange(contract, from, to) {
  return (contract?.daily || [])
    .filter((row) => inRange(row.fecha, from, to))
    .map((row) => {
      const byBrand = {}; let total = 0
      for (const [b, v] of Object.entries(row.brands)) { byBrand[b] = v.spend || 0; total += v.spend || 0 }
      return { fecha: row.fecha, total, byBrand }
    })
}

// ── Ad Museum: piezas activas en el rango (emisión solapa la ventana) ──
// Piezas del contrato ya vienen agregadas con asset; añadimos isVerisure y ordenamos.
export function piecesInRange(contract, from, to, key = 'pieces') {
  const src = key === 'digital' ? (contract?.digital?.pieces || []) : (contract?.[key] || [])
  return src
    .filter((p) => {
      const first = dOf(p.firstEmission)
      const last = dOf(p.lastEmission || p.firstEmission)
      return (!to || first <= to) && (!from || last >= from) // solapamiento de intervalos
    })
    .map((p) => ({ ...p, isVerisure: isVeri(p.maname) }))
    .sort((a, b) => (a.spend < b.spend ? 1 : -1)) // por inversión desc (más relevante primero)
}

// ── OOH: paneles con actividad hasta el fin del rango ─────────────────
export function oohInRange(contract, from, to) {
  return (contract?.ooh || [])
    .filter((p) => (!to || dOf(p.lastFecha) <= to))
    .map((p) => ({ ...p, investment: p.spend, isVerisure: isVeri(p.maname) }))
}

// ── Estrenos (eventos) en rango; el primero = "jugada del día" ────────
export function eventsInRange(contract, from, to) {
  return (contract?.events || [])
    .filter((e) => inRange(e.fecha, from, to))
    .map((e) => ({ ...e, isVerisure: isVeri(e.maname) }))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}

// ── Digital: SOI + comparación en rango (desde digital.daily) ─────────
export function digitalSoi(contract, from, to) {
  const daily = contract?.digital?.daily || []
  const byBrand = new Map(); let total = 0; let impr = 0
  for (const row of daily) {
    if (!inRange(row.fecha, from, to)) continue
    for (const [b, v] of Object.entries(row.brands)) {
      byBrand.set(b, (byBrand.get(b) || 0) + (v.spend || 0))
      total += v.spend || 0; impr += v.impresiones || 0
    }
  }
  const brands = [...byBrand.entries()]
    .map(([maname, investment]) => ({
      maname, investment,
      share: total > 0 ? round((investment / total) * 100, 1) : 0,
      isVerisure: isVeri(maname),
    }))
    .sort((a, b) => b.investment - a.investment)
  return { from, to, total, impresiones: impr, brands }
}

// ── Deltas para MAIA (período vs. período anterior de igual longitud) ─
export function deltas(contract, from, to) {
  const now = soiInRange(contract, from, to)
  const pw = priorWindow(from, to)
  const before = soiInRange(contract, pw.from, pw.to)
  const dNow = digitalSoi(contract, from, to)
  const dBefore = digitalSoi(contract, pw.from, pw.to)
  const events = eventsInRange(contract, from, to)
  const pct = (a, b) => (b > 0 ? round(((a - b) / b) * 100, 0) : null)
  const veriNow = now.brands.find((b) => b.isVerisure)?.investment || 0
  const veriBefore = before.brands.find((b) => b.isVerisure)?.investment || 0
  return {
    from, to, priorFrom: pw.from, priorTo: pw.to, days: pw.len,
    atlTotal: now.total, atlTotalDeltaPct: pct(now.total, before.total),
    veriSpend: veriNow, veriSpendDeltaPct: pct(veriNow, veriBefore),
    digitalTotal: dNow.total, digitalTotalDeltaPct: pct(dNow.total, dBefore.total),
    newPieces: events.length,
    leader: now.brands[0] || null,
    digitalLeader: dNow.brands[0] || null,
  }
}

// ── Share of Search vs Share of Investment (DEMANDA, ESOV) ────────────
// Cruza el share of search (Trends, fixture honesto) con el share of investment REAL del
// período (contrato). gap = búsqueda − inversión (positivo = demanda sin inversión que la acompañe).
import { brandKey } from './derive.js'
export function searchVsInvestment(contract, trends, from, to) {
  const sos = trends?.share_of_search || {}
  return soiInRange(contract, from, to).brands.map((b) => {
    const search = Number(sos[brandKey(b.maname)]) || 0
    return { maname: b.maname, isVerisure: b.isVerisure, search, investment: b.share, gap: round(search - b.share, 0) }
  })
}

// ── Opportunity Score (IPC + IMC) desde el contrato ──────────────────
import { computeIMC } from './derive.js'
// IPC — Índice de Presión Competitiva (0–100): share de competencia + ritmo de
// estrenos + amplitud de canales/franjas de la competencia, en el rango.
export function computeIPC(contract, from, to) {
  const soi = soiInRange(contract, from, to)
  const competidorShare = soi.brands.filter((b) => !b.isVerisure).reduce((s, b) => s + b.share, 0)
  const events = eventsInRange(contract, from, to).filter((e) => !e.isVerisure).length
  const channels = new Set(); const franjas = new Set()
  for (const p of piecesInRange(contract, from, to)) {
    if (p.isVerisure) continue
    for (const c of p.channels || []) channels.add(c)
    if (p.franja) franjas.add(p.franja)
  }
  const nShare = Math.min(100, competidorShare)
  const nNew = Math.min(100, events * 50)
  const nBreadth = Math.min(100, (channels.size + franjas.size) * 8)
  const ipc = Math.round(0.8 * nShare + 0.12 * nNew + 0.08 * nBreadth)
  return Math.max(0, Math.min(100, ipc))
}
export function opportunityScore(contract, trends, contexto, from, to) {
  const ipc = computeIPC(contract, from, to)
  const imc = computeIMC(trends, contexto)
  const raw = 0.84 * imc + 0.16 * (100 - ipc)
  return { score: Math.round(Math.max(0, Math.min(100, raw))), ipc, imc }
}

// ── Frescura / última corrida ─────────────────────────────────────────
export function lastDayIn(contract, to) {
  const days = (contract?.meta?.days || []).filter((d) => !to || d <= to)
  return days[days.length - 1] || contract?.meta?.lastDay || null
}
