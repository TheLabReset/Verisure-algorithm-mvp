// armarVista(contrato, medios, filtros, estado, { mapa, busquedas }) devuelve todo lo que pintan las cuatro capas y
// MAIA. Es la única puerta entre la data y la pantalla: los componentes no calculan. Puro: sin fechas del sistema
// (el atraso de la fuente llega en `estado.hoy`, que lo mide la app).
//
// Foco: lo principal es la competencia. Cada marca trae `foco` (la competencia) para que los gráficos la resalten;
// la marca propia va como referencia, para comparar.
//
// Universos: la inversión ATL (TV, radio, cable, OTT, vía pública) y la digital (Meta, Google, YouTube) las estima
// Integrametrics con métodos distintos: se leen lado a lado y nunca se suman.

import { CLIENTE } from '../cliente.js';
import { rango, diasEntre, diaSemana, sumarDias, periodoDelMes, periodoDe, mesesDisponibles, DIAS_MINIMOS } from './periodo.js';
import { agruparAnuncios, nombrePlataforma, htmlDe } from './anuncios.js';
import { leerOoh, contornos, distritoDe, proyectar } from './ooh.js';
import { plataformaEnFrase, grupoDigital, GRUPOS_DIGITALES } from '../textos/comun.js';
import { versionesDelAnio, cronograma, pautaDiaria, shareSemanal, pautaSemanal, mezclaMensual } from './competencia.js';
import { leerBusquedas } from './busquedas.js';
import { hechosDeLaSemana } from './semana.js';
import { digitalDeLaSemana, atlDeLaSemana, compraDeMedios, APARTADOS_ATL } from './senales.js';
import { emisionesDe } from '../fuentes/medios.js';
import { tiktokDeEjemplo, facebookDeEjemplo, plataformasDeEjemplo } from '../muestra/ejemplo.js';
import { leerTiktok, leerFacebook } from './conversacion.js';
import { leerPlataformas } from './plataformas.js';

export { mesesDisponibles };

// ── Umbrales de las alertas: fijos, a la vista (docs/guia-algoritmo.md, «Alertas») ──
export const UMBRALES = {
  picoVeces: 3,          // un día de la competencia que triplica su mediana de días con inversión
  caidaShareDigital: 5,  // puntos de share digital que pierde la marca propia frente a la comparación
  subidaShareDigital: 5,
  dominioAtl: 90,        // share ATL de la marca propia que se lee como dominio de la categoría
  atrasoFuente: 3,       // días sin datos nuevos para decir que la fuente está atrasada
  subidaCompetencia: 30, // % de subida de la inversión de la competencia frente a la comparación
  bajadaCompetencia: 50, // % de caída de la inversión de la competencia frente a la comparación
  medioNuevo: 5,        // % de su inversión ATL que tiene que pesar un medio nuevo para avisar: lo muy chico no se menciona
  diasMinimos: DIAS_MINIMOS, // días con data en el período para leer una variación: con menos, un día raro manda
  subidaDiy: 15,         // % de subida de las búsquedas de cámaras frente a las mismas semanas del año anterior
};

const PROPIA = CLIENTE.marcaFuente;
const COMPETENCIA = CLIENTE.competencia.map((c) => c.marcaFuente);
// Las marcas vigiladas (solo capa 1): cada una con su número de color, en el orden de cliente.js (--vigilada-N)
export const VIGILADAS = (CLIENTE.vigiladas || []).map((v, i) => ({ id: v.marcaFuente, nombre: v.nombre, color: i + 1 }));
const colorVigilada = (m) => VIGILADAS.find((v) => v.id === m)?.color ?? null;
export const nombreMarca = (m) => (m === PROPIA ? CLIENTE.nombre : [...CLIENTE.competencia, ...(CLIENTE.vigiladas || [])].find((c) => c.marcaFuente === m)?.nombre ?? m);
const MARCAS = [PROPIA, ...COMPETENCIA];
const MARCAS_SEGUIDAS = MARCAS;
const dia = (f) => (f || '').slice(0, 10);
const enRango = (f, a, b) => { const d = dia(f); return d >= a && d <= b; };
const suma = (xs) => xs.reduce((t, x) => t + (x || 0), 0);
const mediana = (xs) => { const s = [...xs].sort((a, b) => a - b); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };

// Porcentajes que suman exacto 100 (mayor resto), para que las partes cuadren con el total
export function partes(valores) {
  const total = suma(valores);
  if (!total) return valores.map(() => null);
  const crudos = valores.map((v) => (v / total) * 100);
  const base = crudos.map(Math.floor);
  let falta = 100 - suma(base);
  const orden = crudos.map((c, i) => [c - base[i], i]).sort((a, b) => b[0] - a[0]);
  for (const [, i] of orden) { if (falta <= 0) break; base[i] += 1; falta -= 1; }
  return base;
}

const reparto = (obj) => { const ks = Object.keys(obj); const ps = partes(ks.map((k) => obj[k])); return Object.fromEntries(ks.map((k, i) => [k, ps[i]])); };

export const MEDIOS = { 'TV ABIERTA': 'TV abierta', CABLE: 'Cable', RADIO: 'Radio', OTT: 'OTT y streaming', OOH: 'Vía pública', 'OTT STREAMING/LIVE': 'OTT y streaming', 'VIA PUBLICA': 'Vía pública' };
export const FRANJAS = { DIA: 'Día', PRIME: 'Prime', NOCHE: 'Noche', MADRUGADA: 'Madrugada' };
const ORDEN_FRANJAS = ['DIA', 'PRIME', 'NOCHE', 'MADRUGADA'];
// Los tipos de aviso de vía pública: su estreno va en la tarjeta de OOH
const APARTADO_OOH = /PANEL|TORRE|VALLA|PANTALLA|BANNER|PALETA|MURO/;

// ── Inversión de un universo (ATL o digital) en un tramo: por marca, con su share ──
function sumarTramo(serie, desde, hasta) {
  const porMarca = Object.fromEntries(MARCAS.map((m) => [m, { inversion: 0, spots: 0, impresiones: 0, medios: {}, franjas: {}, plataformas: {} }]));
  const diasConData = new Set();
  for (const fila of serie) {
    if (!enRango(fila.fecha, desde, hasta)) continue;
    diasConData.add(fila.fecha);
    for (const [m, v] of Object.entries(fila.brands)) {
      if (!porMarca[m]) continue;
      const b = porMarca[m];
      b.inversion += v.spend || 0; b.spots += v.spots || 0; b.impresiones += v.impresiones || 0;
      for (const [k, x] of Object.entries(v.byMedium || {})) b.medios[k] = (b.medios[k] || 0) + x;
      for (const [k, x] of Object.entries(v.byFranja || {})) b.franjas[k] = (b.franjas[k] || 0) + x;
      for (const [k, x] of Object.entries(v.plat || {})) b.plataformas[k] = (b.plataformas[k] || 0) + x;
    }
  }
  const shares = partes(MARCAS.map((m) => porMarca[m].inversion));
  return { porMarca, shares: Object.fromEntries(MARCAS.map((m, i) => [m, shares[i]])), total: suma(MARCAS.map((m) => porMarca[m].inversion)), diasConData };
}

