// Cadenas nacionales de radio y TV. Una compra nacional sale en la emisora de Lima y en sus repetidoras regionales
// a la misma hora, e Integrametrics registra cada repetidora («OXIGENO (AQP)», «LATINA TV (CUS)») con S/ 0, porque
// la tarifa es la de Lima. Ese spot es uno solo, nacional: se cuenta una vez, en su emisora principal.
// Lo mismo con la transmisión del canal en su app o su web («LATINA (APP)», «LATINA (WEB)»).
// Una fila es repetición solo si no tiene inversión, lleva sufijo entre paréntesis y sale a dos minutos o menos de una
// emisión con inversión de la emisora de Lima de la misma cadena, con la misma marca y versión. Una regional que sale
// sola, o con inversión propia, es una compra local y cuenta aparte (todavía no se mide como tal).
// La usan el contrato (src/fuentes/agregado.js) y medios.json (src/fuentes/medios.js): una sola regla para los dos.

export const cadena = (medio) => (medio || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
const conSufijo = (medio) => /\([^)]*\)\s*$/.test(medio || '');
const marcaDeEmisora = (medio) => cadena(medio).split(' ')[0];
// la principal es la emisora de Lima (sin sufijo entre paréntesis) con la misma primera palabra: «OXIGENO (CIX)» y
// «OXIGENO FM», «LATINA (APP)» y «LATINA TV»; «ATV (TRU)» y «ATV», pero no «ATV+»
export const mismaCadena = (repetidora, principal) => conSufijo(repetidora) && !conSufijo(principal) && !!cadena(repetidora) && marcaDeEmisora(repetidora) === marcaDeEmisora(principal);
const TOLERANCIA = 2; // minutos: las repetidoras salen a veces uno o dos minutos después que Lima
const minutos = (m) => Number(m.slice(11, 13)) * 60 + Number(m.slice(14, 16));

// campos: funciones que leen, de cada fila, { marca, minuto ('AAAA-MM-DD HH:MM'), version, medio, inversion }
// Devuelve un Map fila repetida → emisora principal.
export function repeticiones(filas, campos) {
  const clave = (r) => [campos.marca(r), campos.version(r), campos.minuto(r).slice(0, 10)].join('|');
  const principales = new Map();
  for (const r of filas) {
    if (!(campos.inversion(r) > 0) || !campos.minuto(r) || conSufijo(campos.medio(r))) continue;
    const k = clave(r);
    if (!principales.has(k)) principales.set(k, []);
    principales.get(k).push({ medio: campos.medio(r), min: minutos(campos.minuto(r)) });
  }
  const de = new Map();
  for (const r of filas) {
    if (campos.inversion(r) > 0 || !campos.minuto(r) || !conSufijo(campos.medio(r))) continue;
    const m = minutos(campos.minuto(r));
    const p = principales.get(clave(r))?.find((x) => Math.abs(x.min - m) <= TOLERANCIA && mismaCadena(campos.medio(r), x.medio));
    if (p) de.set(r, p.medio);
  }
  return de;
}

// Los campos de cada fuente: el CSV de emisiones y los registros de la API de Integrametrics
export const CAMPOS_CSV = {
  marca: (r) => r.marca, version: (r) => r.version, medio: (r) => r.medio,
  minuto: (r) => (r.fecha && r.hora ? `${r.fecha.slice(0, 10)} ${r.hora.slice(0, 5)}` : ''),
  inversion: (r) => Number(r.inversion_soles) || 0,
};
const dos = (n) => String(n ?? '').padStart(2, '0');
export const CAMPOS_API = {
  marca: (r) => r.maname, version: (r) => r.vname, medio: (r) => r.mname,
  minuto: (r) => (r.fecha ? (r.hour != null ? `${r.fecha.slice(0, 10)} ${dos(r.hour)}:${dos(r.minute)}` : r.fecha.slice(0, 16)) : ''),
  inversion: (r) => Number(r.rinversion) || 0,
};
