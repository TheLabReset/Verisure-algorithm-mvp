// Lecturas de cada tarjeta. Observan, no ordenan; dos frases como máximo; cada comparación dice frente a qué.
// Lo principal es la competencia: cada lectura empieza por ella y la marca propia va para comparar, salvo cuando
// la tarjeta es sobre la marca propia. Toda cifra llega calculada desde src/calculo; acá solo se escribe.
import { numero, porcentaje, soles, solesCompacto, fechaCorta, mesLargo } from '../sistema/formato.js';
import { CLIENTE } from '../cliente.js';
import { tramoMeses, periodoTexto, comparacionTexto, puntosFrente, enLetras, segun, lista, capital, horasTexto, DIAS_SEMANA, version, mesTexto, medioEnFrase, tramoFechas, tipoAviso, tipoAvisoPlural, plataformasTexto, shareDeMarca, frenteATexto } from './comun.js';
import { dolares, fechaSinAnio } from '../sistema/formato.js';
import { MARGEN_OBJETIVO, VECES_PROMEDIO, MARGEN_AVANCE } from '../calculo/plataformas.js';
import { DIAS_MINIMOS } from '../calculo/periodo.js';

const propiaDe = (u) => u.marcas.find((m) => m.propia);
const rivalDe = (u) => u.marcas.find((m) => !m.propia);
const pct = (n) => porcentaje(n);
// un período en que la fuente no tiene ni un día con registros: es un hueco, no una inversión en cero
const sinRegistros = (u) => u.diaria?.length > 0 && u.sinDato?.length === u.diaria.length;
// el share de una marca: «menos de 1 %» o «más de 99 %» cuando el redondeo diría 0 o 100 con inversión de por medio
const shareDe = shareDeMarca;
// un nombre de versión muy largo se corta: la tarjeta lo muestra entero
const corto = (t, n = 60) => (t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t);
const cita = (v) => `«${corto(version(v))}»`;
// los montos de siete cifras o más se leen en millones
const monto = (n) => (Math.abs(n) >= 1e6 ? solesCompacto(n) : soles(n));
const signo = (n) => (n > 0 ? `+${numero(n)} %` : `${n < 0 ? '−' : ''}${numero(Math.abs(n))} %`);

// Nombres de marca para textos que reciben ids de la fuente
export const textosMarca = {
  nombreMarca: (m) => (m === CLIENTE.marcaFuente ? CLIENTE.nombre : CLIENTE.competencia.find((c) => c.marcaFuente === m)?.nombre ?? m),
};

// ── 4.1 ──
export function atlLectura(v) {
  const u = v.lee.atl, P = v.periodo, r = rivalDe(u), p = propiaDe(u);
  // sin inversión de la competencia ni antes ni ahora, no hay cambio que contar
  const frente = r.inversion > 0 || r.inversionPrevia > 0 ? puntosFrente(r.cambioPts, P) : null;
  const cola = `según Integrametrics para ${periodoTexto(P)}.${frente ? ` ${r.nombre} queda ${frente}.` : ''}`;
  if (sinRegistros(u)) return { titulo: 'Sin registros ATL en el período', lectura: `Integrametrics no tiene registros de TV, radio, cable, OTT ni vía pública para ${periodoTexto(P)}.` };
  if (r.share == null) return { titulo: 'Sin inversión ATL registrada', lectura: `Ninguna marca tiene inversión en TV, radio, cable, OTT ni vía pública, ${cola}` };
  if (!r.inversion) return { titulo: `${r.nombre} no tiene inversión ATL registrada`, lectura: `Toda la inversión en TV, radio, cable, OTT y vía pública es de ${p.nombre}, ${cola}` };
  if (!p.inversion) return { titulo: `${r.nombre} tiene toda la inversión ATL`, lectura: `${p.nombre} no tiene inversión en TV, radio, cable, OTT ni vía pública, ${cola}` };
  return { titulo: `${r.nombre} tiene ${shareDe(r, u)} de la inversión ATL`, lectura: `${p.nombre} pone el resto (${shareDe(p, u)}) en TV, radio, cable, OTT y vía pública, ${cola}` };
}
export function digitalLectura(v) {
  const u = v.lee.digital, P = v.periodo, r = rivalDe(u), p = propiaDe(u);
  const frente = puntosFrente(r.cambioPts, P);
  const cola = frente ? ` ${r.nombre} queda ${frente}.` : '';
  if (sinRegistros(u)) return { titulo: 'Sin registros digitales en el período', lectura: `Integrametrics digital no tiene registros para ${periodoTexto(P)}.` };
  if (r.share == null) return { titulo: 'Sin inversión digital registrada', lectura: `Ninguna marca tiene inversión digital en ${periodoTexto(P)}.` };
  if (!r.inversion || !p.inversion) {
    const sola = r.inversion ? r : p, otra = r.inversion ? p : r;
    return { titulo: `Solo ${sola.nombre} invierte en digital`, lectura: `${otra.nombre} no tiene inversión digital en ${periodoTexto(P)}.${cola}` };
  }
  const parejo = Math.abs(p.share - r.share) <= 10;
  const titulo = parejo ? 'En digital la inversión está pareja' : `${r.share > p.share ? r.nombre : p.nombre} lidera la inversión digital`;
  return { titulo, lectura: `En digital, ${r.nombre} tiene ${shareDe(r, u)} y ${p.nombre} ${shareDe(p, u)}.${cola}` };
}
// El share del período en una sola tarjeta: digital y ATL lado a lado (universos distintos, nunca sumados).
// La competencia en el título; la marca propia y el cambio frente a la comparación en la lectura
export function shareLectura(v) {
  const P = v.periodo;
  const us = [['digital', v.lee.digital], ['ATL', v.lee.atl]].filter(([, u]) => u.estado === 'ok' && rivalDe(u)?.share != null);
  if (!us.length && [v.lee.digital, v.lee.atl].every((u) => u.estado !== 'ok' || sinRegistros(u))) return { titulo: 'Sin registros en el período', lectura: `Integrametrics no tiene registros de ninguna marca para ${periodoTexto(P)}.` };
  if (!us.length) return { titulo: 'Sin inversión registrada en el período', lectura: `Integrametrics no tiene inversión de ninguna marca en ${periodoTexto(P)}.` };
  const r = rivalDe(us[0][1]);
  // cuánto tiene cada marca en cada universo; un 0 se dice «no tiene inversión», nunca «0 %»
  const tiene = (m, largo) => {
    const con = us.filter(([, u]) => m(u).inversion > 0), sin = us.filter(([, u]) => !(m(u).inversion > 0));
    const partes = con.map(([n, u]) => (largo ? `${shareDe(m(u), u)} de la inversión ${n}` : `${shareDe(m(u), u)} en ${n}`));
    const no = sin.length ? `no tiene inversión ${sin.map(([n]) => (largo ? n : `en ${n}`)).join(' ni ')}` : null;
    return partes.length ? `tiene ${lista(partes)}${no ? ` y ${no}` : ''}` : no;
  };
  // el cambio solo si hay con qué comparar (y días suficientes: puntosFrente lo decide)
  const cambios = us.map(([n, u]) => [n, rivalDe(u).cambioPts]).filter(([, x]) => x != null && puntosFrente(x, P));
  const cambio = (x) => (x === 0 ? 'igual' : `${numero(Math.abs(x))} ${segun(Math.abs(x), 'punto', 'puntos')} ${x > 0 ? 'más' : 'menos'}`);
  const frenteA = frenteATexto(P) || '';
  // con comparación, el título dice cómo se movió la competencia en cada universo, con un solo verbo:
  // «pasa de 14 % a 1 % en digital y de 4 % a 1 % en ATL»; lo que no cambia, «sigue en 3 % en ATL»
  let conVerbo = false;
  const mov = ([n, u]) => {
    const m = rivalDe(u);
    if (m.cambioPts === 0) return m.inversion > 0 || m.inversionPrevia > 0 ? `sigue en ${shareDe(m, u)} en ${n}` : `sigue sin inversión en ${n}`;
    // entrar o salir de un universo se dice en palabras, no como un «0 %»
    if (!(m.inversion > 0)) return `no tiene inversión en ${n} (tenía ${shareDe(m, u, true)})`;
    if (!(m.inversionPrevia > 0)) return `entra a ${n} con ${shareDe(m, u)}`;
    const t = `${conVerbo ? '' : 'pasa '}de ${shareDe(m, u, true)} a ${shareDe(m, u)} en ${n}`;
    conVerbo = true;
    return t;
  };
  const titulo = cambios.length === us.length ? `${r.nombre} ${lista(us.map(mov))}, frente ${frenteA}` : `${r.nombre} ${tiene(rivalDe, true)}`;
  // sin lectura: la tarjeta va en porcentajes, y la parte de la marca propia es el resto de la barra; los soles están en el detalle
  return { titulo, lectura: '' };
}