function leerUniverso(serie, P) {
  const ahora = sumarTramo(serie, P.desde, P.hasta);
  const antes0 = P.compararDesde ? sumarTramo(serie, P.compararDesde, P.compararHasta) : null;
  // una comparación con menos días con data que el mínimo no compara: un solo día raro mandaría (como en el período)
  const diasAntes = P.compararDesde ? rango(P.compararDesde, P.compararHasta).length : 0;
  const antes = antes0 && antes0.diasConData.size >= Math.min(DIAS_MINIMOS, diasAntes) ? antes0 : null;
  // si el período o su comparación tienen días sin registros, una suma frente a la otra cuenta huecos como ceros
  const conHuecos = Boolean(antes && (antes.diasConData.size < diasAntes || ahora.diasConData.size < rango(P.desde, P.hasta).length));
  const marcas = MARCAS.map((m) => ({
    id: m, nombre: nombreMarca(m), propia: m === PROPIA, foco: m !== PROPIA,
    inversion: ahora.porMarca[m].inversion, share: ahora.shares[m], spots: ahora.porMarca[m].spots, impresiones: ahora.porMarca[m].impresiones,
    medios: ahora.porMarca[m].medios, franjas: ahora.porMarca[m].franjas, plataformas: ahora.porMarca[m].plataformas,
    // partes de su propio total (suman 100): cómo reparte cada marca, no cuánto pone frente a la otra
    mezclaMedios: reparto(ahora.porMarca[m].medios), mezclaFranjas: reparto(ahora.porMarca[m].franjas),
    inversionPrevia: antes ? antes.porMarca[m].inversion : null,
    sharePrevio: antes ? antes.shares[m] : null,
    cambioPts: antes && antes.shares[m] != null && ahora.shares[m] != null ? ahora.shares[m] - antes.shares[m] : null,
  }));
  // Serie diaria: un día sin registros es un hueco (null), no un cero; una marca ausente un día con data, cero
  const porFecha = new Map(serie.map((f) => [f.fecha, f]));
  const diaria = rango(P.desde, P.hasta).map((fecha) => {
    const f = porFecha.get(fecha);
    return { fecha, valores: Object.fromEntries(MARCAS.map((m) => [m, f ? (f.brands[m]?.spend ?? 0) : null])) };
  });
  const sinDato = rango(P.desde, P.hasta).filter((d) => !porFecha.has(d));
  // las plataformas o medios que aparecen en el período, de más a menos piezas (en digital: redes, buscador y sitios)
  const cuenta = {};
  for (const m of marcas) for (const [k, x] of Object.entries(m.plataformas || {})) cuenta[k] = (cuenta[k] || 0) + x;
  const plataformas = Object.entries(cuenta).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  // sin un solo día con registros en el período no hay inversión que leer: es un hueco de la fuente, no un cero
  return { estado: ahora.diasConData.size ? 'ok' : 'sin-registros', marcas, total: ahora.total, totalPrevio: antes ? antes.total : null, diaria, sinDato, plataformas, conHuecos };
}

// Las plataformas digitales del año, de más a menos piezas: lo que de verdad entra al universo digital
function plataformasDelAnio(contrato) {
  const cuenta = {};
  for (const d of contrato.digital?.daily || []) for (const b of Object.values(d.brands || {})) for (const [k, x] of Object.entries(b.plat || {})) cuenta[k] = (cuenta[k] || 0) + x;
  return Object.entries(cuenta).sort((a, b) => b[1] - a[1]).map(([k]) => plataformaEnFrase(k));
}

// ── Piezas para el abanico: cada una con su arte (imagen, video o audio) ──
const formatoDe = (asset) => ({ video: 'Video', audio: 'Audio', image: 'Imagen' }[asset?.kind] ?? null);
const pieza = (p, extra = {}) => ({
  id: String(p.key), titulo: p.vname || '', texto: '', pie: '', plataformas: [], desde: dia(p.firstEmission || p.firstFecha || p.fecha),
  activo: true, enlace: null, imagen: p.asset?.kind === 'image' ? p.asset.url : null,
  medio: p.asset && p.asset.kind !== 'image' && p.asset.kind !== 'link' ? p.asset : null, html: htmlDe(p.asset), formato: formatoDe(p.asset), arte: null, ...extra,
});
function abanico(items, marcaDe, marcas = MARCAS) {
  const porMarca = new Map(marcas.map((m) => [m, []]));
  for (const it of items) if (porMarca.has(marcaDe(it))) porMarca.get(marcaDe(it)).push(it);
  return agruparAnuncios(marcas.map((m) => ({ nombre: nombreMarca(m), propia: m === PROPIA, anuncios: porMarca.get(m).map((x) => x.pieza) })));
}

// ATL: las versiones al aire en el período (su vida se cruza con el período)
function abanicoAtl(contrato, P) {
  const items = (contrato.pieces || [])
    .filter((p) => dia(p.firstEmission) <= P.hasta && dia(p.lastEmission || p.firstEmission) >= P.desde)
    .map((p) => ({ marca: p.maname, pieza: pieza(p, { plataformas: p.channels || [], hasta: dia(p.lastEmission), programa: p.programa, franja: p.franja }) }));
  return abanico(items, (x) => x.marca);
}

