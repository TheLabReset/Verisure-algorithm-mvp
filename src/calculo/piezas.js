// Piezas y campañas dentro de cada plataforma: lo que reporta la propia plataforma (inversión, impresiones, clics y sus
// leads), sin CRM: los bookings no llegan a nivel de pieza. Cada campaña, conjunto y pieza lleva un estado con umbrales
// fijos y a la vista. Lo oficial: el aprendizaje (unos 50 resultados en 7 días en Meta y TikTok; TikTok pide 7 días) y la
// fatiga de Meta (el costo por resultado llega al doble de su historia). Lo que es costumbre de la industria, y se dice
// así en la ayuda: juzgar gastos sin resultados al llegar a 3 veces el costo por lead, y «cara» o «rinde» a 1,5 veces
// el promedio de su plataforma, para arriba o para abajo. Puro.

export const UMBRALES_PIEZAS = {
  diasAprendizaje: 7, // una pieza con menos días al aire todavía aprende: no se juzga (TikTok, oficial)
  resultadosSemana: 50, // un conjunto de Meta o TikTok con menos leads en 7 días tiene el aprendizaje limitado (oficial)
  vecesGasto: 3, // para juzgar, la pieza tiene que haber gastado 3 veces el costo por lead de su plataforma (costumbre)
  vecesCara: 1.5, // cara si su lead cuesta 1,5 veces el promedio de su plataforma; rinde si cuesta 1,5 veces menos
  vecesFatiga: 2, // se cansó si su lead de los últimos 7 días cuesta el doble que antes (Meta, oficial)
  diasReciente: 7,
};
// el orden en que se leen: primero lo que pide mirar
export const ESTADOS = ['sin-leads', 'cara', 'cansada', 'rinde', 'en-linea', 'aprendiendo', 'poca-data'];
const PARA_REVISAR = ['sin-leads', 'cara', 'cansada'];

const suma = (xs) => xs.reduce((s, x) => s + (x || 0), 0);
const dias = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const masDias = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

function cifras(filas) {
  const inversion = suma(filas.map((f) => f.inversion)), leads = suma(filas.map((f) => f.leads));
  const impresiones = suma(filas.map((f) => f.impresiones)), clics = suma(filas.map((f) => f.clics)), alcance = suma(filas.map((f) => f.alcance));
  return { inversion, leads, impresiones, clics, alcance, cpl: leads ? inversion / leads : null, ctr: impresiones ? (clics / impresiones) * 100 : null, frecuencia: alcance ? impresiones / alcance : null };
}

// El estado de una pieza, un conjunto o una campaña frente al promedio de su plataforma (base: su costo por lead)
function estadoDe(x, base, { edad = null, fatiga = null } = {}) {
  const U = UMBRALES_PIEZAS;
  if (edad != null && edad < U.diasAprendizaje) return 'aprendiendo';
  if (!base || x.inversion < U.vecesGasto * base) return 'poca-data';
  if (!x.leads) return 'sin-leads';
  if (fatiga != null && fatiga >= U.vecesFatiga) return 'cansada';
  const r = x.cpl / base;
  if (r >= U.vecesCara) return 'cara';
  if (r <= 1 / U.vecesCara) return 'rinde';
  return 'en-linea';
}