export function presionLectura(v, universo = 'atl') {
  const u = v.lee[universo];
  const conData = u.diaria.filter((d) => Object.values(d.valores).some((x) => x != null));
  const dias = (m) => conData.filter((d) => d.valores[m.id] > 0).length;
  const r = rivalDe(u), p = propiaDe(u);
  const mayor = conData.reduce((a, d) => ((d.valores[r.id] ?? 0) > (a?.valores[r.id] ?? 0) ? d : a), null);
  const n = conData.length, dr = dias(r), dp = dias(p);
  const titulo = `Inversión ${universo === 'atl' ? 'ATL' : 'digital'} día por día`;
  if (!n) return { titulo, lectura: `Sin días con data en ${periodoTexto(v.periodo)}.` };
  // con un solo día no hay «día de más inversión»: se dice quién invirtió y cuánto
  if (n === 1) {
    const quien = [r, p].filter((m) => dias(m)).map((m) => m.nombre);
    return { titulo, lectura: `Hay un solo día con data, el ${fechaCorta(conData[0].fecha)}: ${quien.length ? `invierte${quien.length > 1 ? 'n' : ''} ${lista(quien)}` : 'ninguna marca invierte'}.${dr ? ` ${r.nombre} pone ${monto(conData[0].valores[r.id])}.` : ''}` };
  }
  const deR = dr === 0 ? `no invierte en ninguno de los ${numero(n)} días con data` : dr === n ? `invierte en los ${numero(n)} días con data` : `invierte en ${numero(dr)} de ${numero(n)} días con data`;
  const deP = dp === 0 ? 'en ninguno' : dp === n ? 'en todos' : `en ${numero(dp)}`;
  const pico = mayor && mayor.valores[r.id] > 0 && dr > 1 ? ` El día de más inversión de ${r.nombre} fue el ${fechaCorta(mayor.fecha)}, con ${monto(mayor.valores[r.id])}.` : '';
  return { titulo, lectura: `${r.nombre} ${deR}; ${p.nombre}, ${deP}.${pico}` };
}
// El detalle de la compra de medios: el recorte se dice, y una marca sin compra se nombra en una línea, no en una columna de ceros
export const recorteTexto = (n, total, que, uno) => (total > n ? `Los ${numero(n)} ${que} con más emisiones, de ${numero(total)}.` : `${capital(enLetras(total))} ${total === 1 ? uno : que}${total > 1 ? ', de más a menos emisiones' : ''}.`);
export const sinCompraTexto = (marca, ventana) => `${marca} no compró ATL ${ventana}.`;
// un tipo de aviso con su artículo: «una mención», «un spot», «un auspicio»
export const conArticulo = (tipo) => { const t = tipoAviso(tipo).toLowerCase(); return `${/(ión|a)$/.test(t) ? 'una' : 'un'} ${t}`; };
export const todosTipoTexto = (tipo, n) => (n === 1 ? `Es ${conArticulo(tipo)}.` : `Todos son ${tipoAvisoPlural(tipo)}.`);

// La mezcla de la competencia mes a mes: el año en el título; el mes más volcado a ATL y el último mes cerrado en la lectura
export function mezclaLectura(x) {
  const conMezcla = x.meses.filter((m) => m.digital != null);
  if (!x.anio || !conMezcla.length) return { titulo: `${x.marca} no tiene inversión registrada en el año`, lectura: null };
  const titulo = `El ${porcentaje(x.anio.digital)} de la inversión publicitaria de ${x.marca} en el año es digital`;
  const cerrados = conMezcla.filter((m) => !m.enCurso);
  const masAtl = [...cerrados].sort((a, b) => b.atl - a.atl)[0];
  const ultimo = cerrados.at(-1);
  const partes = [];
  if (masAtl && masAtl.atl >= 1) partes.push(`Su mes con más ATL fue ${mesLargo(+masAtl.mes.slice(5, 7))} (${porcentaje(masAtl.atl)})${masAtl.medios[0] ? `, sobre todo en ${(MEDIOS_MEZCLA[masAtl.medios[0].medio] ?? masAtl.medios[0].medio).toLowerCase()}` : ''}.`);
  else partes.push(`No tuvo ATL en ningún mes cerrado.`);
  if (ultimo && ultimo !== masAtl) partes.push(`En ${mesLargo(+ultimo.mes.slice(5, 7))}, el ${porcentaje(ultimo.digital)} fue digital.`);
  return { titulo, lectura: partes.join(' ') };
}
// Los medios ATL como se leen en la mezcla
export const MEDIOS_MEZCLA = { 'TV ABIERTA': 'TV abierta', CABLE: 'Cable', RADIO: 'Radio', OTT: 'OTT y streaming', 'OTT STREAMING/LIVE': 'OTT y streaming', OOH: 'Vía pública', 'VIA PUBLICA': 'Vía pública' };
// La pista de una columna: el mes, la parte digital y la ATL con sus medios, solo en porcentajes
export function mezclaPista(m) {
  const mes = `${capital(mesLargo(+m.mes.slice(5, 7)))}${m.enCurso ? ' (en curso)' : ''}`;
  if (m.digital == null) return `${mes}\nsin inversión registrada`;
  const medios = m.medios.filter((x) => x.pct >= 0.5).map((x) => `${MEDIOS_MEZCLA[x.medio] ?? x.medio} ${porcentaje(x.pct)}`);
  return `${mes}\nDigital ${porcentaje(m.digital)}\nATL ${porcentaje(m.atl)}${medios.length ? ` (${medios.join(', ')})` : ''}`;
}

export function shareSemanalLectura(s) {
  const comp = (serie) => (serie || []).filter((x) => !x.parcial && x.valor != null);
  const dig = comp(s.digital), atl = comp(s.atl);
  const titulo = `El share de inversión de ${s.marca}, semana a semana`;
  if (!dig.length && !atl.length) return { titulo, lectura: 'Sin semanas completas con data.' };
  // con digital caída (o sin semanas completas), lo que hay de ATL
  if (!dig.length) { const m = atl.reduce((a, x) => (x.valor > a.valor ? x : a)); return { titulo, lectura: `En ATL, la semana más alta de ${s.marca} llega a ${pct(m.valor)}, la del ${fechaCorta(m.fecha)}.` }; }
  const max = dig.reduce((a, x) => (x.valor > a.valor ? x : a));
  const ult = dig.at(-1);
  const topeAtl = atl.length ? Math.max(...atl.map((x) => x.valor)) : null;
  const digital = max.fecha === ult.fecha
    ? `En digital, ${s.marca} tiene ${pct(ult.valor)} en la última semana completa, la del ${fechaCorta(ult.fecha)}: su semana más alta del año.`
    : `En digital, ${s.marca} llegó a ${pct(max.valor)} la semana del ${fechaCorta(max.fecha)} y tiene ${pct(ult.valor)} en la última semana completa, la del ${fechaCorta(ult.fecha)}.`;
  return { titulo, lectura: `${digital}${topeAtl != null ? ` En ATL, su semana más alta llega a ${pct(topeAtl)}.` : ''}` };
}

// ── 1.1 ──
export function cronogramaLectura(c, marca, desde, hasta) {
  const titulo = `Las versiones de ${marca} en el año`;
  if (!c?.total) return { titulo, lectura: `Integrametrics no registró versiones de ${marca} en el año.` };
  const atl = c.filas.filter((f) => f.universo === 'atl').length, dig = c.filas.filter((f) => f.universo === 'digital').length;
  const top = [...c.filas].sort((a, b) => b.inversion - a.inversion)[0];
  const n = c.distintas ?? c.total;
  return { titulo, lectura: `${marca} tuvo ${numero(n)} ${segun(n, 'versión', 'versiones')} en ATL y digital ${tramoMeses(desde, hasta)}. La de más inversión es ${cita(top.version)}, del ${fechaCorta(top.desde)} al ${fechaCorta(top.hasta)}.` };
}
export function estrenosLectura(v) {
  const e = v.lee.estrenos, P = v.periodo;
  // los estrenos los marca Integrametrics en ATL (TV, radio, cable, OTT y vía pública); las piezas digitales nuevas van en la capa 1
  const titulo = 'Piezas nuevas en ATL';
  if (!e.length) return { titulo, lectura: `Ninguna pieza nueva en ATL en ${periodoTexto(P)}.` };
  const nombres = [...new Set(e.map((x) => x.nombre))].sort((a, b) => (a === CLIENTE.nombre) - (b === CLIENTE.nombre));
  const porMarca = nombres.map((n) => `${numero(e.filter((x) => x.nombre === n).length)} de ${n}`);
  return { titulo, lectura: `${capital(enLetras(e.length, true))} ${segun(e.length, 'pieza nueva', 'piezas nuevas')} en ATL en ${periodoTexto(P)}: ${lista(porMarca)}.` };
}
export const estrenoTitulo = (e) => cita(e.version);
export function estrenoDato(e) {
  const hora = e.fecha.slice(11, 16);
  return [e.nombre, [e.tipo && e.tipo.toLowerCase(), e.duracion && `${numero(e.duracion)} s`].filter(Boolean).join(' de '), e.canal, `${fechaCorta(e.fecha.slice(0, 10))}${hora ? ` · ${Number(hora.slice(0, 2))}:${hora.slice(3, 5)}` : ''}`].filter(Boolean).join(' · ');
}
// «<competencia> tiene 7 versiones con emisiones en junio de 2026; <marca propia>, 15.»
function abanicoFrase(a, [uno, varios], cola) {
  const p = a.propio?.anuncios.length ?? 0;
  const r = a.grupos.map((g) => `${g.nombre} tiene ${numero(g.anuncios.length)} ${segun(g.anuncios.length, uno, varios)}`);
  return `${capital(r.length ? lista(r) : `${lista(CLIENTE.competencia.map((c) => c.nombre))} no tiene ${varios}`)} ${cola}; ${CLIENTE.nombre}, ${numero(p)}.`;
}
export function abanicoAtlLectura(a, P) {
  return { titulo: 'Versiones ATL del período', lectura: abanicoFrase(a, ['versión', 'versiones'], `con emisiones en ${periodoTexto(P)}`) };
}
export function abanicoDigitalLectura(a, P) {
  // el primer mes de data no sabe qué ya estaba al aire: se dice «vistas desde», no «nuevas»
  if (a?.sinHistoria) return { titulo: 'Piezas digitales vistas', lectura: abanicoFrase(a, ['versión vista', 'versiones vistas'], `desde el ${fechaCorta(a.inicio)}, el primer día con data digital`) };
  return { titulo: 'Piezas digitales nuevas', lectura: abanicoFrase(a, ['versión nueva', 'versiones nuevas'], `en ${periodoTexto(P)}`) };
}