// Digital: una carta por versión nueva, la que se vio por primera vez en el período. Integrametrics registra cada
// variante (imagen, formato) el día que la ve: una variante nueva de una versión de enero no es una versión nueva
function abanicoDigital(contrato, P) {
  const primera = new Map();
  for (const p of contrato.digital?.pieces || []) {
    const k = `${p.maname}|${p.vname}`, d = dia(p.firstEmission);
    if (!primera.has(k) || d < primera.get(k)) primera.set(k, d);
  }
  const porVersion = new Map();
  for (const p of contrato.digital?.pieces || []) {
    const k = `${p.maname}|${p.vname}`;
    if (!enRango(primera.get(k), P.desde, P.hasta) || !enRango(p.firstEmission, P.desde, P.hasta)) continue;
    if (!porVersion.has(k)) porVersion.set(k, { marca: p.maname, base: p, plataformas: new Set(), variantes: 0, imagen: null, desde: dia(p.firstEmission) });
    const v = porVersion.get(k);
    v.variantes += 1;
    if (p.plataforma) v.plataformas.add(nombrePlataforma(p.plataforma));
    if (!v.imagen && p.asset?.kind === 'image') v.imagen = p.asset;
    if (dia(p.firstEmission) < v.desde) v.desde = dia(p.firstEmission);
  }
  const items = [...porVersion.values()].map((v) => ({
    marca: v.marca,
    pieza: pieza({ ...v.base, asset: v.imagen || v.base.asset, firstEmission: v.desde }, { plataformas: [...v.plataformas], variantes: v.variantes }),
  }));
  // el período que tiene el primer día de data digital no puede decir qué es nuevo: todo se ve por primera vez
  const inicio = contrato.digital?.daily?.[0]?.fecha ?? null;
  return { ...abanico(items, (x) => x.marca), sinHistoria: Boolean(inicio && P.desde <= inicio), inicio };
}

// OOH: los paneles detectados en el período, con su foto o video, sobre el mapa y por distrito
function ooh(contrato, mapa, P, MARCAS = MARCAS_SEGUIDAS) {
  const paneles = (contrato.ooh || []).filter((p) => MARCAS.includes(p.maname) && dia(p.firstFecha || p.lastFecha) <= P.hasta && dia(p.lastFecha || p.firstFecha) >= P.desde)
    .map((p) => ({ ...p, marca: p.maname }));
  const mapaLeido = leerOoh(paneles, mapa, MARCAS);
  // La comparación: en qué distritos tenía paneles cada marca antes (Integrametrics registra cada panel el día que lo
  // detecta, así que lo nuevo no es el panel sino el distrito)
  // la zona es nueva si la marca no tuvo paneles ahí en los 90 días anteriores: Integrametrics detecta los paneles a
  // saltos, y contra una semana cualquier distrito parece nuevo
  const desdeBase = sumarDias(P.desde, -90), hastaBase = sumarDias(P.desde, -1);
  const previos = hastaBase >= contrato.meta.firstDay ? (contrato.ooh || []).filter((p) => MARCAS.includes(p.maname) && dia(p.firstFecha || p.lastFecha) <= hastaBase && dia(p.lastFecha || p.firstFecha) >= desdeBase).map((p) => ({ ...p, marca: p.maname })) : null;
  const leidoAntes = previos ? leerOoh(previos, mapa, MARCAS) : null;
  const zonasDe = (leido, m) => new Set([...leido.porDistrito, ...leido.fueraDeLima].filter((d) => d[m] > 0).map((d) => d.nombre));
  const conPieza = (p) => ({
    id: String(p.key), marca: p.maname, nombre: nombreMarca(p.maname), propia: p.maname === PROPIA, vigilada: colorVigilada(p.maname), lat: p.lat, lng: p.lng,
    version: p.vname || null, direccion: p.direccion || null, localidad: p.localidad || null, tipo: p.tipo || null,
    desde: dia(p.firstFecha), hasta: dia(p.lastFecha || p.firstFecha), inversion: p.spend || 0, asset: p.asset || null,
    pieza: pieza({ ...p, firstEmission: p.firstFecha }, { titulo: p.direccion || p.localidad || 'Panel sin dirección', texto: p.vname ? `«${p.vname}»` : '', plataformas: [p.tipo, p.localidad].filter(Boolean) }),
  });
  const lista = paneles.map(conPieza);
  // distrito y ciudad de cada panel, ya asignados por coordenadas
  const ubicacion = new Map();
  for (const q of mapaLeido.puntos) for (const x of q.paneles) ubicacion.set(String(x.key), { distrito: q.distrito, ubicacion: q.id });
  return {
    ubicaciones: mapaLeido.puntos.map((u) => ({ id: u.id, marca: u.marca, nombre: nombreMarca(u.marca), foco: u.marca !== PROPIA && !colorVigilada(u.marca), propia: u.marca === PROPIA, vigilada: colorVigilada(u.marca), lat: u.lat, lng: u.lng, zona: u.zona, distrito: u.distrito, inversion: u.inversion, paneles: u.paneles.map((x) => String(x.key)) })),
    zonas: mapaLeido.zonas,
    paneles: lista.map((p) => ({ ...p, distrito: ubicacion.get(p.id)?.distrito ?? null, ubicacion: ubicacion.get(p.id)?.ubicacion ?? null })).sort((a, b) => Number(a.propia) - Number(b.propia) || b.inversion - a.inversion),
    porMarca: Object.fromEntries(MARCAS.map((m) => [m, paneles.filter((p) => p.maname === m).length])),
    inversionPorMarca: Object.fromEntries(MARCAS.map((m) => [m, suma(paneles.filter((p) => p.maname === m).map((p) => p.spend))])),
    porMarcaAntes: previos ? Object.fromEntries(MARCAS.map((m) => [m, previos.filter((p) => p.maname === m).length])) : null,
    zonasNuevas: leidoAntes ? Object.fromEntries(MARCAS.map((m) => { const antes = zonasDe(leidoAntes, m); return [m, [...zonasDe(mapaLeido, m)].filter((z) => !antes.has(z) && z !== 'Sin coordenadas')]; })) : null,
    porDistrito: mapaLeido.porDistrito, fueraDeLima: mapaLeido.fueraDeLima, enLima: mapaLeido.enLima, fuera: mapaLeido.fuera,
    contornos: contornos(mapa),
    abanico: abanico(lista.map((p) => ({ marca: p.marca, pieza: p.pieza })), (x) => x.marca, MARCAS),
  };
}

// Estrenos: primera emisión de una versión nueva, con su arte
// Integrametrics marca un estreno por versión, canal y día: la misma versión sale «nueva» en varios canales o fechas.
// Un estreno es la versión, el día de su primera marca en toda la data; las demás marcas no la vuelven a contar.
function estrenos(contrato, P, marcas = MARCAS) {
  const primero = new Map();
  for (const e of contrato.events || []) { const k = `${e.maname}|${e.vname}`; if (!primero.has(k) || e.fecha < primero.get(k).fecha) primero.set(k, e); }
  return [...primero.values()].filter((e) => enRango(e.fecha, P.desde, P.hasta) && marcas.includes(e.maname))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    .map((e) => ({ id: String(e.key), fecha: e.fecha, marca: e.maname, nombre: nombreMarca(e.maname), propia: e.maname === PROPIA, version: e.vname, tipo: e.tname, grupo: e.grupo ?? null, canal: e.mname, franja: e.franja, duracion: Number(e.duraseg) || null, asset: e.asset || null }));
}

