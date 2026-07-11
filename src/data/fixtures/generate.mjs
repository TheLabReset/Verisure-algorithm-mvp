// Generador DETERMINISTA de fixtures de The Algorithm (Fase 1).
// Los campos replican EXACTAMENTE la doc: docs/Documentación API Integra Metrics.pdf
// (endpoints /registros y /registros-digital, catálogos {id,name}).
// Los ~30 días de data son verosímiles es-PE y COHERENTES con el mockup:
//   último día (jue 10 jul 2026): Prosegur S/118.400·46% · Verisure S/85.600·33% ·
//   Securitas S/52.800·21% · total S/256.800 · pieza NUEVA de Prosegur 9:41 América TV.
// Ejecutar: node src/data/fixtures/generate.mjs   (o npm run gen:fixtures)
//
// NOTA de proveniencia de campos:
//  - Todos los campos de /registros y /registros-digital están DOCUMENTADOS en el PDF.
//  - Los catálogos posteriores a /categorias (medios, sectores, subsectores, versiones…)
//    quedan modelados como {id,name} — su esquema exacto está PENDIENTE de verificación
//    con token (respetado según nota del PDF).
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = dirname(fileURLToPath(import.meta.url))
mkdirSync(OUT, { recursive: true })

// PRNG determinista (mulberry32) — fixtures estables entre regeneraciones.
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(20260710)
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]
const jitter = (base, pct) => Math.round(base * (1 + (rnd() * 2 - 1) * pct))

// ── Catálogos base (competencia de seguridad en Perú) ─────────────────
// Verisure = la marca del cliente; Prosegur/Securitas = competencia (grises en gráficos).
const MARCAS = [
  { id: 101, name: 'PROSEGUR ALARMS' },
  { id: 102, name: 'VERISURE' },
  { id: 103, name: 'SECURITAS' },
]
const MEDIOS_TV = [
  { mid: 4, mname: 'AMÉRICA TV', mcodigo: 'AmericaTV', mabierta_cable: 1 },
  { mid: 5, mname: 'LATINA', mcodigo: 'Latina', mabierta_cable: 1 },
  { mid: 6, mname: 'ATV', mcodigo: 'ATV', mabierta_cable: 1 },
  { mid: 7, mname: 'PANAMERICANA', mcodigo: 'Panamericana', mabierta_cable: 1 },
]
const MEDIOS_RADIO = [
  { mid: 20, mname: 'RPP', mcodigo: 'RPP', mabierta_cable: 1 },
  { mid: 21, mname: 'RADIO EXITOSA', mcodigo: 'Exitosa', mabierta_cable: 1 },
]
const PROGRAMAS = [
  { id: 426, name: 'AMÉRICA NOTICIAS', genero: 'INFORMATIVO' },
  { id: 128, name: 'NOTICIAS DE LA MAÑANA', genero: 'INFORMATIVO' },
  { id: 302, name: 'EL GRAN SHOW', genero: 'ENTRETENIMIENTO' },
  { id: 210, name: 'FÚTBOL EN AMÉRICA', genero: 'DEPORTES' },
]
const FRANJAS = ['DIA', 'PRIME', 'NOCHE', 'MADRUGADA']
const CIUDADES = ['LIMA', 'AREQUIPA', 'TRUJILLO', 'CHICLAYO']