// ── 1.2 OOH ──
export function oohLectura(o, P, r = CLIENTE.competencia[0]) {
  const titulo = 'Dónde están los paneles';
  if (!o.paneles.length) return { titulo, lectura: `Integrametrics no detectó paneles de las marcas que se siguen en ${periodoTexto(P)}.` };
  const nr = o.porMarca[r.marcaFuente], np = o.porMarca[CLIENTE.marcaFuente];
  // todas las ciudades donde está la competencia fuera de Lima; si la propia no tiene ninguna, se dice
  const fuera = o.fueraDeLima.filter((c) => c.nombre !== 'Sin coordenadas' && c[r.marcaFuente] > 0);
  const propiaFuera = o.fueraDeLima.some((c) => c.nombre !== 'Sin coordenadas' && c[CLIENTE.marcaFuente] > 0);
  // quien no tiene paneles se dice en palabras, no como «0 paneles»
  const deR = nr ? `${r.nombre} tiene ${numero(nr)} ${segun(nr, 'panel detectado', 'paneles detectados')} en ${periodoTexto(P)}` : `${r.nombre} no tiene paneles detectados en ${periodoTexto(P)}`;
  const deP = nr ? (np ? ` y ${CLIENTE.nombre} ${numero(np)}` : `; ${CLIENTE.nombre}, ninguno`) : `; ${CLIENTE.nombre} tiene ${numero(np)}`;
  return { titulo, lectura: `${deR}${deP}.${fuera.length ? ` Fuera de Lima, ${r.nombre} tiene paneles en ${lista(fuera.map((c) => `${c.nombre} (${numero(c[r.marcaFuente])})`))}${np && !propiaFuera ? `; ${CLIENTE.nombre}, en ninguna ciudad` : ''}.` : ''}` };
}
export function distritosLectura(o) {
  const titulo = 'Paneles por distrito';
  const d = o.porDistrito;
  if (!d.length) return { titulo, lectura: 'Sin paneles en Lima en el período.' };
  // la competencia primero: su distrito con más paneles; si no tiene en Lima, el de la marca propia
  const [r] = CLIENTE.competencia;
  const quien = d.some((x) => x[r.marcaFuente] > 0) ? r : d.some((x) => x[CLIENTE.marcaFuente] > 0) ? { nombre: CLIENTE.nombre, marcaFuente: CLIENTE.marcaFuente } : null;
  if (!quien) return { titulo, lectura: 'Sin paneles de las marcas en Lima en el período.' };
  const k = quien.marcaFuente, tope = Math.max(...d.map((x) => x[k] || 0));
  const empatados = d.filter((x) => x[k] === tope);
  const nadaR = quien !== r ? `${r.nombre} no tiene paneles en Lima. ` : '';
  return { titulo, lectura: `${nadaR}${empatados.length > 3 ? `${quien.nombre} tiene como máximo ${numero(tope)} ${segun(tope, 'panel', 'paneles')} por distrito, en ${enLetras(empatados.length)} distritos` : `${lista(empatados.map((x) => x.nombre))} ${empatados.length > 1 ? 'son los distritos' : 'es el distrito'} con más paneles de ${quien.nombre} (${numero(tope)}${empatados.length > 1 ? ' cada uno' : ''})`}.` };
}
export const panelTitulo = (p) => p.direccion || [p.tipo && version(p.tipo), p.distrito || p.localidad].filter(Boolean).join(' en ') || 'Panel sin dirección';
// Un círculo del mapa que junta varias ubicaciones de una marca: su título y su pista, y cómo se nombra cada una en la lista
export function grupoPanelesTexto(us) {
  const caras = us.reduce((s, u) => s + u.paneles.length, 0), inversion = us.reduce((s, u) => s + u.inversion, 0);
  const marcas = [...new Set(us.map((u) => u.nombre))];
  const de = marcas.length === 1 ? ` de ${marcas[0]}` : `: ${lista(marcas.map((m) => `${numero(us.filter((u) => u.nombre === m).length)} de ${m}`))}`;
  const titulo = `${numero(us.length)} ubicaciones${de}`;
  return { titulo, pista: `${titulo}\n${numero(caras)} ${segun(caras, 'cara', 'caras')} · ${soles(inversion)}` };
}
// paneles: las caras de esa ubicación, con su dirección y su tipo
// (la misma torre puede salir como dos puntos vecinos, detectada en días distintos: la fecha los distingue)
export function ubicacionEnLista(u, paneles) {
  const desde = paneles.map((p) => p.desde).sort()[0], hasta = paneles.map((p) => p.hasta).sort().at(-1);
  const cuando = !desde ? null : desde === hasta ? `el ${fechaCorta(desde)}` : `del ${fechaCorta(desde)} al ${fechaCorta(hasta)}`;
  const que = paneles.length > 1 ? `${panelTitulo(paneles[0])} (${numero(paneles.length)} caras)` : panelTitulo(paneles[0] ?? {});
  return [que, cuando && `detectado ${cuando}`, soles(u.inversion)].filter(Boolean).join(' · ');
}

// ── 2.2 Cámaras DIY ──
export function busquedasLectura(b) {
  const titulo = 'Cámaras de seguridad frente a la marca';
  if (!b) return { titulo, lectura: 'Google Trends no cargó.' };
  const wifi = b.series.find((s) => s.id === 'wifi');
  const crece = (s, nombre) => (s?.crecimiento == null ? null : `las de ${nombre} ${s.crecimiento >= 0 ? 'suben' : 'bajan'} ${numero(Math.abs(s.crecimiento))} %`);
  const cambios = [crece(b.camaras, 'cámaras'), crece(wifi, 'cámara wifi')].filter(Boolean);
  const razon = b.razon == null ? '' : `En las últimas ${numero(b.semanas)} semanas hubo unas ${numero(b.razon, 1)} búsquedas de cámaras de seguridad por cada búsqueda de «${b.marca.nombre}».`;
  return { titulo, lectura: `${razon}${cambios.length ? ` Frente a las mismas semanas de un año antes, ${lista(cambios)}.` : ''}`.trim() };
}
export function marcasDiyLectura(b) {
  const titulo = 'Las marcas de cámaras que se buscan';
  if (!b?.marcas.length) return { titulo, lectura: 'Sin data de marcas de cámaras.' };
  const [top] = b.marcas;
  const otras = b.marcas.filter((m) => m.id !== top.id && m.crecimiento != null && m.crecimiento >= 10).sort((a, z) => z.crecimiento - a.crecimiento);
  return { titulo, lectura: `${top.nombre} es la marca de cámaras más buscada${top.crecimiento != null ? ` (${signo(top.crecimiento)} frente a las mismas semanas de un año antes)` : ''}.${otras.length ? ` También ${otras.length > 1 ? 'suben' : 'sube'} ${lista(otras.map((m) => `${m.nombre} (${signo(m.crecimiento)})`))}.` : ''}` };
}

