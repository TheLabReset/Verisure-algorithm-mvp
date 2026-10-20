// Lo de la competencia en el período elegido: lo nuevo en digital y lo que tuvo en TV, cable y radio, emisión por
// emisión. Y la compra de medios del período, de la competencia y de la marca propia. Puro: sin fechas del sistema.
//
// Todo sigue al período elegido arriba (un día, siete, un mes). Si la competencia no tuvo nada en ese tramo, se
// muestra su último tramo del mismo largo con algo, y se dice.

import { CLIENTE } from '../cliente.js';
import { agruparAnuncios, htmlDe } from './anuncios.js';
import { plataformaEnFrase } from '../textos/comun.js';
import { emisionesDe } from '../fuentes/medios.js';
import { mismaCadena } from '../fuentes/cadenas.js';

// Una repetidora regional sin su propia compra («RITMO ROMANTICA (TRU)») es la misma emisora de Lima: para contar
// canales y nombrarlos va con su principal. El streaming del canal (app, web, YouTube) sí es otro canal
const STREAMING = /\((APP|WEB|YOUTUBE)\)\s*$/i;
export function canalPrincipal(canales) {
  const principales = [...new Set(canales.filter((c) => c && !/\([^)]*\)\s*$/.test(c)))];
  return (c) => (!c || STREAMING.test(c) ? c : principales.find((p) => mismaCadena(c, p)) ?? c);
}

const COMPETENCIA = CLIENTE.competencia.map((c) => c.marcaFuente);
const PROPIA = CLIENTE.marcaFuente;
const nombreDe = (m) => (m === PROPIA ? CLIENTE.nombre : [...CLIENTE.competencia, ...(CLIENTE.vigiladas || [])].find((c) => c.marcaFuente === m)?.nombre ?? m);
const dia = (f) => (f || '').slice(0, 10);
const masDias = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

export const DIAS_SEMANA = 7;
// Los grupos de medio de cada apartado ATL. OTT va con la TV: es la señal del canal por streaming
export const APARTADOS_ATL = { tv: ['TV ABIERTA', 'CABLE', 'OTT STREAMING/LIVE'], radio: ['RADIO'] };

// El último tramo con algo: si el período no tiene nada, el tramo del mismo largo que termina en el último día con
// algo antes (con un período largo, como mucho una semana: lo más reciente, no medio año atrás)
const diasDe = (S) => Math.round((new Date(`${S.hasta}T00:00:00Z`) - new Date(`${S.desde}T00:00:00Z`)) / 86400000) + 1;
// Sin respaldo (las marcas vigiladas) no hay último tramo: lo que no salió en el período no se muestra
function semanaConAlgo(fechas, S, primerDia, respaldo = true) {
  if (fechas.some((f) => f >= S.desde && f <= S.hasta)) return { desde: S.desde, hasta: S.hasta, reciente: false };
  if (!respaldo) return null;
  const ultimo = fechas.filter((f) => f < S.desde).sort().at(-1);
  if (!ultimo) return null;
  const desde = masDias(ultimo, -(Math.min(diasDe(S), DIAS_SEMANA) - 1));
  return { desde: primerDia && desde < primerDia ? primerDia : desde, hasta: ultimo, reciente: true };
}

// El digitalizado de cada versión ATL: Integrametrics guarda el archivo de cada creativo
function archivosPorVersion(contrato) {
  const m = new Map();
  for (const p of [...(contrato.pieces || []), ...(contrato.events || [])]) {
    const k = `${p.maname}|${p.vname}`;
    if (p.asset && p.asset.kind !== 'link' && !m.has(k)) m.set(k, p.asset);
  }
  return m;
}

/**
 * Digital, lo nuevo de la semana de la competencia: las piezas que Integrametrics vio por primera vez en la semana,
 * agrupadas por mensaje (la versión). La marca propia no va: su equipo ya sabe qué tiene.
 * Con `marcas` lo mismo para otras marcas (las vigiladas, una por vez, sin respaldo); `primerDia` es el primer día
 * de data digital del contrato principal: desde ahí se bajan todas las marcas.
 */