// Catálogo de versiones creativas (piezas) por marca, con id ESTABLE por versión.
// La misma pieza se reemite muchos días → agrupa en el Ad Museum (inversión acumulada).
// "Nada es seguro, salvo tu hogar" NO está aquí: entra hoy como pieza NUEVA (primera emisión).
const VERSION_CATALOG = {
  101: [
    { idv: 6101, vname: 'Protección que responde' },
    { idv: 6102, vname: 'Tu casa vigilada' },
    { idv: 6103, vname: 'Alarma con doble verificación' },
    { idv: 6104, vname: 'Seguridad para tu negocio' },
    { idv: 6105, vname: 'Respuesta en minutos' },
    { idv: 6106, vname: 'Vigilancia que no descansa' },
    { idv: 6107, vname: 'Tu familia, protegida' },
    { idv: 6108, vname: 'Central de monitoreo 24/7' },
  ],
  102: [
    { idv: 6201, vname: 'Respuesta en segundos' },
    { idv: 6202, vname: 'Doble verificación' },
    { idv: 6203, vname: 'ZeroVision te cuida' },
    { idv: 6204, vname: 'Control desde tu celular' },
    { idv: 6205, vname: 'Seguridad verificada, no falsas alarmas' },
    { idv: 6206, vname: 'Protegemos lo que importa' },
    { idv: 6207, vname: 'Tu hogar bajo control' },
  ],
  103: [
    { idv: 6301, vname: 'Tu negocio, siempre atendido' },
    { idv: 6302, vname: 'Seguridad para tu empresa' },
    { idv: 6303, vname: 'Monitoreo para comercios' },
    { idv: 6304, vname: 'Protección para tu local' },
    { idv: 6305, vname: 'Respuesta profesional' },
    { idv: 6306, vname: 'Tu empresa segura' },
  ],
}
// Nombres para /registros-digital (reusa el catálogo).
const VERSIONES = Object.fromEntries(
  Object.entries(VERSION_CATALOG).map(([k, v]) => [k, v.map((x) => x.vname)]),
)

const TC = 3.68 // tipo de cambio S/ por USD (coherente con Contexto del mockup)

// ── Serie de 30 días: share por marca interpolado + total diario ──────
// Prosegur crece desde fines de junio; Securitas se apaga; Verisure ~estable.
const DAYS = 30
const LAST = new Date(Date.UTC(2026, 6, 10)) // 2026-07-10 (mes 6 = julio)
function dayISO(offsetFromLast) {
  const d = new Date(LAST)
  d.setUTCDate(d.getUTCDate() - offsetFromLast)
  return d.toISOString().slice(0, 10)
}
// Totales exactos del último día (jue 10 jul) — coherentes con el mockup.
const LAST_DAY_TOTALS = { 101: 118400, 102: 85600, 103: 52800 } // total S/256.800

// t=0 (hace 29 días) → t=1 (hoy)
function shares(t) {
  const prosegur = 0.35 + 0.11 * t // 35% → 46%
  const securitas = 0.28 - 0.07 * t // 28% → 21%
  const verisure = 1 - prosegur - securitas // ~37% → 33%
  return { 101: prosegur, 102: verisure, 103: securitas }
}
// Total diario de inversión de la categoría (S/), con leve tendencia y ruido.
function dayTotal(t) {
  return jitter(190000 + 60000 * t, 0.04) // ~190k → ~256k
}

let idUnico = 3540000
const registros = []

