// Sonda de solo lectura: ¿qué otras marcas de seguridad aparecen en Integrametrics, en qué medios y con cuántas
// piezas nuevas? No escribe en public/data ni hace commit: imprime totales en el log y deja un JSON como artefacto.
// Se borra del repo cuando se leen los resultados.
import { writeFileSync } from 'node:fs'
import { fetchRegistros, fetchRegistrosDigital, fetchCatalogo } from '../src/fuentes/integrametrics.js'
import { CLIENTE } from '../src/cliente.js'

const token = process.env.INTEGRAMETRICS_TOKEN
const HOY = process.env.SONDA_HASTA || new Date().toISOString().slice(0, 10)
const DESDE_ATL = process.env.SONDA_DESDE_ATL || '2026-01-01'
const DIAS_DIG = Number(process.env.SONDA_DIAS_DIGITAL || 90)
const BUSCA = /LIDERMAN|BOXER|HIKVISION|HIK ?VISION|EZVIZ|IMOU|TAPO|TP-?LINK|DAHUA|G4S|RESGUARDO|SECURITAS|HUNTER|ALARM|SEGURIDAD|VIGILAN|MONITOREO|CAMARA|CÁMARA|SMART ?HOME|RING\b|ADT\b/i
const SUBSEC = /SEGUR|ALARM|VIGILAN|CAMAR|CÁMAR|MONITOR/i
const nombre = (o) => o?.name ?? o?.maname ?? o?.nombre ?? o?.ssname ?? ''
const sumar = (m, k, r, extra = () => ({})) => {
  const a = m.get(k) || { registros: 0, inversion: 0, nuevas: 0, versiones: new Set(), primera: '9999', ultima: '0000', ...extra() }
  a.registros += 1; a.inversion += Number(r.rinversion ?? r.inversion_moneda_local ?? 0) || 0
  if (r.nuevas_versiones === 'NUEVO') a.nuevas += 1
  const v = r.vname ?? r.version; if (v) a.versiones.add(String(v))
  const f = String(r.fecha || '').slice(0, 10); if (f && f < a.primera) a.primera = f; if (f > a.ultima) a.ultima = f
  m.set(k, a); return a
}
const tabla = (m) => [...m.entries()].map(([k, a]) => ({ clave: k, registros: a.registros, inversion: Math.round(a.inversion), nuevas: a.nuevas, versiones: a.versiones.size, primera: a.primera, ultima: a.ultima }))
  .sort((x, y) => y.inversion - x.inversion || y.registros - x.registros)
const restar = (iso, d) => { const t = new Date(`${iso}T00:00:00Z`); t.setUTCDate(t.getUTCDate() - d); return t.toISOString().slice(0, 10) }

const out = { hasta: HOY, desdeAtl: DESDE_ATL, diasDigital: DIAS_DIG }

// 1 · Catálogos: nombres exactos de marcas y subsectores que se parecen a seguridad
for (const cat of ['marcas', 'subsectores']) {
  try {
    const lista = await fetchCatalogo({ token, name: cat })
    const arr = Array.isArray(lista) ? lista : Object.values(lista || {}).find(Array.isArray) || []
    const re = cat === 'marcas' ? BUSCA : SUBSEC
    out[cat] = { total: arr.length, campos: arr[0] ? Object.keys(arr[0]) : [], coinciden: arr.filter((o) => re.test(nombre(o))).map((o) => ({ id: o.id, name: nombre(o) })) }
  } catch (e) { out[cat] = { error: e.message } }
  console.log(`\n== Catálogo /${cat} ==`); console.log(JSON.stringify(out[cat], null, 1))
}

// 2 · ATL del año en los subsectores de seguridad (filtro en el servidor): todas las marcas que aparecen
const subs = [...CLIENTE.subsectores, ...(out.subsectores?.coinciden || []).map((s) => s.name)].filter((x, i, a) => a.indexOf(x) === i)
const atlSub = await fetchRegistros({ token, startDate: `${DESDE_ATL} 00:00:00`, endDate: `${HOY} 23:59:59`, filters: { ssname: subs } })
const porMarca = new Map(), porMarcaMedio = new Map()
for (const r of atlSub) { sumar(porMarca, `${r.maname} · ${r.ssname ?? ''}`, r); sumar(porMarcaMedio, `${r.maname} · ${r.gname}`, r) }
out.atlSubsectores = { subsectores: subs, registros: atlSub.length, porMarca: tabla(porMarca), porMarcaMedio: tabla(porMarcaMedio) }
console.log(`\n== ATL ${DESDE_ATL}→${HOY} en ${subs.join(' | ')} · ${atlSub.length} registros ==`)
console.table(out.atlSubsectores.porMarca); console.table(out.atlSubsectores.porMarcaMedio)

// 3 · ATL del año de las marcas del catálogo que se parecen a seguridad, estén en el subsector que estén
const yaSeguidas = new Set([CLIENTE.marcaFuente, ...CLIENTE.competencia.map((c) => c.marcaFuente)])
const nombres = (out.marcas?.coinciden || []).map((m) => m.name).filter((n) => !yaSeguidas.has(n)).slice(0, 80)
if (nombres.length) {
  const atlMarcas = await fetchRegistros({ token, startDate: `${DESDE_ATL} 00:00:00`, endDate: `${HOY} 23:59:59`, filters: { maname: nombres } })
  const m = new Map(); for (const r of atlMarcas) sumar(m, `${r.maname} · ${r.ssname ?? ''} · ${r.gname}`, r)
  out.atlMarcas = { marcas: nombres.length, registros: atlMarcas.length, tabla: tabla(m) }
  console.log(`\n== ATL ${DESDE_ATL}→${HOY} de ${nombres.length} marcas del catálogo · ${atlMarcas.length} registros ==`); console.table(out.atlMarcas.tabla)
}

// 4 · Digital de los últimos días (la API no filtra): por marca que se parece a seguridad o subsector de seguridad
const dig = new Map(); let filasDig = 0
for (let d = restar(HOY, DIAS_DIG - 1); d <= HOY; d = restar(d, -1)) {
  const rows = await fetchRegistrosDigital({ token, startDate: `${d} 00:00:00`, endDate: `${d} 23:59:59` })
  for (const r of Array.isArray(rows) ? rows : []) {
    filasDig += 1
    if (!(SUBSEC.test(r.ssname || '') || BUSCA.test(r.maname || ''))) continue
    sumar(dig, `${r.maname} · ${r.ssname ?? ''} · ${r.medio_digital ?? ''}`, r)
  }
}
out.digital = { filasLeidas: filasDig, tabla: tabla(dig) }
console.log(`\n== Digital, últimos ${DIAS_DIG} días · ${filasDig} filas leídas ==`); console.table(out.digital.tabla)

writeFileSync('sonda-marcas.json', JSON.stringify(out, null, 1))
console.log('\nsonda-marcas.json listo')
