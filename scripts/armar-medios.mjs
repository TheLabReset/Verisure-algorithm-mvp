// Arma public/data/medios.json desde public/data/export.csv, sin llamar a la API.
// Lo corre el pipeline después de escribir el CSV; también se puede correr solo: node scripts/armar-medios.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mediosDesdeCsv } from '../src/fuentes/medios.js';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data');
export function armarMedios() {
  const medios = mediosDesdeCsv(readFileSync(join(OUT, 'export.csv'), 'utf8'));
  writeFileSync(join(OUT, 'medios.json'), JSON.stringify(medios));
  return medios;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const m = armarMedios();
  console.log(`medios.json · ${Object.keys(m.meses).length} meses`);
}
