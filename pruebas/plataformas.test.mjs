// Las filas marcadas en las tablas de plataformas: el mejor tramo es el de menor costo por booking; el peor, el de
// mayor costo, o uno con inversión y sin bookings. La semana incompleta no entra y con menos de tres no se marca nada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extremos, leerPlataformas } from '../src/calculo/plataformas.js';
import { plataformasDeEjemplo } from '../src/muestra/ejemplo.js';

const t = (cpb, extra = {}) => ({ inversion: cpb * 10, bookings: 10, cpb, ...extra });

test('extremos: menor y mayor costo por booking', () => {
  const f = [t(300), t(220), t(410), t(260)];
  assert.deepEqual(extremos(f), { mejor: f[1], peor: f[2] });
});

test('extremos: un tramo con inversión y sin bookings es el peor', () => {
  const f = [t(300), t(220), { inversion: 500, bookings: 0, cpb: null }, t(410)];
  assert.equal(extremos(f).peor, f[2]);
});

test('extremos: la semana incompleta no entra, y con menos de tres no se marca', () => {
  const f = [t(100, { dias: 3 }), t(300, { dias: 7 }), t(240, { dias: 7 }), t(280, { dias: 7 })];
  assert.equal(extremos(f).mejor, f[2]);
  assert.deepEqual(extremos([t(300), t(200)]), { mejor: null, peor: null });
  assert.deepEqual(extremos([t(300), t(300), t(300)]), { mejor: null, peor: null });
});

test('extremos sobre la data de ejemplo: coinciden con el mínimo y el máximo recalculados', () => {
  const datos = plataformasDeEjemplo('2026-06-14', '2026-07-13');
  const x = leerPlataformas(datos, { desde: '2026-06-14', hasta: '2026-07-13' });
  const e = extremos(x.diaria);
  const cpbs = x.diaria.map((d) => d.inversion / d.bookings);
  assert.equal(e.mejor.inversion / e.mejor.bookings, Math.min(...cpbs));
  assert.equal(e.peor.inversion / e.peor.bookings, Math.max(...cpbs));
});
