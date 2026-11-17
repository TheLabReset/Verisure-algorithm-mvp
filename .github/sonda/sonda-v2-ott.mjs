// Segunda sonda: ¿dónde están en la v2 los registros ATL que la v1 trae y la v2 no (OTT y algo de vía pública)?
// Solo lectura, sin montos. Las marcas salen de src/cliente.js.
import { appendFileSync } from 'node:fs'
import { fetchRegistros } from '../../src/fuentes/integrametrics.js'
import { CLIENTE } from '../../src/cliente.js'

const T1 = process.env.INTEGRAMETRICS_TOKEN, T2 = process.env.INTEGRAMETRICS_TOKEN_V2
const ORIGEN = 'https://pe.integra-metrics.com', V2 = `${ORIGEN}/api/rest/v2`
const DESDE = '2026-10-01', HASTA = '2026-10-31'
const salida = [], p = (s = '') => { salida.push(s); console.log(s) }
async function v2(path, params, max = Infinity) {
  const u = new URL(V2 + path)
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v))
  let url = u.toString(); const filas = []
  while (url && filas.length < max) {
    let res
    for (let i = 0; ; i += 1) {
      res = await fetch(url, { headers: { Authorization: `Bearer ${T2}` } })
      if (res.status === 429 && i < 4) { const h = res.headers.get('retry-after'); await new Promise((ok) => setTimeout(ok, 1000 * (h != null && !Number.isNaN(Number(h)) ? Number(h) : 5))); continue }
      break
    }
    if (!res.ok) return { error: `${res.status} ${(await res.text()).slice(0, 200)}`, filas }
    const j = await res.json(); filas.push(...(j.data || []))
    url = j.links?.next ? ORIGEN + j.links.next.replace(ORIGEN, '') : null
  }
  return { filas }
}
const cuenta = (arr, f) => { const m = new Map(); for (const x of arr) { const k = f(x); m.set(k, (m.get(k) || 0) + 1) } return [...m.entries()].sort((a, b) => b[1] - a[1]) }

p('## Sonda v2: los registros que faltan')
const propia = (await v2('/atl/marcas', { q: CLIENTE.marcaFuente, limit: 100 })).filas.find((x) => x.nombre === CLIENTE.marcaFuente)?.id
const a1 = await fetchRegistros({ token: T1, startDate: `${DESDE} 00:00:00`, endDate: '2026-11-01 00:00:00', filters: { maname: [CLIENTE.marcaFuente] } })
const a2 = (await v2('/atl/registros', { startDate: DESDE, endDate: HASTA, limit: 1000, filters: { marcaId: [propia] } })).filas
const en2 = new Set(a2.map((x) => String(x.id)))
const faltan = a1.filter((r) => !en2.has(String(r.id_unico)))
p(`- Marca propia: v1 ${a1.length} · v2 ${a2.length} · faltan en la v2 ${faltan.length}`)
p(`- Los que faltan, por medio y canal: ${cuenta(faltan, (r) => `${r.gname} / ${r.mname}`).slice(0, 12).map(([k, n]) => `${k} ${n}`).join(' · ')}`)
p(`- Tipo de aviso de los que faltan: ${cuenta(faltan, (r) => r.tname).map(([k, n]) => `${k} ${n}`).join(' · ')}`)
p(`- Todo el OTT de la v1 falta en la v2: ${a1.filter((r) => r.gname === 'OTT STREAMING/LIVE').length} OTT en la v1, ${faltan.filter((r) => r.gname === 'OTT STREAMING/LIVE').length} faltan`)
const ooh = faltan.filter((r) => r.gname === 'VIA PUBLICA')
p(`- Vía pública que falta: ${ooh.map((r) => `${r.id_unico} ${String(r.fecha).slice(0, 10)} ${r.tname} ${r.mname} lat=${r.latitud ?? 'null'}`).join(' | ')}`)
const oohV1 = a1.filter((r) => r.gname === 'VIA PUBLICA')
p(`- Vía pública en la v1: ${oohV1.length} · con coordenadas ${oohV1.filter((r) => r.latitud != null).length} · las que faltan con coordenadas ${ooh.filter((r) => r.latitud != null).length}`)

// 1) ¿existen esos ids en la v2 pidiéndolos por id?
const ids = faltan.map((r) => Number(r.id_unico))
let hallados = []
for (let i = 0; i < ids.length; i += 100) { const r = await v2('/atl/registros', { startDate: DESDE, endDate: HASTA, limit: 1000, filters: { id: ids.slice(i, i + 100) } }); if (r.error) { p(`- Pedir por id: ${r.error}`); break } hallados.push(...r.filas) }
p(`- Pedidos por id en la v2: ${hallados.length} de ${ids.length} aparecen`)
// 2) OTT por tipo de medio, con y sin la marca
for (const [n, f] of [['OTT de la marca (tipoMedioId 7)', { marcaId: [propia], tipoMedioId: 7 }], ['OTT de cualquier marca (tipoMedioId 7)', { tipoMedioId: 7 }], ['Vía pública de la marca (tipoMedioId 5)', { marcaId: [propia], tipoMedioId: 5 }]]) {
  const r = await v2('/atl/registros', { startDate: DESDE, endDate: HASTA, limit: 1000, filters: f }, 1000)
  p(`- ${n}: ${r.error ?? `${r.filas.length}${r.filas.length >= 1000 ? ' o más' : ''} registros`}${r.filas[0] ? ` (ejemplo: ${r.filas[0].medio?.nombre}, tipo ${r.filas[0].medio?.tipo})` : ''}`)
}
// 3) los canales OTT en el catálogo de medios de la v2
const med = await v2('/atl/medios', { limit: 1000, filters: { tipoMedioId: 7 } })
p(`- Catálogo v2 de medios OTT: ${med.error ?? `${med.filas.length} medios; ${med.filas.slice(0, 8).map((x) => x.nombre).join(', ')}`}`)
const canales = [...new Set(faltan.filter((r) => r.gname === 'OTT STREAMING/LIVE').map((r) => r.mname))]
for (const c of canales.slice(0, 4)) {
  const cat = await v2('/atl/medios', { limit: 50, q: c })
  const r = await v2('/atl/registros', { startDate: DESDE, endDate: HASTA, limit: 1000, filters: { medioNombre: c } }, 1000)
  p(`- Canal OTT «${c}»: en el catálogo v2 ${cat.error ?? (cat.filas.map((x) => `${x.nombre} (tipo ${x.tipoMedioId})`).join(', ') || 'no está')} · registros v2 con medioNombre: ${r.error ?? r.filas.length}`)
}
// 4) ¿la v2 por fecha y medio, sin filtro de marca, trae el registro? (un registro OTT concreto)
const uno = faltan.find((r) => r.gname === 'OTT STREAMING/LIVE')
if (uno) {
  const f = String(uno.fecha).slice(0, 19)
  const r = await v2('/atl/registros', { startDate: f, endDate: f, limit: 100 })
  p(`- Un OTT concreto (${uno.id_unico}, ${f}, ${uno.mname}): la v2 sin filtros en ese segundo trae ${r.error ?? r.filas.length} registros: ${r.filas?.slice(0, 5).map((x) => `${x.id} ${x.medio?.nombre} ${x.marca?.nombre}`).join(' | ') ?? ''}`)
}
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, salida.join('\n') + '\n')