// ── 2.3 ──
export function pautaLectura(filas) {
  const titulo = 'La pauta del año, día por día';
  const comp = filas.filter((f) => f.foco), prop = filas.filter((f) => !f.foco);
  if (!comp.length) return { titulo, lectura: '' };
  const frase = (f) => `${f.universo} en ${numero(f.diasConInversion)} de ${numero(f.diasConData)} días${f.primerDia && f.diasConInversion < f.diasConData * 0.6 ? `, desde el ${fechaCorta(f.primerDia)}` : ''}`;
  return { titulo, lectura: `${comp[0].marca} invirtió en ${lista(comp.map(frase))}.${prop[0] ? ` ${prop[0].marca}, en ${lista(prop.map((f) => `${f.universo} ${numero(f.diasConInversion)}`))} días.` : ''}` };
}
// La pauta semanal del universo elegido: cuántas semanas invirtió cada marca y desde cuándo
export function pautaSemanalLectura(filas, universo) {
  const nombreU = { atl: 'en ATL', digital: 'en digital', todo: 'entre ATL y digital' }[universo];
  const titulo = 'La pauta del año, semana a semana';
  const [r, p] = [filas.find((f) => f.foco), filas.find((f) => !f.foco)];
  if (!r) return { titulo, lectura: '' };
  const frase = (f) => `${numero(f.semanasConInversion)} de ${numero(f.semanasConData)} semanas${f.primera && f.semanasConInversion < f.semanasConData * 0.6 ? `, desde la del ${fechaCorta(f.primera)}` : ''}`;
  return { titulo, lectura: `${r.marca} invirtió ${nombreU} en ${frase(r)}.${p ? ` ${p.marca}, en ${frase(p)}.` : ''}` };
}
export function temporadaLectura(t) {
  const meses = t.filter((m) => !m.parcial);
  const ids = Object.keys(t[0]?.atl || {}).sort((a, b) => (a === CLIENTE.marcaFuente) - (b === CLIENTE.marcaFuente));
  const conInv = (id) => meses.filter((m) => m.atl[id] > 0).length;
  const cuantos = (id) => (conInv(id) === meses.length ? 'en todos' : `en ${numero(conInv(id))}`);
  const [primera, ...otras] = ids;
  if (!primera || !meses.length) return { titulo: 'Inversión de cada mes', lectura: 'Todavía no hay un mes cerrado.' };
  const resto = otras.map((id) => `; ${textosMarca.nombreMarca(id)}, ${cuantos(id)}`).join('');
  return { titulo: 'Inversión de cada mes', lectura: `${textosMarca.nombreMarca(primera)} invirtió en ATL ${conInv(primera) === meses.length ? `en los ${numero(meses.length)}` : `en ${numero(conInv(primera))} de los ${numero(meses.length)}`} meses cerrados${resto}.` };
}

// ── 3.1 ──
export function mediosLectura(v, MEDIOS) {
  const u = v.lee.atl;
  const frase = (m) => {
    const tot = Object.values(m.medios).reduce((t, x) => t + x, 0);
    if (!tot) return null;
    const top = Object.entries(m.medios).sort((a, b) => b[1] - a[1]).filter(([, x], i) => i === 0 || x / tot >= 0.2).slice(0, 2);
    return `${m.nombre} pone ${lista(top.map(([k, x]) => `${pct(Math.round((x / tot) * 100))} en ${medioEnFrase(MEDIOS[k] || k)}`))}`;
  };
  const frases = [...u.marcas].sort((a, b) => Number(a.propia) - Number(b.propia)).map(frase).filter(Boolean);
  return { titulo: 'Cómo reparte cada marca su inversión ATL', lectura: frases.length ? `${capital(frases.join('; '))}.` : 'Sin inversión ATL registrada en el período.' };
}
export function franjasLectura(v, FRANJAS) {
  const u = v.lee.atl, r = rivalDe(u), p = propiaDe(u);
  // la misma parte que muestran el gráfico y la tabla (reparto que suma 100), no otro redondeo
  const parte = (m, k) => (Object.values(m.franjas).some((x) => x > 0) ? m.mezclaFranjas[k] ?? 0 : null);
  const k = Object.entries(r.franjas).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!k) return { titulo: 'Emisiones por franja', lectura: `Sin emisiones de ${r.nombre} en el período.` };
  const donde = k === 'DIA' ? 'de día' : `en ${FRANJAS[k].toLowerCase()}`;
  const deP = parte(p, k);
  return { titulo: 'Emisiones por franja', lectura: `${pct(parte(r, k))} de las emisiones de ${r.nombre} van ${donde}, ${deP == null ? `y ${p.nombre} no tiene emisiones en el período` : `frente a ${pct(deP)} de ${p.nombre}`}.` };
}
export function canalesLectura(med, marca) {
  const nombre = textosMarca.nombreMarca(marca);
  if (!med || !med.canales.length) return { titulo: `Canales de ${nombre}`, lectura: `Sin emisiones de ${nombre} en el período.` };
  // lo que llega sin canal registrado no se nombra como si fuera un canal
  const [a, b] = med.canales.filter((c) => !c.sinRegistrar);
  const cuantos = `${capital(enLetras(med.totalCanales))} ${segun(med.totalCanales, 'canal', 'canales')} con inversión${med.sinCanal ? ', más emisiones sin canal registrado' : ''}`;
  if (!a) return { titulo: `Canales de ${nombre}`, lectura: `${cuantos}; ninguno con su nombre registrado.` };
  return { titulo: `Canales de ${nombre}`, lectura: `${cuantos}; ${b ? `los dos con más son ${a.nombre} y ${b.nombre}` : `el que más tiene es ${a.nombre}`}.` };
}

// ── 3.2 ──
export function horarioLectura(med, marca) {
  const nombre = textosMarca.nombreMarca(marca);
  const titulo = `Cuándo emite ${nombre}`;
  if (!med || !med.horasAltas.length) return { titulo, lectura: `Sin emisiones de ${nombre} con hora en el período.` };
  const dia = med.diaMayor == null ? null : DIAS_SEMANA[med.diaMayor];
  const n = med.horasAltas.length;
  return { titulo, lectura: `${n > 1 ? `Las ${enLetras(n, true)} horas con más emisiones van` : 'La hora con más emisiones es la de las'} ${n > 1 ? horasTexto(med.horasAltas) : `${med.horasAltas[0]}:00`}.${dia ? ` El día con más es el ${dia}.` : ''}` };
}
export function programasLectura(med, marca) {
  const nombre = textosMarca.nombreMarca(marca);
  if (!med || !med.programas.length) return { titulo: `Programas de ${nombre}`, lectura: `Sin programas registrados para ${nombre} en el período.` };
  return { titulo: `Programas de ${nombre}`, lectura: `Emite en ${numero(med.totalProgramas)} ${segun(med.totalProgramas, 'programa', 'programas')}; el que más emisiones lleva es ${capital(version(med.programas[0].nombre))}.` };
}

