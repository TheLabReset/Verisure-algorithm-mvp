// Agregación registros → CONTRATO publicable (public/data/algorithm.json).
// Colapsa spots repetitivos (45k filas, 38 creativos) en entidades únicas con rollups
// EXACTOS (aditivos: inversión y conteos). El detalle spot-a-spot vive en export.csv.
//
// Idempotente por claves estables: día (fecha), creativo (id_versiones_unica / version+asset),
// panel OOH (lat,lng,creativo), estreno (id_unico). Reejecutar reescribe, no duplica.
import { classifyEPPM, brandKey } from './derive.js'

// Tipo de asset a partir de la URL → el frontend elige <video>/<audio>/<img>.
export function assetOf(url) {
  if (!url) return null
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return { url, kind: 'video' }
  if (/\.(mp3|wav|ogg|m4a|aac)(\?|$)/i.test(url)) return { url, kind: 'audio' }
  if (/\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(url)) return { url, kind: 'image' }
  return { url, kind: 'link' }
}

const num = (v) => Number(v) || 0
const day = (f) => (f || '').slice(0, 10)
// Medio "amigable" agrupado (TV abierta/cable/radio/OTT/OOH) desde gname/mabierta_cable.
function medioOf(r) {
  const g = (r.gname || '').toUpperCase()
  if (/VIA PUBLICA|VÍA/.test(g)) return 'OOH'
  if (/RADIO/.test(g)) return 'RADIO'
  if (/OTT|STREAM/.test(g)) return 'OTT'
  if (/CABLE/.test(g)) return 'CABLE'
  if (/TV|TELEVIS/.test(g)) return r.mabierta_cable === 2 ? 'CABLE' : 'TV ABIERTA'
  return g || 'OTRO'
}
// De un conteo {clave:n} devuelve la clave top.
const topKey = (m) => Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0] || null

// ── Serie diaria por marca × medio × franja (aditiva) ─────────────────
function buildDaily(registros) {
  const byDay = new Map()
  for (const r of registros) {
    const d = day(r.fecha)
    if (!d) continue
    if (!byDay.has(d)) byDay.set(d, {})
    const brands = byDay.get(d)
    const b = r.maname
    if (!brands[b]) brands[b] = { spend: 0, spots: 0, byMedium: {}, byFranja: {} }
    const e = brands[b]
    const inv = num(r.rinversion)
    e.spend += inv
    e.spots += 1
    const med = medioOf(r)
    e.byMedium[med] = (e.byMedium[med] || 0) + inv
    if (r.franja) e.byFranja[r.franja] = (e.byFranja[r.franja] || 0) + 1
  }
  return [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([fecha, brands]) => {
      for (const b of Object.keys(brands)) brands[b].spend = Math.round(brands[b].spend)
      return { fecha, brands }
    })
}

// ── Ad Museum: un item por creativo (id_versiones_unica) con rollup + asset ──
function buildPieces(registros, medio = 'ATL') {
  const byV = new Map()
  for (const r of registros) {
    const key = r.id_versiones_unica ?? `${r.maname}:${r.vname}`
    if (!byV.has(key)) {
      byV.set(key, {
        key, medio, maname: r.maname, vname: r.vname,
        tone: classifyEPPM(r.vname), spots: 0, spend: 0,
        firstEmission: r.primera_emision_version || r.fecha, lastEmission: r.fecha,
        _ch: {}, _prog: {}, _gen: {}, _franja: {}, asset: assetOf(r.rfile),
      })
    }
    const p = byV.get(key)
    p.spots += 1
    p.spend += num(r.rinversion)
    if (r.fecha > p.lastEmission) p.lastEmission = r.fecha
    if (r.mname) p._ch[r.mname] = (p._ch[r.mname] || 0) + 1
    if (r.progname) p._prog[r.progname] = (p._prog[r.progname] || 0) + 1
    if (r.genname) p._gen[r.genname] = (p._gen[r.genname] || 0) + 1
    if (r.franja) p._franja[r.franja] = (p._franja[r.franja] || 0) + 1
    if (!p.asset && r.rfile) p.asset = assetOf(r.rfile)
  }
  return [...byV.values()]
    .map((p) => ({
      key: p.key, medio: p.medio, maname: p.maname, vname: p.vname, tone: p.tone,
      spots: p.spots, spend: Math.round(p.spend),
      firstEmission: p.firstEmission, lastEmission: p.lastEmission,
      channels: Object.entries(p._ch).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k),
      programa: topKey(p._prog), genero: topKey(p._gen), franja: topKey(p._franja),
      asset: p.asset,
    }))
    .sort((a, b) => (a.firstEmission < b.firstEmission ? 1 : -1))
}

