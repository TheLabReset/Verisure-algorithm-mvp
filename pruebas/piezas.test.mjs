// Piezas y campañas: lo que reporta cada plataforma, con un estado por fila y umbrales fijos. La inversión de las
// piezas suma la de su plataforma, cada estado sale de su umbral, y los textos hablan del período en pasado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plataformasDeEjemplo, piezasDeEjemplo } from '../src/muestra/ejemplo.js';
import { leerPiezas, UMBRALES_PIEZAS } from '../src/calculo/piezas.js';
import { piezasLectura, piezaDato } from '../src/textos/lecturas.js';

const datos = plataformasDeEjemplo('2026-01-01', '2026-10-22');
const crudas = piezasDeEjemplo(datos);
const P = { desde: '2026-09-23', hasta: '2026-10-22' };

test('piezas: cada día, lo que gastan las piezas de una plataforma es lo que gastó la plataforma', () => {
  for (const d of [datos.dias[10], datos.dias[150], datos.dias.at(-1)]) {
    const fila = crudas.dias.find((x) => x.fecha === d.fecha);
    for (const p of ['meta', 'google', 'tiktok']) {
      const piezas = Object.entries(fila).filter(([k]) => k.startsWith(`${p}-`)).reduce((s, [, v]) => s + v.inversion, 0);
      assert.ok(Math.abs(piezas - d[p].inversion) < 1e-6, `${p} ${d.fecha}`);
    }
  }
});

test('piezas: el total del período sale en dólares, con Google pasado de euros', () => {
  const x = leerPiezas(crudas, datos, P);
  const tasa = datos.tipoCambio.EUR.usd;
  const crudo = (p) => crudas.dias.filter((d) => d.fecha >= P.desde && d.fecha <= P.hasta).reduce((s, d) => s + Object.entries(d).filter(([k]) => k.startsWith(`${p}-`)).reduce((t, [, v]) => t + v.inversion, 0), 0);
  assert.ok(Math.abs(x.total - (crudo('meta') + crudo('tiktok') + crudo('google') * tasa)) < 1e-6);
  assert.equal(leerPiezas(crudas, { ...datos, tipoCambio: {} }, P), null);
});

test('piezas: cada estado respeta su umbral', () => {
  const x = leerPiezas(crudas, datos, P), U = UMBRALES_PIEZAS;
  for (const p of x.piezas) {
    if (p.estado === 'aprendizaje') assert.ok(p.edad < U.diasAprendizaje);
    else assert.ok(p.edad >= U.diasAprendizaje, p.nombre);
    if (['sin-leads', 'costosa', 'rinde', 'saturada'].includes(p.estado)) assert.ok(p.inversion >= U.vecesGasto * p.base, p.nombre);
    if (p.estado === 'sin-leads') assert.equal(p.leads, 0);
    if (p.estado === 'costosa') assert.ok(p.cpl / p.base >= U.vecesCostosa);
    if (p.estado === 'rinde') assert.ok(p.cpl / p.base < U.vecesCostosa);
    if (p.estado === 'saturada') assert.ok(p.fatiga >= U.vecesSaturada && p.plataforma !== 'google');
  }
  // la muestra trae de todo, para que la maqueta enseñe cada estado
  for (const e of ['sin-leads', 'costosa', 'saturada', 'rinde', 'aprendizaje']) assert.ok(x.porEstado[e].n > 0, e);
  // Google, la búsqueda, es la que mejor rinde en la muestra: el lead más barato
  const cpl = Object.fromEntries(x.bases.map((b) => [b.id, b.cpl]));
  assert.ok(cpl.google < cpl.meta && cpl.google < cpl.tiktok);
  // lo que va primero sigue al aire
  assert.equal(x.piezas[0].alAire, true);
});

test('piezas: los textos hablan del período en pasado, concuerdan en género y dicen qué pasó', () => {
  const x = { total: 1000, piezas: [{ estado: 'sin-leads', inversion: 100 }, { estado: 'costosa', inversion: 50 }, { estado: 'costosa', inversion: 50 }, { estado: 'rinde', inversion: 600 }], conjuntos: [{ estado: 'costosa', inversion: 30 }], campanas: [] };
  assert.equal(piezasLectura(x).titulo, 'Una pieza gastó sin traer leads y dos salieron costosas');
  assert.equal(piezasLectura(x, 'conjunto').titulo, 'Un conjunto salió costoso');
  assert.equal(piezasLectura(x, 'campana').titulo, 'Ninguna campaña gastó sin traer leads ni salió costosa');
  assert.match(piezasLectura(x).lectura, /^Se llevaron el 20\s% de la inversión\. Las que rindieron, el 60\s%\.$/);
  const base = { nivel: 'pieza', plataformaNombre: 'Meta Ads', base: 30, inversion: 1490, edad: 17 };
  assert.equal(piezaDato({ ...base, estado: 'costosa', cpl: 45 }), 'Cada lead costó $45; el promedio de Meta Ads fue $30.');
  assert.equal(piezaDato({ ...base, estado: 'sin-leads' }), 'Gastó $1490 en 17 días y no trajo leads.');
  assert.equal(piezaDato({ ...base, estado: 'saturada', saturacion: { antes: 20, ahora: 49 } }), 'Su lead costaba $20; en la última semana, $49.');
  assert.equal(piezaDato({ ...base, estado: 'aprendizaje', edad: 1 }), 'Lleva 1 día al aire.');
  assert.equal(piezaDato({ ...base, estado: 'aprendizaje', edad: 5, alAire: false }), 'Estuvo 5 días al aire.');
  assert.equal(piezaDato({ ...base, nivel: 'conjunto', estado: 'poca-data', inversion: 40 }), 'Gastó $40: todavía es poco para juzgarlo.');
});

test('piezas: una campaña con piezas que piden mirarse lo dice en su por qué, y va primero', () => {
  const g = { nivel: 'campana', estado: 'rinde', plataformaNombre: 'Meta Ads', cpl: 26, base: 31, cuenta: { 'sin-leads': 1, costosa: 2, saturada: 0, rinde: 3 } };
  assert.equal(piezaDato(g), 'Una pieza gastó sin traer leads y dos salieron costosas.');
  assert.equal(piezaDato({ ...g, cuenta: { rinde: 4 } }), 'Cada lead costó $26; el promedio de Meta Ads fue $31.');
  const x = leerPiezas(crudas, datos, P);
  const revisar = (c) => c.cuenta['sin-leads'] + c.cuenta.costosa + c.cuenta.saturada;
  for (let i = 1; i < x.campanas.length; i++) assert.ok(revisar(x.campanas[i - 1]) >= revisar(x.campanas[i]));
});
