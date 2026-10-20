// Las marcas vigiladas (src/cliente.js) se bajan con la competencia y se separan al llegar: van solo a
// vigiladas.json. El contrato, el CSV del BI y medios.json quedan idénticos a una corrida sin ellas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, copyFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { correrPipeline } from '../scripts/run-pipeline.mjs';
import { emisionesDe } from '../src/fuentes/medios.js';
import { CLIENTE } from '../src/cliente.js';

const DATA = new URL('../public/data/', import.meta.url).pathname;
const masDias = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ULTIMO = JSON.parse(readFileSync(join(DATA, 'algorithm.json'), 'utf8')).meta.lastDay;
const DIA = masDias(ULTIMO, 1);
const [RIVAL] = CLIENTE.competencia;
const [V1, V2, V3] = CLIENTE.vigiladas;

const ATL = [
  { id_unico: 991001, maname: RIVAL.marcaFuente, fecha: `${DIA} 07:15:00`, rinversion: 1200, hour: 7, minute: 15, gname: 'RADIO', mname: 'RPP FM', tname: 'SPOT', vname: 'VERSION DE PRUEBA', id_versiones_unica: 991001, franja: 'DIA', progname: 'PROGRAMA DE PRUEBA', ciuname: 'LIMA' },
];
const ATL_VIG = [
  { id_unico: 992001, maname: V1.marcaFuente, fecha: `${DIA} 08:20:00`, rinversion: 400, hour: 8, minute: 20, gname: 'RADIO', mname: 'OXIGENO FM', tname: 'SPOT RADIO', vname: 'VIGILADA EN RADIO', id_versiones_unica: 992001, franja: 'DIA', progname: 'LA MAÑANA', ciuname: 'LIMA', nuevas_versiones: 'NUEVO', rfile: 'https://ejemplo.invalid/a.mp3' },
  { id_unico: 992002, maname: V2.marcaFuente, fecha: `${DIA} 00:00:00`, rinversion: 3000, gname: 'VIA PUBLICA', tname: 'TORRE UNIPOLAR', vname: 'VIGILADA EN LA CALLE', id_versiones_unica: 992002, latitud: -12.09, longitud: -77.02, direccion: 'AV. DE PRUEBA SIN NUMERO', ciuname: 'LIMA', rfile: 'https://ejemplo.invalid/p.jpg' },
];
const DIGITAL = [{ fecha: DIA, maname: RIVAL.marcaFuente, ssname: CLIENTE.subsectores[0], inversion_moneda_local: 900, impresiones: 50000, medio_digital: 'FACEBOOK', version: 'PIEZA DIGITAL DE PRUEBA', advertisement: 'https://ejemplo.invalid/d.jpg' }];
const DIGITAL_VIG = [
  // una vigilada en otro subsector entra igual: se sigue por su nombre, no por subsector
  { fecha: DIA, maname: V2.marcaFuente, ssname: 'TIENDAS DE TECNOLOGIA', inversion_moneda_local: 300, impresiones: 9000, medio_digital: 'INSTAGRAM', version: 'CAMARAS DE PRUEBA', advertisement: 'https://ejemplo.invalid/v2.jpg' },
  { fecha: DIA, maname: V3.marcaFuente, ssname: 'SEGURIDAD PRIVADA', inversion_moneda_local: 200, impresiones: 4000, medio_digital: 'FACEBOOK', version: 'PORTERIA DE PRUEBA', advertisement: 'https://ejemplo.invalid/v3.jpg' },
  // una marca que no se sigue, en otro subsector, no entra a ningún lado
  { fecha: DIA, maname: 'MARCA AJENA', ssname: 'TIENDAS DE TECNOLOGIA', inversion_moneda_local: 100, impresiones: 1, medio_digital: 'FACEBOOK', version: 'NO', advertisement: null },
];

const api = (conVigiladas) => async (url) => {
  const u = new URL(url);
  const dia = (u.searchParams.get('startDate') || '').slice(0, 10);
  const digital = u.pathname.endsWith('/registros-digital');
  const cuerpo = dia !== DIA ? [] : digital ? [...DIGITAL, ...(conVigiladas ? DIGITAL_VIG : [])] : [...ATL, ...(conVigiladas ? ATL_VIG : [])];
  return new Response(JSON.stringify(cuerpo), { status: 200 });
};

function copia() {
  const dir = mkdtempSync(join(tmpdir(), 'vigiladas-'));
  for (const f of ['algorithm.json', 'export.csv']) copyFileSync(join(DATA, f), join(dir, f));
  return dir;
}
const leer = (dir, f) => readFileSync(join(dir, f), 'utf8');
const correr = (dir, con) => correrPipeline({ token: 'prueba', fetchImpl: api(con), out: dir, hoy: masDias(DIA, 1), ventana: 3, stamp: '2026-01-01T00:00:00Z', log: () => {} });

test('vigiladas: el contrato, el CSV y medios.json quedan idénticos a una corrida sin ellas', async () => {
  const con = copia(), sin = copia();
  try {
    await correr(con, true); await correr(sin, false);
    for (const f of ['algorithm.json', 'export.csv', 'medios.json']) assert.equal(leer(con, f), leer(sin, f), `${f} no cambia por las vigiladas`);
    for (const f of ['algorithm.json', 'export.csv', 'medios.json']) for (const v of CLIENTE.vigiladas) assert.ok(!leer(con, f).includes(v.marcaFuente), `${v.nombre} no aparece en ${f}`);
  } finally { rmSync(con, { recursive: true, force: true }); rmSync(sin, { recursive: true, force: true }); }
});

