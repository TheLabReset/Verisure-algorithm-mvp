import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { armarVista } from '../src/calculo/vista.js';
import { alerta } from '../src/textos/lecturas.js';
import { CLIENTE } from '../src/cliente.js';

const leer = (f) => JSON.parse(readFileSync(new URL(`../public/data/${f}`, import.meta.url)));
const contrato = leer('algorithm.json'), medios = leer('medios.json');

test('pauta propia: avisa los medios donde la competencia invierte más que la marca propia, con su umbral', () => {
  const v = armarVista(contrato, medios, { desde: contrato.meta.firstDay, hasta: contrato.meta.lastDay }, {}, {});
  const atl = v.lee.atl, propia = atl.marcas.find((m) => m.propia);
  // se rederiva desde la data: los medios de cada rival con 5 % o más de su ATL y 20 % más que la marca propia
  for (const rival of atl.marcas.filter((m) => !m.propia && m.inversion > 0)) {
    const nuevos = new Set(v.sugiere.queMirar.filter((x) => x.id === 'medio-nuevo' && x.marca === rival.nombre).flatMap((x) => x.medios.map((y) => y.nombre)));
    const esperado = Object.entries(rival.medios).filter(([k, x]) => x > 0 && Math.round((x / rival.inversion) * 100) >= 5 && x >= (propia.medios[k] || 0) * 1.2).length;
    const aviso = v.sugiere.queMirar.find((x) => x.id === 'medio-adelante' && x.marca === rival.nombre);
    assert.equal((aviso?.medios.length || 0) + [...nuevos].length >= esperado, true, `${rival.nombre}: ${esperado} medios adelante`);
    if (esperado && !nuevos.size) assert.ok(aviso, `${rival.nombre} va adelante en ${esperado} medio(s) y no se avisa`);
  }
  for (const a of v.sugiere.queMirar.filter((x) => x.id === 'medio-adelante')) {
    const rival = atl.marcas.find((m) => m.nombre === a.marca);
    for (const x of a.medios) {
      assert.ok(x.pct >= 5, `${x.nombre}: pesa ${x.pct} % de la inversión ATL de ${a.marca}`);
      assert.ok(x.monto >= x.propia * 1.2, `${x.nombre}: ${a.marca} le saca al menos 20 %`);
      const k = Object.keys(rival.medios).find((key) => rival.medios[key] === x.monto);
      assert.equal(x.propia, propia.medios[k] || 0, 'el monto propio sale del mismo medio');
    }
    const t = alerta(a);
    assert.ok(t.titulo.includes(CLIENTE.nombre) && t.titulo.startsWith(a.marca), 'empieza por la competencia y nombra a la marca propia');
    assert.doesNotMatch(`${t.titulo} ${t.dato}`, /\b(deber[ií]a|tiene que|hay que|conviene|recomend)/i, 'observa, no ordena');
  }
  // sin medios donde la competencia va adelante, no hay aviso (un mes en que la marca propia está en todos con más)
  const rivalSinAtl = armarVista(contrato, medios, { desde: '2026-10-01', hasta: '2026-10-20' }, {}, {});
  assert.ok(!rivalSinAtl.sugiere.queMirar.some((x) => x.id === 'medio-adelante'), 'sin inversión ATL de la competencia no hay medio adelante');
});
