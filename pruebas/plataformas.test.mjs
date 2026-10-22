// Las filas marcadas en las tablas de plataformas: el mejor tramo es el de más bookings y el peor el de menos (el costo
// desempata). El costo pesa solo si se dispara a tres veces el promedio. La semana incompleta no entra y con menos de
// tres tramos no se marca nada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extremos, leerPlataformas } from '../src/calculo/plataformas.js';
import { plataformasDeEjemplo } from '../src/muestra/ejemplo.js';

// un tramo con sus bookings y su inversión
const t = (bookings, inversion, extra = {}) => ({ bookings, inversion, cpb: bookings ? inversion / bookings : null, ...extra });

test('extremos: más y menos bookings, aunque el costo diga otra cosa', () => {
  const f = [t(10, 3000), t(12, 3600), t(7, 1400), t(9, 2000)];
  // el de 7 bookings es el más barato por booking (200), igual es el peor
  assert.deepEqual(extremos(f), { mejor: f[1], peor: f[2] });
});

test('extremos: en un empate de bookings decide el costo por booking', () => {
  const f = [t(7, 1700), t(12, 2700), t(7, 2000), t(7, 1500)];
  assert.equal(extremos(f).peor, f[2]);
  const g = [t(12, 3000), t(12, 2600), t(7, 1500), t(9, 2000)];
  assert.equal(extremos(g).mejor, g[1]);
});

test('extremos: un costo disparado (tres veces el promedio) es el peor aunque tenga bookings, y nunca el mejor', () => {
  // el de 12 bookings cuesta unas dos veces el promedio por booking: no llega a tres, sigue siendo el mejor
  const f = [t(12, 10000), t(10, 1500), t(8, 1300), t(4, 1200)];
  assert.equal(extremos(f).mejor, f[0]);
  // promedio = 11 300 / 27 ≈ 419; el de 6 bookings cuesta 1500 por booking (más de tres veces): es el peor, aunque el
  // de 3 bookings tenga menos
  const g = [t(10, 1000), t(8, 1000), t(3, 300), t(6, 9000)];
  assert.equal(extremos(g).peor, g[3]);
  const h = [t(10, 1000), t(8, 1000), t(4, 1000), t(0, 500)];
  assert.equal(extremos(h).peor, h[3]);
});

test('extremos: la semana incompleta no entra, y con menos de tres no se marca', () => {
  const f = [t(30, 900, { dias: 3 }), t(20, 6000, { dias: 7 }), t(25, 6000, { dias: 7 }), t(22, 6000, { dias: 7 })];
  assert.equal(extremos(f).mejor, f[2]);
  assert.deepEqual(extremos([t(10, 2000), t(8, 2000)]), { mejor: null, peor: null });
  assert.deepEqual(extremos([t(9, 2000), t(9, 2000), t(9, 2000)]), { mejor: null, peor: null });
});

test('extremos sobre la data de ejemplo: coinciden con el máximo y el mínimo de bookings recalculados', () => {
  const datos = plataformasDeEjemplo('2026-01-01', '2026-07-13');
  const x = leerPlataformas(datos, { desde: '2026-07-07', hasta: '2026-07-13' });
  const e = extremos(x.diaria);
  assert.equal(e.mejor.bookings, Math.max(...x.diaria.map((d) => d.bookings)));
  assert.equal(e.peor.bookings, Math.min(...x.diaria.map((d) => d.bookings)));
});

test('la tabla de plataformas: las partes suman 100, Push y Pull suman lo suyo y las semanas cuentan días, no filas', () => {
  const datos = plataformasDeEjemplo('2026-01-01', '2026-10-16');
  const x = leerPlataformas(datos, { desde: '2026-09-17', hasta: '2026-10-16', compararDesde: '2026-08-18', compararHasta: '2026-09-16' });
  const suma = (k) => x.plataformas.reduce((s, p) => s + p[k], 0);
  assert.equal(suma('parteInversion'), 100);
  assert.equal(suma('parteBookings'), 100);
  assert.equal(x.tipos.reduce((s, g) => s + g.parteBookings, 0), 100);
  // el total semana a semana: siete días como máximo aunque cada día traiga una fila por plataforma
  assert.ok(x.semanas.every((s) => s.dias <= 7), 'una semana del total cuenta filas en vez de días');
  assert.ok(x.tipos.every((g) => g.semanas.every((s) => s.dias <= 7)), 'una semana de Push o Pull cuenta filas en vez de días');
  for (const p of x.plataformas) assert.ok(p.semanasSobreObjetivo.de > 0 && p.semanasSobreObjetivo.encima <= p.semanasSobreObjetivo.de);
});

// Google Ads reporta en euros; el panel suma en dólares con el tipo de cambio que viene con la data
test('moneda: la inversión en euros se pasa a dólares al entrar, y el total se rederiva desde la data cruda', () => {
  const datos = plataformasDeEjemplo('2026-10-01', '2026-10-21');
  const tasa = datos.tipoCambio.EUR.usd;
  const x = leerPlataformas(datos, { desde: '2026-10-01', hasta: '2026-10-21' });
  const crudo = (id) => datos.dias.reduce((s, d) => s + d[id].inversion, 0);
  const google = x.plataformas.find((p) => p.id === 'google'), meta = x.plataformas.find((p) => p.id === 'meta');
  assert.equal(google.moneda, 'EUR');
  assert.equal(google.inversionMoneda, crudo('google'));
  assert.ok(Math.abs(google.inversion - crudo('google') * tasa) < 1e-6);
  assert.equal(meta.inversion, crudo('meta'));
  assert.equal(meta.inversionMoneda, null);
  assert.ok(Math.abs(x.total.inversion - (crudo('meta') + crudo('tiktok') + crudo('google') * tasa)) < 1e-6);
  // el costo por lead de Google ya sale en dólares
  const leads = datos.dias.reduce((s, d) => s + d.google.leads, 0);
  assert.ok(Math.abs(google.cpl - (crudo('google') * tasa) / leads) < 1e-9);
  assert.deepEqual(x.cambios.map((c) => [c.moneda, c.plataformas]), [['EUR', ['Google Ads']]]);
  // la data cruda no cambia
  assert.equal(datos.dias[0].google.inversionMoneda, undefined);
});

test('moneda: sin tipo de cambio para los euros no se suma nada', () => {
  const datos = plataformasDeEjemplo('2026-10-01', '2026-10-21');
  assert.equal(leerPlataformas({ ...datos, tipoCambio: {} }, { desde: '2026-10-01', hasta: '2026-10-21' }), null);
  assert.equal(leerPlataformas({ ...datos, tipoCambio: { EUR: { usd: 0 } } }, { desde: '2026-10-01', hasta: '2026-10-21' }), null);
});

test('moneda: la nota dice la tasa, la fuente y la fecha, y solo va con la cuenta que cambia', async () => {
  const { monedaNota } = await import('../src/textos/lecturas.js');
  const cambios = [{ moneda: 'EUR', usd: 1.1205, fecha: '2026-10-22', fuente: 'Banco Central Europeo', plataformas: ['Google Ads'] }];
  assert.equal(monedaNota(cambios), 'En dólares. Google Ads reporta en euros: cada euro, a 1,1205 dólares (Banco Central Europeo, 22 de octubre).');
  assert.equal(monedaNota(cambios, 'Meta Ads'), null);
  assert.equal(monedaNota([]), 'En dólares.');
});