// ── 2.1: alertas ──
// Cuántas alertas hay y cuántas son de la competencia; lo que va bien, aparte
export function queMirarLectura(v) {
  const P = v.periodo, q = v.sugiere.queMirar || [], bien = (v.sugiere.queVaBien || []).length;
  const comp = q.filter((a) => a.competencia).length;
  const rival = CLIENTE.competencia.map((c) => c.nombre).join(' y ');
  if (!q.length) return { titulo: 'Qué mirar', lectura: `Ninguna alerta en ${periodoTexto(P)}.${bien ? ` ${capital(enLetras(bien, true))} ${segun(bien, 'señal', 'señales')} a favor de ${CLIENTE.nombre}.` : ''}` };
  const deComp = comp === q.length ? (q.length === 1 ? `, de ${rival}` : `, todas de ${rival}`) : comp ? `; ${enLetras(comp, true)} ${segun(comp, 'es', 'son')} de ${rival}` : '';
  return { titulo: 'Qué mirar', lectura: `${capital(enLetras(q.length, true))} ${segun(q.length, 'alerta', 'alertas')} en ${periodoTexto(P)}${deComp}.${bien ? ` ${capital(enLetras(bien, true))} ${segun(bien, 'señal', 'señales')} a favor de ${CLIENTE.nombre}.` : ''}` };
}
// frente a qué compara cada alerta («el mismo tramo de junio», «mayo de 2026») y de qué período habla
const comp = (a) => (a.periodo && comparacionTexto(a.periodo)) || 'la comparación';
const per = (a) => (a.periodo ? periodoTexto(a.periodo) : 'el período');
const MEDIO_TARJETA = { tv: ' en TV y cable', radio: ' en radio', ooh: ' en vía pública' };
const ALERTAS = {
  'estreno-competencia': (a) => ({
    titulo: `${a.marca} estrenó ${enLetras(a.cuantos, true)} ${segun(a.cuantos, 'pieza', 'piezas')} en ${per(a)}`,
    dato: `${a.cuantos > 1 ? 'La más reciente: ' : ''}${capital(estrenoTitulo(a.ultimo))}, ${estrenoDato(a.ultimo)}.`,
    mirar: `El mensaje y el medio de la pieza, y si se cruza con lo que tiene al aire ${CLIENTE.nombre}.`,
  }),
  'sube-competencia': (a) => ({
    titulo: `${a.marca} aumenta ${numero(a.sube)} % su inversión ${a.universo}`,
    dato: `${monto(a.monto)} en ${per(a)}, frente a ${monto(a.antes)} en ${comp(a)}.`,
    mirar: 'Qué versiones y qué medios explican el aumento.',
  }),
  'baja-competencia': (a) => ({
    // con algo de inversión, una baja que redondea a 100 % se dice «más de 99 %»
    titulo: `${a.marca} disminuye ${a.monto > 0 && Math.round(a.baja) >= 100 ? 'más de 99' : numero(a.baja)} % su inversión ${a.universo}`,
    dato: `${monto(a.monto)} en ${per(a)}, frente a ${monto(a.antes)} en ${comp(a)}.`,
    mirar: 'Qué versiones dejó de pautar y si su pauta del año muestra pausas parecidas.',
  }),
  'competencia-sin-pauta': (a) => ({
    titulo: `${a.marca} no tiene inversión ${a.universo} en ${per(a)}`,
    dato: `En ${comp(a)} tenía ${monto(a.antes)}. Puede ser una pausa o un hueco de la fuente.`,
    mirar: 'Su pauta del año: si se apagó así antes y qué hizo al volver.',
  }),
  'pocos-dias': (a) => ({
    titulo: `El período tiene ${enLetras(a.dias)} ${segun(a.dias, 'día', 'días')} con data`,
    dato: `Las subidas, bajadas y cambios de share se leen desde el día ${numero(a.minimo)}; antes, un solo día raro las movería.`,
    mirar: 'Los estrenos y los paneles nuevos, que sí se leen desde el primer día.',
  }),
  'pico-competencia': (a) => ({
    titulo: `${a.marca} tuvo un día de inversión ATL fuera de lo normal`,
    dato: `El ${fechaCorta(a.fecha)} invirtió ${monto(a.monto)}; un día típico con inversión, unos ${monto(a.mediana)}.`,
    mirar: 'Qué salió al aire ese día y en qué medio.',
  }),
  'medio-nuevo': (a) => ({
    titulo: `${a.marca} invierte en ${lista(a.medios.map((m) => medioEnFrase(m.nombre)))}, que no tenía en ${comp(a)}`,
    dato: `${capital(lista(a.medios.map((m) => `${medioEnFrase(m.nombre)} con ${monto(m.monto)} (${m.pct < 1 ? 'menos del 1 %' : `el ${porcentaje(m.pct)}`} de su inversión ATL)`)))}.`,
    mirar: 'Si es una prueba puntual o el inicio de una presencia sostenida.',
  }),
  'medio-adelante': (a) => ({
    titulo: `${a.marca} invierte más que ${a.propia} en ${lista(a.medios.map((m) => medioEnFrase(m.nombre)))}`,
    dato: `${capital(lista(a.medios.map((m) => `${medioEnFrase(m.nombre)}, ${monto(m.monto)} frente a ${m.propia ? monto(m.propia) : `nada de ${a.propia}`}`)))}, en ${per(a)}.`,
    mirar: `Si ${a.medios.length > 1 ? 'esos medios llegan' : 'ese medio llega'} al público de ${a.propia}.`,
  }),
  'paneles-competencia': (a) => ({
    // la base son los 90 días anteriores al período (Integrametrics detecta los paneles a saltos)
    titulo: `${a.marca} tiene paneles en ${lista(a.zonas)}, donde no tenía en los 90 días anteriores`,
    dato: `${numero(a.cuantos)} ${segun(a.cuantos, 'panel detectado', 'paneles detectados')} en ${per(a)}.`,
    mirar: `Qué versión lleva cada panel y si se cruza con las zonas de ${CLIENTE.nombre}.`,
  }),
  // una marca vigilada (solo capa 1) con una versión que se ve por primera vez en el período, en su tarjeta
  'aparicion-vigilada': (a) => ({
    // en digital cuenta mensajes nuevos, como el de la competencia; en ATL, versiones estrenadas. El período ya está
    // en la ventana de la tarjeta: no se repite
    titulo: a.tarjeta === 'digital'
      ? `${a.marca} usa ${enLetras(a.cuantos)} ${segun(a.cuantos, 'mensaje digital nuevo', 'mensajes digitales nuevos')} en el período`
      : `${a.marca} estrenó ${enLetras(a.cuantos, true)} ${segun(a.cuantos, 'versión', 'versiones')}${MEDIO_TARJETA[a.tarjeta]} en el período`,
  }),
  'digital-competencia': (a) => ({
    titulo: `${a.marca} usa ${enLetras(a.cuantas)} ${segun(a.cuantas, 'mensaje digital nuevo', 'mensajes digitales nuevos')} en el período`,
    dato: `${a.cuantas > 1 ? 'Uno de ellos: ' : ''}${cita(a.ultima)}, que no había usado antes.`,
    mirar: 'En qué plataformas sale y con cuántas piezas.',
  }),
  'share-digital': (a) => ({
    titulo: `El share de inversión digital de ${CLIENTE.nombre} disminuye`,
    dato: `${porcentaje(a.share)} de la inversión digital, frente a ${porcentaje(a.antes)} en ${comp(a)}.`,
    mirar: 'Cuánto cambió la inversión digital de cada marca, la propia incluida.',
  }),
  'dias-sin-dato': (a) => ({
    titulo: `${capital(enLetras(a.dias.length))} ${segun(a.dias.length, 'día', 'días')} sin registros ATL de Integrametrics`,
    dato: `Sin emisiones ATL registradas de ninguna marca: ${lista(a.dias.map(fechaCorta))}. Puede ser un día sin pauta o un hueco de la fuente.`,
    mirar: 'Con Integrametrics, si el día llegó completo.',
  }),
  'dominio-atl': (a) => ({
    titulo: `${CLIENTE.nombre} concentra ${a.share === 100 && a.inversionCompetencia > 0 ? `más del ${porcentaje(99)}` : `el ${porcentaje(a.share)}`} de la inversión ATL`,
    dato: !a.marca ? 'En TV, radio, cable, OTT y vía pública.' : a.inversionCompetencia > 0 ? `${a.marca} tiene ${a.shareCompetencia < 1 ? 'menos del 1 %' : porcentaje(a.shareCompetencia)} en ${per(a)}.` : `${a.marca} no tiene inversión ATL en ${per(a)}.`,
    mirar: 'Cuántas veces sale al aire cada pieza.',
  }),
  'share-digital-sube': (a) => ({
    titulo: `El share de inversión digital de ${CLIENTE.nombre} aumenta`,
    dato: `${porcentaje(a.share)} de la inversión digital, frente a ${porcentaje(a.antes)} en ${comp(a)}.`,
    mirar: 'Cuánto cambió la inversión digital de cada marca, la propia incluida.',
  }),
};
export function alerta(a) {
  const f = ALERTAS[a.id];
  return f ? { nivel: a.nivel, fuente: a.fuente, ...f(a) } : null;
}

// ── Abanico: textos para cada uso (versiones, piezas digitales, paneles) ──
export function textosDelAbanico(anio, { uno = 'versión', varios = 'versiones', propio = 'los propios, para comparar' } = {}) {
  const cuenta = (n) => `${numero(n)} ${segun(n, uno, varios)}`;
  const fecha = (iso) => (!iso ? '' : iso.slice(0, 4) === String(anio) ? fechaCorta(iso) : `${fechaCorta(iso)} ${iso.slice(0, 4)}`);
  return {
    propio,
    cuenta,
    detalle: (g) => { const d = g.anuncios.find((x) => x.desde)?.desde; return d ? (g.anuncios.length === 1 ? `desde el ${fecha(d)}` : `la más reciente, del ${fecha(d)}`) : ''; },
    ver: (n) => `Ver ${segun(n, 'la pieza', 'todas')}`,
    bajada: (g) => `${cuenta(g.anuncios.length)}${g.anuncios.length > 1 ? ', de la más reciente a la más antigua' : ''}`,
    meta: (x) => [x.plataformas.slice(0, 3).join(' · '), x.desde && `desde el ${fecha(x.desde)}`, x.hasta && x.hasta !== x.desde && `última emisión el ${fecha(x.hasta)}`, x.variantes > 1 && `${numero(x.variantes)} variantes`].filter(Boolean).join(' · '),
    texto: () => '',
    titulo: (x) => (x.titulo === x.titulo.toUpperCase() ? version(x.titulo) : x.titulo),
    sinContenido: null,
    nuevo: 'Nuevo', // el sello de un grupo que se ve por primera vez
  };
}

export { mesTexto, comparacionTexto, periodoTexto, solesCompacto };

// ── Capa 1: la semana de la competencia ──
const semanaDe = (S) => tramoFechas(S.desde, S.hasta);
const ventanaCorta = (S) => tramoFechas(S.desde, S.hasta).replace(/^(del|el) /, '');
const COMP = CLIENTE.competencia[0].nombre;
// las lecturas de la capa 1 sirven también para una marca vigiladas: se les pasa su nombre
const COMP_PRINCIPAL = COMP;

// Las marcas vigiladas en el resumen de la capa 1: de quién son las apariciones, o de quiénes no hubo
export function aparicionesNota(apariciones, marcas, contadas) {
  const parcial = contadas && contadas.digital !== contadas.atl ? ` · solo ${contadas.digital ? 'digital' : 'ATL'}` : '';
  const n = marcas.map((m) => m.nombre);
  if (!apariciones.length) return `ninguna de ${n.length > 1 ? `${n.slice(0, -1).join(', ')} ni ${n.at(-1)}` : n.join('')}${parcial}`;
  return `de ${lista([...new Set(apariciones.map((a) => a.nombre))])}${parcial}`;
}
// el botón del aviso de una vigilada: elige su marca en el filtro de la tarjeta (con su nombre para el lector de pantalla)
export const ACCION_VIGILADA = { digital: 'Ver sus piezas', tv: 'Ver sus emisiones', radio: 'Ver sus emisiones', ooh: 'Ver sus paneles' };
export const accionVigiladaEtiqueta = (tarjeta, nombre) => `${ACCION_VIGILADA[tarjeta].replace('sus', 'las')} de ${nombre}`;

