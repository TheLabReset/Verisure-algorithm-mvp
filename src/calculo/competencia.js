// Lo que hizo la competencia en el año: sus versiones (ATL y digital) como tramos en el tiempo, y la pauta día a
// día de cada marca para leer los encendidos y apagados. Puro.

import { diaSemana } from './periodo.js';
import { plataformaEnFrase } from '../textos/comun.js';

const dia = (f) => (f || '').slice(0, 10);

// Versiones de una marca en el año. ATL: primera y última emisión registradas. Digital: Integrametrics registra
// cada variante el día que la ve por primera vez; el tramo va de la primera a la última variante vista.
export function versionesDelAnio(contrato, marca) {
  const atl = (contrato.pieces || []).filter((p) => p.maname === marca).map((p) => ({
    id: `atl:${p.key}`, version: p.vname, universo: 'atl', canales: (p.channels || []).filter((c) => c !== 'DESCONOCIDO'), programa: p.programa || null,
    desde: dia(p.firstEmission), hasta: dia(p.lastEmission || p.firstEmission), inversion: p.spend || 0, emisiones: p.spots || 0, asset: p.asset || null,
  }));
  const porVersion = new Map();
  for (const p of (contrato.digital?.pieces || []).filter((x) => x.maname === marca)) {
    if (!porVersion.has(p.vname)) porVersion.set(p.vname, { id: `dig:${p.vname}`, version: p.vname, universo: 'digital', canales: new Set(), desde: dia(p.firstEmission), hasta: dia(p.firstEmission), inversion: 0, impresiones: 0, variantes: 0, asset: null });
    const v = porVersion.get(p.vname);
    v.inversion += p.spend || 0; v.impresiones += p.impresiones || 0; v.variantes += 1;
    if (p.plataforma) v.canales.add(p.plataforma);
    if (dia(p.firstEmission) < v.desde) v.desde = dia(p.firstEmission);
    if (dia(p.firstEmission) > v.hasta) v.hasta = dia(p.firstEmission);
    if (!v.asset && p.asset && p.asset.kind !== 'link') v.asset = p.asset;
  }
  // las plataformas como se escriben («Facebook», «clarin.com»); un canal sin registrar no se nombra
  const digital = [...porVersion.values()].map((v) => ({ ...v, canales: [...v.canales].map(plataformaEnFrase) }));
  return [...atl, ...digital].sort((a, b) => b.inversion - a.inversion);
}

// Cronograma: las versiones con más inversión, ordenadas por cuándo empezaron
export function cronograma(versiones, { max = 12 } = {}) {
  const filas = versiones.slice(0, max).sort((a, b) => (a.desde < b.desde ? -1 : a.desde > b.desde ? 1 : b.inversion - a.inversion));
  // distintas: una versión que sale en ATL y en digital es una sola versión; el resto cuenta versiones, no filas
  const distintas = new Set(versiones.map((v) => v.version)).size, mostradas = new Set(filas.map((v) => v.version)).size;
  return { filas, mostradas, resto: distintas - mostradas, total: versiones.length, distintas, atl: versiones.filter((v) => v.universo === 'atl').length, digital: versiones.filter((v) => v.universo === 'digital').length };
}

// Pauta del año: inversión diaria de una marca en un universo, de enero al último día con data. Un día sin
// registros de la fuente es null (hueco), no cero.
export function pautaDiaria(serie, marca, dias) {
  const porFecha = new Map(serie.map((f) => [f.fecha, f]));
  return dias.map((fecha) => { const f = porFecha.get(fecha); return { fecha, valor: f ? (f.brands[marca]?.spend ?? 0) : null }; });
}

// Share semanal de una marca (semanas de lunes a domingo; la semana en curso al final se marca)
// Semanas de lunes a domingo, como las de MAIA: la primera (empieza con la data) y la última (en curso) quedan a medias y se marcan
export function semanasDeLunes(dias) {
  const out = [];
  for (const d of dias) { if (!out.length || diaSemana(d) === 0) out.push([]); out.at(-1).push(d); }
  return out;
}

