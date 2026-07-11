// Valida los fixtures contra un esquema DERIVADO de docs/Documentación API Integra Metrics.pdf.
// Falla (exit 1) si un fixture usa un campo que NO existe en la doc, o le falta un requerido,
// o hay un desajuste de tipo grosero. Ejecutar: npm run validate:fixtures
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const FX = join(ROOT, 'src', 'data', 'fixtures')
const read = (f) => JSON.parse(readFileSync(join(FX, f), 'utf8'))

// ── Campos DOCUMENTADOS de /registros (Descripción + "adicionales del ejemplo real") ──
const REGISTROS_DOC = new Set([
  // Descripción
  'id_unico', 'maname', 'fecha', 'rid', 'rfile', 'rinversion', 'rinversion_neta',
  'rinversion_dolares', 'rinversion_neta_dolares', 'HOUR', 'MINUTE', 'fingerprint',
  'cfile', 'ccodigo', 'palto', 'pancho', 'ppage', 'mname', 'mcodigo', 'mid',
  'mabierta_cable', 'agname', 'agid', 'cename', 'ceid', 'presname', 'gid', 'gname',
  'tid', 'tname', 'stname', 'vname', 'pid', 'pname', 'maid', 'ssname', 'ssid', 'sname',
  'sid', 'caname', 'caid', 'anname', 'anid', 'progid', 'progname', 'comid', 'comname',
  'genname', 'ciuname', 'duracion', 'duraseg', 'cadname', 'id_versiones_unica', 'tanda',
  'tanda_programa', 'posicion_tanda', 'numero_programa', 'cantidad_spots_tanda',
  'vprdisponible', 'fecha_tv', 'region_radio', 'fallas', 'codigo_universal', 'regiid',
  'latitud', 'longitud', 'direccion', 'localidad', 'primera_emision_comercial',
  'primera_emision_version', 'nuevas_versiones', 'duracion_tv', 'etiquetas', 'franja',
  // Adicionales presentes en el ejemplo real (nullable/opcionales)
  'mfrecuencia', 'murl', 'prodid', 'prodname', 'catid', 'catname', 'scatid', 'scatname',
  'rating', 'audiencia', 'alcance', 'spot_valorizado', 'pantalla', 'secname', 'secid', 'centra',
])
const REGISTROS_REQ = ['id_unico', 'maname', 'fecha', 'rinversion', 'nuevas_versiones', 'franja', 'tname']

// ── Campos DOCUMENTADOS de /registros-digital ──
const DIGITAL_DOC = new Set([
  'fecha', 'impresiones', 'inversion_dolares', 'inversion_moneda_local', 'pid', 'pname',
  'maid', 'maname', 'ssid', 'ssname', 'sid', 'sname', 'caid', 'caname',
  'id_medio_digital', 'medio_digital', 'version', 'advertisement',
])
const DIGITAL_REQ = ['fecha', 'impresiones', 'inversion_dolares', 'inversion_moneda_local', 'maname', 'medio_digital']

const errors = []
const fail = (m) => errors.push(m)

function checkArray(name, rows, allowed, required) {
  if (!Array.isArray(rows)) return fail(`${name}: no es un arreglo`)
  if (rows.length === 0) return fail(`${name}: vacío`)
  rows.forEach((r, i) => {
    for (const k of Object.keys(r)) {
      if (!allowed.has(k)) fail(`${name}[${i}]: campo NO documentado en el PDF: "${k}"`)
    }
    for (const k of required) {
      if (r[k] === undefined) fail(`${name}[${i}]: falta campo requerido "${k}"`)
    }
  })
}

// registros
const registros = read('registros.json')
checkArray('registros', registros, REGISTROS_DOC, REGISTROS_REQ)
// tipos/valores clave
registros.forEach((r, i) => {
  if (typeof r.fecha !== 'string' || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(r.fecha))
    fail(`registros[${i}].fecha formato inválido: ${r.fecha}`)
  if (!['DIA', 'PRIME', 'NOCHE', 'MADRUGADA'].includes(r.franja))
    fail(`registros[${i}].franja fuera del dominio: ${r.franja}`)
  if (!['NUEVO', ''].includes(r.nuevas_versiones))
    fail(`registros[${i}].nuevas_versiones fuera del dominio: ${r.nuevas_versiones}`)
  if (typeof r.rinversion !== 'number') fail(`registros[${i}].rinversion no es number`)
})

// registros-digital
checkArray('registros-digital', read('registros-digital.json'), DIGITAL_DOC, DIGITAL_REQ)

// catálogos {id,name}
const cat = read('catalogos.json')
for (const key of ['marcas', 'programas', 'medios', 'sectores', 'subsectores', 'categorias']) {
  if (!Array.isArray(cat[key])) fail(`catalogos.${key}: no es un arreglo`)
  else
    cat[key].forEach((it, i) => {
      if (it.id === undefined || it.name === undefined)
        fail(`catalogos.${key}[${i}]: falta {id,name}`)
    })
}

// trends y contexto: presencia mínima
const trends = read('trends.json')
if (!Array.isArray(trends.keywords) || !trends.diy) fail('trends: falta keywords o diy')
const contexto = read('contexto.json')
if (!contexto.criminalidad || !contexto.macro) fail('contexto: falta criminalidad o macro')

if (errors.length) {
  console.error(`❌ validate:fixtures — ${errors.length} problema(s):`)
  for (const e of errors.slice(0, 40)) console.error('  · ' + e)
  process.exit(1)
}
console.log('✅ validate:fixtures — todos los fixtures respetan el esquema del PDF.')
console.log(`   registros: ${registros.length} · campos permitidos: ${REGISTROS_DOC.size}`)