export function digitalSemanaLectura(d, COMP = COMP_PRINCIPAL) {
  if (!d.piezas) return { titulo: `${COMP} no tiene piezas digitales registradas`, lectura: `Integrametrics no registra piezas digitales de ${COMP} hasta el ${fechaCorta(d.semana.hasta)}.` };
  const [m, segundo] = d.mensajes;
  const k = d.mensajes.length, nuevos = d.mensajes.filter((x) => x.nuevo).length;
  const cuantas = `${numero(d.piezas)} ${segun(d.piezas, 'pieza digital', 'piezas digitales')}`;
  // sin semanas antes en la data, nada se puede llamar nuevo: son las piezas vistas desde el primer día
  const titulo = d.reciente ? `${COMP} no estrenó piezas digitales en el período` : d.sinHistoria ? `${COMP} tiene ${cuantas} ${segun(d.piezas, 'vista', 'vistas')} con ${enLetras(k)} ${segun(k, 'mensaje', 'mensajes')}` : `${COMP} estrenó ${cuantas} con ${enLetras(k)} ${segun(k, 'mensaje', 'mensajes')}`;
  const plats = d.plataformas.slice(0, 2);
  const donde = plats.length ? `, ${plats.length > 1 ? 'sobre todo ' : ''}en ${plataformasTexto(plats)}` : '';
  const primero = d.reciente ? `Lo más reciente ${d.piezas === 1 ? 'es' : 'son'} ${cuantas} ${semanaDe(d.semana)}.`
    : d.sinHistoria ? `${d.piezas === 1 ? 'Es la vista' : 'Son las vistas'} desde el ${fechaCorta(d.inicio)}, el primer día con data digital.`
    : nuevos === k ? `${k === 1 ? 'El mensaje es nuevo' : `Los ${enLetras(k)} mensajes son nuevos`}.`
    : nuevos ? `${nuevos === 1 ? 'Uno' : capital(enLetras(nuevos))} de los ${enLetras(k)} mensajes ${nuevos === 1 ? 'es nuevo' : 'son nuevos'}.`
    : `${k === 1 ? 'Es un mensaje que ya venía usando' : `Los ${enLetras(k)} mensajes ya los venía usando`}.`;
  // el mensaje con más piezas, si hay uno que destaca (con un empate no se elige ninguno)
  const destaca = k > 1 && m.piezas > 1 && m.piezas > (segundo?.piezas ?? 0);
  const cola = destaca ? ` El mensaje con más piezas es ${cita(m.mensaje)} (${numero(m.piezas)})${donde}.`
    : donde ? ` ${d.piezas === 1 ? 'Sale' : 'Salen'}${donde.slice(1)}.` : '';
  return { titulo, lectura: `${primero}${cola}` };
}

export function atlSemanaLectura(a, medio, COMP = COMP_PRINCIPAL) {
  if (a.sinRegistros) return { titulo: `${COMP} no tiene emisiones en ${medio} registradas`, lectura: `Integrametrics no registra emisiones de ${COMP} en ${medio} hasta el ${fechaCorta(a.semana.hasta)}.` };
  const n = a.emisiones.length;
  const [motivo] = a.porMotivo;
  const tipos = a.porTipo.map((t) => `${numero(t.emisiones)} ${tipoAvisoPlural(t.nombre, t.emisiones)}`);
  const titulo = a.reciente ? `${COMP} no salió en ${medio} en el período` : `${COMP} tuvo ${numero(n)} ${segun(n, 'emisión', 'emisiones')} en ${medio}`;
  const primero = a.reciente
    ? `Lo último al aire es ${semanaDe(a.semana)}: ${numero(n)} ${segun(n, 'emisión', 'emisiones')} en ${enLetras(a.canales)} ${segun(a.canales, 'canal', 'canales')}.`
    : `${a.porTipo.length === 1 ? (n === 1 ? `Es ${conArticulo(a.porTipo[0].nombre)}` : `Todas son ${tipoAvisoPlural(a.porTipo[0].nombre, n)}`) : capital(lista(tipos))}, en ${enLetras(a.canales)} ${segun(a.canales, 'canal', 'canales')}.`;
  const segundo = a.porMotivo.length > 1 ? ` El motivo que más sale es ${cita(motivo.nombre)}, con ${numero(motivo.emisiones)}.` : ` El motivo es ${cita(motivo.nombre)}.`;
  return { titulo, lectura: `${primero}${segundo}` };
}

// ── Capa 1.5: tendencias ──
export function trendsMarcasLectura(b) {
  const [primera] = b.marcas;
  if (!primera) return { titulo: 'Las marcas de cámaras en Google', lectura: 'Google Trends no trajo las marcas de cámaras.' };
  const crecen = b.marcas.filter((m) => m.crecimiento != null && m.crecimiento >= 10).map((m) => m.nombre);
  const titulo = `${primera.nombre} es la marca de cámaras más buscada`;
  // sin semanas de un año antes no hay crecimiento que leer: se dice, no se lee como «ninguna crece»
  const sinAntes = b.marcas.every((m) => m.crecimiento == null);
  const lectura = sinAntes ? 'Google Trends todavía no tiene las mismas semanas de un año antes para comparar.' : crecen.length ? `${capital(lista(crecen))} ${crecen.length === 1 ? 'crece' : 'crecen'} frente a las mismas semanas de un año antes.` : `Ninguna crece más de ${porcentaje(10)} frente a las mismas semanas de un año antes.`;
  return { titulo, lectura };
}
// Las empresas del rubro por su nombre: sin decir quién lidera (sus búsquedas suman empleo y otros servicios), solo
// hacia dónde se mueve cada una frente a un año antes, en el orden de CLIENTE (la competencia primero)
export function competenciaBusquedasLectura(c) {
  const defs = CLIENTE.busquedas.competencia || [];
  const titulo = `Las búsquedas de ${lista(defs.map((d) => d.nombre))} en Google`;
  if (!c?.marcas.length) return { titulo, lectura: `Google Trends no trajo las ${CLIENTE.rubroPlural}.` };
  const enOrden = defs.map((d) => c.marcas.find((m) => m.id === d.id)).filter(Boolean);
  if (enOrden.every((m) => m.crecimiento == null)) return { titulo, lectura: enOrden.some((m) => m.antes != null) ? 'Un año antes no hubo búsquedas suficientes para comparar.' : 'Google Trends todavía no tiene las mismas semanas de un año antes para comparar.' };
  const grupo = (f) => enOrden.filter((m) => m.crecimiento != null && f(m.crecimiento));
  const suben = grupo((x) => x >= 1), bajan = grupo((x) => x <= -1), quietas = grupo((x) => Math.abs(x) < 1);
  const n = enOrden.filter((m) => m.crecimiento != null).length;
  const verbo = (xs, uno, varios) => `${lista(xs.map((m) => m.nombre))} ${xs.length > 1 ? varios : uno}`;
  const partes = suben.length === n ? [`Las ${enLetras(n)} suben`] : bajan.length === n ? [`Las ${enLetras(n)} bajan`]
    : [suben.length && verbo(suben, 'sube', 'suben'), bajan.length && verbo(bajan, 'baja', 'bajan'), quietas.length && verbo(quietas, 'se mantiene', 'se mantienen')].filter(Boolean);
  return { titulo, lectura: `${capital(lista(partes))} frente a las mismas semanas de un año antes.` };
}
export function competenciaBusquedasPie(consultado) {
  const notas = (CLIENTE.busquedas.competencia || []).filter((x) => x.nota);
  const frase = notas.map((x, i) => (i === 0 ? `${x.nombre} incluye búsquedas de ${x.nota}` : `${x.nombre}, de ${x.nota}`)).join('; ');
  return `Google Trends, Perú · consultado el ${fechaCorta(consultado)}.${frase ? ` ${frase}.` : ''}`;
}
export function competenciaBusquedasAyuda(semanas) {
  const fuera = CLIENTE.busquedas.sinMedir || [];
  return `Google Trends da un índice en Perú, no la cantidad de búsquedas: 100 es la semana con más búsquedas de la consulta. Las empresas van en la misma consulta, así que se comparan entre sí, pero no con las marcas de cámaras. El porcentaje de cada una compara el promedio de las últimas ${numero(semanas)} semanas completas frente a las mismas semanas de un año antes.${fuera.length ? ` ${lista(fuera)} no ${fuera.length > 1 ? 'tienen' : 'tiene'} búsquedas suficientes para medirse.` : ''}`;
}
export function tiktokLectura(t) {
  const [h] = t.hashtags;
  const marca = t.hashtags.find((x) => x.deMarca);
  const delante = marca ? t.hashtags.indexOf(marca) : -1;
  return {
    titulo: `${h.hashtag} es el hashtag con la tasa de interacción más alta`,
    lectura: !marca ? 'Ningún hashtag de marca entra en la lista.' : delante === 0 ? `Un hashtag de marca, ${marca.hashtag}, encabeza la lista.` : `El primer hashtag de marca es ${marca.hashtag}, con ${numero(delante)} del rubro por delante.`,
  };
}
// El tono de cada tema de Facebook, como se lee en su chip
export const TONOS = { 'muy-positivo': 'Muy positivo', positivo: 'Positivo', neutro: 'Neutro', negativo: 'Negativo', 'muy-negativo': 'Muy negativo' };
export function facebookLectura(f) {
  const [t] = f.temas;
  const negativo = [...f.temas].sort((a, b) => b.negativo - a.negativo)[0];
  return { titulo: `${t.tema} es el tema con más menciones`, lectura: `El tono más negativo está en ${negativo.tema.toLowerCase()} (${porcentaje(negativo.negativo)} de sus menciones).` };
}

