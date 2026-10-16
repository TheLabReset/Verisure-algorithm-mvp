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
import { rango, diasEntre, diaSemana, periodoDelMes, mesesDisponibles, DIAS_MINIMOS } from './periodo.js';
import { agruparAnuncios, nombrePlataforma } from './anuncios.js';
import { leerOoh, contornos } from './ooh.js';
import { versionesDelAnio, cronograma, pautaDiaria, shareSemanal, pautaSemanal } from './competencia.js';
import { leerBusquedas } from './busquedas.js';
import { hechosDeLaSemana } from './semana.js';

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
export const nombreMarca = (m) => (m === PROPIA ? CLIENTE.nombre : CLIENTE.competencia.find((c) => c.marcaFuente === m)?.nombre ?? m);
const MARCAS = [PROPIA, ...COMPETENCIA];
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
  const antes = P.compararDesde ? sumarTramo(serie, P.compararDesde, P.compararHasta) : null;
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
  return { estado: 'ok', marcas, total: ahora.total, totalPrevio: antes ? antes.total : null, diaria, sinDato };
}

// ── Piezas para el abanico: cada una con su arte (imagen, video o audio) ──
const formatoDe = (asset) => ({ video: 'Video', audio: 'Audio', image: 'Imagen' }[asset?.kind] ?? null);
const pieza = (p, extra = {}) => ({
  id: String(p.key), titulo: p.vname || '', texto: '', pie: '', plataformas: [], desde: dia(p.firstEmission || p.firstFecha || p.fecha),
  activo: true, enlace: null, imagen: p.asset?.kind === 'image' ? p.asset.url : null,
  medio: p.asset && p.asset.kind !== 'image' && p.asset.kind !== 'link' ? p.asset : null, formato: formatoDe(p.asset), arte: null, ...extra,
});
function abanico(items, marcaDe) {
  const porMarca = new Map(MARCAS.map((m) => [m, []]));
  for (const it of items) if (porMarca.has(marcaDe(it))) porMarca.get(marcaDe(it)).push(it);
  return agruparAnuncios(MARCAS.map((m) => ({ nombre: nombreMarca(m), propia: m === PROPIA, anuncios: porMarca.get(m).map((x) => x.pieza) })));
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
  return abanico(items, (x) => x.marca);
}

// OOH: los paneles detectados en el período, con su foto o video, sobre el mapa y por distrito
function ooh(contrato, mapa, P) {
  const paneles = (contrato.ooh || []).filter((p) => MARCAS.includes(p.maname) && dia(p.firstFecha || p.lastFecha) <= P.hasta && dia(p.lastFecha || p.firstFecha) >= P.desde)
    .map((p) => ({ ...p, marca: p.maname }));
  const mapaLeido = leerOoh(paneles, mapa, MARCAS);
  // La comparación: en qué distritos tenía paneles cada marca antes (Integrametrics registra cada panel el día que lo
  // detecta, así que lo nuevo no es el panel sino el distrito)
  const previos = P.compararDesde ? (contrato.ooh || []).filter((p) => MARCAS.includes(p.maname) && dia(p.firstFecha || p.lastFecha) <= P.compararHasta && dia(p.lastFecha || p.firstFecha) >= P.compararDesde).map((p) => ({ ...p, marca: p.maname })) : null;
  const leidoAntes = previos ? leerOoh(previos, mapa, MARCAS) : null;
  const zonasDe = (leido, m) => new Set([...leido.porDistrito, ...leido.fueraDeLima].filter((d) => d[m] > 0).map((d) => d.nombre));
  const conPieza = (p) => ({
    id: String(p.key), marca: p.maname, nombre: nombreMarca(p.maname), propia: p.maname === PROPIA, lat: p.lat, lng: p.lng,
    version: p.vname || null, direccion: p.direccion || null, localidad: p.localidad || null, tipo: p.tipo || null,
    desde: dia(p.firstFecha), hasta: dia(p.lastFecha || p.firstFecha), inversion: p.spend || 0, asset: p.asset || null,
    pieza: pieza({ ...p, firstEmission: p.firstFecha }, { titulo: p.direccion || p.localidad || 'Panel sin dirección', texto: p.vname ? `«${p.vname}»` : '', plataformas: [p.tipo, p.localidad].filter(Boolean) }),
  });
  const lista = paneles.map(conPieza);
  // distrito y ciudad de cada panel, ya asignados por coordenadas
  const ubicacion = new Map();
  for (const q of mapaLeido.puntos) for (const x of q.paneles) ubicacion.set(String(x.key), { distrito: q.distrito, ubicacion: q.id });
  return {
    ubicaciones: mapaLeido.puntos.map((u) => ({ id: u.id, marca: u.marca, nombre: nombreMarca(u.marca), foco: u.marca !== PROPIA, propia: u.marca === PROPIA, lat: u.lat, lng: u.lng, zona: u.zona, distrito: u.distrito, inversion: u.inversion, paneles: u.paneles.map((x) => String(x.key)) })),
    zonas: mapaLeido.zonas,
    paneles: lista.map((p) => ({ ...p, distrito: ubicacion.get(p.id)?.distrito ?? null, ubicacion: ubicacion.get(p.id)?.ubicacion ?? null })).sort((a, b) => Number(a.propia) - Number(b.propia) || b.inversion - a.inversion),
    porMarca: Object.fromEntries(MARCAS.map((m) => [m, paneles.filter((p) => p.maname === m).length])),
    inversionPorMarca: Object.fromEntries(MARCAS.map((m) => [m, suma(paneles.filter((p) => p.maname === m).map((p) => p.spend))])),
    porMarcaAntes: previos ? Object.fromEntries(MARCAS.map((m) => [m, previos.filter((p) => p.maname === m).length])) : null,
    zonasNuevas: leidoAntes ? Object.fromEntries(MARCAS.map((m) => { const antes = zonasDe(leidoAntes, m); return [m, [...zonasDe(mapaLeido, m)].filter((z) => !antes.has(z) && z !== 'Sin coordenadas')]; })) : null,
    porDistrito: mapaLeido.porDistrito, fueraDeLima: mapaLeido.fueraDeLima, enLima: mapaLeido.enLima, fuera: mapaLeido.fuera,
    contornos: contornos(mapa),
    abanico: abanico(lista.map((p) => ({ marca: p.marca, pieza: p.pieza })), (x) => x.marca),
  };
}

