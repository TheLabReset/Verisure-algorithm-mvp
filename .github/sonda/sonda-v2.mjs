// Sonda de solo lectura: la misma data de Integrametrics por la API v1 y por la v2, registro por registro.
// No escribe en el repo ni imprime montos: solo conteos, tasas de coincidencia, tablas cruzadas y ejemplos.
// Las marcas salen de src/cliente.js (la propia, la competencia y las vigiladas).
import { appendFileSync } from 'node:fs'
import { fetchRegistros } from '../../src/fuentes/integrametrics.js'
import { CLIENTE } from '../../src/cliente.js'

const T1 = process.env.INTEGRAMETRICS_TOKEN, T2 = process.env.INTEGRAMETRICS_TOKEN_V2
if (!T1 || !T2) { console.error('::error::Faltan INTEGRAMETRICS_TOKEN o INTEGRAMETRICS_TOKEN_V2'); process.exit(1) }
const ORIGEN = 'https://pe.integra-metrics.com', V1 = `${ORIGEN}/api/rest/v1`, V2 = `${ORIGEN}/api/rest/v2`
const DESDE = process.env.SONDA_DESDE || '2026-10-01', HASTA = process.env.SONDA_HASTA || '2026-10-31'
const MARCAS = [CLIENTE.marcaFuente, ...CLIENTE.competencia.map((c) => c.marcaFuente), ...(CLIENTE.vigiladas || []).map((v) => v.marcaFuente)]
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim()
const sumar = (d, n) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10) }
const pausa = (ms) => new Promise((r) => setTimeout(r, ms))
const salida = []
const p = (s = '') => { salida.push(s); console.log(s) }
const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(1)} %` : 'sin casos')

// ── cliente v2: paginación por cursor, 429 con Retry-After, 5xx con reintento ──
let pedidosV2 = 0
async function v2(path, params, token = T2) {
  const u = new URL(V2 + path)
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v))
  let url = u.toString(); const filas = []
  while (url) {
    let res
    for (let i = 0; ; i += 1) {
      res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } }); pedidosV2 += 1
      if (res.status === 429 && i < 4) { { const h = res.headers.get('retry-after'); await pausa(1000 * (h != null && !Number.isNaN(Number(h)) ? Number(h) : 5)); continue } }
      if (res.status >= 500 && i < 2) { await pausa([3000, 10000][i]); continue }
      break
    }
    if (!res.ok) { const cuerpo = await res.text(); throw Object.assign(new Error(`v2 ${path} respondió ${res.status}`), { status: res.status, cuerpo }) }
    const j = await res.json()
    filas.push(...(j.data || []))
    url = j.links?.next ? (j.links.next.startsWith('http') ? j.links.next : ORIGEN + j.links.next) : null
  }
  return filas
}
async function estado(url, token) {
  try { const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } }); return `${r.status}` } catch (e) { return `red: ${e.message}` }
}

p(`## Sonda v1 contra v2: ${DESDE} a ${HASTA}`)
p()
p(`Marcas (de src/cliente.js): ${MARCAS.length}`)

// ── 1. Las claves: ¿cada una sirve en la otra versión? ──
p()
p('### 1. Claves')
p(`- Clave v2 en la v2 (catálogo de marcas): ${await estado(`${V2}/atl/marcas?limit=1`, T2)}`)
p(`- Clave v1 en la v2: ${await estado(`${V2}/atl/marcas?limit=1`, T1)}`)
const unMinuto = `${V1}/registros?startDate=${encodeURIComponent(`${DESDE} 10:00:00`)}&endDate=${encodeURIComponent(`${DESDE} 10:01:00`)}&filters=${encodeURIComponent(JSON.stringify({ maname: [CLIENTE.marcaFuente] }))}`
p(`- Clave v1 en la v1: ${await estado(unMinuto, T1)}`)
p(`- Clave v2 en la v1: ${await estado(unMinuto, T2)}`)
try { await v2('/atl/registros', { startDate: '2026-13-45', endDate: HASTA, limit: 1 }) } catch (e) { p(`- Un error de la v2 (fecha inválida): ${e.status} ${String(e.cuerpo).slice(0, 200)}`) }