// datos: lo de src/muestra/ejemplo.js (piezasDeEjemplo); plataformas: la data de las plataformas, que trae la moneda de
// cada cuenta y el tipo de cambio. La inversión en otra moneda se pasa a la del panel, como en la capa 3
export function leerPiezas(datos, plataformas, P) {
  if (!datos?.dias?.length || !plataformas) return null;
  const tasa = (id) => { const p = plataformas.plataformas.find((x) => x.id === id); return p?.moneda && p.moneda !== plataformas.moneda ? plataformas.tipoCambio?.[p.moneda]?.usd : 1; };
  if (plataformas.plataformas.some((p) => !(tasa(p.id) > 0))) return null;
  const enDolares = (id, f) => (f ? { ...f, inversion: f.inversion * tasa(id) } : null);
  const filasDe = (id, plataforma, a, b) => datos.dias.filter((d) => d.fecha >= a && d.fecha <= b).map((d) => enDolares(plataforma, d[id])).filter(Boolean);
  const nombrePlataforma = Object.fromEntries(plataformas.plataformas.map((p) => [p.id, p.nombre]));
  const recienteDesde = masDias(P.hasta, -(UMBRALES_PIEZAS.diasReciente - 1));

  // las piezas con inversión en el período
  const piezas = datos.piezas.map((p) => {
    const ahora = cifras(filasDe(p.id, p.plataforma, P.desde, P.hasta));
    if (!ahora.inversion) return null;
    // fatiga: el costo por lead de los últimos 7 días frente al de toda su vida antes de esos días
    const reciente = cifras(filasDe(p.id, p.plataforma, recienteDesde, P.hasta)), antes = cifras(filasDe(p.id, p.plataforma, p.inicio, masDias(recienteDesde, -1)));
    const fatiga = reciente.cpl && antes.cpl && antes.leads >= 10 ? reciente.cpl / antes.cpl : null;
    const ultimo = p.fin && p.fin < P.hasta ? p.fin : P.hasta;
    return { ...p, nivel: 'pieza', plataformaNombre: nombrePlataforma[p.plataforma], ...ahora, edad: dias(p.inicio, ultimo) + 1, alAire: !p.fin || p.fin >= P.hasta, fatiga, conjuntoNombre: datos.conjuntos.find((c) => c.id === p.conjunto)?.nombre };
  }).filter(Boolean);
  if (!piezas.length) return null;

  // la base de cada plataforma: su costo por lead en el período, con lo que reporta ella misma
  const bases = Object.fromEntries(plataformas.plataformas.map((pl) => {
    const c = cifras(piezas.filter((p) => p.plataforma === pl.id));
    return [pl.id, { id: pl.id, nombre: pl.nombre, ...c }];
  }));
  for (const p of piezas) { p.base = bases[p.plataforma].cpl; p.estado = estadoDe(p, p.base, { edad: p.edad, fatiga: p.plataforma === 'google' ? null : p.fatiga }); }

  // conjuntos y campañas: la suma de sus piezas; un conjunto de Meta o TikTok con menos de 50 leads en 7 días tiene el
  // aprendizaje limitado (Google no publica ese umbral)
  const agrupar = (clave, nivel, nombre) => [...new Set(piezas.map((p) => p[clave]))].map((id) => {
    const de = piezas.filter((p) => p[clave] === id), p0 = de[0];
    const c = cifras(de), base = bases[p0.plataforma].cpl;
    const semana = cifras(de.flatMap((p) => filasDe(p.id, p.plataforma, recienteDesde, P.hasta)));
    const limitado = nivel === 'conjunto' && p0.plataforma !== 'google' && semana.leads < UMBRALES_PIEZAS.resultadosSemana;
    const cuenta = Object.fromEntries(ESTADOS.map((e) => [e, de.filter((p) => p.estado === e).length]));
    return { id, nivel, nombre: nombre(p0), alAire: de.some((p) => p.alAire), plataforma: p0.plataforma, plataformaNombre: p0.plataformaNombre, campana: p0.campana, ...c, base, estado: estadoDe(c, base), limitado, leadsSemana: semana.leads, piezas: de.length, cuenta };
  });
  const conjuntos = agrupar('conjunto', 'conjunto', (p) => p.conjuntoNombre);
  const campanas = agrupar('campana', 'campana', (p) => p.campana);

  // primero lo que sigue al aire (se puede tocar), y dentro, lo que pide mirarse y lo que más gasta
  const orden = (a, b) => (a.alAire === false) - (b.alAire === false) || ESTADOS.indexOf(a.estado) - ESTADOS.indexOf(b.estado) || b.inversion - a.inversion;
  const total = suma(piezas.map((p) => p.inversion));
  const porEstado = Object.fromEntries(ESTADOS.map((e) => { const de = piezas.filter((p) => p.estado === e); return [e, { n: de.length, inversion: suma(de.map((p) => p.inversion)) }]; }));
  const revisar = piezas.filter((p) => PARA_REVISAR.includes(p.estado));
  return {
    ejemplo: Boolean(datos.ejemplo), fuente: datos.fuente,
    bases: Object.values(bases), total,
    piezas: piezas.sort(orden), conjuntos: conjuntos.sort(orden), campanas: campanas.sort(orden),
    porEstado, revisar: { n: revisar.length, inversion: suma(revisar.map((p) => p.inversion)) },
    alAire: piezas.filter((p) => p.alAire).length,
  };
}