function makeRegistro(fecha, marca, medio, tipo, inv, franja, opts = {}) {
  const [fdate, ftime] = fecha.split(' ')
  const HOUR = Number(ftime.slice(0, 2))
  const MINUTE = Number(ftime.slice(3, 5))
  const isTV = tipo === 'SPOT TV'
  const isOOH = tipo === 'VÍA PÚBLICA'
  const isRadio = tipo === 'SPOT RADIO'
  const prog = isTV ? pick(PROGRAMAS) : null
  const duraseg = isOOH ? 0 : pick([15, 20, 30, 45])
  const vname = opts.vname || pick(VERSIONES[marca.id])
  idUnico += 1
  return {
    id_unico: idUnico,
    maname: marca.name,
    fecha,
    rid: isOOH ? null : 360000 + (idUnico % 90000),
    rfile: isOOH
      ? null
      : `https://files2.integra-metrics.com/multimedia/audio-video/${fdate}/${marca.id}_${idUnico}.mp4`,
    rinversion: inv,
    rinversion_neta: Math.round(inv * 0.83),
    rinversion_dolares: Math.round((inv / TC) * 10) / 10,
    rinversion_neta_dolares: Math.round((inv * 0.83 / TC) * 10) / 10,
    HOUR,
    MINUTE,
    fingerprint: `https://integra-metrics.s3.sa-east-1.amazonaws.com/multimedia/fp/${idUnico}.png`,
    cfile: null,
    ccodigo: `${marca.id}-${idUnico}`,
    palto: null,
    pancho: null,
    ppage: null,
    mname: medio ? medio.mname : null,
    mcodigo: medio ? medio.mcodigo : null,
    mid: medio ? medio.mid : null,
    mabierta_cable: medio ? medio.mabierta_cable : null,
    mfrecuencia: null,
    murl: null,
    prodid: 5000 + marca.id,
    prodname: `${marca.name} MONITOREO`,
    catid: 40,
    catname: 'SERVICIOS',
    scatid: 401,
    scatname: 'SEGURIDAD Y MONITOREO',
    anname: `${marca.name} PERÚ`,
    anid: 2000 + marca.id,
    progid: prog ? prog.id : null,
    progname: prog ? prog.name : null,
    comid: 1,
    comname: 'NACIONAL',
    genname: prog ? prog.genero : null,
    ciuname: opts.ciudad || 'LIMA',
    duracion: isOOH
      ? null
      : `00:00:${String(duraseg).padStart(2, '0')}`,
    duraseg: isOOH ? null : duraseg,
    cadname: null,
    id_versiones_unica: opts.idVersion,
    tanda: isTV ? 1 + Math.floor(rnd() * 30) : null,
    tanda_programa: isTV ? 1 + Math.floor(rnd() * 6) : null,
    posicion_tanda: isTV ? 1 + Math.floor(rnd() * 14) : null,
    numero_programa: isTV ? 1 + Math.floor(rnd() * 12) : null,
    cantidad_spots_tanda: isTV ? 8 + Math.floor(rnd() * 18) : null,
    vprdisponible: null,
    fecha_tv: null,
    region_radio: isRadio ? 'metropolitana' : null,
    fallas: 'sin fallas',
    codigo_universal: 7000 + (idUnico % 3000),
    regiid: 2,
    latitud: isOOH ? opts.lat : null,
    longitud: isOOH ? opts.lng : null,
    direccion: isOOH ? opts.direccion : null,
    localidad: isOOH ? opts.localidad : null,
    sname: 'SERVICIOS',
    sid: 40,
    ssname: 'SEGURIDAD',
    ssid: 401,
    caname: 'SEGURIDAD Y MONITOREO',
    caid: 40,
    agname: pick(['LA FIRMA', 'MEC', 'PUBLICIS']),
    agid: pick([9, 30, 50]),
    cename: pick(['PUBLICIS GROUPE MEDIA', 'HAVAS MEDIA', null]),
    ceid: 50,
    presname: null,
    gid: isTV ? 1 : isRadio ? 2 : 5,
    gname: isTV ? 'TELEVISIÓN' : isRadio ? 'RADIO' : 'VÍA PÚBLICA',
    tid: isTV ? 1 : isRadio ? 3 : 8,
    tname: tipo,
    stname: 'INSTITUCIONAL',
    vname,
    pid: 400 + marca.id,
    pname: `${marca.name} ALARMAS`,
    maid: marca.id,
    rating: isTV ? Math.round(rnd() * 5 * 100) / 100 : null,
    audiencia: isTV ? jitter(6000, 0.5) : null,
    alcance: isTV ? jitter(6000, 0.5) : null,
    spot_valorizado: 'si',
    pantalla: null,
    secname: 'SEGURIDAD',
    secid: 401,
    centra: null,
    primera_emision_comercial: opts.primeraEmision || null,
    primera_emision_version: opts.primeraVersion || fecha,
    nuevas_versiones: opts.nuevo ? 'NUEVO' : '',
    duracion_tv: isOOH ? null : Math.ceil(duraseg / 5) * 5,
    etiquetas: [],
    franja,
  }
}