// ── 2. Los ids de las marcas ──
const ids = {}
for (const m of MARCAS) {
  const cat = await v2('/atl/marcas', { q: m, limit: 1000 })
  const exacta = cat.filter((x) => norm(x.nombre) === norm(m))
  ids[m] = exacta.map((x) => x.id)
  p(`- Marca ${MARCAS.indexOf(m) + 1}: ${exacta.length} id exacto en el catálogo v2 (${exacta.map((x) => x.id).join(', ') || 'ninguno'}); ${cat.length} resultados con la subcadena`)
}
const marcaIds = Object.values(ids).flat().map(Number)

// ── 3. ATL ──
p()
p('### 2. TV, radio y vía pública (ATL)')
let t0 = Date.now()
const a1 = await fetchRegistros({ token: T1, startDate: `${DESDE} 00:00:00`, endDate: `${sumar(HASTA, 1)} 00:00:00`, filters: { maname: MARCAS } })
const tA1 = (Date.now() - t0) / 1000
t0 = Date.now(); const antes = pedidosV2
const a2 = await v2('/atl/registros', { startDate: DESDE, endDate: HASTA, limit: 1000, filters: { marcaId: marcaIds } })
const tA2 = (Date.now() - t0) / 1000, pedA2 = pedidosV2 - antes
p(`- v1: ${a1.length} registros, ${Math.round((Date.parse(HASTA) - Date.parse(DESDE)) / 864e5) + 1} pedidos, ${tA1.toFixed(1)} s`)
p(`- v2: ${a2.length} registros, ${pedA2} pedidos, ${tA2.toFixed(1)} s`)
const maidV1 = {}
for (const r of a1) { const k = norm(r.maname); maidV1[k] = maidV1[k] || new Set(); maidV1[k].add(r.maid) }
for (const m of MARCAS) p(`- Marca ${MARCAS.indexOf(m) + 1}: maid en la v1 ${[...(maidV1[norm(m)] || [])].join(', ') || 'sin filas'} · id en la v2 ${ids[m].join(', ') || 'ninguno'} · filas v1 ${a1.filter((r) => norm(r.maname) === norm(m)).length} · filas v2 ${a2.filter((x) => norm(x.marca?.nombre) === norm(m)).length}`)

// emparejar por id
const porId2 = new Map(a2.map((x) => [String(x.id), x])), porReg2 = new Map(a2.map((x) => [String(x.registroId), x]))
const porId1 = new Map(a1.map((r) => [String(r.id_unico), r]))
const conId = a1.filter((r) => porId2.has(String(r.id_unico))).length
const conReg = a1.filter((r) => porReg2.has(String(r.id_unico))).length
p(`- id_unico (v1) = id (v2): ${pct(conId, a1.length)} de los registros v1 · = registroId (v2): ${pct(conReg, a1.length)}`)
const llave = conReg > conId ? 'registroId' : 'id'
const mapa2 = llave === 'id' ? porId2 : porReg2
const pares = a1.map((r) => [r, mapa2.get(String(r.id_unico))]).filter(([, x]) => x)
const solo1 = a1.filter((r) => !mapa2.has(String(r.id_unico)))
const ids1 = new Set(a1.map((r) => String(r.id_unico)))
const solo2 = a2.filter((x) => !ids1.has(String(x[llave])))
p(`- Emparejados por ${llave}: ${pares.length} · solo en v1: ${solo1.length} · solo en v2: ${solo2.length}`)
const cuenta = (arr, f) => { const m = new Map(); for (const x of arr) { const k = f(x); m.set(k, (m.get(k) || 0) + 1) } return [...m.entries()].sort((a, b) => b[1] - a[1]) }
if (solo1.length) p(`  - Solo v1, por medio: ${cuenta(solo1, (r) => r.gname).slice(0, 6).map(([k, n]) => `${k} ${n}`).join(' · ')}`)
if (solo2.length) p(`  - Solo v2, por tipo de medio y espacio disponible: ${cuenta(solo2, (x) => `${x.medio?.tipo} / disponible=${x.espacioDisponible}`).slice(0, 8).map(([k, n]) => `${k} ${n}`).join(' · ')}`)
if (solo1.length) p(`  - Ejemplos solo v1: ${solo1.slice(0, 3).map((r) => `${r.id_unico} ${r.fecha} ${r.gname} ${r.mname}`).join(' | ')}`)
if (solo2.length) p(`  - Ejemplos solo v2: ${solo2.slice(0, 3).map((x) => `${x.id}/${x.registroId} ${x.fecha} ${x.medio?.tipo} ${x.medio?.nombre}`).join(' | ')}`)

