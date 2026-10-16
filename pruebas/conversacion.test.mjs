// La conversación en redes: el tono de cada tema sale de positivo menos negativo con umbrales fijos, y la tasa de
// interacción de TikTok es la interacción sobre las vistas
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tonoDe, leerTiktok, leerFacebook } from '../src/calculo/conversacion.js';
import { tiktokDeEjemplo, facebookDeEjemplo } from '../src/muestra/ejemplo.js';

test('tonoDe: los umbrales de 10 y 40 puntos, hacia los dos lados', () => {
  assert.equal(tonoDe({ positivo: 60, negativo: 20 }), 'muy-positivo');
  assert.equal(tonoDe({ positivo: 50, negativo: 11 }), 'positivo');
  assert.equal(tonoDe({ positivo: 30, negativo: 21 }), 'neutro');
  assert.equal(tonoDe({ positivo: 20, negativo: 30 }), 'negativo');
  assert.equal(tonoDe({ positivo: 10, negativo: 50 }), 'muy-negativo');
});

test('TikTok y Facebook de ejemplo: tasa de mayor a menor y tono en cada tema', () => {
  const t = leerTiktok(tiktokDeEjemplo('2026-10-16'));
  assert.ok(t.hashtags.every((h, i, a) => i === 0 || a[i - 1].tasa >= h.tasa));
  const h = t.hashtags[0];
  assert.equal(h.tasa, (h.interaccion / h.vistas) * 100);
  const f = leerFacebook(facebookDeEjemplo('2026-10-16'));
  assert.ok(f.temas.every((x) => ['muy-positivo', 'positivo', 'neutro', 'negativo', 'muy-negativo'].includes(x.tono)));
});
