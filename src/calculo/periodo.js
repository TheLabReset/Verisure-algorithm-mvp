// Períodos: un mes del contrato, recortado a los días que tienen data, contra los mismos días del mes anterior.
// Un mes parcial (el último, que sigue corriendo) se compara con el mismo tramo, nunca con un mes entero.
// Sin fechas del sistema: todo sale del contrato.

export const DIA = 86400000;
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
