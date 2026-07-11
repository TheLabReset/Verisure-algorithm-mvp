// Derivadores PUROS de The Algorithm (Fase 1).
// Entrada: data cruda (registros de Integrametrics, trends, contexto).
// Salida: métricas del producto. Sin efectos, sin fechas del sistema, testeables.
//
// Convención de marca del cliente: Verisure se enfatiza (rojo); la competencia va
// en grises (DESIGN §1). Aquí solo marcamos `isVerisure`; el color lo aplica la UI.

export const VERISURE = 'VERISURE'

const dayOf = (fecha) => (fecha || '').slice(0, 10)
const round = (n, d = 0) => {
  const f = 10 ** d
  return Math.round(n * f) / f
}

// ── SOI diario (Share of Investment) por competidor ───────────────────
// Verisure ES la categoría; el desglose por competidor es la vista default
// (DESIGN/blueprint B.2). Devuelve marcas ordenadas por inversión desc.
export function computeSOI(registros, day) {
  const byBrand = new Map()
  let total = 0
  for (const r of registros) {
    if (dayOf(r.fecha) !== day) continue
    const inv = Number(r.rinversion) || 0
    byBrand.set(r.maname, (byBrand.get(r.maname) || 0) + inv)
    total += inv
  }
  const brands = [...byBrand.entries()]
    .map(([maname, investment]) => ({
      maname,
      investment,
      share: total > 0 ? round((investment / total) * 100, 1) : 0,
      isVerisure: maname === VERISURE,
    }))
    .sort((a, b) => b.investment - a.investment)
  return { day, total, brands }
}

// ── Detección de piezas nuevas (alerta same-day) ──────────────────────
// nuevas_versiones === "NUEVO" y fecha de emisión en el día consultado.
// Devuelve la lista de piezas nuevas (con lo necesario para la alerta y el video).
export function detectNewPieces(registros, day) {
  return registros
    .filter((r) => r.nuevas_versiones === 'NUEVO' && dayOf(r.fecha) === day)
    .map((r) => ({
      id_unico: r.id_unico,
      maname: r.maname,
      vname: r.vname,
      tname: r.tname,
      mname: r.mname,
      franja: r.franja,
      fecha: r.fecha,
      duraseg: r.duraseg,
      rinversion: r.rinversion,
      rfile: r.rfile,
      primera_emision_comercial: r.primera_emision_comercial,
      eppm: classifyEPPM(r.vname),
      isVerisure: r.maname === VERISURE,
    }))
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
}

// ── Serie de presión (inversión diaria estimada) últimos N días ───────
// endDay inclusive; devuelve N puntos ascendentes por fecha, con total categoría
// y desglose por marca (para el timeline anotado del Radar).
export function pressureSeries(registros, endDay, days = 30) {
  const end = new Date(`${endDay}T00:00:00Z`)
  const points = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setUTCDate(d.getUTCDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const soi = computeSOI(registros, iso)
    const byBrand = {}
    for (const b of soi.brands) byBrand[b.maname] = b.investment
    points.push({ fecha: iso, total: soi.total, byBrand })
  }
  return points
}

// ── Índice de Amenaza DIY (0–100) ─────────────────────────────────────
// Sustitución de cámaras solas frente al servicio monitoreado (blueprint DEMANDA).
// Componentes documentados: (a) crecimiento de búsqueda "cámara wifi",
// (b) caída de precio en marketplace (más barato = más amenaza),
// (c) pauta DIY detectada. Fórmula ponderada, calibrada al mockup (≈58).
export function diyIndex(trends, registrosDigital = []) {
  const diy = trends?.diy || {}
  const searchGrowth = Number(diy.busquedas_camara_wifi_growth_90d) || 0 // %
  const priceDrop = -(Number(diy.precio_delta_vs_abr) || 0) // % de caída (positivo = más amenaza)

  const DIY_BRANDS = new Set((diy.marcas_monitoreadas || []).map((s) => s.toUpperCase()))
  const pautaDIY = registrosDigital
    .filter((r) => DIY_BRANDS.has(String(r.maname).toUpperCase()))
    .reduce((s, r) => s + (Number(r.inversion_moneda_local) || 0), 0)

  // Normalizaciones a 0–100 (topes calibrados a los sub-datos DIY del mockup;
  // pesos ilustrativos, a afinar con data real).
  const nSearch = Math.min(100, (searchGrowth / 40) * 100) // 40% growth = tope
  const nPrice = Math.min(100, (priceDrop / 20) * 100) // 20% de caída = tope
  const nPauta = Math.min(100, (pautaDIY / 340_000) * 100) // ≈S/41.200/sem = tope

  // Pesos: búsqueda 0.5, precio 0.25, pauta 0.25
  const index = Math.round(0.5 * nSearch + 0.25 * nPrice + 0.25 * nPauta)
  return {
    index: Math.max(0, Math.min(100, index)),
    deltaSemana: diy.delta_semana != null ? Number(diy.delta_semana) : null,
    components: {
      busquedas_camara_wifi_growth_90d: searchGrowth,
      precio_mediano_marketplace: Number(diy.precio_mediano_marketplace) || null,
      precio_delta_vs_abr: Number(diy.precio_delta_vs_abr) || 0,
      pauta_diy_moneda_local: pautaDIY,
      marcas_monitoreadas: diy.marcas_monitoreadas || [],
    },
  }
}