// ── OOH: un item por panel×creativo (lat,lng,creativo) con foto/video ─
function buildOoh(registros) {
  const byP = new Map()
  for (const r of registros) {
    if (r.latitud == null || r.longitud == null) continue
    const key = `${r.latitud},${r.longitud},${r.id_versiones_unica ?? r.vname}`
    if (!byP.has(key)) {
      byP.set(key, {
        key, maname: r.maname, lat: num(r.latitud), lng: num(r.longitud),
        direccion: r.direccion || null, localidad: r.localidad || r.ciuname || null,
        tipo: r.tname || null, vname: r.vname, spots: 0, spend: 0,
        firstFecha: r.fecha, lastFecha: r.fecha, asset: assetOf(r.rfile),
      })
    }
    const p = byP.get(key)
    p.spots += 1
    p.spend += num(r.rinversion)
    if (r.fecha < p.firstFecha) p.firstFecha = r.fecha
    if (r.fecha > p.lastFecha) p.lastFecha = r.fecha
    if (!p.asset && r.rfile) p.asset = assetOf(r.rfile)
  }
  return [...byP.values()].map((p) => ({ ...p, spend: Math.round(p.spend) }))
}

// ── Estrenos (alerta): primera emisión del fingerprint (nuevas_versiones==='NUEVO') ──
function buildEvents(registros) {
  const seen = new Set()
  const out = []
  for (const r of registros) {
    if (r.nuevas_versiones !== 'NUEVO') continue
    const key = r.id_unico ?? `${r.id_versiones_unica}:${r.fecha}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({
      key: String(key), fecha: r.fecha, maname: r.maname, vname: r.vname, tone: classifyEPPM(r.vname),
      tname: r.tname || null, mname: r.mname || null, franja: r.franja || null,
      duraseg: r.duraseg ?? null, asset: assetOf(r.rfile),
    })
  }
  return out.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}

// ── Digital: serie diaria + Ad Museum digital (dedup por marca+version+asset) ──
function buildDigital(digital = []) {
  const byDay = new Map()
  const byV = new Map()
  for (const r of digital) {
    const d = day(r.fecha)
    const b = r.maname
    if (!byDay.has(d)) byDay.set(d, {})
    const br = byDay.get(d)
    if (!br[b]) br[b] = { spend: 0, impresiones: 0, plat: {} }
    br[b].spend += num(r.inversion_moneda_local)
    br[b].impresiones += num(r.impresiones)
    if (r.medio_digital) br[b].plat[r.medio_digital] = (br[b].plat[r.medio_digital] || 0) + 1
    const key = `${b}:${r.version}:${r.advertisement || ''}`
    if (!byV.has(key)) {
      byV.set(key, { key, medio: 'DIGITAL', maname: b, vname: r.version, tone: classifyEPPM(r.version), spend: 0, impresiones: 0, plataforma: r.medio_digital || null, firstEmission: r.fecha, asset: assetOf(r.advertisement) })
    }
    const p = byV.get(key)
    p.spend += num(r.inversion_moneda_local)
    p.impresiones += num(r.impresiones)
    if (r.fecha < p.firstEmission) p.firstEmission = r.fecha
  }
  const daily = [...byDay.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([fecha, brands]) => {
    for (const b of Object.keys(brands)) brands[b].spend = Math.round(brands[b].spend)
    return { fecha, brands }
  })
  const pieces = [...byV.values()].map((p) => ({ ...p, spend: Math.round(p.spend) }))
  return { daily, pieces }
}

// ── Contrato completo ─────────────────────────────────────────────────
export function buildAlgorithm(registros = [], digital = [], { source = 'fixtures', generated = null } = {}) {
  const daily = buildDaily(registros)
  const days = daily.map((d) => d.fecha)
  const brands = [...new Set(registros.map((r) => r.maname))]
  return {
    meta: {
      generated: generated || (days.length ? `${days[days.length - 1]}T06:00:00-05:00` : null),
      source,
      firstDay: days[0] || null,
      lastDay: days[days.length - 1] || null,
      days,
      brands,
    },
    daily,
    pieces: buildPieces(registros, 'ATL'),
    ooh: buildOoh(registros),
    events: buildEvents(registros),
    digital: buildDigital(digital),
  }
}

// ── Merge idempotente (incremental): reescribe días/entidades por clave, sin duplicar ──
export function mergeAlgorithm(base, fresh) {
  if (!base) return fresh
  const byFecha = new Map(base.daily.map((d) => [d.fecha, d]))
  for (const d of fresh.daily) byFecha.set(d.fecha, d) // upsert por día
  const daily = [...byFecha.values()].sort((a, b) => (a.fecha < b.fecha ? -1 : 1))

  // Días: upsert por fecha (ya calculado arriba) → EXACTO e idempotente. Es la verdad de
  // toda cifra de inversión/SOI/deltas (cada día es independiente).
  //
  // Entidades (piezas/OOH/estrenos): sus rollups (spend/spots/impresiones) son ACUMULADOS
  // sobre la vida entera del creativo, que puede exceder la ventana incremental de 7 días.
  // Reemplazar por la ventana subcontaría un creativo de meses. → UNIÓN MONOTÓNICA por
  // clave estable: descubre entidades nuevas cada día y conserva el rollup más completo
  // (máximo visto). Idempotente (reejecutar la misma ventana no cambia nada). El backfill
  // semanal (workflow_dispatch/cron dominical) re-cuadra los acumulados de forma exacta.
  const mergeEntities = (baseArr = [], freshArr = [], keyFn) => {
    const m = new Map(baseArr.map((x) => [keyFn(x), { ...x }]))
    for (const f of freshArr) {
      const k = keyFn(f)
      const b = m.get(k)
      if (!b) { m.set(k, f); continue }
      m.set(k, {
        ...b, ...f, // datos descriptivos + asset frescos
        spend: Math.max(b.spend || 0, f.spend || 0),
        spots: Math.max(b.spots || 0, f.spots || 0),
        impresiones: Math.max(b.impresiones || 0, f.impresiones || 0),
        firstEmission: b.firstEmission && f.firstEmission ? (b.firstEmission < f.firstEmission ? b.firstEmission : f.firstEmission) : (b.firstEmission || f.firstEmission),
        lastEmission: b.lastEmission && f.lastEmission ? (b.lastEmission > f.lastEmission ? b.lastEmission : f.lastEmission) : (b.lastEmission || f.lastEmission),
        firstFecha: b.firstFecha && f.firstFecha ? (b.firstFecha < f.firstFecha ? b.firstFecha : f.firstFecha) : (b.firstFecha || f.firstFecha),
        lastFecha: b.lastFecha && f.lastFecha ? (b.lastFecha > f.lastFecha ? b.lastFecha : f.lastFecha) : (b.lastFecha || f.lastFecha),
        asset: f.asset || b.asset,
      })
    }
    return [...m.values()]
  }
  const pieces = mergeEntities(base.pieces, fresh.pieces, (p) => p.key)
  const ooh = mergeEntities(base.ooh, fresh.ooh, (p) => p.key ?? `${p.lat},${p.lng},${p.vname}`)
  const events = mergeEntities(base.events, fresh.events, (e) => e.key ?? `${e.fecha}:${e.vname}`)
  const dDaily = (() => {
    const m = new Map((base.digital?.daily || []).map((d) => [d.fecha, d]))
    for (const d of fresh.digital?.daily || []) m.set(d.fecha, d)
    return [...m.values()].sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
  })()
  const dPieces = mergeEntities(base.digital?.pieces || [], fresh.digital?.pieces || [], (p) => p.key)
  const days = daily.map((d) => d.fecha)

  return {
    meta: { ...fresh.meta, firstDay: days[0] || null, lastDay: days[days.length - 1] || null, days },
    daily,
    pieces: pieces.sort((a, b) => (a.firstEmission < b.firstEmission ? 1 : -1)),
    ooh,
    events: events.sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
    digital: { daily: dDaily, pieces: dPieces },
  }
}