// ── Genera registros por día ──────────────────────────────────────────
for (let d = 0; d < DAYS; d++) {
  const t = (DAYS - 1 - d) / (DAYS - 1) // 0 (más antiguo) → 1 (hoy)
  const fdate = dayISO(d)
  const total = dayTotal(t)
  const sh = shares(t)
  const isLastDay = d === 0
  for (const marca of MARCAS) {
    const brandTotal = isLastDay ? LAST_DAY_TOTALS[marca.id] : Math.round(total * sh[marca.id])
    // nº de piezas del día por marca (Prosegur más activo)
    let nPieces = marca.id === 101 ? 4 + Math.floor(rnd() * 3) : 2 + Math.floor(rnd() * 3)
    let remaining = brandTotal

    // Prosegur, último día: la primera pieza es la NUEVA ("jugada del día" del mockup),
    // integrada dentro de su total del día (no adicional).
    if (isLastDay && marca.id === 101) {
      registros.push(
        makeRegistro('2026-07-10 09:41:12', marca, MEDIOS_TV[0], 'SPOT TV', 84300, 'PRIME', {
          idVersion: 6199, // id estable exclusivo de la pieza NUEVA de hoy
          vname: 'Nada es seguro, salvo tu hogar',
          nuevo: true,
          primeraEmision: '2026-07-10 09:41:12',
          primeraVersion: '2026-07-10 09:41:12',
        }),
      )
      remaining -= 84300
      nPieces -= 1
    }

    for (let i = 0; i < nPieces; i++) {
      const isLastPiece = i === nPieces - 1
      const inv = isLastPiece
        ? remaining
        : Math.round((remaining / (nPieces - i)) * (1 + (rnd() * 2 - 1) * 0.25))
      remaining -= inv
      if (inv <= 0) continue
      // mezcla de medios: OOH ~12% para todas las marcas; Securitas más B2B/radio.
      const r = rnd()
      let medio, tipo
      if (r < 0.12) {
        medio = null; tipo = 'VÍA PÚBLICA'
      } else if (marca.id === 103 && r < 0.55) {
        medio = pick(MEDIOS_RADIO); tipo = 'SPOT RADIO'
      } else if (r < 0.28) {
        medio = pick(MEDIOS_RADIO); tipo = 'SPOT RADIO'
      } else {
        medio = pick(MEDIOS_TV); tipo = 'SPOT TV'
      }
      const franja = tipo === 'SPOT TV' ? pick(['DIA', 'PRIME', 'PRIME', 'NOCHE']) : pick(FRANJAS)
      const hh = franja === 'PRIME' ? 20 + Math.floor(rnd() * 2) : franja === 'DIA' ? 8 + Math.floor(rnd() * 10) : franja === 'NOCHE' ? 22 + Math.floor(rnd() * 1) : 1 + Math.floor(rnd() * 4)
      const mm = Math.floor(rnd() * 60)
      const fecha = `${fdate} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}`
      const ver = pick(VERSION_CATALOG[marca.id]) // versión estable → agrupa en el Ad Museum
      const oohOpts = tipo === 'VÍA PÚBLICA'
        ? { lat: -12.09 + (rnd() - 0.5) * 0.1, lng: -77.02 + (rnd() - 0.5) * 0.1, direccion: pick(['Av. Javier Prado 4200', 'Panamericana Norte km 12', 'Av. La Marina 2500']), localidad: pick(['SAN ISIDRO', 'LOS OLIVOS', 'SAN MIGUEL']) }
        : {}
      registros.push(makeRegistro(fecha, marca, medio, tipo, inv, franja, { idVersion: ver.idv, vname: ver.vname, ...oohOpts }))
    }
  }
}

// ── Detecciones históricas: marca la PRIMERA emisión de cada versión como NUEVA ──
// Así el monitoreo diario tiene "última detección" en días previos (no solo hoy).
// Excluimos primeras emisiones de HOY (salvo el hero 6199) para que "N alertas hoy"
// sea exactamente la jugada del día.
{
  const firstByVersion = new Map()
  for (const r of registros) {
    const k = r.id_versiones_unica
    const cur = firstByVersion.get(k)
    if (!cur || r.fecha < cur.fecha) firstByVersion.set(k, r)
  }
  for (const [k, first] of firstByVersion) {
    if (k === 6199) continue // hero de hoy: ya marcado
    if (first.fecha.slice(0, 10) === '2026-07-10') continue // no ensuciar el conteo de hoy
    first.nuevas_versiones = 'NUEVO'
    first.primera_emision_comercial = first.fecha
    first.primera_emision_version = first.fecha
  }
}