// ── IPC — Índice de Presión Competitiva (0–100) ───────────────────────
// SOI de competencia + ritmo de piezas nuevas + amplitud de canales/franjas.
export function computeIPC(registros, day) {
  const soi = computeSOI(registros, day)
  const competidorShare = soi.brands
    .filter((b) => !b.isVerisure)
    .reduce((s, b) => s + b.share, 0) // % de la categoría que NO es Verisure
  const newToday = detectNewPieces(registros, day).length
  const channels = new Set()
  const franjas = new Set()
  for (const r of registros) {
    if (dayOf(r.fecha) !== day || r.maname === VERISURE) continue
    if (r.mname) channels.add(r.mname)
    if (r.franja) franjas.add(r.franja)
  }
  const nShare = Math.min(100, competidorShare) // share de competencia (0–100)
  const nNew = Math.min(100, newToday * 50) // cada pieza nueva pesa fuerte
  const nBreadth = Math.min(100, (channels.size + franjas.size) * 8)
  // Pesos: share 0.8, novedad 0.12, amplitud 0.08 (calibrado al mockup ≈64; ilustrativo)
  const ipc = Math.round(0.8 * nShare + 0.12 * nNew + 0.08 * nBreadth)
  return Math.max(0, Math.min(100, ipc))
}

// ── IMC — Índice de Momento de Categoría (0–100) ──────────────────────
// Demanda (Trends) + criminalidad + estacionalidad.
export function computeIMC(trends, contexto) {
  const kw = (trends?.keywords || []).find((k) => k.keyword === 'alarma para casa')
  const demandGrowth = kw ? Number(kw.growth_90d) : 0 // %
  const demandLevel = kw ? Number(kw.interest) : 0 // 0–100
  const nDemand = Math.min(100, 0.6 * demandLevel + 0.4 * Math.min(100, (demandGrowth / 30) * 100))

  const distritos = contexto?.criminalidad?.distritos || []
  const totalDenuncias =
    distritos.reduce((s, d) => s + (Number(d.denuncias) || 0), 0) +
    (Number(contexto?.criminalidad?.resto_distritos?.denuncias) || 0)
  const nCrime = Math.min(100, (totalDenuncias / 18000) * 100) // 18k denuncias/mes = tope

  const seasonalHigh = /vacacional|navideñ|patrias/i.test(
    JSON.stringify(contexto?.estacionalidad || {}),
  )
  const nSeason = seasonalHigh ? 90 : 55

  // Pesos: demanda 0.5, criminalidad 0.25, estacionalidad 0.25 (calibrado al mockup ≈79; ilustrativo)
  const imc = Math.round(0.5 * nDemand + 0.25 * nCrime + 0.25 * nSeason)
  return Math.max(0, Math.min(100, imc))
}

// ── Normaliza marca a clave corta (para cruzar con share_of_search) ───
export function brandKey(maname = '') {
  const m = maname.toUpperCase()
  if (m.includes('VERISURE')) return 'VERISURE'
  if (m.includes('PROSEGUR')) return 'PROSEGUR'
  if (m.includes('SECURITAS')) return 'SECURITAS'
  return m
}

// ── Share of investment (30d) por marca ───────────────────────────────
export function investmentShare(registros) {
  const byBrand = new Map()
  let total = 0
  for (const r of registros) {
    const inv = Number(r.rinversion) || 0
    byBrand.set(r.maname, (byBrand.get(r.maname) || 0) + inv)
    total += inv
  }
  return [...byBrand.entries()]
    .map(([maname, inv]) => ({
      maname,
      investment: inv,
      share: total > 0 ? round((inv / total) * 100, 1) : 0,
      isVerisure: maname === VERISURE,
    }))
    .sort((a, b) => b.share - a.share)
}

