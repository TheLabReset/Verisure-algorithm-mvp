// Medios por mes y marca, desde el CSV de emisiones (public/data/export.csv): hora, día de la semana, la matriz
// día × hora, canal, programa, zona y grupo de medio. Corre en el pipeline (Node) y deja public/data/medios.json.
// El CSV es la grilla emisión por emisión que ya va al Power BI del cliente: una sola fuente para las dos cosas.

import { repeticiones, CAMPOS_CSV } from './cadenas.js';

// CSV con comillas: los nombres de programa pueden traer comas
export function leerCsv(texto) {
  const filas = [];
  let campo = '', fila = [], comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; } else if (c === '"') comillas = false; else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && texto[i + 1] === '\n') i++; fila.push(campo); filas.push(fila); fila = []; campo = ''; }
    else campo += c;
  }
  if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila); }
  const [cab, ...resto] = filas.filter((f) => f.length > 1 || f[0] !== '');
  return resto.map((f) => Object.fromEntries(cab.map((k, j) => [k, f[j] ?? ''])));
}

const diaSemana = (iso) => (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7; // lunes = 0
const sumar = (obj, clave, n) => { if (clave) obj[clave] = (obj[clave] || 0) + n; };

export function mediosDesdeCsv(texto) {
  const meses = {};
  const filas = leerCsv(texto);
  const repetida = repeticiones(filas, CAMPOS_CSV);
  for (const r of filas) {
    const fecha = r.fecha?.slice(0, 10);
    if (!fecha || !r.marca) continue;
    const mes = fecha.slice(0, 7);
    const m = (meses[mes] ??= {});
    const b = (m[r.marca] ??= { emisiones: 0, horas: Array(24).fill(0), dias: Array(7).fill(0), horaDia: Array.from({ length: 7 }, () => Array(24).fill(0)), canales: {}, programas: {}, zonas: {}, grupos: {} });
    // una repetición regional de una compra nacional no es otra emisión
    if (repetida.has(r)) continue;
    const inv = Number(r.inversion_soles) || 0;
    b.emisiones += 1;
    const h = Number((r.hora || '').slice(0, 2));
    const d = diaSemana(fecha);
    if (r.hora && h >= 0 && h < 24) { b.horas[h] += 1; b.horaDia[d][h] += 1; }
    b.dias[d] += 1;
    sumar(b.canales, r.medio, inv);
    sumar(b.programas, r.programa, 1);
    sumar(b.zonas, r.zona, inv);
    sumar(b.grupos, r.grupo_medio, inv);
  }
  for (const m of Object.values(meses)) for (const b of Object.values(m)) for (const k of ['canales', 'zonas', 'grupos']) for (const c of Object.keys(b[k])) b[k][c] = Math.round(b[k][c]);
  return { meses };
}