// Medios del período (hora, día, canal, programa, zona) en TV, radio, cable y OTT: de cada emisión de medios.json
// diasConData: los días con registros de la fuente; un día sin registros es un hueco, no un día sin emisiones
function horarioYCanales(medios, P, diasConData) {
  if (!medios?.emisiones) return null;
  const dias = rango(P.desde, P.hasta).filter((d) => !diasConData || diasConData.has(d));
  const cuantosDia = Array(7).fill(0);
  for (const d of dias) cuantosDia[diaSemana(d)] += 1;
  return Object.fromEntries(MARCAS.map((marca) => {
    // una marca sin emisiones en el período no emitió (cero), no es un dato que falta
    const b = { emisiones: 0, horas: Array(24).fill(0), dias: Array(7).fill(0), horaDia: Array.from({ length: 7 }, () => Array(24).fill(0)), canales: {}, programas: {}, zonas: {} };
    // la vía pública no sale al aire: sus detecciones van en OOH, no en las horas, los canales ni los programas
    for (const e of emisionesDe(medios, marca, P.desde, P.hasta)) {
      if (e.grupo === 'VIA PUBLICA') continue;
      b.emisiones += 1;
      const h = Number(e.hora.slice(0, 2)), d = diaSemana(e.fecha);
      if (e.hora && h >= 0 && h < 24) { b.horas[h] += 1; b.horaDia[d][h] += 1; }
      b.dias[d] += 1;
      if (e.canal) b.canales[e.canal] = (b.canales[e.canal] || 0) + e.inversion;
      if (e.programa) b.programas[e.programa] = (b.programas[e.programa] || 0) + 1;
      if (e.zona) b.zonas[e.zona] = (b.zonas[e.zona] || 0) + e.inversion;
    }
    const porHora = b.horas.map((n) => n / (dias.length || 1));
    // emisiones promedio en cada hora de cada día de la semana: la cuenta del período dividida por cuántas veces cae ese día
    const matriz = b.horaDia.map((fila, i) => fila.map((n) => (cuantosDia[i] ? n / cuantosDia[i] : null)));
    const porDiaSemana = b.dias.map((n, i) => (cuantosDia[i] ? n / cuantosDia[i] : null));
    const horasAltas = porHora.map((v, h) => [v, h]).sort((a, z) => z[0] - a[0]).slice(0, 4).filter(([v]) => v > 0).map(([, h]) => h);
    const max = Math.max(...porDiaSemana.map((v) => v ?? -1));
    // Integrametrics marca «DESCONOCIDO» el canal que no identificó
    const top = (obj, n) => Object.entries(obj).filter(([, v]) => v > 0).sort((a, z) => z[1] - a[1] || a[0].localeCompare(z[0])).slice(0, n).map(([nombre, valor]) => ({ nombre: nombre === 'DESCONOCIDO' ? 'Canal sin registrar' : nombre, sinRegistrar: nombre === 'DESCONOCIDO', valor }));
    // los canales con nombre: lo que llega sin canal registrado no es un canal más
    const conInversion = Object.entries(b.canales).filter(([k, v]) => v > 0 && k !== 'DESCONOCIDO').length;
    const sinCanal = (b.canales.DESCONOCIDO || 0) > 0;
    return [marca, {
      emisiones: b.emisiones, porHora, porDiaSemana, matriz, horasAltas, diaMayor: max > 0 && !(porDiaSemana.filter((x) => x != null).sort((a, b) => b - a)[1] >= max * 0.9) ? porDiaSemana.indexOf(max) : null, // con otro día a menos de 10 %, se parecen: no se nombra uno
      canales: top(b.canales, 8), programas: top(b.programas, 8), zonas: top(b.zonas, 8), totalCanales: conInversion, sinCanal, totalProgramas: Object.keys(b.programas).length,
    }];
  }));
}

// Temporada: inversión de cada mes del contrato, por marca y universo (un mes en curso se marca como parcial)
function temporada(contrato) {
  const meses = mesesDisponibles(contrato.meta);
  const fila = (serie, mes) => Object.fromEntries(MARCAS.map((m) => [m, suma(serie.filter((f) => f.fecha.startsWith(mes)).map((f) => f.brands[m]?.spend || 0))]));
  return meses.map((mes) => ({ mes, parcial: periodoDelMes(contrato.meta, mes).parcial, atl: fila(contrato.daily, mes), digital: fila(contrato.digital?.daily || [], mes) }));
}

// Pauta del año, día por día: la competencia primero, cada universo por su lado
function pautaDelAnio(contrato, ok) {
  const dias = rango(contrato.meta.firstDay, contrato.meta.lastDay);
  const filas = [];
  for (const m of [...COMPETENCIA, PROPIA]) {
    if (ok.atl) filas.push({ id: `${m}-atl`, marca: nombreMarca(m), universo: 'ATL', foco: m !== PROPIA, serie: pautaDiaria(contrato.daily, m, dias) });
    if (ok.digital) filas.push({ id: `${m}-digital`, marca: nombreMarca(m), universo: 'digital', foco: m !== PROPIA, serie: pautaDiaria(contrato.digital?.daily || [], m, dias) });
  }
  return filas.map((f) => {
    const activos = f.serie.filter((d) => d.valor > 0);
    return { ...f, nombre: `${f.marca} · ${f.universo}`, diasConInversion: activos.length, diasConData: f.serie.filter((d) => d.valor != null).length, total: suma(f.serie.map((d) => d.valor)), primerDia: activos[0]?.fecha ?? null, ultimoDia: activos.at(-1)?.fecha ?? null };
  });
}
// Pauta del año por semana, para leer rápido cuándo se prende cada marca. ATL, digital y, a pedido, los dos juntos:
// «todo» suma dos estimaciones hechas con métodos distintos, así que se lee como encendido y apagado, no como monto
function pautaPorSemana(contrato, ok) {
  const dias = rango(contrato.meta.firstDay, contrato.meta.lastDay);
  const fuentes = { atl: ok.atl ? [contrato.daily] : null, digital: ok.digital ? [contrato.digital?.daily || []] : null };
  fuentes.todo = ok.atl && ok.digital ? [contrato.daily, contrato.digital?.daily || []] : null;
  return Object.fromEntries(Object.entries(fuentes).filter(([, f]) => f).map(([u, series]) => [u, [...COMPETENCIA, PROPIA].map((m) => {
    const semanas = pautaSemanal(series, m, dias);
    const activas = semanas.filter((x) => x.valor > 0);
    return { id: m, marca: nombreMarca(m), foco: m !== PROPIA, propia: m === PROPIA, semanas, semanasConInversion: activas.length, semanasConData: semanas.filter((x) => x.valor != null).length, primera: activas[0]?.fecha ?? null, total: suma(semanas.map((x) => x.valor)) };
  })]));
}

