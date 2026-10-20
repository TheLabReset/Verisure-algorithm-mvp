// Sonda de solo lectura (temporal): corre el pipeline real con backfill desde enero en una carpeta aparte, con la
// data commiteada como base, y deja vigiladas.json como artefacto. Compara el contrato con el commiteado para ver que
// las vigiladas no lo tocaron. No escribe en public/data ni hace commit. Se borra al leer los resultados.
import { mkdtempSync, copyFileSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { correrPipeline } from './run-pipeline.mjs';

const DATA = new URL('../public/data/', import.meta.url).pathname;
const dir = mkdtempSync(join(tmpdir(), 'sonda-'));
for (const f of ['algorithm.json', 'export.csv']) copyFileSync(join(DATA, f), join(dir, f));
const t0 = Date.now();
const { algorithm, vigiladas } = await correrPipeline({ token: process.env.INTEGRAMETRICS_TOKEN, out: dir, inicio: '2026-01-01', log: console.log });
console.log(`backfill en ${Math.round((Date.now() - t0) / 1000)} s`);
const antes = JSON.parse(readFileSync(join(DATA, 'algorithm.json'), 'utf8'));
const resumen = (a) => ({ dias: a.daily.length, marcas: a.meta.brands, piezas: a.pieces.length, ooh: a.ooh.length, estrenos: a.events.length, digital: a.digital.pieces.length });
console.log('contrato commiteado', JSON.stringify(resumen(antes)));
console.log('contrato de la sonda', JSON.stringify(resumen(algorithm)));
const nombres = vigiladas.meta.marcas;
const cuenta = (xs) => Object.fromEntries(nombres.map((m) => [m, xs.filter((x) => x.maname === m).length]));
console.log('vigiladas: piezas ATL', JSON.stringify(cuenta(vigiladas.pieces)), '· paneles', JSON.stringify(cuenta(vigiladas.ooh)), '· estrenos', JSON.stringify(cuenta(vigiladas.events)), '· piezas digitales', JSON.stringify(cuenta(vigiladas.digital.pieces)));
console.log('vigiladas: emisiones', JSON.stringify(Object.fromEntries(Object.entries(vigiladas.medios.emisiones).map(([m, e]) => [m, e.length]))));
console.log('¿alguna vigilada en el contrato?', nombres.some((m) => JSON.stringify(algorithm).includes(`"${m}"`)) ? 'SÍ, REVISAR' : 'no');
mkdirSync('sonda', { recursive: true });
for (const f of ['vigiladas.json', 'algorithm.json', 'medios.json', 'meta.json']) copyFileSync(join(dir, f), join('sonda', f));
writeFileSync('sonda/resumen.json', JSON.stringify({ antes: resumen(antes), despues: resumen(algorithm) }, null, 1));