// campo por campo
const vacio = (v) => v === null || v === undefined || v === ''
const igual = (a, b) => (vacio(a) && vacio(b)) || norm(a) === norm(b)
const num = (a, b, tol = 0.01) => (vacio(a) && vacio(b)) || Math.abs(Number(a) - Number(b)) <= tol
const base = (u) => String(u ?? '').split('?')[0].split('/').pop()
const fecha = (a, b) => (vacio(a) && vacio(b)) || String(a ?? '').slice(0, 19) === String(b ?? '').slice(0, 19)
const COMPARAR = [
  ['fecha', (r) => r.fecha, (x) => x.fecha, fecha],
  ['marca id (maid → marca.id)', (r) => r.maid, (x) => x.marca?.id, num],
  ['versión id (id_versiones_unica → version.id)', (r) => r.id_versiones_unica, (x) => x.version?.id, num],
  ['versión nombre (vname → version.nombre)', (r) => r.vname, (x) => x.version?.nombre, igual],
  ['medio (mname → medio.nombre)', (r) => r.mname, (x) => x.medio?.nombre, igual],
  ['inversión bruta (rinversion → inversion.bruta)', (r) => r.rinversion, (x) => x.inversion?.bruta, num],
  ['inversión dólares (rinversion_dolares → inversion.brutaDolares)', (r) => r.rinversion_dolares, (x) => x.inversion?.brutaDolares, num],
  ['hora (hour → horario.hora)', (r) => r.hour ?? r.HOUR, (x) => x.horario?.hora, num],
  ['minuto (minute → horario.minuto)', (r) => r.minute ?? r.MINUTE, (x) => x.horario?.minuto, num],
  ['duración (duraseg → duracionSegundos)', (r) => r.duraseg, (x) => x.duracionSegundos, num],
  ['señal TV (mabierta_cable → medio.senalTvCodigo)', (r) => r.mabierta_cable, (x) => x.medio?.senalTvCodigo, num],
  ['tipo de aviso (tname → tipoAviso.nombre)', (r) => r.tname, (x) => x.tipoAviso?.nombre, igual],
  ['programa (progname → programa.nombre)', (r) => r.progname, (x) => x.programa?.nombre, igual],
  ['género (genname → programa.genero)', (r) => r.genname, (x) => x.programa?.genero, igual],
  ['estreno de versión (primera_emision_version → version.primeraDeteccion)', (r) => r.primera_emision_version, (x) => x.version?.primeraDeteccion, fecha],
  ['estreno de comercial (primera_emision_comercial → comercial.primeraEmision)', (r) => r.primera_emision_comercial, (x) => x.comercial?.primeraEmision, fecha],
  ['NUEVO (nuevas_versiones → comercial.esPrimeraEmision)', (r) => r.nuevas_versiones === 'NUEVO', (x) => x.comercial?.esPrimeraEmision === true, (a, b) => a === b],
  ['latitud', (r) => r.latitud, (x) => x.ubicacion?.latitud, (a, b) => num(a, b, 1e-6)],
  ['longitud', (r) => r.longitud, (x) => x.ubicacion?.longitud, (a, b) => num(a, b, 1e-6)],
  ['ciudad (ciuname → ubicacion.ciudad)', (r) => r.ciuname, (x) => x.ubicacion?.ciudad, igual],
  ['dirección', (r) => r.direccion, (x) => x.ubicacion?.direccion, igual],
  ['localidad', (r) => r.localidad, (x) => x.ubicacion?.localidad, igual],
  ['rfile = evidenciaUrl', (r) => r.rfile, (x) => x.evidenciaUrl, igual],
  ['rfile = comercial.huellaUrl', (r) => r.rfile, (x) => x.comercial?.huellaUrl, igual],
  ['archivo de rfile = archivo de evidenciaUrl', (r) => base(r.rfile), (x) => base(x.evidenciaUrl), igual],
  ['archivo de rfile = archivo de huellaUrl', (r) => base(r.rfile), (x) => base(x.comercial?.huellaUrl), igual],
  ['archivo de rfile = evidenciaArchivo', (r) => base(r.rfile), (x) => base(x.evidenciaArchivo), igual],
  ['archivo de rfile = comercial.archivo', (r) => base(r.rfile), (x) => base(x.comercial?.archivo), igual],
]
p()
p('| Campo (v1 → v2) | Coinciden | Con dato en v1 | Con dato en v2 | Ejemplo distinto (v1 → v2) |')
p('|---|---:|---:|---:|---|')
for (const [n, f1, f2, eq] of COMPARAR) {
  let ok = 0, d1 = 0, d2 = 0, ej = null
  for (const [r, x] of pares) {
    const a = f1(r), b = f2(x)
    if (!vacio(a) && a !== false) d1 += 1
    if (!vacio(b) && b !== false) d2 += 1
    if (eq(a, b)) ok += 1; else if (!ej) ej = `${String(a).slice(0, 50)} → ${String(b).slice(0, 50)}`
  }
  p(`| ${n} | ${pct(ok, pares.length)} | ${d1} | ${d2} | ${ej ?? ''} |`)
}
const cruce = (titulo, f1, f2) => {
  p(); p(`**${titulo}** (v1 → v2, pares)`)
  for (const [k, n] of cuenta(pares, ([r, x]) => `${f1(r) ?? 'null'} → ${f2(x) ?? 'null'}`).slice(0, 15)) p(`- ${k}: ${n}`)
}
cruce('Franja', (r) => r.franja, (x) => x.horario?.franja)
cruce('Tipo de medio', (r) => `${r.gname} (${r.mabierta_cable ?? '-'})`, (x) => `${x.medio?.tipo} (tipoId ${x.medio?.tipoId}, señal ${x.medio?.senalTvCodigo ?? '-'})`)
cruce('Tipo de aviso', (r) => r.tname, (x) => x.tipoAviso?.nombre)
p()
p('**Lo que trae la v2 y la v1 no** (sobre todos los registros v2)')
const con = (f) => a2.filter(f).length
p(`- espacioDisponible = true: ${con((x) => x.espacioDisponible === true)} · false: ${con((x) => x.espacioDisponible === false)}`)
p(`- rating con mediciones: ${con((x) => (x.rating || []).length > 0)} · agencia: ${con((x) => x.agencia)} · central: ${con((x) => x.central)} · comercializadora: ${con((x) => x.comercializadora)} · posiciones: ${con((x) => (x.posiciones || []).length > 0)} · etiquetas: ${con((x) => (x.etiquetas || []).length > 0)} · inversión neta: ${con((x) => x.inversion?.neta != null)} · subtipoAviso: ${con((x) => x.subtipoAviso)}`)
p(`- Agencias distintas: ${new Set(a2.map((x) => x.agencia?.nombre).filter(Boolean)).size} · centrales distintas: ${new Set(a2.map((x) => x.central?.nombre).filter(Boolean)).size}`)
const s1 = a1.reduce((s, r) => s + (Number(r.rinversion) || 0), 0), s2 = a2.reduce((s, x) => s + (Number(x.inversion?.bruta) || 0), 0)
p(`- Inversión bruta total, v2 / v1: ${s1 ? (s2 / s1).toFixed(4) : 'sin v1'} (solo la razón)`)
p(`- Campos de un registro v2: ${a2[0] ? Object.keys(a2[0]).join(', ') : '(sin filas)'}`)

