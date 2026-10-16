// Las plataformas de la marca propia cruzadas con su CRM: inversión, leads, bookings y sus razones (L2B, costo por
// lead y por booking), en el período y semana a semana, por plataforma y por Push o Pull. Puro.
// Hoy lo alimenta la data de ejemplo (src/muestra/ejemplo.js); cuando se conecten las cuentas y el Google Sheets
// del CRM, el pipeline publica la misma forma y este cálculo no cambia.

const suma = (xs) => xs.reduce((s, x) => s + (x || 0), 0);
const razon = (a, b) => (b ? a / b : null);
const lunesDe = (iso) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); };

// Las cifras de un tramo: inversión, leads, bookings y sus razones
export function cifras(filas) {
  const inversion = suma(filas.map((f) => f.inversion)), leads = suma(filas.map((f) => f.leads)), bookings = suma(filas.map((f) => f.bookings));
  return { inversion, leads, bookings, l2b: razon(bookings, leads) == null ? null : (bookings / leads) * 100, cpl: razon(inversion, leads), cpb: razon(inversion, bookings) };
}

// Frente al objetivo: «bien» si el costo queda en el objetivo o por debajo; «cerca» hasta 15 % arriba; «lejos» más
export const MARGEN_OBJETIVO = 15;
export const frenteAlObjetivo = (costo, objetivo) => (costo == null || !objetivo ? null : costo <= objetivo ? 'bien' : costo <= objetivo * (1 + MARGEN_OBJETIVO / 100) ? 'cerca' : 'lejos');

// El mejor y el peor tramo de una tabla (días o semanas). Lo que cuenta es cuántos bookings trae: el mejor es el de más
// bookings y el peor el de menos; si empatan, decide el costo por booking. El costo pesa solo cuando se dispara: un
// tramo que cuesta VECES_PROMEDIO veces el costo por booking del conjunto o más (o con inversión y sin bookings) es el
// peor aunque tenga bookings, y nunca el mejor. Una semana a medias (la en curso, o la que corta el período) no entra (no se compara con semanas enteras) y
// con menos de tres tramos no se marca nada. Devuelve los tramos mismos, no su posición
export const VECES_PROMEDIO = 3;
export function extremos(filas) {
  const ninguno = { mejor: null, peor: null };
  const candidatos = filas.filter((f) => f.inversion > 0 && (f.dias == null || f.dias >= 7));
  if (candidatos.length < 3) return ninguno;
  const bookings = suma(candidatos.map((f) => f.bookings));
  const promedio = bookings ? suma(candidatos.map((f) => f.inversion)) / bookings : null;
  const costo = (f) => (f.bookings > 0 ? f.inversion / f.bookings : Infinity);
  const disparado = (f) => promedio == null || costo(f) >= VECES_PROMEDIO * promedio;
  const masAlto = (a, f) => (costo(f) > costo(a) ? f : a);
  const disparados = candidatos.filter(disparado), normales = candidatos.filter((f) => !disparado(f));
  const peor = disparados.length ? disparados.reduce(masAlto)
    : candidatos.reduce((a, f) => (f.bookings < a.bookings || (f.bookings === a.bookings && costo(f) > costo(a)) ? f : a));
  const mejor = normales.length ? normales.reduce((a, f) => (f.bookings > a.bookings || (f.bookings === a.bookings && costo(f) < costo(a)) ? f : a)) : null;
  if (!mejor || mejor === peor || (mejor.bookings === peor.bookings && costo(mejor) === costo(peor))) return ninguno;
  return { mejor, peor };
}

export function leerPlataformas(datos, P) {
  if (!datos?.dias?.length) return null;
  const enTramo = (a, b) => datos.dias.filter((d) => d.fecha >= a && d.fecha <= b);
  const dias = enTramo(P.desde, P.hasta);
  if (!dias.length) return null;
  const antes = P.compararDesde ? enTramo(P.compararDesde, P.compararHasta) : [];
  const deUna = (lista, id) => lista.map((d) => d[id]).filter(Boolean);
  // las semanas (lunes a domingo) del año hasta el último día del período: la tabla de cada plataforma va por semana
  const semanasDe = (filtro) => {
    const porSemana = new Map();
    for (const d of datos.dias.filter((x) => x.fecha <= P.hasta)) {
      const k = lunesDe(d.fecha);
      if (!porSemana.has(k)) porSemana.set(k, []);
      porSemana.get(k).push(...filtro(d));
    }
    // una semana de menos de siete días está en curso si llega al último día de la data; si no, la corta el período
    const ultimo = datos.dias.filter((x) => x.fecha <= P.hasta).at(-1)?.fecha, final = datos.dias.at(-1).fecha;
    return [...porSemana.entries()].map(([desde, filas]) => {
      const fechas = datos.dias.filter((x) => x.fecha <= P.hasta && lunesDe(x.fecha) === desde).map((x) => x.fecha);
      return { desde, primero: fechas[0], hasta: fechas.at(-1), dias: filas.length, enCurso: fechas.at(-1) === ultimo && ultimo === final && fechas.length < 7, ...cifras(filas) };
    });
  };
  const plataformas = datos.plataformas.map((p) => {
    const ahora = cifras(deUna(dias, p.id));
    const previo = antes.length ? cifras(deUna(antes, p.id)) : null;
    // las campañas: el reparto de cada día entre ellas, sumado en el período
    const campanas = p.campanas.map((nombre, i) => cifras(dias.map((d) => ({ inversion: d[p.id].inversion * d[p.id].campanas[i], leads: d[p.id].leads * d[p.id].campanas[i], bookings: d[p.id].bookings * d[p.id].campanas[i] })))).map((c, i) => ({ nombre: p.campanas[i], ...c }));
    return {
      ...p, ...ahora, previo,
      estadoCpl: frenteAlObjetivo(ahora.cpl, p.objetivo.cpl), estadoCpb: frenteAlObjetivo(ahora.cpb, p.objetivo.cpb),
      semanas: semanasDe((d) => [d[p.id]]).map((s) => ({ ...s, estadoCpl: frenteAlObjetivo(s.cpl, p.objetivo.cpl), estadoCpb: frenteAlObjetivo(s.cpb, p.objetivo.cpb) })),
      campanas: campanas.sort((a, b) => b.inversion - a.inversion),
    };
  });
  const todas = (lista) => lista.flatMap((d) => datos.plataformas.map((p) => d[p.id]));
  const delTipo = (tipo) => (d) => datos.plataformas.filter((p) => p.tipo === tipo).map((p) => d[p.id]);
  const total = cifras(todas(dias));
  return {
    ejemplo: Boolean(datos.ejemplo), moneda: datos.moneda, fuente: datos.fuente,
    total, totalPrevio: antes.length ? cifras(todas(antes)) : null,
    plataformas,
    diaria: dias.map((d) => ({ fecha: d.fecha, ...cifras(todas([d])), porPlataforma: Object.fromEntries(datos.plataformas.map((p) => [p.id, d[p.id]])) })),
    tipos: ['push', 'pull'].map((tipo) => ({ tipo, ...cifras(dias.flatMap(delTipo(tipo))), semanas: semanasDe(delTipo(tipo)) })),
  };
}