test('vigiladas: van a vigiladas.json con sus estrenos, paneles, piezas digitales y emisiones, sin duplicar', async () => {
  const dir = copia();
  try {
    await correr(dir, true);
    const revisar = () => {
      const v = JSON.parse(leer(dir, 'vigiladas.json'));
      assert.deepEqual(v.meta.marcas, CLIENTE.vigiladas.map((x) => x.marcaFuente));
      assert.equal(v.events.length, 1); assert.equal(v.events[0].maname, V1.marcaFuente);
      assert.equal(v.ooh.length, 1); assert.equal(v.ooh[0].maname, V2.marcaFuente);
      assert.deepEqual(v.digital.pieces.map((p) => p.maname).sort(), [V2.marcaFuente, V3.marcaFuente].sort(), 'por nombre, en cualquier subsector; la marca ajena no entra');
      const radio = emisionesDe(v.medios, V1.marcaFuente, DIA, DIA);
      assert.equal(radio.length, 1); assert.equal(radio[0].programa, 'LA MAÑANA');
      assert.ok(!JSON.stringify(v).includes(RIVAL.marcaFuente) && !JSON.stringify(v).includes('MARCA AJENA'), 'ni la competencia ni otras marcas');
    };
    revisar();
    await correr(dir, true); // la misma ventana otra vez
    revisar();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('vigiladas: lo commiteado fuera de la ventana se queda', async () => {
  const dir = copia();
  try {
    await correr(dir, true);
    // dos días después llega solo la competencia: la ventana nueva no trae vigiladas y lo de antes sigue
    const DIA2 = masDias(DIA, 2);
    const soloRival = async (url) => {
      const u = new URL(url), dia = (u.searchParams.get('startDate') || '').slice(0, 10);
      const cuerpo = dia === DIA2 && !u.pathname.endsWith('/registros-digital') ? ATL.map((r) => ({ ...r, id_unico: 993001, fecha: `${DIA2} 07:15:00` })) : [];
      return new Response(JSON.stringify(cuerpo), { status: 200 });
    };
    await correrPipeline({ token: 'prueba', fetchImpl: soloRival, out: dir, hoy: masDias(DIA2, 1), ventana: 2, stamp: '2026-01-01T00:00:00Z', log: () => {} });
    assert.equal(JSON.parse(leer(dir, 'algorithm.json')).meta.lastDay, DIA2, 'la corrida nueva sí escribió');
    const v = JSON.parse(leer(dir, 'vigiladas.json'));
    assert.equal(v.meta.ventana.desde > DIA, true, 'la ventana nueva ya no incluye el día de las vigiladas');
    assert.equal(emisionesDe(v.medios, V1.marcaFuente, DIA, DIA).length, 1);
    assert.equal(v.ooh.length, 1);
    assert.equal(v.digital.pieces.length, 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

import { armarVista } from '../src/calculo/vista.js';

test('vigiladas en la vista: apariciones por tarjeta, avisos propios y nada en las alertas generales', async () => {
  const dir = copia();
  try {
    await correr(dir, true);
    const contrato = JSON.parse(leer(dir, 'algorithm.json')), medios = JSON.parse(leer(dir, 'medios.json')), vigiladas = JSON.parse(leer(dir, 'vigiladas.json'));
    const mapa = JSON.parse(readFileSync(join(DATA, 'mapa-lima.json'), 'utf8'));
    const filtros = { desde: masDias(DIA, -6), hasta: DIA };
    const v = armarVista(contrato, medios, filtros, { hoy: masDias(DIA, 1) }, { mapa, vigiladas });
    const g = v.lee.vigiladas;
    assert.ok(g, 'con su archivo, la vista trae las vigiladas');
    const de = (tarjeta) => g.apariciones.filter((a) => a.tarjeta === tarjeta).map((a) => a.marca).sort();
    assert.deepEqual(de('digital'), [V2.marcaFuente, V3.marcaFuente].sort());
    assert.deepEqual(de('radio'), [V1.marcaFuente]);
    assert.deepEqual(de('ooh'), [V2.marcaFuente]);
    assert.deepEqual(de('tv'), []);
    assert.equal(g.avisos.length, 4, 'un aviso por marca y tarjeta');
    assert.equal(g.digital[V2.marcaFuente].piezas, 1);
    assert.equal(g.radio[V1.marcaFuente].emisiones.length, 1);
    assert.equal(g.radio[V1.marcaFuente].emisiones[0].nueva, true);
    assert.equal(g.ooh[V2.marcaFuente].porMarca[V2.marcaFuente], 1);
    assert.ok(g.ooh[V2.marcaFuente].ubicaciones.some((u) => u.vigilada === 2 && !u.foco), 'su punto lleva su color, no el de la competencia');
    // sin respaldo: una vigilada sin nada en el período no muestra lo último que tuvo
    assert.equal(g.digital[V1.marcaFuente].piezas, 0);
    // las alertas generales (y con ellas MAIA) no las leen; la competencia sigue igual
    const sin = armarVista(contrato, medios, filtros, { hoy: masDias(DIA, 1) }, { mapa });
    assert.equal(sin.lee.vigiladas, null, 'sin su archivo no hay vigiladas');
    assert.deepEqual(v.sugiere.queMirar.map((a) => a.id), sin.sugiere.queMirar.map((a) => a.id));
    assert.deepEqual(v.lee.ooh.porMarca, sin.lee.ooh.porMarca);
    assert.deepEqual(v.lee.atl.marcas.map((m) => m.inversion), sin.lee.atl.marcas.map((m) => m.inversion));
    // un archivo con otra forma cuenta como que no llegó
    assert.equal(armarVista(contrato, medios, filtros, { hoy: masDias(DIA, 1) }, { mapa, vigiladas: { meta: {}, pieces: [] } }).lee.vigiladas, null);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
