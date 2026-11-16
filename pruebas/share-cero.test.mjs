// El título del share no escribe «0 %» cuando el cambio redondea a 0 puntos: una marca que tenía menos de 1 % y
// ahora no tiene inversión «no tiene inversión», una que no tenía y entra con poco «entra con menos de 1 %».
// Arma la vista con la data publicada y cambia solo la marca de la competencia en ATL: no depende del día
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { armarVista } from '../src/calculo/vista.js';
import { shareLectura } from '../src/textos/lecturas.js';

const leer = (f) => JSON.parse(readFileSync(new URL(`../public/data/${f}`, import.meta.url), 'utf8'));
const base = () => armarVista(leer('algorithm.json'), leer('medios.json'), { atajo: '30d' }, {}, { mapa: leer('mapa-lima.json'), busquedas: leer('busquedas.json') });

function conRivalAtl(cambios) {
  const v = base();
  for (const u of [v.lee.digital, v.lee.atl]) { u.estado = 'ok'; if (!u.total) u.total = 1000; if (!u.totalPrevio) u.totalPrevio = 1000; }
  const r = v.lee.atl.marcas.find((m) => !m.propia);
  Object.assign(r, cambios);
  const d = v.lee.digital.marcas.find((m) => !m.propia);
  Object.assign(d, { share: 19, sharePrevio: 2, inversion: 190, inversionPrevia: 20, cambioPts: 17 });
  return shareLectura(v).titulo;
}

test('share: sin inversión ahora y menos de 1 % antes no se escribe «sigue en 0 %»', () => {
  const t = conRivalAtl({ share: 0, sharePrevio: 0, inversion: 0, inversionPrevia: 5, cambioPts: 0 });
  assert.doesNotMatch(t, /\b0 %|\b0 %/, t);
  assert.match(t, /no tiene inversión en ATL \(tenía menos de 1 %\)/, t);
});

test('share: entra con menos de 1 % sin cambio redondeado se dice «entra»', () => {
  const t = conRivalAtl({ share: 0, sharePrevio: 0, inversion: 5, inversionPrevia: 0, cambioPts: 0 });
  assert.doesNotMatch(t, /\b0 %|\b0 %/, t);
  assert.match(t, /entra a ATL con menos de 1 %/, t);
});

test('share: sin inversión en ningún período sigue diciendo «sigue sin inversión»', () => {
  const t = conRivalAtl({ share: 0, sharePrevio: 0, inversion: 0, inversionPrevia: 0, cambioPts: 0 });
  assert.match(t, /sigue sin inversión en ATL/, t);
});
