// Baja Google Trends a public/data/busquedas.json: la categoría (cámaras DIY frente a la marca), las marcas de cámaras y las
// empresas del rubro (la competencia por su nombre).
// Lo corre el pipeline una vez por semana (Trends es semanal); también a mano: node scripts/bajar-busquedas.mjs
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bajarGrupo } from '../src/fuentes/trends.js';
import { CLIENTE } from '../src/cliente.js';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data', 'busquedas.json');

export async function bajarBusquedas({ hoy = new Date().toISOString().slice(0, 10), fetchImpl = fetch } = {}) {
  const { geo, desde, categoria, marcasDiy, competencia } = CLIENTE.busquedas;
  const estado = {};
  const opciones = { geo, desde, hasta: hoy, fetchImpl, estado };
  const datos = { consultado: hoy, geo, fuente: 'Google Trends', categoria: await bajarGrupo(categoria, opciones), marcasDiy: await bajarGrupo(marcasDiy, opciones),
  };
  // el grupo de la competencia es aparte: si Trends lo corta, se publica lo demás y se queda el grupo anterior (la
  // tarjeta dice su propia fecha); sin grupo anterior, la tarjeta queda sin el filtro
  if (competencia?.length) {
    try { datos.competencia = await bajarGrupo(competencia, opciones); } catch (e) {
      console.error(`⚠ Google Trends no trajo la competencia: ${e.message}`);
      try { const antes = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')).competencia : null; if (antes) datos.competencia = antes; } catch { /* sin grupo anterior */ }
    }
  }
  writeFileSync(OUT, JSON.stringify(datos));
  return datos;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  bajarBusquedas().then((d) => console.log(`busquedas.json · ${d.categoria.semanas.length} semanas · al ${d.categoria.semanas.at(-1)}`))
    .catch((e) => { console.error('❌ Google Trends falló:', e.message); process.exit(1); });
}
