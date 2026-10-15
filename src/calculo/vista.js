// armarVista(contrato, medios, filtros, estado) devuelve todo lo que pintan las cuatro capas. Es la única puerta
// entre la data y la pantalla: los componentes no calculan. Puro: sin fechas del sistema (el atraso de la fuente
// llega en `estado.hoy`, que lo mide la app).
//
// Universos: la inversión ATL (TV, radio, cable, OTT, vía pública) y la digital (Meta, Google, YouTube) las estima
// Integrametrics con métodos distintos: se leen lado a lado y nunca se suman.

import { CLIENTE } from '../cliente.js';
import { rango, diasEntre, diaSemana, periodoDelMes, mesesDisponibles } from './periodo.js';
import { agruparAnuncios, nombrePlataforma } from './anuncios.js';

export { mesesDisponibles };

// ── Umbrales de las alertas: fijos, a la vista (docs/guia-algoritmo.md, «Alertas») ──
export const UMBRALES = {
  picoVeces: 3,          // un día de la competencia que triplica su mediana de días con inversión
  caidaShareDigital: 5,  // puntos de share digital que pierde la marca propia frente a la comparación
  subidaShareDigital: 5,
  dominioAtl: 90,        // share ATL de la marca propia que se lee como dominio de la categoría
  atrasoFuente: 3,       // días sin datos nuevos para decir que la fuente está atrasada
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
    id: m, nombre: nombreMarca(m), propia: m === PROPIA,
    inversion: ahora.porMarca[m].inversion, share: ahora.shares[m], spots: ahora.porMarca[m].spots, impresiones: ahora.porMarca[m].impresiones,
    medios: ahora.porMarca[m].medios, franjas: ahora.porMarca[m].franjas, plataformas: ahora.porMarca[m].plataformas,
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

// Digital: una carta por versión (las variantes de una misma versión se juntan), las que aparecieron en el período
function abanicoDigital(contrato, P) {
  const porVersion = new Map();
  for (const p of contrato.digital?.pieces || []) {
    if (!enRango(p.firstEmission, P.desde, P.hasta)) continue;
    const k = `${p.maname}|${p.vname}`;
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

// Vía pública: los paneles detectados en el período, con su foto o video, y la cuenta por distrito
function viaPublica(contrato, P) {
  const paneles = (contrato.ooh || []).filter((p) => dia(p.firstFecha || p.lastFecha) <= P.hasta && dia(p.lastFecha || p.firstFecha) >= P.desde);
  const items = paneles.map((p) => ({
    marca: p.maname,
    pieza: pieza({ ...p, key: p.key, vname: p.vname, firstEmission: p.firstFecha }, { titulo: p.direccion || p.localidad || 'Panel sin dirección', texto: p.vname ? `«${p.vname}»` : '', plataformas: [p.tipo, p.localidad].filter(Boolean) }),
  }));
  const distritos = new Map();
  for (const p of paneles) {
    const d = p.localidad || 'Sin distrito';
    if (!distritos.has(d)) distritos.set(d, Object.fromEntries(MARCAS.map((m) => [m, 0])));
    if (distritos.get(d)[p.maname] != null) distritos.get(d)[p.maname] += 1;
  }
  const porDistrito = [...distritos.entries()].map(([nombre, c]) => ({ nombre, ...c, total: suma(Object.values(c)) })).sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre));
  return { paneles: paneles.length, porMarca: Object.fromEntries(MARCAS.map((m) => [m, paneles.filter((p) => p.maname === m).length])), porDistrito, abanico: abanico(items, (x) => x.marca) };
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
    const b = m[marca];
    if (!b) return [marca, null];
    const porHora = b.horas.map((n) => n / dias.length);
    const porDiaSemana = b.dias.map((n, i) => (cuantosDia[i] ? n / cuantosDia[i] : null));
    const horasAltas = porHora.map((v, h) => [v, h]).sort((a, z) => z[0] - a[0]).slice(0, 4).filter(([v]) => v > 0).map(([, h]) => h);
    const max = Math.max(...porDiaSemana.map((v) => v ?? -1));
    const top = (obj, n) => Object.entries(obj).sort((a, z) => z[1] - a[1] || a[0].localeCompare(z[0])).slice(0, n).map(([nombre, valor]) => ({ nombre, valor }));
    return [marca, {
      emisiones: b.emisiones, porHora, porDiaSemana, horasAltas, diaMayor: max > 0 ? porDiaSemana.indexOf(max) : null,
      canales: top(b.canales, 8), programas: top(b.programas, 8), zonas: top(b.zonas, 8), totalCanales: Object.keys(b.canales).length, totalProgramas: Object.keys(b.programas).length,
    }];
  }));
}