// Share semanal de la competencia principal en el año, en ATL y en digital (cada uno sobre su universo)
function shareDelAnio(contrato, ok) {
  const dias = rango(contrato.meta.firstDay, contrato.meta.lastDay);
  const m = COMPETENCIA[0];
  return {
    marca: nombreMarca(m),
    atl: ok.atl ? shareSemanal(contrato.daily, m, MARCAS, dias) : null,
    digital: ok.digital ? shareSemanal(contrato.digital?.daily || [], m, MARCAS, dias) : null,
  };
}

// ── Marcas vigiladas: solo la capa 1. Lo de cada una en el período, tarjeta por tarjeta, sin respaldo (lo que no
// salió en el período no se muestra), sus primeras apariciones y los avisos de cada tarjeta. No entran a queMirar:
// ni las alertas generales ni MAIA las leen.
// Una primera aparición es una versión que se ve por primera vez en el período: en TV, cable y radio, el estreno que
// marca Integrametrics; en digital y en vía pública (que la fuente no marca), el primer día que se ve. El período que
// tiene el primer día de data no puede decir qué es nuevo: ahí no hay apariciones.
// La tarjeta de un estreno sale de su grupo de medio (un BANNER de TV es TV); un estreno anterior al campo, de su tipo
export const tarjetaDe = (e) => (e.grupo ? (e.grupo === 'OOH' ? 'ooh' : e.grupo === 'RADIO' ? 'radio' : 'tv') : /RADIO/.test(e.tipo || '') ? 'radio' : APARTADO_OOH.test(e.tipo || '') ? 'ooh' : 'tv');
function leerVigiladas(vig, contrato, mapa, P, ok) {
  if (!VIGILADAS.length || !vig) return null;
  const S = { desde: P.desde, hasta: P.hasta };
  const mayor = (a, b) => (a && b ? (a > b ? a : b) : a || b);
  // desde cuándo hay data de cada vigilada: lo más tarde entre el contrato y su propia historia (una vigilada agregada
  // después, o un archivo rearmado, empieza en su primera ventana). Sin historia en el archivo, no se sabe: nada es nuevo
  const historia = (m) => vig.meta?.historia?.[m] ?? '9999-12-31';
  const inicioDigital = (m) => mayor(contrato.digital?.daily?.[0]?.fecha ?? null, historia(m)), inicioAtl = (m) => mayor(contrato.meta.firstDay, historia(m));
  const porMarca = (f) => Object.fromEntries(VIGILADAS.map((v) => [v.id, f(v)]));
  const digital = ok('digital') ? porMarca((v) => digitalDeLaSemana(vig, S, { marcas: [v.id], respaldo: false, primerDia: inicioDigital(v.id) })) : null;
  // TV, cable y radio: una emisión es «nueva» solo si su estreno cae después del primer día de la historia
  const atl = (apartado) => (ok('atl') ? porMarca((v) => {
    const r = atlDeLaSemana({ ...vig, meta: { ...vig.meta, firstDay: contrato.meta.firstDay } }, vig.medios, S, apartado, { marcas: [v.id], respaldo: false, primerDia: contrato.meta.firstDay });
    return P.desde > inicioAtl(v.id) ? r : { ...r, emisiones: r.emisiones.map((e) => ({ ...e, nueva: false })) };
  }) : null);
  // OOH: los paneles de cada vigilada con los de la marca propia como referencia, igual que la competencia en su mapa
  const oohDe = (v) => ooh({ ...contrato, ooh: [...(vig.ooh || []).filter((p) => p.maname === v.id), ...(contrato.ooh || []).filter((p) => p.maname === PROPIA)] }, mapa, P, [PROPIA, v.id]);
  const oohs = ok('atl') ? porMarca(oohDe) : null;
  const apariciones = [];
  for (const v of VIGILADAS) {
    if (digital && !digital[v.id].sinHistoria && P.desde > (inicioDigital(v.id) || '9999-12-31')) for (const m of digital[v.id].mensajes.filter((x) => x.nuevo)) apariciones.push({ marca: v.id, nombre: v.nombre, color: v.color, tarjeta: 'digital', version: m.mensaje, fecha: m.primeraVez });
    if (ok('atl') && P.desde > inicioAtl(v.id)) {
      for (const e of estrenos(vig, P, [v.id])) apariciones.push({ marca: v.id, nombre: v.nombre, color: v.color, tarjeta: tarjetaDe(e), version: e.version, fecha: dia(e.fecha) });
      // vía pública: la versión cuyo primer panel detectado cae en el período (sin estreno marcado por la fuente). Los
      // paneles se detectan a saltos: hace falta la misma base de 90 días que las zonas nuevas de la competencia
      if (P.desde > sumarDias(inicioAtl(v.id), 90)) {
        const primera = new Map();
        for (const p of (vig.ooh || []).filter((x) => x.maname === v.id)) { const f = dia(p.firstFecha); if (!primera.has(p.vname) || f < primera.get(p.vname)) primera.set(p.vname, f); }
        for (const [version, fecha] of primera) if (enRango(fecha, P.desde, P.hasta) && !apariciones.some((a) => a.marca === v.id && a.tarjeta === 'ooh' && a.version === version)) apariciones.push({ marca: v.id, nombre: v.nombre, color: v.color, tarjeta: 'ooh', version, fecha });
      }
    }
  }
  apariciones.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  // qué se pudo contar: una fuente caída o un período sin historia antes no dicen «cero apariciones», dicen «sin dato»
  const contadas = {
    digital: Boolean(digital) && VIGILADAS.some((v) => P.desde > (inicioDigital(v.id) || '9999-12-31')),
    atl: ok('atl') && VIGILADAS.some((v) => P.desde > inicioAtl(v.id)),
  };
  // un aviso por marca y tarjeta, con la aparición más reciente
  const avisos = [];
  for (const v of VIGILADAS) for (const tarjeta of ['digital', 'tv', 'radio', 'ooh']) {
    const suyas = apariciones.filter((a) => a.marca === v.id && a.tarjeta === tarjeta);
    if (suyas.length) avisos.push({ id: 'aparicion-vigilada', nivel: 'atencion', tarjeta, fuente: tarjeta === 'digital' ? 'Integrametrics digital' : 'Integrametrics', marca: v.nombre, marcaId: v.id, color: v.color, cuantos: suyas.length, ultima: suyas[0], periodo: P });
  }
  return { marcas: VIGILADAS, digital, tv: atl('tv'), radio: atl('radio'), ooh: oohs, apariciones, avisos, contadas };
}

