// Lo que hizo la competencia en el año: sus versiones (ATL y digital) como tramos en el tiempo, y la pauta día a
// día de cada marca para leer los encendidos y apagados. Puro.

import { diaSemana } from './periodo.js';

const dia = (f) => (f || '').slice(0, 10);

// Versiones de una marca en el año. ATL: primera y última emisión registradas. Digital: Integrametrics registra
// cada variante el día que la ve por primera vez; el tramo va de la primera a la última variante vista.
export function versionesDelAnio(contrato, marca) {
  const atl = (contrato.pieces || []).filter((p) => p.maname === marca).map((p) => ({
    id: `atl:${p.key}`, version: p.vname, universo: 'atl', canales: p.channels || [], programa: p.programa || null,
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
  const digital = [...porVersion.values()].map((v) => ({ ...v, canales: [...v.canales] }));
  return [...atl, ...digital].sort((a, b) => b.inversion - a.inversion);
}

// Cronograma: las versiones con más inversión, ordenadas por cuándo empezaron
export function cronograma(versiones, { max = 12 } = {}) {
  const filas = versiones.slice(0, max).sort((a, b) => (a.desde < b.desde ? -1 : a.desde > b.desde ? 1 : b.inversion - a.inversion));
  return { filas, resto: Math.max(0, versiones.length - max), total: versiones.length, atl: versiones.filter((v) => v.universo === 'atl').length, digital: versiones.filter((v) => v.universo === 'digital').length };
}

// Pauta del año: inversión diaria de una marca en un universo, de enero al último día con data. Un día sin
// registros de la fuente es null (hueco), no cero.
export function pautaDiaria(serie, marca, dias) {
  const porFecha = new Map(serie.map((f) => [f.fecha, f]));
  return dias.map((fecha) => { const f = porFecha.get(fecha); return { fecha, valor: f ? (f.brands[marca]?.spend ?? 0) : null }; });
}

// Share semanal de una marca (semanas de lunes a domingo; una semana incompleta al final se marca)
// Semanas de lunes a domingo, como las de MAIA: la primera y la última pueden quedar incompletas y se marcan
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
// es null; la primera y la última pueden estar incompletas y se marcan
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
