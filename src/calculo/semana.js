// La semana de MAIA: la última semana completa (lunes a domingo) con data, frente a la anterior. De acá salen los
// hechos del reporte semanal: primero lo que hizo la competencia, después la marca propia y las búsquedas DIY.
// Cada hecho trae su dato; la redacción va en src/textos/maia.js. Puro.
import { sumarDias, diaSemana } from './periodo.js';

const dia = (f) => (f || '').slice(0, 10);
const suma = (xs) => xs.reduce((t, x) => t + (x || 0), 0);
const cambio = (antes, ahora) => (antes ? Math.round(((ahora - antes) / antes) * 100) : null);

export function semanaDe(meta) {
  const ultimo = meta.lastDay;
  // el domingo de la última semana completa: si el último día es domingo, esa; si no, la anterior
  const hasta = sumarDias(ultimo, diaSemana(ultimo) === 6 ? 0 : -(diaSemana(ultimo) + 1));
  const desde = sumarDias(hasta, -6);
  if (desde < meta.firstDay) return null;
  return { desde, hasta, previaDesde: sumarDias(desde, -7), previaHasta: sumarDias(desde, -1) };
}

function inversion(serie, marca, desde, hasta) {
  return suma(serie.filter((f) => f.fecha >= desde && f.fecha <= hasta).map((f) => f.brands[marca]?.spend || 0));
}

// sinDigital: la fuente digital no cargó, y sus hechos no se cuentan. distritoDe: el distrito de un panel por sus
// coordenadas, el mismo que usa el mapa (el texto de la fuente a veces dice otro)
export function hechosDeLaSemana(contrato, { propia, competencia, nombreMarca, busquedas, sinDigital = false, distritoDe = (p) => p.localidad }) {
  const S = semanaDe(contrato.meta);
  if (!S) return null;
  const hechos = [];
  const marcas = [...competencia, propia];
  for (const m of marcas) {
    const esPropia = m === propia;
    for (const [universo, serie] of [['atl', contrato.daily], ...(sinDigital ? [] : [['digital', contrato.digital?.daily || []]])]) {
      const ahora = inversion(serie, m, S.desde, S.hasta), antes = inversion(serie, m, S.previaDesde, S.previaHasta);
      const tot = suma(marcas.map((x) => inversion(serie, x, S.desde, S.hasta)));
      if (ahora || antes) hechos.push({ id: 'inversion', tema: esPropia ? 'propia' : 'competencia', marca: nombreMarca(m), universo, ahora, antes, cambio: cambio(antes, ahora), share: tot ? Math.round((ahora / tot) * 100) : null });
    }
    if (esPropia) continue;
    const versiones = (contrato.pieces || []).filter((p) => p.maname === m && dia(p.firstEmission) >= S.desde && dia(p.firstEmission) <= S.hasta);
    const digitales = new Set((contrato.digital?.pieces || []).filter((p) => p.maname === m && dia(p.firstEmission) >= S.desde && dia(p.firstEmission) <= S.hasta).map((p) => p.vname));
    const yaVistas = new Set((contrato.digital?.pieces || []).filter((p) => p.maname === m && dia(p.firstEmission) < S.desde).map((p) => p.vname));
    const nuevasDigitales = sinDigital ? [] : [...digitales].filter((v) => !yaVistas.has(v));
    const paneles = (contrato.ooh || []).filter((p) => p.maname === m && dia(p.firstFecha) >= S.desde && dia(p.firstFecha) <= S.hasta);
    if (versiones.length) hechos.push({ id: 'versiones-atl', tema: 'competencia', marca: nombreMarca(m), cuantas: versiones.length, nombres: versiones.map((p) => p.vname) });
    if (nuevasDigitales.length) hechos.push({ id: 'versiones-digitales', tema: 'competencia', marca: nombreMarca(m), cuantas: nuevasDigitales.length, nombres: nuevasDigitales });
    if (paneles.length) hechos.push({ id: 'paneles', tema: 'competencia', marca: nombreMarca(m), cuantos: paneles.length, distritos: [...new Set(paneles.map(distritoDe).filter(Boolean))] });
  }
  if (busquedas?.camaras?.crecimiento != null) hechos.push({ id: 'diy', tema: 'diy', crecimiento: busquedas.camaras.crecimiento, razon: busquedas.razon, desde: busquedas.desde, hasta: busquedas.hasta });
  return { ...S, hechos };
}
