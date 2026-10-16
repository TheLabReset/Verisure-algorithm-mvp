// Piezas de texto comunes. Puras: reciben datos ya calculados y devuelven frases en español peruano.
import { mesLargo, numero } from '../sistema/formato.js';
import { CLIENTE } from '../cliente.js';
import { diasEntre, DIAS_MINIMOS } from '../calculo/periodo.js';

export const mesTexto = (aaaamm) => `${mesLargo(+aaaamm.slice(5, 7))} de ${aaaamm.slice(0, 4)}`;
export const capital = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);
export const lista = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}`);

// «del 24 al 30 de junio» si es el mismo mes; si no, cada fecha completa
export function tramoFechas(desde, hasta) {
  const d = desde.slice(8, 10), h = hasta.slice(8, 10);
  if (desde === hasta) return `el ${Number(d)} de ${mesLargo(+hasta.slice(5, 7))}`;
  if (desde.slice(0, 7) === hasta.slice(0, 7)) return `del ${Number(d)} al ${Number(h)} de ${mesLargo(+hasta.slice(5, 7))}`;
  return `del ${Number(d)} de ${mesLargo(+desde.slice(5, 7))} al ${Number(h)} de ${mesLargo(+hasta.slice(5, 7))}`;
}
// El chip de una tarjeta: «1 al 30 de junio», o «1 de julio» si el período es de un solo día
export const ventanaTexto = (desde, hasta) => tramoFechas(desde, hasta).replace(/^(del|el) /, '');
// El período: el mes entero, o el tramo cuando el mes todavía corre («del 1 al 13 de julio»)
// El mes en curso se dice «lo que va de julio»: se lee bien después de «de», «en» o «para», y el tramo exacto va en el chip de cada tarjeta
// Un tramo de meses que se escribe con lo que tiene la data: «entre enero y julio», «en julio»,
// «entre diciembre de 2026 y enero de 2027». a: 'entre' | 'de' (para «de enero a julio»)
export function tramoMeses(desde, hasta, a = 'entre') {
  if (!desde || !hasta) return 'en el año';
  const [ad, md] = [desde.slice(0, 4), +desde.slice(5, 7)], [ah, mh] = [hasta.slice(0, 4), +hasta.slice(5, 7)];
  if (ad === ah && md === mh) return `en ${mesLargo(md)}`;
  const [x, y] = ad === ah ? [mesLargo(md), mesLargo(mh)] : [`${mesLargo(md)} de ${ad}`, `${mesLargo(mh)} de ${ah}`];
  return a === 'de' ? `${x} a ${y}` : `entre ${x} y ${y}`;
}
export const periodoTexto = (P) => (P.parcial ? `lo que va de ${mesLargo(+P.mes.slice(5, 7))}` : mesTexto(P.mes));
export const comparacionTexto = (P) => (!P.compararDesde ? null : P.parcial ? `el mismo tramo de ${mesLargo(+P.compararDesde.slice(5, 7))}` : mesTexto(P.compararDesde.slice(0, 7)));

// Cantidades chicas en letras (al inicio de una frase o en un sujeto): «dos piezas», «tres paneles»
const LETRAS_M = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
export const enLetras = (n, femenino = false) => (n >= 0 && n <= 10 && Number.isInteger(n) ? (n === 1 ? (femenino ? 'una' : 'un') : LETRAS_M[n]) : numero(n));
export const segun = (n, uno, varios) => (n === 1 ? uno : varios);

// Puntos de share: «3 puntos más que en mayo de 2026», «igual que en mayo de 2026». Con menos de DIAS_MINIMOS días
// en el período (el mes recién empieza) no se compara: las alertas tampoco lo hacen
export function puntosFrente(pts, P) {
  if (pts == null || !P.compararDesde || diasEntre(P.desde, P.hasta) + 1 < DIAS_MINIMOS) return null;
  const en = `en ${comparacionTexto(P)}`;
  if (pts === 0) return `igual que ${en}`;
  return `${numero(Math.abs(pts))} ${segun(Math.abs(pts), 'punto', 'puntos')} ${pts > 0 ? 'más' : 'menos'} que ${en}`;
}

// Las horas más altas: «entre las 14:00 y las 16:00» si son seguidas; si no, «a las 8, 14, 15 y 18 h»
export const horasTexto = (hs) => {
  const o = [...hs].sort((a, b) => a - b);
  return o.length > 1 && o.every((h, i) => i === 0 || h === o[i - 1] + 1) ? `entre las ${o[0]}:00 y ${o.at(-1) + 1 === 24 ? 'la medianoche' : `las ${o.at(-1) + 1}:00`}` : `a las ${lista(o.map(String))} h`;
};
export const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

// Nombres de versión: la fuente los manda en mayúsculas; se leen mejor como frase, con los nombres propios intactos
const PROPIOS = [CLIENTE.nombre, ...CLIENTE.competencia.map((c) => c.nombre), ...CLIENTE.nombresPropios];
// Siglas de medios que la fuente escribe en mayúsculas y que siguen en mayúsculas en una frase («ATV noticias»)
const SIGLAS = ['ATV', 'RPP', 'TV', 'FM', 'OTT', 'TVN'];
// Un medio dentro de una frase: en minúscula salvo que empiece con sigla («TV abierta», «vía pública»)
export const medioEnFrase = (m) => (/^\p{Lu}{2,}/u.test(m) ? m : m[0].toLowerCase() + m.slice(1));

export function version(v) {
  if (!v) return '';
  let t = v.trim().toLowerCase().replace(/\s+/g, ' ');
  t = t[0].toUpperCase() + t.slice(1);
  for (const p of [...PROPIOS, ...SIGLAS]) t = t.replace(new RegExp(`(^|[^\\p{L}])${p.toLowerCase()}(?![\\p{L}])`, 'giu'), (m, a) => a + p);
  return t;
}
// Medios y canales en mayúsculas de la fuente: «LATINA TV» queda igual (son nombres); los grupos se traducen en el cálculo
