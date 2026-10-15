// Lecturas de cada tarjeta. Observan, no ordenan; dos frases como máximo; cada comparación dice frente a qué.
// Toda cifra llega calculada desde src/calculo; acá solo se escribe.
import { numero, porcentaje, soles, solesCompacto, fechaCorta } from '../sistema/formato.js';
import { CLIENTE } from '../cliente.js';
import { periodoTexto, comparacionTexto, puntosFrente, enLetras, segun, lista, capital, horasTexto, DIAS_SEMANA, version, mesTexto, medioEnFrase } from './comun.js';

const propiaDe = (u) => u.marcas.find((m) => m.propia);
const rivales = (u) => u.marcas.filter((m) => !m.propia);
const pct = (n) => porcentaje(n);

// ── Resumen de cada capa: una frase por universo, con la cifra en negrita y la variación con color ──
export function fraseShare(u, universo, P) {
  const p = propiaDe(u);
  const r = rivales(u)[0];
  if (p.share == null) return [{ t: `Sin inversión registrada en ${universo} en el período.` }];
  const segs = [{ t: `En ${universo}, ${p.nombre} tiene ` }, { t: pct(p.share), cifra: true }, { t: ` de la inversión` }];
  if (r) segs.push({ t: `; ${r.nombre}, ` }, { t: pct(r.share), cifra: true });
  if (p.cambioPts != null && P.compararDesde) {
    segs.push({ t: '. ' });
    segs.push({ t: capital(puntosFrente(p.cambioPts, P)), tono: p.cambioPts > 0 ? 'mejora' : p.cambioPts < 0 ? 'empeora' : undefined });
    segs.push({ t: ` para ${p.nombre}.` });
  } else segs.push({ t: '.' });
  return segs;
}

// ── 4.1 ──
export function atlLectura(v) {
  const u = v.lee.atl, P = v.periodo, p = propiaDe(u), r = rivales(u)[0];
  const titulo = `${p.nombre} concentra ${pct(p.share)} de la inversión ATL`;
  const frente = puntosFrente(p.cambioPts, P);
  return { titulo, lectura: `TV, radio, cable, OTT y vía pública, estimado por Integrametrics para ${periodoTexto(P)}. ${r ? `${r.nombre} tiene ${pct(r.share)}` : ''}${frente ? `; ${p.nombre} queda ${frente}.` : '.'}` };
}
export function digitalLectura(v) {
  const u = v.lee.digital, P = v.periodo, p = propiaDe(u), r = rivales(u)[0];
  const lider = [...u.marcas].sort((a, b) => b.inversion - a.inversion)[0];
  const parejo = r && Math.abs(p.share - r.share) <= 10;
  const titulo = parejo ? 'En digital la inversión está pareja' : `${lider.nombre} lidera la inversión digital`;
  const frente = puntosFrente(p.cambioPts, P);
  return { titulo, lectura: `Facebook, Instagram, Google y YouTube: ${p.nombre} tiene ${pct(p.share)}${r ? ` y ${r.nombre} ${pct(r.share)}` : ''}.${frente ? ` ${capital(p.nombre)} queda ${frente}.` : ''}` };
}
export function presionLectura(v) {
  const u = v.lee.atl;
  const conData = u.diaria.filter((d) => Object.values(d.valores).some((x) => x != null));
  const dias = (m) => conData.filter((d) => d.valores[m.id] > 0).length;
  const p = propiaDe(u), r = rivales(u)[0];
  const mayor = conData.reduce((a, d) => ((d.valores[p.id] ?? 0) > (a?.valores[p.id] ?? 0) ? d : a), null);
  const pico = mayor && mayor.valores[p.id] > 0 ? ` Su día de mayor inversión fue el ${fechaCorta(mayor.fecha)}, con ${soles(mayor.valores[p.id])}.` : '';
  return { titulo: 'Inversión ATL día por día', lectura: `${p.nombre} invierte ${dias(p) === conData.length ? 'todos los días con data' : `en ${numero(dias(p))} de ${numero(conData.length)} días`}${r ? `; ${r.nombre}, en ${numero(dias(r))}` : ''}.${pico}` };
}