// Estrenos: primera emisión de una versión nueva, con su arte
function estrenos(contrato, P) {
  return (contrato.events || []).filter((e) => enRango(e.fecha, P.desde, P.hasta) && MARCAS.includes(e.maname))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    .map((e) => ({ id: String(e.key), fecha: e.fecha, marca: e.maname, nombre: nombreMarca(e.maname), propia: e.maname === PROPIA, version: e.vname, tipo: e.tname, canal: e.mname, franja: e.franja, duracion: Number(e.duraseg) || null, asset: e.asset || null }));
}

// Medios del mes (hora, día, canal, programa, zona): de medios.json, armado desde el CSV de emisiones
function horarioYCanales(medios, P) {
  const m = medios?.meses?.[P.mes];
  if (!m) return null;
  const dias = rango(P.desde, P.hasta);
  const cuantosDia = Array(7).fill(0);
  for (const d of dias) cuantosDia[diaSemana(d)] += 1;
  return Object.fromEntries(MARCAS.map((marca) => {
    // el mes está en medios.json pero la marca no: no emitió (cero), no es un dato que falta
    const b = m[marca] ?? { emisiones: 0, horas: Array(24).fill(0), dias: Array(7).fill(0), horaDia: Array.from({ length: 7 }, () => Array(24).fill(0)), canales: {}, programas: {}, zonas: {}, grupos: {} };
    const porHora = b.horas.map((n) => n / dias.length);
    // emisiones promedio en cada hora de cada día de la semana: la cuenta del mes dividida por cuántas veces cae ese día
    const matriz = (b.horaDia || []).map((fila, i) => fila.map((n) => (cuantosDia[i] ? n / cuantosDia[i] : null)));
    const porDiaSemana = b.dias.map((n, i) => (cuantosDia[i] ? n / cuantosDia[i] : null));
    const horasAltas = porHora.map((v, h) => [v, h]).sort((a, z) => z[0] - a[0]).slice(0, 4).filter(([v]) => v > 0).map(([, h]) => h);
    const max = Math.max(...porDiaSemana.map((v) => v ?? -1));
    // Integrametrics marca «DESCONOCIDO» el canal que no identificó
    const top = (obj, n) => Object.entries(obj).filter(([, v]) => v > 0).sort((a, z) => z[1] - a[1] || a[0].localeCompare(z[0])).slice(0, n).map(([nombre, valor]) => ({ nombre: nombre === 'DESCONOCIDO' ? 'Canal sin registrar' : nombre, sinRegistrar: nombre === 'DESCONOCIDO', valor }));
    const conInversion = Object.values(b.canales).filter((v) => v > 0).length;
    return [marca, {
      emisiones: b.emisiones, porHora, porDiaSemana, matriz, horasAltas, diaMayor: max > 0 ? porDiaSemana.indexOf(max) : null,
      canales: top(b.canales, 8), programas: top(b.programas, 8), zonas: top(b.zonas, 8), totalCanales: conInversion, totalProgramas: Object.keys(b.programas).length,
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

// ── Qué mirar: cada alerta sale de una regla con umbral fijo y trae su dato ──
function queMirar(v, P) {
  const out = [];
  const comp = (x) => x.marcas.filter((m) => !m.propia);
  if (v.lee.estrenos) {
    for (const c of CLIENTE.competencia) {
      const suyos = v.lee.estrenos.filter((e) => e.marca === c.marcaFuente);
      if (suyos.length) out.push({ id: 'estreno-competencia', nivel: 'atencion', sostiene: '1.1', fuente: 'Integrametrics', marca: c.nombre, cuantos: suyos.length, ultimo: suyos[0] });
    }
  }
  // Con pocos días de data (el mes recién empieza) las variaciones no se leen: un día raro mandaría
  const diasConData = (u) => (u.estado === 'ok' ? u.diaria.filter((d) => Object.values(d.valores).some((x) => x != null)).length : 0);
  const pocos = v.lee.atl.estado === 'ok' && diasConData(v.lee.atl) < UMBRALES.diasMinimos;
  if (pocos) out.push({ id: 'pocos-dias', nivel: 'revisar', sostiene: '4.1', fuente: 'Integrametrics', dias: diasConData(v.lee.atl), minimo: UMBRALES.diasMinimos });
  if (v.lee.atl.estado === 'ok' && !pocos) {
    for (const m of comp(v.lee.atl)) {
      const valores = v.lee.atl.diaria.map((d) => d.valores[m.id]).filter((x) => x > 0);
      const med = mediana(valores);
      const pico = v.lee.atl.diaria.filter((d) => med && d.valores[m.id] >= UMBRALES.picoVeces * med).sort((a, z) => z.valores[m.id] - a.valores[m.id])[0];
      if (pico && valores.length >= 4) out.push({ id: 'pico-competencia', nivel: 'revisar', sostiene: '4.1', fuente: 'Integrametrics', marca: m.nombre, fecha: pico.fecha, monto: pico.valores[m.id], mediana: med });
      if (v.lee.atlPrevio) {
        const antes = v.lee.atlPrevio.find((x) => x.id === m.id)?.medios || {};
        const nuevos = Object.entries(m.medios).filter(([k, x]) => x > 0 && !(antes[k] > 0)).map(([k, x]) => ({ nombre: MEDIOS[k] || k, monto: x, pct: Math.round((x / m.inversion) * 100) })).filter((x) => x.pct >= UMBRALES.medioNuevo);
        if (nuevos.length) out.push({ id: 'medio-nuevo', nivel: 'revisar', sostiene: '3.1', fuente: 'Integrametrics', marca: m.nombre, medios: nuevos });
      }
    }
    const propia = v.lee.atl.marcas.find((m) => m.propia);
    const principal = v.lee.atl.marcas.find((m) => m.id === COMPETENCIA[0]);
    if (propia.share != null && propia.share >= UMBRALES.dominioAtl) out.push({ id: 'dominio-atl', nivel: 'bien', sostiene: '4.1', fuente: 'Integrametrics', share: propia.share, periodo: P, marca: principal?.nombre, shareCompetencia: principal?.share ?? 0 });
    if (v.lee.atl.sinDato.length) out.push({ id: 'dias-sin-dato', nivel: 'revisar', sostiene: '4.1', fuente: 'Integrametrics', dias: v.lee.atl.sinDato });
  }
  // La competencia sube, baja o se apaga frente a la comparación (ATL y digital por separado). Apagarse también es
  // una señal: puede ser una pausa de temporada o la antesala de un lanzamiento
  for (const [u, fuente] of [[v.lee.atl, 'Integrametrics'], [v.lee.digital, 'Integrametrics digital']]) {
    if (u.estado !== 'ok' || diasConData(u) < UMBRALES.diasMinimos) continue;
    const universo = u === v.lee.atl ? 'ATL' : 'digital';
    for (const m of comp(u)) {
      if (!m.inversionPrevia) continue;
      if (!m.inversion) { out.push({ id: 'competencia-sin-pauta', nivel: 'atencion', sostiene: '4.1', fuente, marca: m.nombre, universo, antes: m.inversionPrevia }); continue; }
      const cambio = Math.round(((m.inversion - m.inversionPrevia) / m.inversionPrevia) * 100);
      if (cambio >= UMBRALES.subidaCompetencia) out.push({ id: 'sube-competencia', nivel: 'atencion', sostiene: '4.1', fuente, marca: m.nombre, universo, sube: cambio, monto: m.inversion, antes: m.inversionPrevia });
      if (cambio <= -UMBRALES.bajadaCompetencia) out.push({ id: 'baja-competencia', nivel: 'revisar', sostiene: '4.1', fuente, marca: m.nombre, universo, baja: -cambio, monto: m.inversion, antes: m.inversionPrevia });
    }
  }
  if (v.lee.ooh?.zonasNuevas) {
    for (const c of CLIENTE.competencia) {
      const zonas = v.lee.ooh.zonasNuevas[c.marcaFuente];
      if (zonas.length) out.push({ id: 'paneles-competencia', nivel: 'revisar', sostiene: '1.2', fuente: 'Integrametrics', marca: c.nombre, zonas, cuantos: v.lee.ooh.porMarca[c.marcaFuente], antes: v.lee.ooh.porMarcaAntes[c.marcaFuente] });
    }
  }
  if (v.lee.abanicoDigital) {
    for (const g of v.lee.abanicoDigital.grupos) {
      if (g.anuncios.length) out.push({ id: 'digital-competencia', nivel: 'revisar', sostiene: '1.1', fuente: 'Integrametrics digital', marca: g.nombre, cuantas: g.anuncios.length, ultima: g.anuncios[0]?.titulo });
    }
  }
  const b = v.analiza.busquedas;
  if (b?.camaras?.crecimiento != null && b.camaras.crecimiento >= UMBRALES.subidaDiy) out.push({ id: 'diy-sube', nivel: 'atencion', sostiene: '2.2', fuente: 'Google Trends', crecimiento: b.camaras.crecimiento, razon: b.razon, desde: b.desde, hasta: b.hasta });
  if (v.lee.digital.estado === 'ok' && diasConData(v.lee.digital) >= UMBRALES.diasMinimos) {
    const propia = v.lee.digital.marcas.find((m) => m.propia);
    if (propia.cambioPts != null && propia.cambioPts <= -UMBRALES.caidaShareDigital) out.push({ id: 'share-digital', nivel: 'atencion', sostiene: '4.1', fuente: 'Integrametrics digital', share: propia.share, antes: propia.sharePrevio });
    if (propia.cambioPts != null && propia.cambioPts >= UMBRALES.subidaShareDigital) out.push({ id: 'share-digital-sube', nivel: 'bien', sostiene: '4.1', fuente: 'Integrametrics digital', share: propia.share, antes: propia.sharePrevio });
  }
  // Lo de la competencia va primero dentro de cada nivel: es lo principal del panel
  const deCompetencia = (a) => ['estreno-competencia', 'sube-competencia', 'baja-competencia', 'competencia-sin-pauta', 'pico-competencia', 'medio-nuevo', 'paneles-competencia', 'digital-competencia'].includes(a.id);
  // cada alerta lleva su período, para que su texto diga frente a qué compara
  return out.map((a) => ({ ...a, competencia: deCompetencia(a), periodo: P })).sort((a, z) => Number(z.competencia) - Number(a.competencia));
}

export function armarVista(contrato, medios, filtros, estado = {}, { mapa = null, busquedas = null } = {}) {
  const meta = contrato.meta;
  const P = periodoDelMes(meta, filtros.mes);
  const caidas = new Set(estado.fuentesCaidas || []);
  const atraso = estado.hoy ? diasEntre(meta.lastDay, estado.hoy) : 0;
  const atrasada = atraso > UMBRALES.atrasoFuente;
  const fuentes = [
    { id: 'atl', nombre: 'Integrametrics ATL', estado: caidas.has('atl') ? 'no-cargo' : atrasada ? 'parcial' : 'ok', corte: meta.lastDay, atraso, sinDato: [] },
    { id: 'digital', nombre: 'Integrametrics digital', estado: caidas.has('digital') ? 'no-cargo' : atrasada ? 'parcial' : 'ok', corte: contrato.digital?.daily?.at(-1)?.fecha ?? meta.lastDay, atraso, sinDato: [] },
  ];
  // Google Trends es semanal: se atrasa si pasan más de dos semanas desde la última semana completa
  const ultimaSemana = busquedas?.categoria?.semanas?.filter((_, i) => !busquedas.categoria.parcial[i]).at(-1) ?? null;
  const atrasoTrends = ultimaSemana && estado.hoy ? diasEntre(ultimaSemana, estado.hoy) : 0;
  fuentes.push({ id: 'trends', nombre: 'Google Trends', estado: caidas.has('trends') || !busquedas ? 'no-cargo' : atrasoTrends > 21 ? 'parcial' : 'ok', corte: ultimaSemana, atraso: atrasoTrends, sinDato: [] });
  const ok = (id) => !caidas.has(id);
  const atl = ok('atl') ? leerUniverso(contrato.daily, P) : { estado: 'no-cargo' };
  const digital = ok('digital') ? leerUniverso(contrato.digital?.daily || [], P) : { estado: 'no-cargo' };
  if (atl.estado === 'ok') fuentes[0].sinDato = atl.sinDato;
  const atlPrevio = ok('atl') && P.compararDesde ? leerUniverso(contrato.daily, { ...P, desde: P.compararDesde, hasta: P.compararHasta, compararDesde: null }).marcas : null;

  const vista = {
    periodo: P, fuentes, umbrales: UMBRALES,
    monitoreo: [
      { titulo: 'Marcas que se siguen', items: MARCAS.map(nombreMarca) },
      { titulo: 'Subsectores de Integrametrics', items: CLIENTE.subsectores },
      { titulo: 'Medios ATL', items: ['TV abierta', 'Cable', 'Radio', 'OTT y streaming', 'Vía pública'] },
      { titulo: 'Plataformas digitales', items: ['Facebook', 'Instagram', 'Google Search', 'YouTube'] },
      { titulo: 'Búsquedas en Google Trends', items: [...CLIENTE.busquedas.categoria, ...CLIENTE.busquedas.marcasDiy].map((b) => b.nombre) },
      { titulo: 'Por conectar', items: ['Precios de cámaras en marketplaces', 'Anuncios de marcas de cámaras (Meta Ad Library)', 'Denuncias SIDPOL', `Power BI de ${CLIENTE.nombre}`] },
    ],
    lee: {
      atl, digital, atlPrevio,
      estrenos: ok('atl') ? estrenos(contrato, P) : null,
      abanicoAtl: ok('atl') ? abanicoAtl(contrato, P) : null,
      abanicoDigital: ok('digital') ? abanicoDigital(contrato, P) : null,
      ooh: ok('atl') ? ooh(contrato, mapa, P) : null,
      medios: ok('atl') ? horarioYCanales(medios, P) : null,
      // las versiones del año de la competencia principal (la primera de cliente.js)
      cronograma: ok('atl') ? cronograma(versionesDelAnio(contrato, COMPETENCIA[0])) : null,
    },
    analiza: {
      temporada: temporada(contrato), franjas: ORDEN_FRANJAS,
      pauta: pautaDelAnio(contrato, { atl: ok('atl'), digital: ok('digital') }),
      pautaSemanal: pautaPorSemana(contrato, { atl: ok('atl'), digital: ok('digital') }),
      shareSemanal: shareDelAnio(contrato, { atl: ok('atl'), digital: ok('digital') }),
      busquedas: ok('trends') ? leerBusquedas(busquedas) : null,
    },
    sugiere: {},
  };
  vista.sugiere.semana = ok('atl') ? hechosDeLaSemana(contrato, { propia: PROPIA, competencia: COMPETENCIA, nombreMarca, busquedas: vista.analiza.busquedas }) : null;
  vista.sugiere.queMirar = queMirar(vista, P).filter((a) => a.nivel !== 'bien');
  vista.sugiere.queVaBien = queMirar(vista, P).filter((a) => a.nivel === 'bien');
  return vista;
}
