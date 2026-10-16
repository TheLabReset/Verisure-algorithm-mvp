// El pipeline de punta a punta, con la API de Integrametrics simulada: un día nuevo entra al contrato, al CSV, a
// medios.json y al contexto de MAIA, la vista se arma con eso y correrlo dos veces no duplica nada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, copyFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { correrPipeline } from '../scripts/run-pipeline.mjs';
import { armarContexto } from '../scripts/armar-contexto.mjs';
import { armarVista } from '../src/calculo/vista.js';
import { CLIENTE } from '../src/cliente.js';

const DATA = new URL('../public/data/', import.meta.url).pathname;
const DIA = '2026-07-14';
const [RIVAL] = CLIENTE.competencia;
const ATL = [
  { id_unico: 990001, maname: RIVAL.marcaFuente, fecha: `${DIA} 07:15:00`, rinversion: 1200, hour: 7, minute: 15, gname: 'RADIO', mname: 'RPP FM', tname: 'SPOT', vname: 'VERSION DE PRUEBA', id_versiones_unica: 990001, franja: 'DIA', progname: 'PROGRAMA DE PRUEBA', ciuname: 'LIMA' },
  { id_unico: 990002, maname: CLIENTE.marcaFuente, fecha: `${DIA} 21:40:00`, rinversion: 30000, hour: 21, minute: 40, gname: 'TV ABIERTA', mabierta_cable: 1, mname: 'LATINA TV', tname: 'SPOT', vname: 'OTRA VERSION DE PRUEBA', id_versiones_unica: 990002, franja: 'PRIME', progname: 'NOTICIERO DE PRUEBA', ciuname: 'LIMA' },
];
const DIGITAL = [{ fecha: DIA, maname: RIVAL.marcaFuente, ssname: CLIENTE.subsectores[0], inversion_moneda_local: 900, impresiones: 50000, medio_digital: 'FACEBOOK', version: 'PIEZA DIGITAL DE PRUEBA', advertisement: 'https://ejemplo.invalid/p.jpg' }];

// La API simulada responde el día nuevo y nada en los otros días de la ventana
const fetchImpl = async (url) => {
  const u = new URL(url);
  const dia = (u.searchParams.get('startDate') || '').slice(0, 10);
  const cuerpo = u.pathname.endsWith('/registros-digital') ? (dia === DIA ? DIGITAL : []) : (dia === DIA ? ATL : []);
  return new Response(JSON.stringify(cuerpo), { status: 200 });
};

function copiaDeLaData() {
  const dir = mkdtempSync(join(tmpdir(), 'pipeline-'));
  for (const f of ['algorithm.json', 'export.csv', 'mapa-lima.json', 'busquedas.json']) copyFileSync(join(DATA, f), join(dir, f));
  return dir;
}
const leer = (dir, f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));

test('pipeline: un día nuevo llega al contrato, al CSV, a medios y a MAIA, sin duplicar', async () => {
  const dir = copiaDeLaData();
  try {
    const antes = leer(join(DATA), 'algorithm.json');
    const correr = () => correrPipeline({ token: 'prueba', fetchImpl, out: dir, hoy: '2026-07-15', ventana: 3, log: () => {} });
    await correr();
    const a = leer(dir, 'algorithm.json');
    assert.equal(a.meta.lastDay, DIA, 'el último día del contrato pasa al día nuevo');
    const dia = a.daily.find((d) => d.fecha === DIA);
    assert.equal(dia.brands[RIVAL.marcaFuente].spend, 1200);
    assert.equal(dia.brands[CLIENTE.marcaFuente].spend, 30000);
    assert.equal(a.digital.daily.find((d) => d.fecha === DIA).brands[RIVAL.marcaFuente].spend, 900);
    assert.equal(a.daily.length, antes.daily.length + 1, 'los días anteriores siguen todos');
    const csv = readFileSync(join(dir, 'export.csv'), 'utf8');
    assert.equal(csv.split('\n').filter((l) => l.startsWith(DIA)).length, 2);
    const medios = leer(dir, 'medios.json');
    assert.ok(medios.meses['2026-07'][RIVAL.marcaFuente].programas['PROGRAMA DE PRUEBA'] === 1);

    // idempotente: la misma ventana otra vez no suma de nuevo
    await correr();
    const b = leer(dir, 'algorithm.json');
    assert.equal(b.daily.find((d) => d.fecha === DIA).brands[RIVAL.marcaFuente].spend, 1200);
    assert.equal(readFileSync(join(dir, 'export.csv'), 'utf8').split('\n').filter((l) => l.startsWith(DIA)).length, 2);

    // el contexto de MAIA y la vista se arman con la data nueva
    const c = armarContexto(dir);
    assert.equal(c.corte.integrametrics, DIA);
    const v = armarVista(b, leer(dir, 'medios.json'), { mes: '2026-07' }, { hoy: '2026-07-15' }, { mapa: leer(dir, 'mapa-lima.json'), busquedas: leer(dir, 'busquedas.json') });
    assert.equal(v.periodo.hasta, DIA);
    assert.equal(v.fuentes[0].estado, 'ok', 'con data de ayer la fuente está al día');
    assert.ok(v.lee.estrenos !== null && v.analiza.pautaSemanal.atl);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('pipeline: sin token falla con un mensaje claro y no toca la data', async () => {
  const dir = copiaDeLaData();
  try {
    const antes = readFileSync(join(dir, 'algorithm.json'), 'utf8');
    await assert.rejects(() => correrPipeline({ token: null, fetchImpl, out: dir, log: () => {} }), /INTEGRAMETRICS_TOKEN/);
    assert.equal(readFileSync(join(dir, 'algorithm.json'), 'utf8'), antes);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