// ── 1.1 ──
export function estrenosLectura(v) {
  const e = v.lee.estrenos, P = v.periodo;
  const titulo = 'Piezas que se estrenaron';
  if (!e.length) return { titulo, lectura: `Ninguna versión nueva salió al aire en ${periodoTexto(P)}. Integrametrics marca una pieza como nueva el día de su primera emisión.` };
  const porMarca = [...new Set(e.map((x) => x.nombre))].map((n) => `${numero(e.filter((x) => x.nombre === n).length)} de ${n}`);
  return { titulo, lectura: `${capital(enLetras(e.length, true))} ${segun(e.length, 'pieza nueva', 'piezas nuevas')} en ${periodoTexto(P)}: ${lista(porMarca)}.` };
}
export const estrenoTitulo = (e) => `«${version(e.version)}»`;
export function estrenoDato(e) {
  const hora = e.fecha.slice(11, 16);
  return [e.nombre, [e.tipo && e.tipo.toLowerCase(), e.duracion && `${numero(e.duracion)} s`].filter(Boolean).join(' de '), e.canal, `${fechaCorta(e.fecha.slice(0, 10))}${hora ? ` · ${Number(hora.slice(0, 2))}:${hora.slice(3, 5)}` : ''}`].filter(Boolean).join(' · ');
}
export function abanicoAtlLectura(a, P) {
  const p = a.propio?.anuncios.length ?? 0;
  const r = a.grupos.map((g) => `${g.nombre}, ${numero(g.anuncios.length)}`);
  return { titulo: 'Versiones ATL al aire', lectura: `${CLIENTE.nombre} tiene ${numero(p)} ${segun(p, 'versión', 'versiones')} al aire en ${periodoTexto(P)}${r.length ? `; ${lista(r)}` : ''}. Cada carta es una versión, con su video, audio o imagen.` };
}
export function abanicoDigitalLectura(a, P) {
  const p = a.propio?.anuncios.length ?? 0;
  const r = a.grupos.map((g) => `${g.nombre}, ${numero(g.anuncios.length)}`);
  return { titulo: 'Piezas digitales nuevas', lectura: `Versiones que aparecieron en ${periodoTexto(P)}: ${CLIENTE.nombre}, ${numero(p)}${r.length ? `; ${lista(r)}` : ''}. Las variantes de una misma versión van juntas en una carta.` };
}

// ── 1.2 ──
export function viaPublicaLectura(vp, P) {
  const titulo = 'Paneles por distrito';
  if (!vp.paneles) return { titulo, lectura: `Integrametrics no detectó paneles de las marcas que se siguen en ${periodoTexto(P)}.` };
  const marcas = Object.entries(vp.porMarca).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  const top = vp.porDistrito[0];
  const { nombreMarca } = textosMarca;
  return { titulo, lectura: `${capital(lista(marcas.map(([m, n]) => `${nombreMarca(m)} tiene ${numero(n)} ${segun(n, 'panel detectado', 'paneles detectados')}`)))} en ${periodoTexto(P)}. ${top.nombre} es el distrito con más (${numero(top.total)}).` };
}
// Nombres de marca para textos que reciben ids de la fuente
export const textosMarca = {
  nombreMarca: (m) => (m === CLIENTE.marcaFuente ? CLIENTE.nombre : CLIENTE.competencia.find((c) => c.marcaFuente === m)?.nombre ?? m),
};

// ── 3.1 ──
export function mediosLectura(v, MEDIOS) {
  const u = v.lee.atl;
  const frase = (m) => {
    const tot = Object.values(m.medios).reduce((t, x) => t + x, 0);
    if (!tot) return null;
    const [k, x] = Object.entries(m.medios).sort((a, b) => b[1] - a[1])[0];
    return `${m.nombre} pone ${pct(Math.round((x / tot) * 100))} en ${medioEnFrase(MEDIOS[k] || k)}`;
  };
  const frases = u.marcas.map(frase).filter(Boolean);
  return { titulo: 'Inversión ATL por medio', lectura: frases.length ? `${capital(lista(frases))}.` : 'Sin inversión ATL registrada en el período.' };
}
export function franjasLectura(v, FRANJAS) {
  const u = v.lee.atl;
  const frase = (m) => {
    const tot = Object.values(m.franjas).reduce((t, x) => t + x, 0);
    if (!tot) return null;
    const [k, x] = Object.entries(m.franjas).sort((a, b) => b[1] - a[1])[0];
    return `${pct(Math.round((x / tot) * 100))} de las emisiones de ${m.nombre} van ${k === 'DIA' ? 'de día' : `en ${FRANJAS[k].toLowerCase()}`}`;
  };
  const frases = u.marcas.map(frase).filter(Boolean);
  return { titulo: 'Emisiones por franja', lectura: frases.length ? `${capital(lista(frases))}.` : 'Sin emisiones en el período.' };
}
export function canalesLectura(med, marca) {
  const nombre = textosMarca.nombreMarca(marca);
  if (!med) return { titulo: `Canales de ${nombre}`, lectura: `Sin emisiones de ${nombre} en el período.` };
  const [a, b] = med.canales;
  return { titulo: `Canales de ${nombre}`, lectura: `${numero(med.totalCanales)} ${segun(med.totalCanales, 'canal', 'canales')} con inversión; ${a.nombre}${b ? ` y ${b.nombre}` : ''} ${b ? 'concentran' : 'concentra'} la mayor parte.` };
}