// ── Qué mirar: cada alerta sale de una regla con umbral fijo y trae su dato ──
function queMirar(v, P) {
  const out = [];
  const comp = (x) => x.marcas.filter((m) => !m.propia);
  if (v.lee.estrenos) {
    for (const c of CLIENTE.competencia) {
      const suyos = v.lee.estrenos.filter((e) => e.marca === c.marcaFuente);
      // cada estreno va en la tarjeta de su medio: radio, vía pública o TV y cable
      for (const tarjeta of ['tv', 'radio', 'ooh']) {
        const deAca = suyos.filter((e) => tarjetaDe(e) === tarjeta);
        if (deAca.length) out.push({ id: 'estreno-competencia', nivel: 'atencion', tarjeta, fuente: 'Integrametrics', marca: c.nombre, cuantos: deAca.length, ultimo: deAca[0] });
      }
    }
  }
  // Con pocos días de data (el mes recién empieza) las variaciones no se leen: un día raro mandaría
  const diasConData = (u) => (u.estado === 'ok' ? u.diaria.filter((d) => Object.values(d.valores).some((x) => x != null)).length : 0);
  const pocos = v.lee.atl.estado === 'ok' && diasConData(v.lee.atl) < UMBRALES.diasMinimos;
  // un período entero sin registros de la fuente también se avisa: es un hueco, no una inversión en cero
  if (v.lee.atl.estado === 'sin-registros') out.push({ id: 'dias-sin-dato', nivel: 'revisar', tarjeta: 'diaria', fuente: 'Integrametrics', dias: v.lee.atl.sinDato });
  if (pocos) out.push({ id: 'pocos-dias', nivel: 'revisar', tarjeta: 'share', fuente: 'Integrametrics', dias: diasConData(v.lee.atl), minimo: UMBRALES.diasMinimos });
  if (v.lee.atl.estado === 'ok' && !pocos) {
    for (const m of comp(v.lee.atl)) {
      const valores = v.lee.atl.diaria.map((d) => d.valores[m.id]).filter((x) => x > 0);
      const med = mediana(valores);
      const pico = v.lee.atl.diaria.filter((d) => med && d.valores[m.id] >= UMBRALES.picoVeces * med).sort((a, z) => z.valores[m.id] - a.valores[m.id])[0];
      if (pico && valores.length >= 4) out.push({ id: 'pico-competencia', nivel: 'revisar', tarjeta: 'diaria', fuente: 'Integrametrics', marca: m.nombre, fecha: pico.fecha, monto: pico.valores[m.id], mediana: med });
      if (v.lee.atlPrevio) {
        const antes = v.lee.atlPrevio.find((x) => x.id === m.id)?.medios || {};
        const nuevos = Object.entries(m.medios).filter(([k, x]) => x > 0 && !(antes[k] > 0)).map(([k, x]) => ({ nombre: MEDIOS[k] || k, monto: x, pct: Math.round((x / m.inversion) * 100) })).filter((x) => x.pct >= UMBRALES.medioNuevo);
        if (nuevos.length) out.push({ id: 'medio-nuevo', nivel: 'revisar', tarjeta: 'medios', fuente: 'Integrametrics', marca: m.nombre, medios: nuevos });
      }
    }
    const propia = v.lee.atl.marcas.find((m) => m.propia);
    const principal = v.lee.atl.marcas.find((m) => m.id === COMPETENCIA[0]);
    if (propia.share != null && propia.share >= UMBRALES.dominioAtl) out.push({ id: 'dominio-atl', nivel: 'bien', tarjeta: 'share', fuente: 'Integrametrics', share: propia.share, periodo: P, marca: principal?.nombre, shareCompetencia: principal?.share ?? 0, inversionCompetencia: principal?.inversion ?? 0 });
    if (v.lee.atl.sinDato.length) out.push({ id: 'dias-sin-dato', nivel: 'revisar', tarjeta: 'diaria', fuente: 'Integrametrics', dias: v.lee.atl.sinDato });
  }
  // La competencia sube, baja o se apaga frente a la comparación (ATL y digital por separado). Apagarse también es
  // una señal: puede ser una pausa de temporada o la antesala de un lanzamiento
  for (const [u, fuente] of [[v.lee.atl, 'Integrametrics'], [v.lee.digital, 'Integrametrics digital']]) {
    // con huecos en el período o en la comparación, una subida o una bajada puede ser solo el hueco: no se avisa
    if (u.estado !== 'ok' || diasConData(u) < UMBRALES.diasMinimos || u.conHuecos) continue;
    const universo = u === v.lee.atl ? 'ATL' : 'digital';
    for (const m of comp(u)) {
      if (!m.inversionPrevia) continue;
      if (!m.inversion) { out.push({ id: 'competencia-sin-pauta', nivel: 'atencion', tarjeta: 'share', fuente, marca: m.nombre, universo, antes: m.inversionPrevia }); continue; }
      const cambio = Math.round(((m.inversion - m.inversionPrevia) / m.inversionPrevia) * 100);
      if (cambio >= UMBRALES.subidaCompetencia) out.push({ id: 'sube-competencia', nivel: 'atencion', tarjeta: 'share', fuente, marca: m.nombre, universo, sube: cambio, monto: m.inversion, antes: m.inversionPrevia });
      if (cambio <= -UMBRALES.bajadaCompetencia) out.push({ id: 'baja-competencia', nivel: 'revisar', tarjeta: 'share', fuente, marca: m.nombre, universo, baja: -cambio, monto: m.inversion, antes: m.inversionPrevia });
    }
  }
  if (v.lee.ooh?.zonasNuevas) {
    for (const c of CLIENTE.competencia) {
      const zonas = v.lee.ooh.zonasNuevas[c.marcaFuente];
      if (zonas.length) out.push({ id: 'paneles-competencia', nivel: 'revisar', tarjeta: 'ooh', fuente: 'Integrametrics', marca: c.nombre, zonas, cuantos: v.lee.ooh.porMarca[c.marcaFuente], antes: v.lee.ooh.porMarcaAntes[c.marcaFuente] });
    }
  }
  // un mensaje digital que la competencia no había usado antes, en la semana de la tarjeta
  const ds = v.lee.digitalSemana;
  if (ds && !ds.reciente && !ds.sinHistoria) {
    const nuevos = ds.mensajes.filter((m) => m.nuevo);
    if (nuevos.length) out.push({ id: 'digital-competencia', nivel: 'atencion', tarjeta: 'digital', fuente: 'Integrametrics digital', marca: nuevos[0].nombre, cuantas: nuevos.length, ultima: nuevos[0].mensaje, semana: ds.semana });
  }
  if (v.lee.digital.estado === 'ok' && diasConData(v.lee.digital) >= UMBRALES.diasMinimos) {
    const propia = v.lee.digital.marcas.find((m) => m.propia);
    if (propia.cambioPts != null && propia.cambioPts <= -UMBRALES.caidaShareDigital) out.push({ id: 'share-digital', nivel: 'atencion', tarjeta: 'share', fuente: 'Integrametrics digital', share: propia.share, antes: propia.sharePrevio });
    if (propia.cambioPts != null && propia.cambioPts >= UMBRALES.subidaShareDigital) out.push({ id: 'share-digital-sube', nivel: 'bien', tarjeta: 'share', fuente: 'Integrametrics digital', share: propia.share, antes: propia.sharePrevio });
  }
  // Lo de la competencia va primero dentro de cada nivel: es lo principal del panel
  const deCompetencia = (a) => ['estreno-competencia', 'sube-competencia', 'baja-competencia', 'competencia-sin-pauta', 'pico-competencia', 'medio-nuevo', 'paneles-competencia', 'digital-competencia'].includes(a.id);
  // cada alerta lleva su período, para que su texto diga frente a qué compara
  return out.map((a) => ({ ...a, competencia: deCompetencia(a), periodo: P })).sort((a, z) => Number(z.competencia) - Number(a.competencia));
}

