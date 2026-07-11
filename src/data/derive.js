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