export function shareSemanal(serie, marca, marcas, dias) {
  const semanas = [];
  for (const tramo of semanasDeLunes(dias)) {
    const filas = serie.filter((f) => f.fecha >= tramo[0] && f.fecha <= tramo.at(-1));
    const tot = filas.reduce((s, f) => s + marcas.reduce((t, m) => t + (f.brands[m]?.spend || 0), 0), 0);
    const suya = filas.reduce((s, f) => s + (f.brands[marca]?.spend || 0), 0);
    semanas.push({ fecha: tramo[0], valor: tot ? Math.round((suya / tot) * 100) : null, parcial: tramo.length < 7 });
  }
  return semanas;
}

// Pauta semanal de una marca: inversión de cada semana de lunes a domingo. Una semana sin ningún día con registros
// es null; la primera (empieza con la data) y la última (en curso) pueden quedar a medias y se marcan
export function pautaSemanal(series, marca, dias) {
  const porFecha = series.map((serie) => new Map(serie.map((f) => [f.fecha, f])));
  const out = [];
  for (const tramo of semanasDeLunes(dias)) {
    let suma = 0, conData = false;
    for (const d of tramo) for (const m of porFecha) { const f = m.get(d); if (f) { conData = true; suma += f.brands[marca]?.spend || 0; } }
    out.push({ fecha: tramo[0], hasta: tramo.at(-1), valor: conData ? suma : null, parcial: tramo.length < 7 });
  }
  return out;
}

// La mezcla de una marca mes a mes: de su inversión del mes (el 100 %), qué parte es digital y qué parte ATL, y cómo
// se reparte el ATL por medio. Suma ATL y digital, que Integrametrics estima con métodos distintos: sirve para ver
// hacia dónde se mueve la mezcla, no para comparar montos. Solo porcentajes. Un mes sin inversión queda sin mezcla
export function mezclaMensual(atlDaily, digDaily, marca, primerDia, ultimoDia) {
  const meses = new Map();
  for (let m = primerDia.slice(0, 7); m <= ultimoDia.slice(0, 7); m = siguienteMes(m)) meses.set(m, { atl: 0, digital: 0, medios: {} });
  for (const d of atlDaily) {
    const x = meses.get(d.fecha.slice(0, 7)), b = d.brands?.[marca];
    if (!x || !b) continue;
    x.atl += b.spend || 0;
    for (const [medio, v] of Object.entries(b.byMedium || {})) x.medios[medio] = (x.medios[medio] || 0) + (v || 0);
  }
  for (const d of digDaily) {
    const x = meses.get(d.fecha.slice(0, 7)), b = d.brands?.[marca];
    if (x && b) x.digital += b.spend || 0;
  }
  const finDeMes = (m) => { const [a, mm] = m.split('-').map(Number); return new Date(Date.UTC(a, mm, 0)).toISOString().slice(0, 10); };
  // el año, ponderado por la inversión de cada mes (no el promedio de los porcentajes)
  const atl = [...meses.values()].reduce((s, x) => s + x.atl, 0), digital = [...meses.values()].reduce((s, x) => s + x.digital, 0);
  const anio = atl + digital ? { digital: (digital / (atl + digital)) * 100, atl: (atl / (atl + digital)) * 100 } : null;
  const lista = [...meses.entries()].map(([mes, x]) => {
    const total = x.atl + x.digital;
    const pct = (v) => (total ? (v / total) * 100 : null);
    return {
      mes, enCurso: ultimoDia < finDeMes(mes), digital: pct(x.digital), atl: pct(x.atl),
      medios: Object.entries(x.medios).filter(([, v]) => v > 0).map(([medio, v]) => ({ medio, pct: pct(v) })).sort((a, b) => b.pct - a.pct),
    };
  });
  return { anio, meses: lista };
}
const siguienteMes = (m) => { const [a, mm] = m.split('-').map(Number); return mm === 12 ? `${a + 1}-01` : `${a}-${String(mm + 1).padStart(2, '0')}`; };