// ── 3.2 ──
export function horarioLectura(med, marca) {
  const nombre = textosMarca.nombreMarca(marca);
  const titulo = `Cuándo emite ${nombre}`;
  if (!med || !med.horasAltas.length) return { titulo, lectura: `Sin emisiones de ${nombre} con hora en el período.` };
  const dia = med.diaMayor == null ? null : DIAS_SEMANA[med.diaMayor];
  return { titulo, lectura: `Las cuatro horas con más emisiones van ${horasTexto(med.horasAltas)}.${dia ? ` El día con más es el ${dia}.` : ''}` };
}
export function programasLectura(med, marca) {
  const nombre = textosMarca.nombreMarca(marca);
  if (!med || !med.programas.length) return { titulo: `Programas de ${nombre}`, lectura: `Sin programas registrados para ${nombre} en el período.` };
  return { titulo: `Programas de ${nombre}`, lectura: `Emite en ${numero(med.totalProgramas)} ${segun(med.totalProgramas, 'programa', 'programas')}; el que más emisiones lleva es ${capital(version(med.programas[0].nombre))}.` };
}

// ── 2.2 ──
export function temporadaLectura(t) {
  const meses = t.filter((m) => !m.parcial);
  const ids = Object.keys(t[0]?.atl || {});
  const conInv = (id) => meses.filter((m) => m.atl[id] > 0).length;
  const frases = ids.map((id) => `${textosMarca.nombreMarca(id)} invirtió en ATL ${conInv(id) === meses.length ? 'todos los meses cerrados' : `en ${numero(conInv(id))} de ${numero(meses.length)} meses cerrados`}`);
  return { titulo: 'Inversión de cada mes', lectura: `${capital(lista(frases))}. El mes en curso va con su tramo, marcado como parcial.` };
}

// ── 2.1: alertas ──
const ALERTAS = {
  'estreno-competencia': (a) => ({
    titulo: `${a.marca} estrenó ${enLetras(a.cuantos, true)} ${segun(a.cuantos, 'pieza', 'piezas')} en el período`,
    dato: `La más reciente: ${estrenoTitulo(a.ultimo)}, ${estrenoDato(a.ultimo)}.`,
    mirar: 'El mensaje y el medio de la pieza, y si se cruza con lo que tiene al aire la marca propia.',
  }),
  'pico-competencia': (a) => ({
    titulo: `${a.marca} tuvo un día de inversión fuera de lo normal`,
    dato: `El ${fechaCorta(a.fecha)} invirtió ${soles(a.monto)}; un día típico con inversión, unos ${soles(a.mediana)}.`,
    mirar: 'Qué salió al aire ese día y en qué medio.',
  }),
  'medio-nuevo': (a) => ({
    titulo: `${a.marca} invierte en ${lista(a.medios.map((m) => medioEnFrase(m.nombre)))}, que no tenía en la comparación`,
    dato: `${capital(lista(a.medios.map((m) => `${medioEnFrase(m.nombre)} con ${soles(m.monto)}, ${m.pct < 1 ? 'menos del 1 %' : `el ${porcentaje(m.pct)}`} de su inversión ATL`)))}.`,
    mirar: 'Si es una prueba puntual o el inicio de una presencia sostenida.',
  }),
  'share-digital': (a) => ({
    titulo: `${CLIENTE.nombre} pierde share en digital`,
    dato: `${porcentaje(a.share)} de la inversión digital, frente a ${porcentaje(a.antes)} en la comparación.`,
    mirar: 'Qué plataformas y piezas sumó la competencia en el período.',
  }),
  'dias-sin-dato': (a) => ({
    titulo: `${capital(enLetras(a.dias.length))} ${segun(a.dias.length, 'día', 'días')} sin registros de Integrametrics`,
    dato: `Sin emisiones registradas de ninguna marca: ${lista(a.dias.map(fechaCorta))}. Puede ser un día sin pauta o un hueco de la fuente.`,
    mirar: 'Con Integrametrics, si el día llegó completo.',
  }),
  'dominio-atl': (a) => ({
    titulo: `${CLIENTE.nombre} concentra ${porcentaje(a.share)} de la inversión ATL`,
    dato: 'En TV, radio, cable, OTT y vía pública, la presencia de la competencia es marginal en el período.',
    mirar: 'La frecuencia de las piezas al aire: con tanta presión propia, el desgaste creativo llega antes.',
  }),
  'share-digital-sube': (a) => ({
    titulo: `${CLIENTE.nombre} gana share en digital`,
    dato: `${porcentaje(a.share)} de la inversión digital, frente a ${porcentaje(a.antes)} en la comparación.`,
    mirar: 'Qué piezas digitales nuevas sostienen la subida.',
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
  };
}

export { mesTexto, comparacionTexto, periodoTexto, solesCompacto };