// Temporada: inversión de cada mes del contrato, por marca y universo (un mes en curso se marca como parcial)
function temporada(contrato) {
  const meses = mesesDisponibles(contrato.meta);
  const fila = (serie, mes) => Object.fromEntries(MARCAS.map((m) => [m, suma(serie.filter((f) => f.fecha.startsWith(mes)).map((f) => f.brands[m]?.spend || 0))]));
  return meses.map((mes) => ({ mes, parcial: periodoDelMes(contrato.meta, mes).parcial, atl: fila(contrato.daily, mes), digital: fila(contrato.digital?.daily || [], mes) }));
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
  if (v.lee.atl.estado === 'ok') {
    for (const m of comp(v.lee.atl)) {
      const valores = v.lee.atl.diaria.map((d) => d.valores[m.id]).filter((x) => x > 0);
      const med = mediana(valores);
      const pico = v.lee.atl.diaria.filter((d) => med && d.valores[m.id] >= UMBRALES.picoVeces * med).sort((a, z) => z.valores[m.id] - a.valores[m.id])[0];
      if (pico && valores.length >= 4) out.push({ id: 'pico-competencia', nivel: 'revisar', sostiene: '4.1', fuente: 'Integrametrics', marca: m.nombre, fecha: pico.fecha, monto: pico.valores[m.id], mediana: med });
      if (v.lee.atlPrevio) {
        const antes = v.lee.atlPrevio.find((x) => x.id === m.id)?.medios || {};
        const nuevos = Object.entries(m.medios).filter(([k, x]) => x > 0 && !(antes[k] > 0)).map(([k, x]) => ({ nombre: MEDIOS[k] || k, monto: x, pct: Math.round((x / m.inversion) * 100) }));
        if (nuevos.length) out.push({ id: 'medio-nuevo', nivel: 'revisar', sostiene: '3.1', fuente: 'Integrametrics', marca: m.nombre, medios: nuevos });
      }
    }
    const propia = v.lee.atl.marcas.find((m) => m.propia);
    if (propia.share != null && propia.share >= UMBRALES.dominioAtl) out.push({ id: 'dominio-atl', nivel: 'bien', sostiene: '4.1', fuente: 'Integrametrics', share: propia.share });
    if (v.lee.atl.sinDato.length) out.push({ id: 'dias-sin-dato', nivel: 'revisar', sostiene: '4.1', fuente: 'Integrametrics', dias: v.lee.atl.sinDato });
  }
  if (v.lee.digital.estado === 'ok') {
    const propia = v.lee.digital.marcas.find((m) => m.propia);
    if (propia.cambioPts != null && propia.cambioPts <= -UMBRALES.caidaShareDigital) out.push({ id: 'share-digital', nivel: 'atencion', sostiene: '4.1', fuente: 'Integrametrics digital', share: propia.share, antes: propia.sharePrevio });
    if (propia.cambioPts != null && propia.cambioPts >= UMBRALES.subidaShareDigital) out.push({ id: 'share-digital-sube', nivel: 'bien', sostiene: '4.1', fuente: 'Integrametrics digital', share: propia.share, antes: propia.sharePrevio });
  }
  return out;
}

export function armarVista(contrato, medios, filtros, estado = {}) {
  const meta = contrato.meta;
  const P = periodoDelMes(meta, filtros.mes);
  const caidas = new Set(estado.fuentesCaidas || []);
  const atraso = estado.hoy ? diasEntre(meta.lastDay, estado.hoy) : 0;
  const atrasada = atraso > UMBRALES.atrasoFuente;
  const fuentes = [
    { id: 'atl', nombre: 'Integrametrics ATL', estado: caidas.has('atl') ? 'no-cargo' : atrasada ? 'parcial' : 'ok', corte: meta.lastDay, atraso, sinDato: [] },
    { id: 'digital', nombre: 'Integrametrics digital', estado: caidas.has('digital') ? 'no-cargo' : atrasada ? 'parcial' : 'ok', corte: contrato.digital?.daily?.at(-1)?.fecha ?? meta.lastDay, atraso, sinDato: [] },
  ];
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
      { titulo: 'Por conectar', items: ['Google Trends', 'Denuncias SIDPOL', `Power BI de ${CLIENTE.nombre}`] },
    ],
    lee: {
      atl, digital, atlPrevio,
      estrenos: ok('atl') ? estrenos(contrato, P) : null,
      abanicoAtl: ok('atl') ? abanicoAtl(contrato, P) : null,
      abanicoDigital: ok('digital') ? abanicoDigital(contrato, P) : null,
      viaPublica: ok('atl') ? viaPublica(contrato, P) : null,
      medios: ok('atl') ? horarioYCanales(medios, P) : null,
    },
    analiza: { temporada: temporada(contrato), franjas: ORDEN_FRANJAS },
    sugiere: {},
  };
  vista.sugiere.queMirar = queMirar(vista, P).filter((a) => a.nivel !== 'bien');
  vista.sugiere.queVaBien = queMirar(vista, P).filter((a) => a.nivel === 'bien');
  return vista;
}
