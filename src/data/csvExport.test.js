import { test } from 'node:test'
import assert from 'node:assert/strict'
import { registrosToCSV, CSV_COLUMNS } from './csvExport.js'

const sample = [
  {
    fecha: '2026-07-10 09:41:12',
    HOUR: 9,
    MINUTE: 41,
    ciuname: 'LIMA',
    localidad: null,
    gname: 'TELEVISIÓN',
    mname: 'AMÉRICA TV',
    progname: 'AMÉRICA NOTICIAS',
    maname: 'PROSEGUR ALARMS',
    vname: 'Nada es seguro, salvo tu hogar',
    franja: 'PRIME',
    tname: 'SPOT TV',
    rinversion: 84300,
    rinversion_dolares: 22907.6,
  },
]

test('CSV: encabezado con las llaves compartidas §A.7', () => {
  const csv = registrosToCSV(sample, { tipoCambio: 3.68 })
  const [header] = csv.split('\n')
  assert.equal(header, CSV_COLUMNS.join(','))
  for (const key of ['fecha', 'hora', 'zona', 'medio', 'marca']) assert.ok(header.includes(key))
})

test('CSV: una fila por registro con hora HH:MM y zona resueltas', () => {
  const csv = registrosToCSV(sample, { tipoCambio: 3.68 })
  const lines = csv.split('\n')
  assert.equal(lines.length, 2) // header + 1
  const row = lines[1]
  assert.ok(row.includes('2026-07-10'))
  assert.ok(row.includes('09:41'))
  assert.ok(row.includes('LIMA')) // zona cae a ciuname si no hay localidad
  assert.ok(row.includes('AMÉRICA TV'))
})

test('CSV: escapa comas y comillas en la versión creativa', () => {
  const csv = registrosToCSV(
    [{ ...sample[0], vname: 'Protege, verifica y responde "ya"' }],
    { tipoCambio: 3.68 },
  )
  assert.ok(csv.includes('"Protege, verifica y responde ""ya"""'))
})

test('CSV: sin registros → solo encabezado', () => {
  const csv = registrosToCSV([], {})
  assert.equal(csv.split('\n').length, 1)
})
