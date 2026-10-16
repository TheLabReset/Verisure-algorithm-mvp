// Piezas de texto comunes. Puras: reciben datos ya calculados y devuelven frases en español peruano.
import { mesLargo, mesCorto, numero } from '../sistema/formato.js';
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
// El aviso del selector cuando una fecha a mano no sirve
export const avisoFechas = (min, max) => `Hay data ${tramoFechas(min, max)}, y «Desde» va antes de «Hasta».`;
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
// Si la fuente está atrasada, el mes no «va»: se dice hasta dónde tiene data («julio hasta el 13»), que también se lee
// bien después de «de», «en» o «para»
// Un tramo de días («Últimos 7 días» o dos fechas) se dice «los días del 7 al 13 de julio», o «el día 5 de marzo» si es
// uno solo: se lee bien después de «en» o «para»
export const periodoTexto = (P) => (P.tramo ? (P.desde === P.hasta ? `el día ${tramoFechas(P.desde, P.hasta).replace(/^el /, '')}` : `los días ${tramoFechas(P.desde, P.hasta)}`)
  : !P.parcial ? mesTexto(P.mes) : P.enCurso === false ? `${mesLargo(+P.mes.slice(5, 7))} hasta el ${Number(P.hasta.slice(8, 10))}` : `lo que va de ${mesLargo(+P.mes.slice(5, 7))}`);
// La comparación: el mes anterior, el mismo tramo del mes anterior o los mismos días justo antes
export const comparacionTexto = (P) => (!P.compararDesde ? null : P.tramo ? (P.dias === 1 ? 'el día anterior' : `los ${numero(P.dias)} días anteriores`)
  : P.parcial ? `el mismo tramo de ${mesLargo(+P.compararDesde.slice(5, 7))}` : mesTexto(P.compararDesde.slice(0, 7)));
// El título del resumen de cada capa: «Resumen de julio de 2026», «Resumen del 7 al 13 de julio»
export const resumenTitulo = (P) => (P.tramo ? `Resumen ${tramoFechas(P.desde, P.hasta).replace(/^el /, 'del ')}` : `Resumen de ${periodoTexto(P)}`);
// El rótulo de cada barra, corto: «Julio» y «Junio» si es un mes; si es un tramo, sus fechas («7 al 13 jul»)
const fechasCortas = (a, b) => (a === b ? `${Number(a.slice(8))} ${mesCorto(+a.slice(5, 7))}` : a.slice(0, 7) === b.slice(0, 7) ? `${Number(a.slice(8))} al ${Number(b.slice(8))} ${mesCorto(+b.slice(5, 7))}` : `${Number(a.slice(8))} ${mesCorto(+a.slice(5, 7))} al ${Number(b.slice(8))} ${mesCorto(+b.slice(5, 7))}`);
export const mesPeriodo = (P) => (P.tramo ? fechasCortas(P.desde, P.hasta) : capital(mesLargo(+P.mes.slice(5, 7))));
export const mesComparacion = (P) => (!P.compararDesde ? null : P.tramo ? fechasCortas(P.compararDesde, P.compararHasta) : capital(mesLargo(+P.compararDesde.slice(5, 7))));

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

// Una plataforma digital como se escribe: «Facebook», «Google Search», «X»; un sitio, en minúsculas («infobae.com»)
const PLATAFORMAS = { FACEBOOK: 'Facebook', INSTAGRAM: 'Instagram', YOUTUBE: 'YouTube', 'GOOGLE SEARCH': 'Google Search', TWITTER: 'X', TIKTOK: 'TikTok', LINKEDIN: 'LinkedIn' };
export const plataformaEnFrase = (k) => PLATAFORMAS[k] ?? (k.includes('.') ? k.toLowerCase() : k[0] + k.slice(1).toLowerCase());
// «Facebook, YouTube, Instagram y Google Search», o con la cola de los sitios: «…, Google Search y 12 sitios y redes más»
export function plataformasTexto(ks, max = 4) {
  const n = ks.map(plataformaEnFrase);
  if (n.length <= max) return lista(n);
  const resto = n.length - max;
  return `${n.slice(0, max).join(', ')} y ${numero(resto)} ${resto === 1 ? 'sitio o red más' : 'sitios y redes más'}`;
}

// Tipos de aviso de Integrametrics en palabras: un spot, una mención, la presentación o la despedida de un programa
const TIPOS_AVISO = { SPOT: 'Spot', 'SPOT RADIO': 'Spot', 'MENCION TV': 'Mención', 'MENCION RADIO': 'Mención', 'PRESENTA TV': 'Presentación del programa', 'DESPIDE TV': 'Despedida del programa', 'PROMOCION CON AUSPICIO': 'Auspicio', SOBREIMPOSICION: 'Sobreimposición', 'PRODUCT PLACEMENT': 'Product placement', PNT: 'Product placement' };
export const tipoAviso = (t) => TIPOS_AVISO[t] ?? (t ? capital(t.toLowerCase()) : 'Sin tipo');
const TIPOS_PLURAL = { Spot: 'spots', Mención: 'menciones', Auspicio: 'auspicios', Sobreimposición: 'sobreimposiciones', 'Product placement': 'product placements' };
export const tipoAvisoPlural = (t, n) => (n === 1 ? tipoAviso(t).toLowerCase() : (TIPOS_PLURAL[tipoAviso(t)] ?? `${tipoAviso(t).toLowerCase()}s`));
// Plataformas digitales en cuatro grupos (tres colores y el resto en gris): las tres redes con más avisos del rubro
// por su nombre y lo demás junto (TikTok, sitios de noticias, radios en línea)
export const GRUPOS_DIGITALES = ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'OTROS'];
export const grupoDigital = (k) => (GRUPOS_DIGITALES.includes(k) ? k : 'OTROS');
export const nombreGrupoDigital = (k) => ({ FACEBOOK: 'Facebook', INSTAGRAM: 'Instagram', YOUTUBE: 'YouTube', OTROS: 'TikTok, sitios y otros' }[k]);

// La ventana de un patrón (horario, compra): «en cuatro semanas», o los días que hay si la data empieza antes
export const ventanaPatron = (mv) => (mv.dias >= 28 ? 'en cuatro semanas' : `en ${numero(mv.dias)} ${mv.dias === 1 ? 'día' : 'días'}`);