export function digitalDeLaSemana(contrato, S, { marcas = COMPETENCIA, respaldo = true, primerDia: inicio } = {}) {
  const todas = (contrato.digital?.pieces || []).filter((p) => marcas.includes(p.maname));
  const primerDia = inicio !== undefined ? inicio : contrato.digital?.daily?.[0]?.fecha ?? null;
  const W = semanaConAlgo(todas.map((p) => dia(p.firstEmission)), S, primerDia, respaldo);
  // la primera vez que se vio cada mensaje, en toda la data: dice si el mensaje es nuevo o ya venía
  const primera = new Map();
  for (const p of todas) { const k = `${p.maname}|${p.vname}`, d = dia(p.firstEmission); if (!primera.has(k) || d < primera.get(k)) primera.set(k, d); }
  if (!W) return { semana: S, reciente: false, piezas: 0, mensajes: [], abanico: { grupos: [], propio: null, total: 0 }, plataformas: [], sinHistoria: false };
  const enLaSemana = todas.filter((p) => dia(p.firstEmission) >= W.desde && dia(p.firstEmission) <= W.hasta);
  const porMensaje = new Map();
  for (const p of enLaSemana) {
    const k = `${p.maname}|${p.vname}`;
    if (!porMensaje.has(k)) porMensaje.set(k, { id: k, marca: p.maname, nombre: nombreDe(p.maname), mensaje: p.vname || 'Sin nombre', piezas: [], plataformas: new Set(), desde: dia(p.firstEmission), primeraVez: primera.get(k) });
    const g = porMensaje.get(k);
    g.piezas.push(p);
    if (p.plataforma) g.plataformas.add(p.plataforma);
    if (dia(p.firstEmission) < g.desde) g.desde = dia(p.firstEmission);
  }
  const mensajes = [...porMensaje.values()]
    .map((g) => ({ id: g.id, marca: g.marca, nombre: g.nombre, mensaje: g.mensaje, piezas: g.piezas.length, plataformas: [...g.plataformas], desde: g.desde, nuevo: g.primeraVez >= W.desde, primeraVez: g.primeraVez }))
    .sort((a, b) => b.piezas - a.piezas || (a.desde < b.desde ? 1 : -1));
  // el abanico: un mazo por mensaje, con sus piezas (imagen o video) de la más reciente a la más antigua
  const carta = (p) => ({
    id: String(p.key), titulo: p.vname || '', texto: '', pie: '', plataformas: p.plataforma ? [plataformaEnFrase(p.plataforma)] : [], desde: dia(p.firstEmission),
    activo: true, enlace: null, imagen: p.asset?.kind === 'image' ? p.asset.url : null,
    medio: p.asset && p.asset.kind !== 'image' && p.asset.kind !== 'link' ? p.asset : null, html: htmlDe(p.asset), formato: { video: 'Video', image: 'Imagen' }[p.asset?.kind] ?? null, arte: null,
  });
  const abanico = agruparAnuncios(mensajes.map((m) => ({ nombre: m.mensaje, anuncios: porMensaje.get(m.id).piezas.map(carta) })));
  // las plataformas de la semana, de más a menos piezas (el código de la fuente: el texto lo escribe la pantalla)
  const cuenta = new Map();
  for (const p of enLaSemana) if (p.plataforma) cuenta.set(p.plataforma, (cuenta.get(p.plataforma) || 0) + 1);
  const plataformas = [...cuenta.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  return { semana: { desde: W.desde, hasta: W.hasta }, reciente: W.reciente, piezas: enLaSemana.length, mensajes, abanico, plataformas, sinHistoria: Boolean(primerDia && W.desde <= primerDia), inicio: primerDia };
}

/**
 * TV y cable, o radio, de la competencia en la semana: cada emisión con su digitalizado, programa, motivo (la
 * versión), fecha, hora y tipo de aviso. Una versión es nueva si su estreno cae en la semana.
 */
export function atlDeLaSemana(contrato, medios, S, apartado, { marcas = COMPETENCIA, respaldo = true, primerDia = contrato.meta.firstDay } = {}) {
  const grupos = APARTADOS_ATL[apartado];
  const archivos = archivosPorVersion(contrato);
  const estreno = new Map();
  for (const e of contrato.events || []) { const k = `${e.maname}|${e.vname}`; if (!estreno.has(k) || e.fecha < estreno.get(k)) estreno.set(k, dia(e.fecha)); }
  const filas = marcas.flatMap((m) => emisionesDe(medios, m, primerDia, S.hasta).map((e) => ({ marca: m, ...e }))).filter((e) => grupos.includes(e.grupo));
  const W = semanaConAlgo(filas.map((e) => e.fecha), S, primerDia, respaldo);
  if (!W) return { semana: S, reciente: false, emisiones: [], porTipo: [], porMotivo: [], canales: 0, sinRegistros: true };
  const lista = filas.filter((e) => e.fecha >= W.desde && e.fecha <= W.hasta).map((e, i) => {
    const k = `${e.marca}|${e.version}`;
    return { ...e, id: `${apartado}-${e.fecha}-${e.hora}-${i}`, nombre: nombreDe(e.marca), asset: archivos.get(k) || null, nueva: Boolean(estreno.get(k) && estreno.get(k) >= W.desde && estreno.get(k) <= W.hasta) };
  });
  const contar = (clave) => { const c = new Map(); for (const e of lista) c.set(e[clave], (c.get(e[clave]) || 0) + 1); return [...c.entries()].map(([nombre, emisiones]) => ({ nombre, emisiones })).sort((a, b) => b.emisiones - a.emisiones || a.nombre.localeCompare(b.nombre)); };
  const principal = canalPrincipal(lista.map((e) => e.canal));
  return { semana: { desde: W.desde, hasta: W.hasta }, reciente: W.reciente, emisiones: lista, porTipo: contar('tipo'), porMotivo: contar('version'), canales: new Set(lista.map((e) => principal(e.canal))).size, sinRegistros: false };
}

/**
 * La compra de medios del período: por canal (medio, emisiones, inversión, programas, tipos) de la competencia, con
 * la marca propia al lado, y el detalle por canal, programa y tipo de aviso. Vía pública va aparte, en OOH.
 */
export function compraDeMedios(medios, P) {
  if (!medios?.emisiones) return null;
  const MARCAS = [...COMPETENCIA, PROPIA];
  const porCanal = new Map();
  const detalle = Object.fromEntries(MARCAS.map((m) => [m, new Map()]));
  const todas = Object.fromEntries(MARCAS.map((m) => [m, emisionesDe(medios, m, P.desde, P.hasta).filter((e) => e.grupo !== 'VIA PUBLICA')]));
  const principal = canalPrincipal(MARCAS.flatMap((m) => todas[m].map((x) => x.canal)));
  for (const m of MARCAS) {
    for (const e0 of todas[m]) {
      const e = { ...e0, canal: principal(e0.canal) };
      const k = `${e.grupo}|${e.canal}`;
      if (!porCanal.has(k)) porCanal.set(k, { id: k, grupo: e.grupo, canal: e.canal, marcas: Object.fromEntries(MARCAS.map((x) => [x, { emisiones: 0, inversion: 0, programas: new Set(), tipos: new Set() }])) });
      const b = porCanal.get(k).marcas[m];
      b.emisiones += 1; b.inversion += e.inversion;
      if (e.programa) b.programas.add(e.programa);
      if (e.tipo) b.tipos.add(e.tipo);
      // el detalle: cada combinación de canal, programa y tipo de aviso, con su franja más frecuente
      const kd = [e.grupo, e.canal, e.programa, e.tipo].join('|');
      if (!detalle[m].has(kd)) detalle[m].set(kd, { grupo: e.grupo, canal: e.canal, programa: e.programa, tipo: e.tipo, emisiones: 0, inversion: 0, franjas: {} });
      const c = detalle[m].get(kd);
      c.emisiones += 1; c.inversion += e.inversion; c.franjas[e.franja] = (c.franjas[e.franja] || 0) + 1;
    }
  }
  const canales = [...porCanal.values()].map((c) => ({ ...c, marcas: Object.fromEntries(Object.entries(c.marcas).map(([m, b]) => [m, { ...b, programas: b.programas.size, tipos: [...b.tipos] }])) }));
  const comp = COMPETENCIA[0];
  // la competencia primero: sus canales de más a menos inversión; los canales solo de la marca propia, al final
  canales.sort((a, b) => b.marcas[comp].inversion - a.marcas[comp].inversion || b.marcas[comp].emisiones - a.marcas[comp].emisiones || b.marcas[PROPIA].inversion - a.marcas[PROPIA].inversion);
  const total = (m) => canales.reduce((s, c) => ({ emisiones: s.emisiones + c.marcas[m].emisiones, inversion: s.inversion + c.marcas[m].inversion, canales: s.canales + (c.marcas[m].emisiones > 0 ? 1 : 0) }), { emisiones: 0, inversion: 0, canales: 0 });
  const totales = Object.fromEntries(MARCAS.map((m) => [m, total(m)]));
  const enComun = canales.filter((c) => c.marcas[comp].emisiones > 0 && c.marcas[PROPIA].emisiones > 0).length;
  // por grupo de medio (TV abierta, cable, radio, OTT): emisiones e inversión de cada marca
  const grupos = [...new Set(canales.map((c) => c.grupo))].map((g) => ({ grupo: g, marcas: Object.fromEntries(MARCAS.map((m) => [m, canales.filter((c) => c.grupo === g).reduce((s, c) => ({ emisiones: s.emisiones + c.marcas[m].emisiones, inversion: s.inversion + c.marcas[m].inversion }), { emisiones: 0, inversion: 0 })])) }));
  const filas = Object.fromEntries(MARCAS.map((m) => [m, [...detalle[m].values()].map((c) => ({ ...c, franja: Object.entries(c.franjas).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null })).sort((a, b) => b.inversion - a.inversion || b.emisiones - a.emisiones)]));
  // lo de cada marca para los gráficos: sus canales de más a menos emisiones (marcando los que compra también la otra)
  // y sus tipos de aviso
  const otra = (m) => (m === PROPIA ? comp : PROPIA);
  const porMarca = Object.fromEntries(MARCAS.map((m) => {
    const suyos = canales.filter((c) => c.marcas[m].emisiones > 0).sort((a, b) => b.marcas[m].emisiones - a.marcas[m].emisiones || b.marcas[m].inversion - a.marcas[m].inversion);
    const tipos = new Map();
    // el spot de radio y el de TV son el mismo tipo de aviso: la fuente los separa solo por el medio
    const tipoBase = (t) => (t === 'SPOT RADIO' ? 'SPOT' : t === 'MENCION RADIO' ? 'MENCION TV' : t);
    for (const c of filas[m]) tipos.set(tipoBase(c.tipo), (tipos.get(tipoBase(c.tipo)) || 0) + c.emisiones);
    return [m, {
      canales: suyos.slice(0, 8).map((c) => ({ canal: c.canal, grupo: c.grupo, emisiones: c.marcas[m].emisiones, inversion: c.marcas[m].inversion, enComun: c.marcas[otra(m)].emisiones > 0 })),
      restoCanales: Math.max(0, suyos.length - 8),
      tipos: [...tipos.entries()].map(([tipo, emisiones]) => ({ tipo, emisiones })).sort((a, b) => b.emisiones - a.emisiones),
    }];
  }));
  // el detalle se lee en diez filas: los programas con más emisiones de cada marca, cada programa una vez aunque salga
  // en varios canales (sus emisiones se suman; el canal que se nombra es el de más emisiones, y el tipo, el más
  // frecuente). Lo que llega sin programa (el streaming) no es un programa. Cuántos hay en total va al pie
  const porPrograma = (m) => {
    const g = new Map();
    for (const c of filas[m]) {
      if (!c.programa) continue;
      if (!g.has(c.programa)) g.set(c.programa, { programa: c.programa, emisiones: 0, canales: new Map(), tipos: new Map() });
      const x = g.get(c.programa);
      x.emisiones += c.emisiones;
      x.canales.set(c.canal, (x.canales.get(c.canal) || 0) + c.emisiones);
      x.tipos.set(c.tipo, (x.tipos.get(c.tipo) || 0) + c.emisiones);
    }
    const mayor = (mapa) => [...mapa.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return [...g.values()].map((x) => ({ programa: x.programa, emisiones: x.emisiones, canal: mayor(x.canales), otrosCanales: x.canales.size - 1, tipo: mayor(x.tipos) }))
      .sort((a, b) => b.emisiones - a.emisiones);
  };
  const programas = Object.fromEntries(MARCAS.map((m) => [m, porPrograma(m)]));
  const programasTop = Object.fromEntries(MARCAS.map((m) => [m, programas[m].slice(0, TOPE_DETALLE)]));
  const totalProgramas = Object.fromEntries(MARCAS.map((m) => [m, programas[m].length]));
  return { canales, totales, enComun, grupos, detalle: filas, porMarca, programasTop, totalProgramas, competencia: comp, propia: PROPIA };
}
export const TOPE_DETALLE = 10;
