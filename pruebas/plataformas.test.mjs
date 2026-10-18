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