// fecha de corte: un día en la v2 con endDate solo fecha, y con hora
const dia = sumar(DESDE, 14)
const d2a = await v2('/atl/registros', { startDate: dia, endDate: dia, limit: 1000, filters: { marcaId: marcaIds } })
const d2b = await v2('/atl/registros', { startDate: `${dia} 00:00:00`, endDate: `${dia} 23:59:59`, limit: 1000, filters: { marcaId: marcaIds } })
const d1 = a1.filter((r) => String(r.fecha).slice(0, 10) === dia).length
p(`- Un día (${dia}): v1 ${d1} · v2 con endDate=${dia} ${d2a.length} · v2 con endDate=${dia} 23:59:59 ${d2b.length} · fechas fuera del día en la v2: ${d2a.filter((x) => String(x.fecha).slice(0, 10) !== dia).length}`)

// ── 4. Digital ──
p()
p('### 3. Digital')
t0 = Date.now(); const g1 = []
for (let d = DESDE; d <= HASTA; d = sumar(d, 1)) {
  const u = `${V1}/registros-digital?startDate=${encodeURIComponent(`${d} 00:00:00`)}&endDate=${encodeURIComponent(`${d} 23:59:59`)}`
  const r = await fetch(u, { headers: { Authorization: `Bearer ${T1}` } })
  if (!r.ok) { p(`- v1 digital ${d}: ${r.status}`); continue }
  for (const x of await r.json()) if (MARCAS.some((m) => norm(m) === norm(x.maname))) g1.push(x)
}
const tG1 = (Date.now() - t0) / 1000
t0 = Date.now(); const antesG = pedidosV2
const g2 = await v2('/digital/registros', { startDate: DESDE, endDate: HASTA, limit: 1000, filters: { marcaId: marcaIds } })
const tG2 = (Date.now() - t0) / 1000, pedG2 = pedidosV2 - antesG
p(`- v1: ${g1.length} filas de las marcas, ${Math.round((Date.parse(HASTA) - Date.parse(DESDE)) / 864e5) + 1} pedidos con todas las marcas, ${tG1.toFixed(1)} s`)
p(`- v2: ${g2.length} filas, ${pedG2} pedidos, ${tG2.toFixed(1)} s`)
const clave1 = (r) => `${String(r.fecha).slice(0, 10)}|${r.maid}|${norm(r.version)}|${r.advertisement}`
const clave2 = (x) => `${String(x.fecha).slice(0, 10)}|${x.marca?.id}|${norm(x.version?.nombre)}|${x.anuncioUrl}`
const multi = (arr, f) => { const m = new Map(); for (const x of arr) { const k = f(x); m.set(k, (m.get(k) || 0) + 1) } return m }
const m1 = multi(g1, clave1), m2 = multi(g2, clave2)
let comunes = 0; for (const [k, n] of m1) comunes += Math.min(n, m2.get(k) || 0)
p(`- Misma fila (día, marca, versión, URL): ${comunes} en común · solo v1 ${g1.length - comunes} · solo v2 ${g2.length - comunes}`)
const sd1 = g1.reduce((s, r) => s + (Number(r.inversion_moneda_local) || 0), 0), sd2 = g2.reduce((s, x) => s + (Number(x.inversion?.monedaLocal) || 0), 0)
const si1 = g1.reduce((s, r) => s + (Number(r.impresiones) || 0), 0), si2 = g2.reduce((s, x) => s + (Number(x.impresiones) || 0), 0)
p(`- Inversión digital total, v2 / v1: ${sd1 ? (sd2 / sd1).toFixed(4) : 'sin v1'} · impresiones, v2 / v1: ${si1 ? (si2 / si1).toFixed(4) : 'sin v1'}`)
p(`- Medio digital (v1 → v2, top): ${cuenta(g2, (x) => x.medio?.nombre).slice(0, 6).map(([k, n]) => `${k} ${n}`).join(' · ')}`)
p(`- Versiones sin id en la v2: ${g2.filter((x) => x.version?.id == null).length} · ids de versión distintos: ${new Set(g2.map((x) => x.version?.id)).size} · nombres distintos: ${new Set(g2.map((x) => norm(x.version?.nombre))).size}`)
p(`- Campos de una fila digital v2: ${g2[0] ? Object.keys(g2[0]).join(', ') : '(sin filas)'}`)
p()
p(`Pedidos totales a la v2: ${pedidosV2}`)

if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, salida.join('\n') + '\n')
