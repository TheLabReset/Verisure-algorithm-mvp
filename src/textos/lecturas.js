// Lecturas de cada tarjeta. Observan, no ordenan; dos frases como máximo; cada comparación dice frente a qué.
// Lo principal es la competencia: cada lectura empieza por ella y la marca propia va para comparar, salvo cuando
// la tarjeta es sobre la marca propia. Toda cifra llega calculada desde src/calculo; acá solo se escribe.
import { numero, porcentaje, soles, solesCompacto, fechaCorta } from '../sistema/formato.js';
import { CLIENTE } from '../cliente.js';
import { tramoMeses, periodoTexto, comparacionTexto, puntosFrente, enLetras, segun, lista, capital, horasTexto, DIAS_SEMANA, version, mesTexto, medioEnFrase } from './comun.js';

const propiaDe = (u) => u.marcas.find((m) => m.propia);
const rivalDe = (u) => u.marcas.find((m) => !m.propia);
const pct = (n) => porcentaje(n);
// el share de una marca: si tiene inversión pero redondea a cero, «menos de 1 %», no «0 %»
const shareDe = (m) => (m.inversion > 0 && !m.share ? 'menos de 1 %' : porcentaje(m.share));
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
  const frente = puntosFrente(r.cambioPts, P);
  const cola = `según Integrametrics para ${periodoTexto(P)}.${frente ? ` ${r.nombre} queda ${frente}.` : ''}`;
  if (r.share == null) return { titulo: 'Sin inversión ATL registrada', lectura: `Ninguna marca tiene inversión en TV, radio, cable, OTT ni vía pública, ${cola}` };
  if (!r.inversion) return { titulo: `${r.nombre} no tiene inversión ATL registrada`, lectura: `Toda la inversión en TV, radio, cable, OTT y vía pública es de ${p.nombre}, ${cola}` };
  if (!p.inversion) return { titulo: `${r.nombre} tiene toda la inversión ATL`, lectura: `${p.nombre} no tiene inversión en TV, radio, cable, OTT ni vía pública, ${cola}` };
  return { titulo: `${r.nombre} tiene ${shareDe(r)} de la inversión ATL`, lectura: `${p.nombre} pone el resto (${shareDe(p)}) en TV, radio, cable, OTT y vía pública, ${cola}` };
}
export function digitalLectura(v) {
  const u = v.lee.digital, P = v.periodo, r = rivalDe(u), p = propiaDe(u);
  const frente = puntosFrente(r.cambioPts, P);
  const cola = frente ? ` ${r.nombre} queda ${frente}.` : '';
  if (r.share == null) return { titulo: 'Sin inversión digital registrada', lectura: `Ninguna marca tiene inversión digital en ${periodoTexto(P)}.` };
  if (!r.inversion || !p.inversion) {
    const sola = r.inversion ? r : p, otra = r.inversion ? p : r;
    return { titulo: `Solo ${sola.nombre} invierte en digital`, lectura: `${otra.nombre} no tiene inversión digital en ${periodoTexto(P)}.${cola}` };
  }
  const parejo = Math.abs(p.share - r.share) <= 10;
  const titulo = parejo ? 'En digital la inversión está pareja' : `${r.share > p.share ? r.nombre : p.nombre} lidera la inversión digital`;
  return { titulo, lectura: `En digital, ${r.nombre} tiene ${shareDe(r)} y ${p.nombre} ${shareDe(p)}.${cola}` };
}
// El share del período en una sola tarjeta: digital y ATL lado a lado (universos distintos, nunca sumados).
// La competencia en el título; la marca propia y el cambio frente a la comparación en la lectura
export function shareLectura(v) {
  const P = v.periodo;
  const us = [['digital', v.lee.digital], ['ATL', v.lee.atl]].filter(([, u]) => u.estado === 'ok' && rivalDe(u)?.share != null);
  if (!us.length) return { titulo: 'Sin inversión registrada en el período', lectura: `Integrametrics no tiene inversión de ninguna marca en ${periodoTexto(P)}.` };
  const r = rivalDe(us[0][1]), p = propiaDe(us[0][1]);
  // cuánto tiene cada marca en cada universo; un 0 se dice «no tiene inversión», nunca «0 %»
  const tiene = (m, largo) => {
    const con = us.filter(([, u]) => m(u).inversion > 0), sin = us.filter(([, u]) => !(m(u).inversion > 0));
    const partes = con.map(([n, u]) => (largo ? `${shareDe(m(u))} de la inversión ${n}` : `${shareDe(m(u))} en ${n}`));
    const no = sin.length ? `no tiene inversión ${sin.map(([n]) => (largo ? n : `en ${n}`)).join(' ni ')}` : null;
    return partes.length ? `tiene ${lista(partes)}${no ? ` y ${no}` : ''}` : no;
  };
  const titulo = `${r.nombre} ${tiene(rivalDe, true)}`;
  const propia = `${p.nombre} ${tiene(propiaDe, false)}.`;
  // el cambio solo si hay con qué comparar (y días suficientes: puntosFrente lo decide)
  const cambios = us.map(([n, u]) => [n, rivalDe(u).cambioPts]).filter(([, x]) => x != null && puntosFrente(x, P));
  const cambio = (x) => (x === 0 ? 'igual' : `${numero(Math.abs(x))} ${segun(Math.abs(x), 'punto', 'puntos')} ${x > 0 ? 'más' : 'menos'}`);
  const comp = comparacionTexto(P) || '';
  const frenteA = comp.startsWith('el ') ? `al ${comp.slice(3)}` : `a ${comp}`;
  const frente = cambios.length ? ` Frente ${frenteA}, ${r.nombre} queda ${lista(cambios.map(([n, x]) => `${cambio(x)} en ${n}`))}.` : '';
  // la lectura no repite los porcentajes del gráfico: dice el cambio y los montos, que no están a la vista
  const enSoles = ` En soles, ${r.nombre} puso ${lista(us.map(([n, u]) => `${solesCompacto(rivalDe(u).inversion)} en ${n}`))}.`;
  return { titulo, lectura: `${cambios.length ? frente.trim() : propia}${enSoles}` };
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
export function shareSemanalLectura(s) {
  const comp = (serie) => (serie || []).filter((x) => !x.parcial && x.valor != null);
  const dig = comp(s.digital), atl = comp(s.atl);
  const titulo = `El share de ${s.marca}, semana a semana`;
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
  return { titulo, lectura: `${marca} tuvo ${numero(c.distintas ?? c.total)} versiones entre ATL y digital ${tramoMeses(desde, hasta)}. La de más inversión es ${cita(top.version)}, del ${fechaCorta(top.desde)} al ${fechaCorta(top.hasta)}.` };
}
export function estrenosLectura(v) {
  const e = v.lee.estrenos, P = v.periodo;
  const titulo = 'Piezas que se estrenaron';
  if (!e.length) return { titulo, lectura: `Ninguna pieza nueva en ${periodoTexto(P)}.` };
  const nombres = [...new Set(e.map((x) => x.nombre))].sort((a, b) => (a === CLIENTE.nombre) - (b === CLIENTE.nombre));
  const porMarca = nombres.map((n) => `${numero(e.filter((x) => x.nombre === n).length)} de ${n}`);
  return { titulo, lectura: `${capital(enLetras(e.length, true))} ${segun(e.length, 'pieza nueva', 'piezas nuevas')} en ${periodoTexto(P)}: ${lista(porMarca)}.` };
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
export function oohLectura(o, P) {
  const titulo = 'Dónde están los paneles';
  if (!o.paneles.length) return { titulo, lectura: `Integrametrics no detectó paneles de las marcas que se siguen en ${periodoTexto(P)}.` };
  const [r] = CLIENTE.competencia;
  const nr = o.porMarca[r.marcaFuente], np = o.porMarca[CLIENTE.marcaFuente];
  // todas las ciudades donde está la competencia fuera de Lima; si la propia no tiene ninguna, se dice
  const fuera = o.fueraDeLima.filter((c) => c.nombre !== 'Sin coordenadas' && c[r.marcaFuente] > 0);
  const propiaFuera = o.fueraDeLima.some((c) => c.nombre !== 'Sin coordenadas' && c[CLIENTE.marcaFuente] > 0);
  return { titulo, lectura: `${r.nombre} tiene ${numero(nr)} ${segun(nr, 'panel detectado', 'paneles detectados')} en ${periodoTexto(P)} y ${CLIENTE.nombre} ${numero(np)}.${fuera.length ? ` Fuera de Lima, ${r.nombre} tiene paneles en ${lista(fuera.map((c) => `${c.nombre} (${numero(c[r.marcaFuente])})`))}${np && !propiaFuera ? `; ${CLIENTE.nombre}, en ninguna ciudad` : ''}.` : ''}` };
}
export function distritosLectura(o) {
  const titulo = 'Paneles por distrito';
  const d = o.porDistrito;
  if (!d.length) return { titulo, lectura: 'Sin paneles en Lima en el período.' };
  const empatados = d.filter((x) => x.total === d[0].total);
  return { titulo, lectura: `${lista(empatados.map((x) => x.nombre))} ${empatados.length > 1 ? 'son los distritos' : 'es el distrito'} con más paneles (${numero(d[0].total)}${empatados.length > 1 ? ' cada uno' : ''}).` };
}
export const panelTitulo = (p) => p.direccion || [p.tipo && version(p.tipo), p.distrito || p.localidad].filter(Boolean).join(' en ') || 'Panel sin dirección';

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
  return { titulo, lectura: `${n > 1 ? `Las ${enLetras(n, true)} horas con más emisiones van` : 'La hora con más emisiones es'} ${n > 1 ? horasTexto(med.horasAltas) : `las ${med.horasAltas[0]}:00`}.${dia ? ` El día con más es el ${dia}.` : ''}` };
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
const ALERTAS = {
  'estreno-competencia': (a) => ({
    titulo: `${a.marca} estrenó ${enLetras(a.cuantos, true)} ${segun(a.cuantos, 'pieza', 'piezas')} en ${per(a)}`,
    dato: `${a.cuantos > 1 ? 'La más reciente: ' : ''}${capital(estrenoTitulo(a.ultimo))}, ${estrenoDato(a.ultimo)}.`,
    mirar: `El mensaje y el medio de la pieza, y si se cruza con lo que tiene al aire ${CLIENTE.nombre}.`,
  }),
  'sube-competencia': (a) => ({
    titulo: `${a.marca} sube ${numero(a.sube)} % su inversión ${a.universo}`,
    dato: `${monto(a.monto)} en ${per(a)}, frente a ${monto(a.antes)} en ${comp(a)}.`,
    mirar: 'Qué versiones y qué medios explican la subida.',
  }),
  'baja-competencia': (a) => ({
    // con algo de inversión, una baja que redondea a 100 % se dice «más de 99 %»
    titulo: `${a.marca} baja ${a.monto > 0 && Math.round(a.baja) >= 100 ? 'más de 99' : numero(a.baja)} % su inversión ${a.universo}`,
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
  'paneles-competencia': (a) => ({
    titulo: `${a.marca} tiene paneles en ${lista(a.zonas)}, donde no tenía en ${comp(a)}`,
    dato: `${numero(a.cuantos)} ${segun(a.cuantos, 'panel detectado', 'paneles detectados')} en ${per(a)}, frente a ${numero(a.antes)} en ${comp(a)}.`,
    mirar: `Qué versión lleva cada panel y si se cruza con las zonas de ${CLIENTE.nombre}.`,
  }),
  'digital-competencia': (a) => ({
    titulo: `${a.marca} sacó ${enLetras(a.cuantas, true)} ${segun(a.cuantas, 'versión digital nueva', 'versiones digitales nuevas')}`,
    dato: a.ultima ? `${a.cuantas > 1 ? 'La más reciente: ' : ''}${cita(a.ultima)}.` : `Versiones vistas por primera vez en ${per(a)}.`,
    mirar: 'El mensaje de cada versión y en qué plataformas sale.',
  }),
  'diy-sube': (a) => ({
    titulo: `Las búsquedas de cámaras de seguridad suben ${numero(a.crecimiento)} %`,
    dato: `Del ${fechaCorta(a.desde)} al ${fechaCorta(a.hasta)} de ${a.hasta.slice(0, 4)}, frente a las mismas semanas de ${Number(a.hasta.slice(0, 4)) - 1}.`,
    mirar: 'Qué marcas de cámaras explican la subida.',
  }),
  'share-digital': (a) => ({
    titulo: `${CLIENTE.nombre} pierde share en digital`,
    dato: `${porcentaje(a.share)} de la inversión digital, frente a ${porcentaje(a.antes)} en ${comp(a)}.`,
    mirar: 'Cuánto cambió la inversión digital de cada marca, la propia incluida.',
  }),
  'dias-sin-dato': (a) => ({
    titulo: `${capital(enLetras(a.dias.length))} ${segun(a.dias.length, 'día', 'días')} sin registros ATL de Integrametrics`,
    dato: `Sin emisiones ATL registradas de ninguna marca: ${lista(a.dias.map(fechaCorta))}. Puede ser un día sin pauta o un hueco de la fuente.`,
    mirar: 'Con Integrametrics, si el día llegó completo.',
  }),
  'dominio-atl': (a) => ({
    titulo: `${CLIENTE.nombre} concentra ${porcentaje(a.share)} de la inversión ATL`,
    dato: !a.marca ? 'En TV, radio, cable, OTT y vía pública.' : a.inversionCompetencia > 0 ? `${a.marca} tiene ${a.shareCompetencia < 1 ? 'menos del 1 %' : porcentaje(a.shareCompetencia)} en ${per(a)}.` : `${a.marca} no tiene inversión ATL en ${per(a)}.`,
    mirar: 'Cuántas veces sale al aire cada pieza.',
  }),
  'share-digital-sube': (a) => ({
    titulo: `${CLIENTE.nombre} gana share en digital`,
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
  };
}

export { mesTexto, comparacionTexto, periodoTexto, solesCompacto };