export function armarVista(contrato, medios, filtros, estado = {}, { mapa: mapaLeido = null, busquedas: busquedasLeidas = null, vigiladas: vigiladasLeidas = null } = {}) {
  // un archivo opcional con otra forma (vacío, de otra versión) cuenta como que no llegó
  const mapa = mapaLeido?.proyeccion && Array.isArray(mapaLeido.distritos) ? mapaLeido : null;
  const vig = vigiladasLeidas?.meta && Array.isArray(vigiladasLeidas.pieces) && Array.isArray(vigiladasLeidas.events) && Array.isArray(vigiladasLeidas.ooh)
    && Array.isArray(vigiladasLeidas.digital?.pieces) && vigiladasLeidas.medios?.emisiones && vigiladasLeidas.medios?.dic ? vigiladasLeidas : null;
  const busquedas = busquedasLeidas?.categoria?.semanas?.length && Array.isArray(busquedasLeidas.categoria.series) ? busquedasLeidas : null;
  const meta = contrato.meta;
  const caidas = new Set(estado.fuentesCaidas || []);
  const atraso = estado.hoy ? diasEntre(meta.lastDay, estado.hoy) : 0;
  const atrasada = atraso > UMBRALES.atrasoFuente;
  // el último mes con la fuente atrasada no está «en curso»: es un tramo con data hasta el último día
  const P0 = periodoDe(meta, filtros);
  const P = P0.parcial && atrasada ? { ...P0, enCurso: false } : P0;
  const fuentes = [
    { id: 'atl', nombre: 'Integrametrics ATL', estado: caidas.has('atl') ? 'no-cargo' : atrasada ? 'parcial' : 'ok', corte: meta.lastDay, atraso, sinDato: [] },
    { id: 'digital', nombre: 'Integrametrics digital', estado: caidas.has('digital') ? 'no-cargo' : atrasada ? 'parcial' : 'ok', corte: contrato.digital?.daily?.at(-1)?.fecha ?? meta.lastDay, atraso, sinDato: [] },
  ];
  // Google Trends es semanal: se atrasa si pasan más de dos semanas desde la última semana completa
  const ultimaSemana = busquedas?.categoria?.semanas?.filter((_, i) => !busquedas.categoria.parcial[i]).at(-1) ?? null;
  const atrasoTrends = ultimaSemana && estado.hoy ? diasEntre(ultimaSemana, estado.hoy) : 0;
  fuentes.push({ id: 'trends', nombre: 'Google Trends', estado: caidas.has('trends') || !busquedas ? 'no-cargo' : atrasoTrends > 21 ? 'parcial' : 'ok', corte: ultimaSemana, atraso: atrasoTrends, sinDato: [] });
  // fuentes por conectar: sus tarjetas pintan data de ejemplo y lo dicen
  fuentes.push({ id: 'apify', nombre: 'TikTok y Facebook', estado: 'ejemplo', corte: null, atraso: 0, sinDato: [] });
  fuentes.push({ id: 'plataformas', nombre: 'Plataformas y CRM', estado: 'ejemplo', corte: null, atraso: 0, sinDato: [] });
  const ok = (id) => !caidas.has(id);
  const atl = ok('atl') ? leerUniverso(contrato.daily, P) : { estado: 'no-cargo' };
  const digital = ok('digital') ? leerUniverso(contrato.digital?.daily || [], P) : { estado: 'no-cargo' };
  if (atl.estado !== 'no-cargo') fuentes[0].sinDato = atl.sinDato;
  // digital también avisa sus días sin registros en su chip (un hueco no es un día sin avisos)
  const fuenteDigital = fuentes.find((f) => f.id === 'digital');
  if (digital.estado !== 'no-cargo' && fuenteDigital) fuenteDigital.sinDato = digital.sinDato;
  // las franjas cuentan emisiones al aire (TV, radio, cable y OTT) del período, emisión por emisión: un panel de vía
  // pública no es una emisión. Sin emisiones, la marca queda sin franjas (hueco en el gráfico, no 0 %)
  if (atl.estado === 'ok' && medios?.emisiones) for (const m of atl.marcas) {
    const f = {};
    for (const e of emisionesDe(medios, m.id, P.desde, P.hasta)) if (e.grupo !== 'VIA PUBLICA' && e.franja) f[e.franja] = (f[e.franja] || 0) + 1;
    m.franjas = f; m.mezclaFranjas = reparto(f);
  }
  // digital por grupo de plataforma (Facebook, Instagram, YouTube, TikTok y sitios): avisos registrados, no inversión
  if (digital.estado === 'ok') for (const m of digital.marcas) {
    m.grupos = Object.fromEntries(GRUPOS_DIGITALES.map((g) => [g, 0]));
    for (const [k, n] of Object.entries(m.plataformas || {})) m.grupos[grupoDigital(k)] += n;
  }
  const atlPrevio = ok('atl') && P.compararDesde ? leerUniverso(contrato.daily, { ...P, desde: P.compararDesde, hasta: P.compararHasta, compararDesde: null }).marcas : null;

  // la semana de la capa 1 es el período elegido: con el atajo inicial, los últimos siete días
  const diasConData = new Set(contrato.daily.map((d) => d.fecha));
  const S = { desde: P.desde, hasta: P.hasta };
  const DIAS_PATRON = 28;
  const desdePatron = sumarDias(P.hasta, -(DIAS_PATRON - 1));
  const PM = P.dias >= DIAS_PATRON ? P : { desde: desdePatron < meta.firstDay ? meta.firstDay : desdePatron, hasta: P.hasta };
  const medPM = ok('atl') ? horarioYCanales(medios, PM, diasConData) : null;
  const vista = {
    periodo: P, fuentes, umbrales: UMBRALES,
    monitoreo: [
      { titulo: 'Marcas que se siguen', items: MARCAS.map(nombreMarca) },
      ...(VIGILADAS.length ? [{ titulo: 'Otras marcas, solo en lo nuevo de la capa 1', items: VIGILADAS.map((v) => v.nombre) }] : []),
      { titulo: 'Subsectores de Integrametrics', items: CLIENTE.subsectores },
      { titulo: 'Medios ATL', items: ['TV abierta', 'Cable', 'Radio', 'OTT y streaming', 'Vía pública'] },
      { titulo: 'Plataformas digitales', items: plataformasDelAnio(contrato) },
      { titulo: 'Búsquedas en Google Trends', items: [...CLIENTE.busquedas.categoria, ...CLIENTE.busquedas.marcasDiy].map((b) => b.nombre) },
      { titulo: 'Por conectar', items: ['Hashtags en TikTok (Apify)', 'Conversación en Facebook (Apify)', `Meta Ads, Google Ads y TikTok Ads de ${CLIENTE.nombre}`, `CRM de ${CLIENTE.nombre} en Google Sheets`] },
    ],
    lee: {
      atl, digital, atlPrevio,
      estrenos: ok('atl') ? estrenos(contrato, P) : null,
      abanicoAtl: ok('atl') ? abanicoAtl(contrato, P) : null,
      abanicoDigital: ok('digital') ? abanicoDigital(contrato, P) : null,
      ooh: ok('atl') ? ooh(contrato, mapa, P) : null,
      // cuándo sale al aire es un patrón: con menos de cuatro semanas se lee en las cuatro que terminan en el período
      medios: medPM,
      mediosVentana: { desde: PM.desde, hasta: PM.hasta, ampliada: PM.desde !== P.desde, dias: diasEntre(PM.desde, PM.hasta) + 1 },
      // los mismos medios en el período exacto: para MAIA y para las cifras que dicen el período
      mediosDelPeriodo: PM === P ? medPM : (ok('atl') ? horarioYCanales(medios, P, diasConData) : null),
      // las versiones del año de la competencia principal (la primera de cliente.js)
      cronograma: ok('atl') ? cronograma(versionesDelAnio(contrato, COMPETENCIA[0])) : null,
      // la semana de la competencia: los siete días que terminan en el último día del período
      semana: S,
      digitalSemana: ok('digital') ? digitalDeLaSemana(contrato, S) : null,
      tvSemana: ok('atl') && medios?.emisiones ? atlDeLaSemana(contrato, medios, S, 'tv') : null,
      radioSemana: ok('atl') && medios?.emisiones ? atlDeLaSemana(contrato, medios, S, 'radio') : null,
      // la compra de medios también es un patrón: la misma ventana mínima de cuatro semanas que el horario
      compra: ok('atl') ? compraDeMedios(medios, PM) : null,
      // las marcas vigiladas, solo para la capa 1 (null si su archivo no llegó)
      vigiladas: leerVigiladas(vig, contrato, mapa, P, ok),
    },
    // Data de ejemplo (src/muestra/ejemplo.js): fuentes por conectar. Va rotulada y no entra a los avisos ni a MAIA
    ejemplo: {
      tiktok: leerTiktok(tiktokDeEjemplo(P.hasta)),
      facebook: leerFacebook(facebookDeEjemplo(P.hasta)),
      plataformas: leerPlataformas(plataformasDeEjemplo(meta.firstDay, meta.lastDay), P),
    },
    analiza: {
      temporada: temporada(contrato), franjas: ORDEN_FRANJAS,
      pauta: pautaDelAnio(contrato, { atl: ok('atl'), digital: ok('digital') }),
      pautaSemanal: pautaPorSemana(contrato, { atl: ok('atl'), digital: ok('digital') }),
      shareSemanal: shareDelAnio(contrato, { atl: ok('atl'), digital: ok('digital') }),
      // la mezcla de la competencia principal mes a mes: necesita las dos fuentes, si no el 100 % mentiría
      mezcla: ok('atl') && ok('digital') ? { marca: nombreMarca(COMPETENCIA[0]), ...mezclaMensual(contrato.daily, contrato.digital?.daily || [], COMPETENCIA[0], contrato.meta.firstDay, contrato.meta.lastDay) } : null,
      busquedas: ok('trends') ? leerBusquedas(busquedas, { hasta: P.hasta }) : null,
    },
    sugiere: {},
  };
  // sin ATL no hay semana que armar: el panel de MAIA lo dice; sin digital, los hechos digitales no se cuentan
  const distritoPanel = (p) => (mapa && Number.isFinite(p.lat) && Number.isFinite(p.lng) ? distritoDe(mapa, proyectar(mapa, p.lat, p.lng)) : null) ?? p.localidad;
  vista.sugiere.semana = ok('atl') ? hechosDeLaSemana(contrato, { propia: PROPIA, competencia: COMPETENCIA, nombreMarca, busquedas: ok('trends') ? leerBusquedas(busquedas) : null, sinDigital: !ok('digital'), distritoDe: distritoPanel }) : null;
  vista.sugiere.semanaSinAtl = !ok('atl');
  vista.sugiere.queMirar = queMirar(vista, P).filter((a) => a.nivel !== 'bien');
  vista.sugiere.queVaBien = queMirar(vista, P).filter((a) => a.nivel === 'bien');
  return vista;
}
