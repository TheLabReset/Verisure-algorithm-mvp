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

// Cada emisión de cada marca, para que cualquier tramo de fechas (un día, una semana, seis meses) se arme en el
// panel: horas, días, canales, programas, la compra de medios y las fichas de TV, cable y radio. Los textos que se
// repiten (canal, programa, versión) van una sola vez en un diccionario y cada emisión guarda su posición.
// Una emisión: [fecha, hora, grupo, canal, programa, versión, tipo, franja, zona, inversión en soles].
export const CAMPOS_EMISION = ['fecha', 'hora', 'grupo', 'canal', 'programa', 'version', 'tipo', 'franja', 'zona', 'inversion'];
const DICCIONARIOS = ['fecha', 'grupo', 'canal', 'programa', 'version', 'tipo', 'franja', 'zona'];

export function mediosDesdeCsv(texto) {
  const filas = leerCsv(texto);
  const repetida = repeticiones(filas, CAMPOS_CSV);
  const dic = Object.fromEntries(DICCIONARIOS.map((k) => [k, []]));
  const pos = Object.fromEntries(DICCIONARIOS.map((k) => [k, new Map()]));
  const codigo = (k, v) => { const t = v || ''; if (!pos[k].has(t)) { pos[k].set(t, dic[k].length); dic[k].push(t); } return pos[k].get(t); };
  const emisiones = {};
  for (const r of filas) {
    const fecha = r.fecha?.slice(0, 10);
    if (!fecha || !r.marca) continue;
    // una repetición regional de una compra nacional no es otra emisión
    if (repetida.has(r)) continue;
    (emisiones[r.marca] ??= []).push([codigo('fecha', fecha), r.hora || '', codigo('grupo', r.grupo_medio), codigo('canal', r.medio), codigo('programa', r.programa),
      codigo('version', r.version), codigo('tipo', r.tipo), codigo('franja', r.franja), codigo('zona', r.zona), Math.round(Number(r.inversion_soles) || 0)]);
  }
  return { campos: CAMPOS_EMISION, dic, emisiones };
}

/** Las emisiones de una marca entre dos fechas (incluidas), ya decodificadas. */
export function emisionesDe(medios, marca, desde, hasta) {
  const d = medios?.dic, lista = medios?.emisiones?.[marca];
  if (!d || !lista) return [];
  const out = [];
  for (const e of lista) {
    const fecha = d.fecha[e[0]];
    if (fecha < desde || fecha > hasta) continue;
    out.push({ fecha, hora: e[1], grupo: d.grupo[e[2]], canal: d.canal[e[3]], programa: d.programa[e[4]], version: d.version[e[5]], tipo: d.tipo[e[6]], franja: d.franja[e[7]], zona: d.zona[e[8]], inversion: e[9] });
  }
  return out;
}
