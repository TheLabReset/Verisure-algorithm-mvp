// Baja Google Trends a public/data/busquedas.json: la categoría (cámaras DIY frente a la marca) y las marcas de cámaras.
// Lo corre el pipeline una vez por semana (Trends es semanal); también a mano: node scripts/bajar-busquedas.mjs
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bajarGrupo } from '../src/fuentes/trends.js';
import { CLIENTE } from '../src/cliente.js';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data', 'busquedas.json');

export async function bajarBusquedas({ hoy = new Date().toISOString().slice(0, 10), fetchImpl = fetch } = {}) {
  const { geo, desde, categoria, marcasDiy } = CLIENTE.busquedas;
  const estado = {};
  const opciones = { geo, desde, hasta: hoy, fetchImpl, estado };
  const datos = { consultado: hoy, geo, fuente: 'Google Trends', categoria: await bajarGrupo(categoria, opciones), marcasDiy: await bajarGrupo(marcasDiy, opciones) };
  writeFileSync(OUT, JSON.stringify(datos));
  return datos;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  bajarBusquedas().then((d) => console.log(`busquedas.json · ${d.categoria.semanas.length} semanas · al ${d.categoria.semanas.at(-1)}`))
    .catch((e) => { console.error('❌ Google Trends falló:', e.message); process.exit(1); });
}