// ── /registros-digital: inversión digital de competencia + marcas DIY ─
const DIGITAL_MEDIOS = [
  { id: 1, name: 'GOOGLE' },
  { id: 2, name: 'FACEBOOK' },
  { id: 3, name: 'YOUTUBE' },
  { id: 4, name: 'INSTAGRAM' },
]
const DIY_MARCAS = [
  { id: 201, name: 'EZVIZ' },
  { id: 202, name: 'IMOU' },
  { id: 203, name: 'TP-LINK TAPO' },
]
const registrosDigital = []
for (let d = 0; d < DAYS; d++) {
  const t = (DAYS - 1 - d) / (DAYS - 1)
  const fdate = dayISO(d)
  // competencia digital
  for (const marca of MARCAS) {
    const invUSD = jitter(1200 + 1800 * (marca.id === 102 ? 0.9 : 1), 0.3)
    const medio = pick(DIGITAL_MEDIOS)
    registrosDigital.push({
      fecha: fdate,
      impresiones: jitter(400000, 0.4),
      inversion_dolares: invUSD,
      inversion_moneda_local: Math.round(invUSD * TC),
      pid: 400 + marca.id,
      pname: `${marca.name} ALARMAS`,
      maid: marca.id,
      maname: marca.name,
      ssid: 401,
      ssname: 'SEGURIDAD',
      sid: 40,
      sname: 'SERVICIOS',
      caid: 40,
      caname: 'SEGURIDAD Y MONITOREO',
      id_medio_digital: medio.id,
      medio_digital: medio.name,
      version: pick(VERSIONES[marca.id]),
      advertisement: `https://integra-metrics-a.s3.amazonaws.com/cr/digital/${fdate}/${marca.id}_${d}.jpg`,
    })
  }
  // DIY (crece hacia el final → alimenta índice de amenaza).
  // Calibrado a la pauta DIY del mockup (≈ S/41.200/sem ≈ S/177k/mes ≈ US$48k/mes).
  for (const diy of DIY_MARCAS) {
    const invUSD = jitter(450 + 170 * t, 0.25)
    registrosDigital.push({
      fecha: fdate,
      impresiones: jitter(520000, 0.4),
      inversion_dolares: invUSD,
      inversion_moneda_local: Math.round(invUSD * TC),
      pid: 900 + diy.id,
      pname: `${diy.name} CÁMARA WIFI`,
      maid: diy.id,
      maname: diy.name,
      ssid: 530,
      ssname: 'CÁMARAS Y VIDEOVIGILANCIA',
      sid: 90,
      sname: 'RETAIL / HARDWARE',
      caid: 1,
      caname: 'COMERCIOS Y RETAIL',
      id_medio_digital: pick(DIGITAL_MEDIOS).id,
      medio_digital: pick(DIGITAL_MEDIOS).name,
      version: `${diy.name} PROMO`,
      advertisement: `https://integra-metrics-a.s3.amazonaws.com/cr/digital/${fdate}/diy_${diy.id}_${d}.jpg`,
    })
  }
}

// ── Catálogos ({id,name}; los post-/categorias PENDIENTES de verificación) ──
const catalogos = {
  marcas: MARCAS.map((m) => ({ id: m.id, name: m.name })),
  programas: PROGRAMAS.map((p) => ({ id: p.id, name: p.name, genero: p.genero })),
  // PENDIENTE de verificación con token — modelados como {id,name}:
  medios: [...MEDIOS_TV, ...MEDIOS_RADIO].map((m) => ({ id: m.mid, name: m.mname })),
  sectores: [{ id: 40, name: 'SERVICIOS' }],
  subsectores: [
    { id: 401, name: 'SEGURIDAD' },
    { id: 530, name: 'CÁMARAS Y VIDEOVIGILANCIA' },
  ],
  categorias: [{ id: 40, name: 'SEGURIDAD Y MONITOREO' }],
}