// ── Share of Search vs Share of Investment (DEMANDA, análisis ESOV) ───
// Cruza el share of search (Trends) con el share of investment (Integrametrics).
// gap = búsqueda − inversión: positivo => la demanda no está acompañada de inversión.
export function searchVsInvestment(registros, trends) {
  const sos = trends?.share_of_search || {}
  const inv = investmentShare(registros)
  return inv.map((b) => {
    const search = Number(sos[brandKey(b.maname)]) || 0
    return {
      maname: b.maname,
      isVerisure: b.isVerisure,
      search,
      investment: b.share,
      gap: round(search - b.share, 0),
    }
  })
}

// ── Día más reciente presente en los registros ────────────────────────
export function latestDay(registros) {
  let max = ''
  for (const r of registros) {
    const d = dayOf(r.fecha)
    if (d > max) max = d
  }
  return max || null
}

// ── Comparación SOI vs. N días atrás (para "vs. semana pasada") ────────
export function soiComparison(registros, day, daysAgo = 7) {
  const prior = new Date(`${day}T00:00:00Z`)
  prior.setUTCDate(prior.getUTCDate() - daysAgo)
  const priorDay = prior.toISOString().slice(0, 10)
  const now = computeSOI(registros, day)
  const before = computeSOI(registros, priorDay)
  const beforeShare = Object.fromEntries(before.brands.map((b) => [b.maname, b.share]))
  const brands = now.brands.map((b) => ({
    ...b,
    deltaPts: round(b.share - (beforeShare[b.maname] || 0), 0),
  }))
  return { ...now, priorDay, brands }
}

// ── Clasificador EPPM (miedo → eficacia → alivio / innovación) ─────────
// PLACEHOLDER de la Fase 2: heurística por palabras clave sobre el nombre de versión.
// El clasificador real (keyframes de rfile + Claude) llega en la Fase 4 (blueprint RADAR).
export function classifyEPPM(vname = '') {
  const v = vname.toLowerCase()
  if (/(nada es seguro|robo|miedo|peligro|protección|protege|vigila)/.test(v)) return 'miedo → alivio'
  if (/(negocio|empresa|comercio|pyme|atendido|b2b)/.test(v)) return 'eficacia'
  if (/(respuesta|segundos|tranquil|verificad|zerovision|cuida)/.test(v)) return 'alivio'
  return 'innovación'
}

// ── Ad Museum: piezas (versiones) agrupadas con inversión acumulada ───
// Cada versión creativa = una pieza; primera emisión, canales, inversión acumulada, tono EPPM.
export function adMuseumPieces(registros) {
  const byVersion = new Map()
  for (const r of registros) {
    const key = r.id_versiones_unica ?? `${r.maname}:${r.vname}`
    let p = byVersion.get(key)
    if (!p) {
      p = {
        key,
        vname: r.vname,
        maname: r.maname,
        isVerisure: r.maname === VERISURE,
        firstEmission: r.fecha,
        channels: new Set(),
        tipos: new Set(),
        totalInvestment: 0,
        rfile: r.rfile || null,
        eppm: classifyEPPM(r.vname),
      }
      byVersion.set(key, p)
    }
    if (r.fecha < p.firstEmission) p.firstEmission = r.fecha
    if (r.mname) p.channels.add(r.mname)
    if (r.gname) p.tipos.add(r.gname)
    p.totalInvestment += Number(r.rinversion) || 0
    if (!p.rfile && r.rfile) p.rfile = r.rfile
  }
  return [...byVersion.values()]
    .map((p) => ({
      ...p,
      channels: [...p.channels],
      tipos: [...p.tipos],
    }))
    .sort((a, b) => (a.firstEmission < b.firstEmission ? 1 : -1)) // más recientes primero
}

// ── Puntos OOH (vía pública con lat/long) para el mapa ────────────────
export function oohPoints(registros) {
  return registros
    .filter((r) => r.tname === 'VÍA PÚBLICA' && r.latitud != null && r.longitud != null)
    .map((r) => ({
      lat: r.latitud,
      lng: r.longitud,
      maname: r.maname,
      isVerisure: r.maname === VERISURE,
      investment: Number(r.rinversion) || 0,
      localidad: r.localidad,
      direccion: r.direccion,
    }))
}

// ── Opportunity Score (0–100) = combinación IPC + IMC ─────────────────
// Lectura EPPM (blueprint B.2): IMC alto con IPC no dominante => ventana favorable
// para presionar. Score = peso a favor del momento, penalizado por presión rival.
export function opportunityScore(registros, trends, contexto, day) {
  const ipc = computeIPC(registros, day)
  const imc = computeIMC(trends, contexto)
  // Momento de categoría empuja; presión competitiva resta, pero atenuada.
  // (calibrado al mockup ≈72; pesos ilustrativos, a afinar con data real)
  const raw = 0.84 * imc + 0.16 * (100 - ipc)
  const score = Math.round(Math.max(0, Math.min(100, raw)))
  return { score, ipc, imc }
}
