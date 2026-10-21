import test from 'node:test';
import assert from 'node:assert/strict';
import { frenteAObjetivos, MARGEN_AVANCE } from '../src/calculo/plataformas.js';

const MES = { inversion: 3100, leads: 310, bookings: 31, l2b: 10, cpl: 10, cpb: 100 };
const obj = (...meses) => meses.map((mes) => ({ mes, ...MES }));
const total = (t) => ({ inversion: 0, leads: 0, bookings: 0, l2b: null, cpl: null, cpb: null, ...t });

test('objetivos: dentro de un mes, lo que toca es la parte de los días elegidos', () => {
  // 20 de 31 días: toca 64,5 %; 2000 de 3100 es 64,5 %
  const o = frenteAObjetivos(total({ inversion: 2000, leads: 200, bookings: 18 }), obj('2026-10'), '2026-10-01', '2026-10-20');
  assert.equal(o.dias, 20); assert.equal(o.unMes, true); assert.equal(o.mesCompleto, false);
  assert.ok(Math.abs(o.toca - (20 / 31) * 100) < 1e-9);
  assert.equal(o.inversion.objetivo, 3100, 'dentro de un mes se muestra el objetivo del mes');
  assert.equal(o.inversion.tono, 'bien', 'llega a lo que toca');
  assert.equal(o.leads.tono, 'bien');
  // 18 de 20 que tocan: falta 10 % → rojo
  assert.equal(o.bookings.tono, 'mal');
});

test('objetivos: el margen es relativo a lo que toca, también en una semana', () => {
  // 7 de 31 días: tocan 7 bookings; 6,7 es 4,3 % menos (sin tono) y 6,6 es 5,7 % menos (rojo)
  const casi = frenteAObjetivos(total({ bookings: 6.7 }), obj('2026-10'), '2026-10-07', '2026-10-13');
  const lejos = frenteAObjetivos(total({ bookings: 6.6 }), obj('2026-10'), '2026-10-07', '2026-10-13');
  assert.equal(casi.bookings.tono, null, `a menos de ${MARGEN_AVANCE} % no hay color`);
  assert.equal(lejos.bookings.tono, 'mal');
});

test('objetivos: el mes cerrado se compara con el objetivo entero', () => {
  const o = frenteAObjetivos(total({ leads: 310, bookings: 29 }), obj('2026-10'), '2026-10-01', '2026-10-31');
  assert.equal(o.mesCompleto, true); assert.equal(o.toca, 100);
  assert.equal(o.leads.tono, 'bien'); assert.equal(o.bookings.tono, 'mal');
});

test('objetivos: un tramo que cruza meses suma lo que toca a cada día', () => {
  // del 21 de setiembre (30 días) al 10 de octubre (31 días): 10 días de cada mes
  const o = frenteAObjetivos(total({ inversion: 2000 }), obj('2026-09', '2026-10'), '2026-09-21', '2026-10-10');
  const esperado = 10 * (3100 / 30) + 10 * (3100 / 31);
  assert.equal(o.unMes, false); assert.equal(o.toca, 100);
  assert.ok(Math.abs(o.inversion.objetivo - esperado) < 1e-9);
});

test('objetivos: el mínimo y el tope no dependen de los días', () => {
  const o = frenteAObjetivos(total({ l2b: 9.6, cpl: 10.45, cpb: 107 }), obj('2026-10'), '2026-10-01', '2026-10-05');
  assert.equal(o.l2b.tono, null, '4 % bajo el mínimo: sin color');
  assert.equal(o.cpl.tono, null, '4,5 % sobre el tope: sin color');
  assert.equal(o.cpb.tono, 'mal', '7 % sobre el tope: rojo');
  assert.equal(frenteAObjetivos(total({ cpb: 100 }), obj('2026-10'), '2026-10-01', '2026-10-05').cpb.tono, 'bien', 'en el tope cumple');
});

test('objetivos: un mes sin objetivo no inventa nada', () => {
  assert.equal(frenteAObjetivos(total({ inversion: 1 }), obj('2026-10'), '2026-09-28', '2026-10-02'), null);
  assert.equal(frenteAObjetivos(total({ inversion: 1 }), [], '2026-10-01', '2026-10-02'), null);
  assert.equal(frenteAObjetivos(total({}), obj('2026-10'), '2026-10-01', '2026-10-02').l2b, null, 'sin L2B no hay avance de L2B');
});