// ── Google Trends (fuente pública; modelado al mockup) ────────────────
const trends = {
  updated: '2026-07-10',
  region: 'PE',
  source: 'Google Trends Perú (fixture)',
  keywords: [
    { keyword: 'alarma para casa', interest: 78, growth_90d: 18, trend: 'rising' },
    { keyword: 'cámaras de seguridad', interest: 92, growth_90d: 28, trend: 'rising' },
    { keyword: 'cámara wifi', interest: 71, growth_90d: 24, trend: 'rising' },
    { keyword: 'verisure', interest: 44, growth_90d: 6, trend: 'stable' },
    { keyword: 'prosegur alarmas', interest: 31, growth_90d: 9, trend: 'stable' },
    { keyword: 'securitas', interest: 12, growth_90d: 2, trend: 'stable' },
  ],
  // share of search por marca (para slope vs share of investment)
  share_of_search: { VERISURE: 44, PROSEGUR: 37, SECURITAS: 19 },
  // serie diaria del interés "alarma para casa" (índice 0-100) últimos 30 días
  series_alarma_casa: Array.from({ length: DAYS }, (_, d) => {
    const t = d / (DAYS - 1)
    return { fecha: dayISO(DAYS - 1 - d), value: Math.round(62 + 16 * t + (rnd() * 2 - 1) * 3) }
  }),
  diy: {
    // Índice de Amenaza DIY = 58/100 (mockup), +4 esta semana
    delta_semana: 4,
    busquedas_camara_wifi_growth_90d: 24,
    precio_mediano_marketplace: 129,
    precio_delta_vs_abr: -12,
    marcas_monitoreadas: ['Ezviz', 'Imou', 'TP-Link Tapo'],
  },
}

// ── Contexto (SIDPOL + BCRP + prensa; público, modelado al mockup) ────
const contexto = {
  criminalidad: {
    fuente: 'SIDPOL',
    periodo: '2026-05',
    rezago_dias: 45,
    distritos: [
      { distrito: 'SJL', denuncias: 1842 },
      { distrito: 'Los Olivos', denuncias: 1310 },
      { distrito: 'Ate', denuncias: 1276 },
      { distrito: 'SMP', denuncias: 1190 },
      { distrito: 'Comas', denuncias: 1084 },
      { distrito: 'Callao', denuncias: 897 },
      { distrito: 'Surco', denuncias: 812 },
    ],
    resto_distritos: { count: 28, denuncias: 6410 },
  },
  macro: {
    fuente: 'BCRP',
    tipo_cambio: { value: 3.68, delta_semana_pct: -0.3 },
    confianza_consumidor: { value: 47.2, delta_vs_mes_pct: 1.1 },
    expectativa_economia: { value: 52.4, delta: 0, tramo: 'optimista' },
    inflacion_12m: { value: 2.6, delta_pts: -0.1 },
  },
  estacionalidad: {
    nota: 'Fiestas Patrias (28–29 jul) eleva búsquedas de alarmas +22% y robos a vivienda +9% en agosto',
    picos: ['jul–ago: pico vacacional', 'nov–dic: pico navideño'],
  },
  noticias: [
    { titular: 'PNP refuerza patrullaje en Lima Norte tras ola de robos a viviendas en Los Olivos y Comas', fuente: 'El Comercio', hora: '8:12', url: 'https://elcomercio.pe/' },
    { titular: 'Extorsiones a bodegas y farmacias crecieron 21% en el primer semestre, según gremio', fuente: 'RPP', hora: '7:40', url: 'https://rpp.pe/' },
    { titular: 'Importación de cámaras de seguridad marcó récord en junio: 340 mil unidades', fuente: 'Gestión', hora: '6:55', url: 'https://gestion.pe/' },
    { titular: 'Municipalidad de Surco amplía red de serenazgo con 40 cámaras conectadas a central', fuente: 'Latina', hora: '6:30', url: 'https://latina.pe/' },
  ],
}

// ── Escribir ──────────────────────────────────────────────────────────
const write = (name, data) => writeFileSync(join(OUT, name), JSON.stringify(data, null, 0))
write('registros.json', registros)
write('registros-digital.json', registrosDigital)
write('catalogos.json', catalogos)
write('trends.json', trends)
write('contexto.json', contexto)

console.log('registros:', registros.length)
console.log('registros-digital:', registrosDigital.length)
// sanity: SOI del último día
const lastDay = '2026-07-10'
const byBrand = {}
let totalLast = 0
for (const r of registros) {
  if (r.fecha.slice(0, 10) === lastDay) {
    byBrand[r.maname] = (byBrand[r.maname] || 0) + r.rinversion
    totalLast += r.rinversion
  }
}
console.log('último día total S/', totalLast)
for (const [b, v] of Object.entries(byBrand)) {
  console.log(`  ${b}: S/ ${v} (${((v / totalLast) * 100).toFixed(1)}%)`)
}
