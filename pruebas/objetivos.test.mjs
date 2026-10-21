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
  assert.equal(o.toca, 65, 'lo que toca va redondeado, como se ve en el pie');
  assert.equal(o.inversion.objetivo, 3100, 'dentro de un mes se muestra el objetivo del mes');
  assert.equal(o.inversion.tono, 'bien', 'llega a lo que toca');
  assert.equal(o.leads.tono, 'bien');
  // 18 de 20 que tocan: falta 10 % → rojo
  assert.equal(o.bookings.tono, 'mal');
});

test('objetivos: el margen va en puntos de lo que se ve, también en una semana', () => {
  // 7 de 31 días: toca 23 %. 6,7 de 31 se ve 22 % (un punto atrás, sin tono); 5,6 se ve 18 % (cinco, sin tono);
  // 5,3 se ve 17 % (seis puntos atrás, rojo)
  const ver = (b) => frenteAObjetivos(total({ bookings: b }), obj('2026-10'), '2026-10-07', '2026-10-13').bookings.tono;
  assert.equal(ver(6.7), null, `a ${MARGEN_AVANCE} puntos o menos no hay color`);
  assert.equal(ver(5.6), null, 'justo en el margen, sin color');
  assert.equal(ver(5.3), 'mal');
  assert.equal(ver(7.2), 'bien');
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
  const o = frenteAObjetivos(total({ l2b: 9.6, cpl: 10.45, cpb: 107 }), obj('2026-10'), '2026-10-01', '2026-10-10');
  assert.equal(o.l2b.tono, null, '4 % bajo el mínimo: sin color');
  assert.equal(o.cpl.tono, null, 'se ve 105 %: cinco puntos sobre el tope, sin color');
  assert.equal(o.cpb.tono, 'mal', '7 % sobre el tope: rojo');
  assert.equal(frenteAObjetivos(total({ cpb: 100 }), obj('2026-10'), '2026-10-01', '2026-10-10').cpb.tono, 'bien', 'en el tope cumple');
});

test('objetivos: un mes sin objetivo no inventa nada', () => {
  assert.equal(frenteAObjetivos(total({ inversion: 1 }), obj('2026-10'), '2026-09-28', '2026-10-02'), null);
  assert.equal(frenteAObjetivos(total({ inversion: 1 }), [], '2026-10-01', '2026-10-02'), null);
  assert.equal(frenteAObjetivos(total({}), obj('2026-10'), '2026-10-01', '2026-10-02').l2b, null, 'sin L2B no hay avance de L2B');
});

test('objetivos: los días sin data no tocan, y con menos de 7 días no hay color', () => {
  // del 1 al 20 con data solo del 1 al 14: tocan 14 de 31 días (45 %), no 20
  const conData = new Set(Array.from({ length: 14 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`));
  const o = frenteAObjetivos(total({ inversion: 1400 }), obj('2026-10'), '2026-10-01', '2026-10-20', conData);
  assert.equal(o.dias, 14); assert.equal(o.sinData, 6); assert.equal(o.toca, 45);
  assert.equal(o.inversion.tono, 'bien', '1400 de 3100 es 45 %: llega a lo que toca a los días con data');
  const pocos = frenteAObjetivos(total({ bookings: 0, inversion: 9000, leads: 1 }), obj('2026-10'), '2026-10-01', '2026-10-05');
  assert.equal(pocos.pocos, true);
  assert.ok(['inversion', 'leads', 'bookings'].every((k) => pocos[k].tono === null), 'con cinco días, sin color');
});

test('objetivos: la inversión que se pasa del presupuesto también es roja', () => {
  // 20 de 31 días: toca 65 %; 2200 de 3100 se ve 71 % (seis puntos de más)
  assert.equal(frenteAObjetivos(total({ inversion: 2200 }), obj('2026-10'), '2026-10-01', '2026-10-20').inversion.tono, 'mal');
  assert.equal(frenteAObjetivos(total({ inversion: 2150 }), obj('2026-10'), '2026-10-01', '2026-10-20').inversion.tono, 'bien', 'cinco puntos de más: todavía bien');
});

test('objetivos: un costo con inversión y sin bookings va en rojo; un objetivo en 0 no se compara', () => {
  const o = frenteAObjetivos(total({ inversion: 500, leads: 50, bookings: 0, cpl: 10, cpb: null }), obj('2026-10'), '2026-10-01', '2026-10-10');
  assert.deepEqual([o.cpb.avance, o.cpb.tono], [null, 'mal']);
  const cero = [{ mes: '2026-09', ...MES }, { mes: '2026-10', ...MES, bookings: 0 }];
  assert.equal(frenteAObjetivos(total({ bookings: 100 }), cero, '2026-09-21', '2026-10-20').bookings, null, 'un mes con objetivo en 0 deja la cifra sin avance');
});
