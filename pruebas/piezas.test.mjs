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
    if (p.estado === 'aprendiendo') assert.ok(p.edad < U.diasAprendizaje);
    else assert.ok(p.edad >= U.diasAprendizaje, p.nombre);
    if (['sin-leads', 'cara', 'rinde', 'cansada', 'en-linea'].includes(p.estado)) assert.ok(p.inversion >= U.vecesGasto * p.base, p.nombre);
    if (p.estado === 'sin-leads') assert.equal(p.leads, 0);
    if (p.estado === 'cara') assert.ok(p.cpl / p.base >= U.vecesCara);
    if (p.estado === 'rinde') assert.ok(p.cpl / p.base <= 1 / U.vecesCara);
    if (p.estado === 'cansada') assert.ok(p.fatiga >= U.vecesFatiga && p.plataforma !== 'google');
  }
  // la muestra trae de todo, para que la maqueta enseñe cada estado
  for (const e of ['sin-leads', 'cara', 'rinde', 'aprendiendo', 'en-linea']) assert.ok(x.porEstado[e].n > 0, e);
  // lo que va primero sigue al aire
  assert.equal(x.piezas[0].alAire, true);
});

test('piezas: los textos hablan del período en pasado y concuerdan en género', () => {
  const x = { total: 1000, piezas: [{ estado: 'sin-leads', inversion: 100 }, { estado: 'cara', inversion: 50 }, { estado: 'cara', inversion: 50 }], conjuntos: [{ estado: 'cara', inversion: 30 }], campanas: [] };
  assert.equal(piezasLectura(x).titulo, 'Una pieza gastó sin traer leads y dos salieron caras');
  assert.equal(piezasLectura(x, 'conjunto').titulo, 'Un conjunto salió caro');
  assert.equal(piezasLectura(x, 'campana').titulo, 'Ninguna campaña gastó sin traer leads ni salió cara');
  assert.match(piezasLectura(x).lectura, /^Entre todas se llevaron \$200, el 20\s% de la inversión\.$/);
  assert.equal(piezaDato({ estado: 'cara', nivel: 'pieza', cpl: 45, base: 30 }), 'Su lead cuesta 50\u00a0% más que el promedio');
});
