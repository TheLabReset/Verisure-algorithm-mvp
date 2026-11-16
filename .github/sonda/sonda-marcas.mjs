// Sonda de solo lectura: qué marcas de un rubro registra Integrametrics en digital y cómo vienen escritas.
// No escribe nada en el repo ni imprime inversión: solo nombres, conteos, fechas y plataformas, en el log y en el
// resumen del job. No lleva nombres de marcas: el rubro se elige por la taxonomía (categoría, sector, subsector).
import { appendFileSync } from 'node:fs'

const BASE = 'https://pe.integra-metrics.com/api/rest/v1'
const token = process.env.INTEGRAMETRICS_TOKEN
if (!token) { console.error('::error::Falta INTEGRAMETRICS_TOKEN'); process.exit(1) }

const sumar = (dia, n) => { const d = new Date(`${dia}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
const HASTA = process.env.SONDA_HASTA || sumar(new Date().toISOString().slice(0, 10), -1)
const DESDE = process.env.SONDA_DESDE || sumar(HASTA, -182)
const RUBRO = new RegExp(process.env.SONDA_RUBRO || 'EDUC|UNIVERS|INSTITUT|ACADEM', 'i')
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim()

const ESPERAS = [3000, 10000]
const pausa = (ms) => new Promise((r) => setTimeout(r, ms))
async function getJSON(url) {
  for (let i = 0; ; i += 1) {
    let res, error
    try { res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } }) } catch (e) { error = e }
    const pasajero = error || res.status >= 500 || res.status === 429
    if (!pasajero) { if (!res.ok) throw new Error(`respondió ${res.status}`); return res.json() }
    if (i >= ESPERAS.length) throw error || new Error(`respondió ${res.status}`)
    await pausa(ESPERAS[i])
  }
}
const urlDia = (dia) => {
  const u = new URL(`${BASE}/registros-digital`)
  u.searchParams.set('startDate', `${dia} 00:00:00`); u.searchParams.set('endDate', `${dia} 23:59:59`)
  return u.toString()
}

const marcas = new Map(), taxonomia = new Map(), filasPorDia = []
const fallidos = []
let campos = null
const sumarEn = (m, k) => m.set(k, (m.get(k) || 0) + 1)

console.log(`Sonda digital ${DESDE} → ${HASTA}, rubro /${RUBRO.source}/`)
for (let dia = DESDE; dia <= HASTA; dia = sumar(dia, 1)) {
  let filas
  try { filas = await getJSON(urlDia(dia)) } catch (e) { fallidos.push(`${dia} (${e.message})`); continue }
  if (!Array.isArray(filas)) { fallidos.push(`${dia} (no es un arreglo)`); continue }
  filasPorDia.push([dia, filas.length])
  if (!campos && filas.length) campos = Object.keys(filas[0])
  for (const r of filas) {
    const tax = `${norm(r.caname)} > ${norm(r.sname)} > ${norm(r.ssname)}`
    if (!RUBRO.test(tax)) continue
    sumarEn(taxonomia, tax)
    const nombre = norm(r.maname)
    if (!marcas.has(nombre)) marcas.set(nombre, { crudos: new Set(), maid: new Set(), filas: 0, dias: new Set(), versiones: new Set(), anuncios: new Map(), plataformas: new Map(), productos: new Map(), tax: new Set() })
    const m = marcas.get(nombre)
    m.crudos.add(JSON.stringify(r.maname)); m.maid.add(r.maid); m.filas += 1
    const f = String(r.fecha).slice(0, 10)
    m.dias.add(f); m.versiones.add(norm(r.version)); sumarEn(m.plataformas, norm(r.medio_digital)); sumarEn(m.productos, norm(r.pname)); m.tax.add(tax)
    const a = r.advertisement || `(sin url) ${norm(r.version)}`
    if (!m.anuncios.has(a)) m.anuncios.set(a, new Set())
    m.anuncios.get(a).add(f)
  }
  if (filasPorDia.length % 30 === 0) console.log(`  ${dia}: ${filasPorDia.length} días leídos`)
}

const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k || '(vacío)'} ${v}`).join(' · ')
const filasMarca = [...marcas.entries()].sort((a, b) => b[1].filas - a[1].filas)
const vol = filasPorDia.map(([, n]) => n)
const lineas = []
const p = (s = '') => { lineas.push(s); console.log(s) }

p(`## Sonda de marcas en digital: ${DESDE} a ${HASTA}`)
p()
p(`- Días leídos: ${filasPorDia.length}. Días que fallaron: ${fallidos.length}${fallidos.length ? ` (${fallidos.slice(0, 10).join(', ')})` : ''}`)
p(`- Filas digitales por día, todas las marcas: mínimo ${Math.min(...vol)}, máximo ${Math.max(...vol)}`)
p(`- Días sin una sola fila (todas las marcas): ${filasPorDia.filter(([, n]) => !n).map(([d]) => d).join(', ') || 'ninguno'}`)
p(`- Campos de una fila: ${campos ? campos.join(', ') : '(sin filas)'}`)
p(`- Marcas del rubro: ${marcas.size}`)
p()
p('### Taxonomías del rubro (categoría > sector > subsector, filas)')
for (const [t, n] of [...taxonomia.entries()].sort((a, b) => b[1] - a[1])) p(`- ${t}: ${n}`)
p()
p('### Marcas del rubro')
p('| Marca (normalizada) | Como viene | maid | Filas | Días con filas | Versiones | Anuncios | Fechas por anuncio | Primera | Última | Plataformas | Productos | Subsector |')
p('|---|---|---|---:|---:|---:|---:|---:|---|---|---|---|---|')
for (const [nombre, m] of filasMarca) {
  const fechas = [...m.dias].sort()
  const porAnuncio = [...m.anuncios.values()].map((s) => s.size)
  const prom = (porAnuncio.reduce((s, x) => s + x, 0) / porAnuncio.length).toFixed(2)
  p(`| ${nombre} | ${[...m.crudos].join(' / ')} | ${[...m.maid].join(' / ')} | ${m.filas} | ${m.dias.size} | ${m.versiones.size} | ${m.anuncios.size} | ${prom} (máx ${Math.max(...porAnuncio)}) | ${fechas[0]} | ${fechas.at(-1)} | ${top(m.plataformas, 4)} | ${top(m.productos, 3)} | ${[...m.tax].map((t) => t.split(' > ')[2]).join(' / ')} |`)
}
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lineas.join('\n') + '\n')
if (fallidos.length > filasPorDia.length / 10) { console.error(`::error::Fallaron ${fallidos.length} días`); process.exit(1) }
