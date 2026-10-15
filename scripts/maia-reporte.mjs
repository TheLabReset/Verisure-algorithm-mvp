// Escribe la lectura semanal de MAIA en public/data/maia.json. Lo corre el pipeline los lunes, después de la data y
// del contexto. Sin ANTHROPIC_API_KEY falla en rojo: un paso que no puede hacer su trabajo no queda verde.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { redactarReporte, MODELO } from '../src/fuentes/maia.js';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data');

export async function maiaReporte({ clave = process.env.ANTHROPIC_API_KEY, modelo = process.env.MAIA_MODELO || MODELO, fetchImpl = fetch, generado = new Date().toISOString() } = {}) {
  const contexto = JSON.parse(readFileSync(join(DATA, 'maia-contexto.json'), 'utf8'));
  if (!contexto.semana) throw new Error('el contexto no trae una semana completa');
  const lectura = await redactarReporte({ clave, modelo, contexto, semana: contexto.semana, fetchImpl });
  const reporte = { semana: { desde: contexto.semana.desde, hasta: contexto.semana.hasta }, generado, modelo, corte: contexto.corte, lectura };
  writeFileSync(join(DATA, 'maia.json'), JSON.stringify(reporte));
  return reporte;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  maiaReporte().then((r) => console.log(`maia.json · semana del ${r.semana.desde} al ${r.semana.hasta} · ${r.lectura.length} caracteres`))
    .catch((e) => { console.error('❌ MAIA no escribió el reporte:', e.message); process.exit(1); });
}
