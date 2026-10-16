// Cadenas nacionales: una compra nacional sale en Lima y en sus repetidoras (o en la app y la web del canal) a la
// misma hora, con S/ 0 en las repetidoras. Es un spot, no siete. Una regional con inversión propia, o que no coincide
// con Lima, es compra local y cuenta aparte.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { repeticiones, mismaCadena, CAMPOS_CSV, CAMPOS_API } from '../src/fuentes/cadenas.js';
import { leerCsv, mediosDesdeCsv } from '../src/fuentes/medios.js';
import { buildAlgorithm } from '../src/fuentes/agregado.js';

const fila = (medio, hora, inversion, extra = {}) => ({ fecha: '2026-07-01', hora: `${hora}:00`, marca: 'X', version: 'V1', grupo_medio: 'RADIO', medio, inversion_soles: String(inversion), zona: 'LIMA', ...extra });

test('cadenas: qué emisora es la principal de una repetidora', () => {
  assert.ok(mismaCadena('OXIGENO (AQP)', 'OXIGENO FM'));
  assert.ok(mismaCadena('LATINA (APP)', 'LATINA TV'));
  assert.ok(mismaCadena('ATV (TRU)', 'ATV'));
  assert.ok(!mismaCadena('ATV (TRU)', 'ATV+'), 'ATV+ es otro canal');
  assert.ok(!mismaCadena('ATV (TRU)', 'ATV (PIU)'), 'una regional no es principal de otra');
  assert.ok(!mismaCadena('OXIGENO FM', 'OXIGENO FM'));
});

test('cadenas: Lima con inversión y sus repetidoras a la misma hora (o hasta dos minutos después) son un spot', () => {
  const filas = [fila('OXIGENO FM', '07:19', 228), fila('OXIGENO (AQP)', '07:19', 0), fila('OXIGENO (CIX)', '07:20', 0), fila('OXIGENO (PIU)', '07:21', 0),
    fila('OXIGENO (CUZ)', '07:25', 0), fila('OXIGENO (TRU)', '07:19', 50), fila('RITMO ROMANTICA (HYO)', '07:19', 0), fila('OXIGENO (HYO)', '07:19', 0, { version: 'OTRA' })];
  const r = repeticiones(filas, CAMPOS_CSV);
  assert.deepEqual([...r.keys()].map((x) => x.medio).sort(), ['OXIGENO (AQP)', 'OXIGENO (CIX)', 'OXIGENO (PIU)']);
  // a 6 minutos, con inversión propia, de otra cadena o de otra versión: cuenta aparte
  const m = mediosDesdeCsv(['fecha,hora,zona,grupo_medio,medio,programa,marca,version,franja,tipo,inversion_soles', ...filas.map((f) => [f.fecha, f.hora, f.zona, f.grupo_medio, f.medio, '', f.marca, f.version, 'DIA', 'SPOT', f.inversion_soles].join(','))].join('\n'));
  assert.equal(m.meses['2026-07'].X.emisiones, 5);
});

test('cadenas: el contrato cuenta un spot por compra nacional y la inversión no cambia', () => {
  const reg = (mname, hour, minute, rinversion) => ({ maname: 'X', fecha: `2026-07-01 ${hour}:${minute}:00`, hour, minute, vname: 'V1', gname: 'RADIO', mname, rinversion, franja: 'DIA' });
  const a = buildAlgorithm([reg('OXIGENO FM', 7, 19, 228), reg('OXIGENO (AQP)', 7, 19, 0), reg('OXIGENO (CIX)', 7, 20, 0), reg('RPP FM (AQP)', 9, 0, 0)], [], { source: 'prueba' });
  const b = a.daily[0].brands.X;
  assert.deepEqual([b.spend, b.spots, b.byFranja.DIA], [228, 2, 2]);
  assert.deepEqual(a.pieces[0].channels.sort(), ['OXIGENO FM', 'RPP FM (AQP)']);
  assert.equal(CAMPOS_API.minuto({ fecha: '2026-07-01 07:05:09', hour: 7, minute: 5 }), '2026-07-01 07:05');
});

test('cadenas: en la data real, las repeticiones suman S/ 0 y los spots del contrato salen del CSV sin ellas', () => {
  const filas = leerCsv(readFileSync(new URL('../public/data/export.csv', import.meta.url), 'utf8'));
  const r = repeticiones(filas, CAMPOS_CSV);
  assert.ok(r.size > 0);
  assert.equal([...r.keys()].reduce((s, x) => s + (Number(x.inversion_soles) || 0), 0), 0, 'una repetición con inversión no es repetición');
  const a = JSON.parse(readFileSync(new URL('../public/data/algorithm.json', import.meta.url), 'utf8'));
  const spots = a.daily.reduce((s, d) => s + Object.values(d.brands).reduce((t, b) => t + b.spots, 0), 0);
  assert.equal(spots, filas.length - r.size);
});
