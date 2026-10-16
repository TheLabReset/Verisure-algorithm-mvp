// Períodos: cualquier tramo de días con data, elegido con un atajo o con dos fechas.
// Un mes cerrado se compara con el mes anterior entero; el mes en curso, con el mismo tramo del mes anterior; un
// tramo cualquiera, con los mismos días justo antes. Sin fechas del sistema: todo sale del contrato.

export const DIA = 86400000;
// días del período desde los que una variación frente a la comparación se lee: con menos, un día raro manda
export const DIAS_MINIMOS = 7;
export const aFecha = (iso) => new Date(`${iso}T00:00:00Z`);
export const aIso = (d) => d.toISOString().slice(0, 10);
export const sumarDias = (iso, n) => aIso(new Date(aFecha(iso).getTime() + n * DIA));
export const diasEntre = (a, b) => Math.round((aFecha(b) - aFecha(a)) / DIA);
export const diaSemana = (iso) => (aFecha(iso).getUTCDay() + 6) % 7; // lunes = 0
export function rango(desde, hasta) {
  const out = [];
  for (let d = desde; d <= hasta; d = sumarDias(d, 1)) out.push(d);
  return out;
}
export const finDeMes = (mes) => { const [a, m] = mes.split('-').map(Number); return aIso(new Date(Date.UTC(a, m, 0))); };
export const mesAnterior = (mes) => { const [a, m] = mes.split('-').map(Number); return aIso(new Date(Date.UTC(a, m - 2, 1))).slice(0, 7); };

export function mesesDisponibles(meta) {
  if (!meta?.firstDay || !meta?.lastDay) return [];
  const out = [];
  for (let m = meta.firstDay.slice(0, 7); m <= meta.lastDay.slice(0, 7); m = aIso(new Date(Date.UTC(+m.slice(0, 4), +m.slice(5, 7), 1))).slice(0, 7)) out.push(m);
  return out;
}

export function periodoDelMes(meta, mes) {
  const desde = mes + '-01' < meta.firstDay ? meta.firstDay : mes + '-01';
  const fin = finDeMes(mes);
  const hasta = fin > meta.lastDay ? meta.lastDay : fin;
  const parcial = hasta < fin || desde > mes + '-01';
  // Comparación: el mismo tramo de días del mes anterior, si el contrato lo tiene
  const ant = mesAnterior(mes);
  const finAnt = finDeMes(ant);
  const dia = (iso) => iso.slice(8, 10);
  // Un mes completo se compara con el mes anterior completo; uno parcial, con el mismo tramo de días
  const compararDesde = parcial ? (`${ant}-${dia(desde)}` > finAnt ? finAnt : `${ant}-${dia(desde)}`) : `${ant}-01`;
  const compararHasta = parcial ? (`${ant}-${dia(hasta)}` > finAnt ? finAnt : `${ant}-${dia(hasta)}`) : finAnt;
  const hayComparacion = compararDesde >= meta.firstDay;
  return {
    mes, desde, hasta, parcial, dias: diasEntre(desde, hasta) + 1,
    compararDesde: hayComparacion ? compararDesde : null, compararHasta: hayComparacion ? compararHasta : null,
  };
}

// Los atajos del selector. «Últimos» cuenta desde el último día con data, no desde hoy: la fuente puede ir atrasada
export const ATAJOS = [
  { id: '7d', nombre: 'Últimos 7 días' },
  { id: '30d', nombre: 'Últimos 30 días' },
  { id: 'mes', nombre: 'Este mes' },
  { id: 'mes-pasado', nombre: 'Mes pasado' },
  { id: '6m', nombre: 'Últimos 6 meses' },
];
export const ATAJO_INICIAL = '7d';

// Un tramo cualquiera: se compara con los mismos días justo antes, si el contrato los tiene
export function periodoDelTramo(meta, desde0, hasta0) {
  const desde = desde0 < meta.firstDay ? meta.firstDay : desde0 > meta.lastDay ? meta.lastDay : desde0;
  const hasta = hasta0 > meta.lastDay ? meta.lastDay : hasta0 < desde ? desde : hasta0;
  // un mes entero (del 1 al último día, o al último día con data del mes en curso) es un mes
  const mes = desde.slice(0, 7);
  if (desde.slice(8) === '01' && hasta.slice(0, 7) === mes && (hasta === finDeMes(mes) || hasta === meta.lastDay)) return periodoDelMes(meta, mes);
  const dias = diasEntre(desde, hasta) + 1;
  const compararHasta = sumarDias(desde, -1), compararDesde = sumarDias(desde, -dias);
  const hay = compararDesde >= meta.firstDay;
  return { mes: null, tramo: true, desde, hasta, parcial: false, dias, compararDesde: hay ? compararDesde : null, compararHasta: hay ? compararHasta : null };
}

/** El período de los filtros: un atajo, dos fechas o (como antes) un mes. */
export function periodoDe(meta, filtros = {}) {
  if (filtros.desde && filtros.hasta) return { ...periodoDelTramo(meta, filtros.desde, filtros.hasta), atajo: null };
  if (filtros.mes) return { ...periodoDelMes(meta, filtros.mes), atajo: null };
  const ultimo = meta.lastDay, atajo = ATAJOS.some((a) => a.id === filtros.atajo) ? filtros.atajo : ATAJO_INICIAL;
  const P = atajo === 'mes' ? periodoDelMes(meta, ultimo.slice(0, 7))
    : atajo === 'mes-pasado' ? periodoDelMes(meta, ultimo.slice(0, 7) > meta.firstDay.slice(0, 7) ? mesAnterior(ultimo.slice(0, 7)) : ultimo.slice(0, 7))
    : atajo === '6m' ? periodoDelTramo(meta, sumarDias(aIso(new Date(Date.UTC(+ultimo.slice(0, 4), +ultimo.slice(5, 7) - 7, +ultimo.slice(8, 10)))), 1), ultimo)
    : periodoDelTramo(meta, sumarDias(ultimo, atajo === '30d' ? -29 : -6), ultimo);
  return { ...P, atajo };
}
