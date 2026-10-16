// Data en movimiento: cada escenario de src/calculo/escenarios.js, en cada mes, tiene que dar una vista sin números
// rotos y con lecturas que se puedan leer. Si un escenario rompe una vista, la vista no era adaptativa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { armarVista, mesesDisponibles } from '../src/calculo/vista.js';
import { ESCENARIOS, aplicarEscenario } from '../src/calculo/escenarios.js';
import { numerosRotos, revisarTextos } from './revisar.mjs';

const leer = (f) => JSON.parse(readFileSync(new URL(`../public/data/${f}`, import.meta.url), 'utf8'));
const DATOS = { contrato: leer('algorithm.json'), medios: leer('medios.json'), mapa: leer('mapa-lima.json'), busquedas: leer('busquedas.json') };
const original = JSON.stringify(DATOS.contrato.meta);

for (const e of ESCENARIOS) {
  test(`escenario «${e.titulo}»: cada mes arma una vista sana y lecturas legibles`, () => {
    const d = aplicarEscenario(e.id, DATOS);
    for (const mes of mesesDisponibles(d.contrato.meta)) {
      const v = armarVista(d.contrato, d.medios, { mes }, {}, { mapa: d.mapa, busquedas: d.busquedas });
      assert.deepEqual(numerosRotos(v), [], `${e.id} ${mes}`);
      revisarTextos(v, `${e.id} ${mes}:`);
    }
  });
}

test('los escenarios no tocan la data original', () => {
  for (const e of ESCENARIOS) aplicarEscenario(e.id, DATOS);
  assert.equal(JSON.stringify(DATOS.contrato.meta), original);
});

test('los escenarios mueven lo que dicen mover', () => {
  const mes = mesesDisponibles(DATOS.contrato.meta).at(-1);
  const vista = (id) => { const d = aplicarEscenario(id, DATOS); return armarVista(d.contrato, d.medios, { mes }, {}, { mapa: d.mapa, busquedas: d.busquedas }); };
  const base = vista(null);
  const rival = (v) => v.lee.atl.marcas.find((m) => m.foco);
  assert.ok(rival(vista('competencia-fuerte')).share > rival(base).share, 'la competencia fuerte no sube su share');
  assert.ok(vista('competencia-fuerte').sugiere.queMirar.some((a) => a.id === 'sube-competencia'), 'la competencia fuerte no dispara la alerta de subida');
  assert.ok(vista('competencia-apagada').sugiere.queMirar.some((a) => a.id === 'competencia-sin-pauta'), 'la competencia apagada no dispara ninguna alerta');
  const unDia = vista('un-dia').sugiere.queMirar;
  assert.ok(unDia.some((a) => a.id === 'pocos-dias') && !unDia.some((a) => ['sube-competencia', 'baja-competencia', 'medio-nuevo', 'pico-competencia'].includes(a.id)), 'con un día de data se leen variaciones');
  assert.equal(vista('sin-paneles').lee.ooh?.paneles?.length ?? 0, 0);
  assert.equal(vista('un-dia').periodo.desde, vista('un-dia').periodo.hasta);
});
