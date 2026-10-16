// Data en movimiento: cada escenario de src/calculo/escenarios.js, en cada mes, tiene que dar una vista sin números
// rotos y con lecturas que se puedan leer. Si un escenario rompe una vista, la vista no era adaptativa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { armarVista, mesesDisponibles } from '../src/calculo/vista.js';
import { ESCENARIOS, aplicarEscenario } from '../src/calculo/escenarios.js';
import { periodoDelMes, diasEntre, DIAS_MINIMOS } from '../src/calculo/periodo.js';
import { numerosRotos, revisarTextos } from './revisar.mjs';
import { CLIENTE } from '../src/cliente.js';

const leer = (f) => JSON.parse(readFileSync(new URL(`../public/data/${f}`, import.meta.url), 'utf8'));
const DATOS = { contrato: leer('algorithm.json'), medios: leer('medios.json'), mapa: leer('mapa-lima.json'), busquedas: leer('busquedas.json') };
// toda la data, no solo meta: un escenario que mutara una fila del contrato, de medios o de búsquedas cambiaría la data real
const original = JSON.stringify(DATOS);

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
  for (const e of ESCENARIOS) {
    const meses = mesesDisponibles(DATOS.contrato.meta);
    for (const mes of [undefined, meses[0], meses.at(-1)]) aplicarEscenario(e.id, DATOS, { mes });
    assert.ok(JSON.stringify(DATOS) === original, `«${e.titulo}» cambió la data original`);
  }
});

test('los escenarios mueven lo que dicen mover', (t) => {
  // un mes con días suficientes para leer variaciones, fijo frente a la data viva: el pipeline corre estas pruebas
  // antes de bajar data nueva, y el día 1 de un mes el último mes tiene un solo día
  const meses = mesesDisponibles(DATOS.contrato.meta);
  // y con inversión de la competencia en la comparación: si el mes anterior no tiene, no hay subida que leer
  const idRival = CLIENTE.competencia[0].marcaFuente;
  const conPauta = (desde, hasta) => DATOS.contrato.daily.some((d) => d.fecha >= desde && d.fecha <= hasta && d.brands[idRival]?.spend > 0);
  const mes = [...meses].reverse().find((m) => { const P = periodoDelMes(DATOS.contrato.meta, m); return diasEntre(P.desde, P.hasta) + 1 >= DIAS_MINIMOS && P.compararDesde && conPauta(P.compararDesde, P.compararHasta) && conPauta(P.desde, P.hasta); });
  // sin un mes así (una data que no tiene dos meses seguidos con pauta de la competencia) no hay subida que mover
  if (!mes) return t.skip('la data no tiene un mes con pauta de la competencia en él y en el anterior');
  const vista = (id) => { const d = aplicarEscenario(id, DATOS, { mes }); return armarVista(d.contrato, d.medios, { mes }, {}, { mapa: d.mapa, busquedas: d.busquedas }); };
  const base = vista(null);
  const rival = (v) => v.lee.atl.marcas.find((m) => m.foco);
  assert.ok(rival(vista('competencia-fuerte')).share > rival(base).share, 'la competencia fuerte no sube su share');
  assert.ok(vista('competencia-fuerte').sugiere.queMirar.some((a) => a.id === 'sube-competencia'), 'la competencia fuerte no dispara la alerta de subida');
  assert.ok(vista('competencia-apagada').sugiere.queMirar.some((a) => a.id === 'competencia-sin-pauta'), 'la competencia apagada no dispara ninguna alerta');
  const unDia = aplicarEscenario('un-dia', DATOS);
  const vu = armarVista(unDia.contrato, unDia.medios, { mes: mesesDisponibles(unDia.contrato.meta).at(-1) }, {}, {});
  assert.equal(vu.periodo.desde, vu.periodo.hasta);
  const alertasUnDia = vu.sugiere.queMirar;
  assert.ok(alertasUnDia.some((a) => a.id === 'pocos-dias') && !alertasUnDia.some((a) => ['sube-competencia', 'baja-competencia', 'medio-nuevo', 'pico-competencia'].includes(a.id)), 'con un día de data se leen variaciones');
  assert.equal(vista('sin-paneles').lee.ooh?.paneles?.length ?? 0, 0);
  if (base.analiza.busquedas) assert.ok(vista('pico-trends').analiza.busquedas.camaras.crecimiento > base.analiza.busquedas.camaras.crecimiento, 'el pico de búsquedas no sube las búsquedas');
});