// ── Capa 2: dónde, qué compra y cuándo ──
export function digitalPlataformasLectura(u) {
  const r = rivalDe(u), p = propiaDe(u);
  const total = (m) => Object.values(m.grupos).reduce((s, x) => s + x, 0);
  if (!total(r)) return { titulo: `${r.nombre} no tiene avisos digitales registrados`, lectura: `${p.nombre} tiene ${numero(total(p))} en ${periodoTexto(u.periodo)}.` };
  const principal = (m) => Object.entries(m.grupos).sort((a, b) => b[1] - a[1])[0];
  const [kr, nr] = principal(r);
  const parteR = Math.round((nr / total(r)) * 100);
  const [kp] = total(p) ? principal(p) : [null];
  const parteP = kp ? Math.round((p.grupos[kp] / total(p)) * 100) : null;
  // «la mayor parte» solo con más de la mitad; si no, es donde pone más
  const tituloR = parteR >= 100 ? `Todos los avisos digitales de ${r.nombre} están en ${u.nombreGrupo(kr)}` : `${r.nombre} concentra el ${porcentaje(parteR)} de sus avisos digitales en ${u.nombreGrupo(kr)}`;
  return { titulo: tituloR, lectura: kp ? `${p.nombre} pone ${parteP > 50 ? 'la mayor parte' : 'más avisos'} en ${u.nombreGrupo(kp)}.` : `${p.nombre} no tiene avisos digitales registrados en el período.` };
}
// P: el período de la compra; ventana: con un período corto, «en cuatro semanas» (la compra se lee en las que terminan en él)
export function compraLectura(c, P, ventana = null) {
  const r = c.totales[c.competencia], p = c.totales[c.propia];
  const rn = textosMarca.nombreMarca(c.competencia), pn = textosMarca.nombreMarca(c.propia);
  const canales = (n) => `${enLetras(n)} ${segun(n, 'canal', 'canales')}`;
  if (!r.emisiones) return { titulo: `${rn} no tiene emisiones en TV, cable, radio ni OTT ${semanaDe(P)}`, lectura: `${pn} tiene ${numero(p.emisiones)} ${segun(p.emisiones, 'emisión', 'emisiones')} en ${canales(p.canales)}.` };
  return {
    titulo: `${ventana ? `${capital(ventana)}, ` : ''}${rn} compró ${numero(r.emisiones)} ${segun(r.emisiones, 'emisión', 'emisiones')} en ${canales(r.canales)}`,
    lectura: c.enComun ? `Coinciden con ${pn} en ${canales(c.enComun)}.` : `No coinciden con ${pn} en ningún canal.`,
  };
}

// ── Capa 3: plataformas y CRM (hoy con data de ejemplo) ──
const usd = (n) => dolares(n);
// El pie del resumen de las plataformas con objetivos: contra qué fechas van las flechas y qué dice el color, con los
// días elegidos (lo que toca cambia con el período)
// La moneda del panel y, si alguna cuenta reporta en otra, a cuánto se pasa: «En dólares. Google Ads reporta en euros:
// cada euro, a 1,1205 dólares (Banco Central Europeo, 22 de octubre).» Con la cuenta elegida, solo si es la que cambia
export function monedaNota(cambios, plataforma = null) {
  const de = cambios.filter((c) => !plataforma || c.plataformas.includes(plataforma));
  if (plataforma && !de.length) return null;
  const nombre = { EUR: ['euros', 'euro'] };
  const tramos = de.map((c) => `${lista(c.plataformas)} reporta${c.plataformas.length > 1 ? 'n' : ''} en ${nombre[c.moneda]?.[0] ?? c.moneda}: cada ${nombre[c.moneda]?.[1] ?? c.moneda}, a ${numero(c.usd, 4)} dólares (${c.fuente}, ${fechaSinAnio(c.fecha)}).`);
  return ['En dólares.', ...tramos].join(' ');
}

export function objetivosPie(o, P) {
  const mesEntero = (a, b) => a.slice(8) === '01' && b.slice(0, 7) === a.slice(0, 7) && new Date(Date.UTC(+b.slice(0, 4), +b.slice(5, 7), 0)).getUTCDate() === +b.slice(8);
  const contra = !P.compararDesde ? '' : P.compararDesde === P.compararHasta ? `a${tramoFechas(P.compararDesde, P.compararHasta).replace(/^el /, 'l ')}`
    : mesEntero(P.compararDesde, P.compararHasta) ? `a ${mesLargo(+P.compararDesde.slice(5, 7))}` : `a los días ${tramoFechas(P.compararDesde, P.compararHasta)}`;
  const flechas = contra ? `Flechas: frente ${contra}. ` : '';
  const conData = o.sinData ? ' con data' : '';
  const estos = o.dias === 1 ? `a este día${conData}` : `a estos ${numero(o.dias)} días${conData}`;
  const objetivo = o.unMes ? '' : `El objetivo es lo que toca ${estos}. `;
  if (o.pocos) return `${flechas}${objetivo}Con menos de ${numero(DIAS_MINIMOS)} días con data, el avance va sin color.`;
  const rojo = o.toca > MARGEN_AVANCE ? `; rojo bajo ${porcentaje(o.toca - MARGEN_AVANCE)}` : '';
  const color = o.mesCompleto || !o.unMes ? `Verde desde ${porcentaje(100)}${rojo}.` : `Verde desde ${porcentaje(o.toca)}, lo que toca ${estos}${rojo}.`;
  return `${flechas}${objetivo}${color} En L2B y costos, ${porcentaje(100)} es el mínimo o el tope; en inversión, pasarse también es rojo.`;
}

// La comparación del resumen se dice con sus fechas, al pie: frente a qué tramo se mide cada cambio
export const comparadoTexto = (P) => (!P.compararDesde ? null : `Comparado con ${P.compararDesde === P.compararHasta ? tramoFechas(P.compararDesde, P.compararHasta) : `los días ${tramoFechas(P.compararDesde, P.compararHasta)}`}.`);

// 3.1 · Leads y bookings en el tiempo: el rango de bookings, el L2B y el tramo más flojo, por semana o por día (las semanas,
// solo las enteras: la en curso no se compara con semanas completas)
export function plataformasTiempoLectura(tramos, unidad = 'semana') {
  const enteros = tramos.filter((s) => (unidad === 'dia' || s.dias >= 7) && s.bookings != null);
  const porTramo = unidad === 'dia' ? 'por día' : 'por semana';
  const titulo = `Leads y bookings ${porTramo}`;
  if (enteros.length < 2) return { titulo, lectura: '' };
  const bs = enteros.map((s) => s.bookings), min = Math.min(...bs), max = Math.max(...bs);
  const l2b = enteros.map((s) => s.l2b).filter((n) => n != null).map(Math.round), lmin = Math.min(...l2b), lmax = Math.max(...l2b);
  const flojo = enteros.reduce((a, s) => (s.bookings < a.bookings ? s : a));
  const cual = unidad === 'dia' ? `El día más flojo fue el ${fechaCorta(flojo.fecha)}` : `La semana más floja fue la del ${fechaCorta(flojo.desde)}`;
  return {
    titulo: min === max ? `Los bookings se mantienen en ${numero(min)} ${porTramo}` : `Los bookings van entre ${numero(min)} y ${numero(max)} ${porTramo}`,
    lectura: `De cada 100 leads llegan a booking ${lmin === lmax ? numero(lmin) : `entre ${numero(lmin)} y ${numero(lmax)}`}. ${cual}, con ${numero(flojo.leads)} leads y ${numero(flojo.bookings)} bookings.`,
  };
}

// 3.3 · La tabla de plataformas: la que más rinde frente a lo que pone, y el objetivo de costo por booking
export function plataformasTablaLectura(x) {
  const conParte = x.plataformas.filter((p) => p.parteInversion != null && p.parteBookings != null);
  const rinde = [...conParte].sort((a, b) => (b.parteBookings - b.parteInversion) - (a.parteBookings - a.parteInversion))[0];
  const encima = x.plataformas.filter((p) => p.estadoCpb === 'lejos' || p.estadoCpb === 'cerca');
  const titulo = rinde && rinde.parteBookings > rinde.parteInversion
    ? `${rinde.nombre} pone el ${porcentaje(rinde.parteInversion)} de la inversión y trae el ${porcentaje(rinde.parteBookings)} de los bookings`
    : 'Cada plataforma frente a su objetivo';
  const objetivo = encima.length ? `${lista(encima.map((p) => p.nombre))} ${encima.length === 1 ? 'queda' : 'quedan'} por encima de su objetivo de costo por booking.`
    : 'Todas quedan dentro de su objetivo de costo por booking.';
  // de las que hoy están en objetivo, la que más semanas lo pasó
  const semanas = x.plataformas.filter((p) => !encima.includes(p) && p.semanasSobreObjetivo?.encima > 0).sort((a, b) => b.semanasSobreObjetivo.encima - a.semanasSobreObjetivo.encima)[0];
  const cola = semanas ? ` ${semanas.nombre} lo pasó en ${numero(semanas.semanasSobreObjetivo.encima)} de las últimas ${numero(semanas.semanasSobreObjetivo.de)} semanas.` : '';
  return { titulo, lectura: `${objetivo}${cola}` };
}
// Un costo frente a su objetivo, en la tabla: «12 % bajo $380» o «8 % sobre $380»
export const frenteObjetivoTexto = (costo, objetivo) => {
  if (costo == null || !objetivo) return null;
  const d = Math.round(((costo - objetivo) / objetivo) * 100);
  return d === 0 ? `en ${usd(objetivo)}` : `${porcentaje(Math.abs(d))} ${d < 0 ? 'bajo' : 'sobre'} ${usd(objetivo)}`;
};
const PARECIDO_L2B = 0.1;
export function pushPullLectura(x) {
  const [push, pull] = x.tipos;
  if (push.l2b == null || pull.l2b == null) return { titulo: 'Push y Pull', lectura: '' };
  const mas = push.l2b >= pull.l2b ? push : pull, menos = mas === push ? pull : push;
  const nombre = (t) => (t.tipo === 'push' ? 'Push' : 'Pull');
  // se parecen si la diferencia es menos del 10 % de la tasa mayor
  if (Math.round(mas.l2b) === Math.round(menos.l2b)) return { titulo: `Push y Pull convierten parecido: ${porcentaje(push.l2b)} de sus leads llegan a booking`, lectura: '' };
  if (mas.l2b - menos.l2b < mas.l2b * PARECIDO_L2B) return { titulo: 'Push y Pull convierten parecido', lectura: `De Push llega a booking ${porcentaje(push.l2b)} de los leads; de Pull, ${porcentaje(pull.l2b)}.` };
  return { titulo: `${nombre(mas)} convierte más: ${porcentaje(mas.l2b)} de sus leads llegan a booking`, lectura: `${nombre(menos)}, ${porcentaje(menos.l2b)}.` };
}
// Un costo frente a su objetivo, en palabras: en objetivo, o cuánto lo pasa
// Las dos filas marcadas en las tablas de plataformas, y la ayuda que dice cómo se eligen
export const extremoTexto = (cual, unidad) => `${cual === 'mejor' ? 'Mejor' : 'Peor'} ${unidad}`;
// El rótulo de una semana en las tablas de plataformas: la en curso lo dice; la que corta el período dice sus días
export const semanaRotulo = (s) => (s.dias >= 7 ? fechaCorta(s.desde) : s.enCurso ? `${fechaCorta(s.desde)} (en curso)` : `${fechaCorta(s.primero)} al ${fechaCorta(s.hasta)}`);
export const extremosAyuda = (unidad) => {
  const uno = unidad === 'día' ? 'el día' : 'la semana', otro = unidad === 'día' ? 'el' : 'la';
  return `En verde, ${uno} con más bookings; en rojo, ${otro} de menos (si empatan, decide el costo por booking). ${unidad === 'día' ? 'Un día' : 'Una semana'} cuyo costo por booking llega a ${numero(VECES_PROMEDIO)} veces el promedio va en rojo aunque tenga bookings${unidad === 'semana' ? '; la semana en curso no entra' : ''}.`;
};

export const estadoObjetivo = (e) => ({ bien: 'En objetivo', cerca: `Hasta ${porcentaje(MARGEN_OBJETIVO)} por encima`, lejos: `Más de ${porcentaje(MARGEN_OBJETIVO)} por encima` }[e] ?? null);
export { fechaSinAnio };

// ── Piezas y campañas (capa 3): lo que reporta cada plataforma, con un estado por fila ──
export const ESTADO_PIEZA = {
  'sin-leads': 'Sin leads', costosa: 'Costosa', saturada: 'Saturada', rinde: 'Rinde', aprendizaje: 'Aprendizaje', 'poca-data': 'Poca inversión',
};
const NIVEL_PIEZA = { pieza: ['pieza', 'piezas', true], conjunto: ['conjunto', 'conjuntos', false], campana: ['campaña', 'campañas', true] };
const dias = (n) => `${numero(n)} ${segun(n, 'día', 'días')}`;
// Por qué tiene su estado, en una frase con sus cifras: qué pasó, sin juicio (el juicio es el estado)
// En una campaña o un conjunto, si alguna de sus piezas pide mirarse, eso es lo que pasó
const PARTES_PIEZA = [['sin-leads', 'gastó sin traer leads', 'gastaron sin traer leads'], ['costosa', 'salió costosa', 'salieron costosas'], ['saturada', 'se saturó', 'se saturaron']];
const frasePiezas = (cuenta) => {
  const partes = PARTES_PIEZA.map(([e, s1, p1]) => [cuenta[e] || 0, s1, p1]).filter(([k]) => k > 0);
  return partes.length ? `${capital(lista(partes.map(([k, s1, p1], i) => `${enLetras(k, true)}${i === 0 ? ` ${segun(k, 'pieza', 'piezas')}` : ''} ${segun(k, s1, p1)}`)))}.` : null;
};
export function piezaDato(f) {
  if (f.nivel !== 'pieza' && f.cuenta && f.estado !== 'sin-leads') { const t = frasePiezas(f.cuenta); if (t) return t; }
  switch (f.estado) {
    case 'sin-leads': return f.nivel === 'pieza' ? `Gastó ${dolares(f.inversion)} en ${dias(f.edad)} y no trajo leads.` : `Gastó ${dolares(f.inversion)} y no trajo leads.`;
    case 'saturada': return `Su lead costaba ${dolares(f.saturacion.antes)}; en la última semana, ${dolares(f.saturacion.ahora)}.`;
    case 'aprendizaje': return f.alAire === false ? `Estuvo ${dias(f.edad)} al aire.` : `Lleva ${dias(f.edad)} al aire.`;
    case 'poca-data': return `Gastó ${dolares(f.inversion)}: todavía es poco para juzgar${f.nivel === 'conjunto' ? 'lo' : 'la'}.`;
    default: return `Cada lead costó ${dolares(f.cpl)}; el promedio de ${f.plataformaNombre} fue ${dolares(f.base)}.`;
  }
}
// Una pieza que ya no está al aire lo dice bajo su nombre
export const piezaPausa = (f) => (f.nivel === 'pieza' && f.fin && !f.alAire ? `Pausada el ${fechaCorta(f.fin)}` : null);
// El título y la lectura: cuántas piden mirarse y qué parte de la inversión se llevaron, frente a las que rindieron
export function piezasLectura(x, nivel = 'pieza') {
  const [uno, varios, fem] = NIVEL_PIEZA[nivel];
  const filas = nivel === 'pieza' ? x.piezas : nivel === 'conjunto' ? x.conjuntos : x.campanas;
  const n = (e) => filas.filter((f) => f.estado === e).length;
  const costoso = fem ? ['salió costosa', 'salieron costosas'] : ['salió costoso', 'salieron costosos'], saturado = fem ? ['se saturó', 'se saturaron'] : ['se saturó', 'se saturaron'];
  const partes = [['sin-leads', 'gastó sin traer leads', 'gastaron sin traer leads'], ['costosa', ...costoso], ['saturada', ...saturado]]
    .map(([e, s1, p1]) => [n(e), s1, p1]).filter(([k]) => k > 0);
  const suma = (e) => filas.filter((f) => e.includes(f.estado)).reduce((t, f) => t + f.inversion, 0);
  const revisar = suma(['sin-leads', 'costosa', 'saturada']), rinden = suma(['rinde']);
  const pct = (v) => porcentaje((v / x.total) * 100);
  const titulo = partes.length
    ? capital(lista(partes.slice(0, 2).map(([k, s1, p1], i) => `${enLetras(k, fem)}${i === 0 ? ` ${segun(k, uno, varios)}` : ''} ${segun(k, s1, p1)}`)))
    : `${fem ? 'Ninguna' : 'Ningún'} ${uno} gastó sin traer leads ni ${costoso[0]}`;
  const lectura = !x.total ? '' : revisar
    ? `Se llevaron el ${pct(revisar)} de la inversión. ${fem ? 'Las' : 'Los'} que rindieron, el ${pct(rinden)}.`
    : `${fem ? 'Las' : 'Los'} que rindieron se llevaron el ${pct(rinden)} de la inversión.`;
  return { titulo, lectura };
}
export function piezasAyuda(U) {
  return `Leads de la plataforma, no del CRM: a este nivel no hay bookings. Cada fila se compara con el costo por lead de su plataforma en el período. `
    + `Aprendizaje: menos de ${U.diasAprendizaje} días al aire, todavía no se juzga (TikTok lo pide en su guía). Saturada: su lead de los últimos ${U.diasReciente} días cuesta ${numero(U.vecesSaturada)} veces el de antes (el criterio de fatiga de Meta). `
    + `Aprendizaje limitado: un conjunto de Meta o TikTok con menos de ${U.resultadosSemana} leads en ${U.diasReciente} días (Meta y TikTok). `
    + `Por costumbre de la industria, no de las plataformas: se juzga recién cuando gastó ${U.vecesGasto} veces el costo por lead de su plataforma. Si hasta ahí no trajo leads, va Sin leads; si su lead cuesta ${numero(U.vecesCostosa, 1)} veces el promedio o más, Costosa; por debajo, Rinde.`;
}
