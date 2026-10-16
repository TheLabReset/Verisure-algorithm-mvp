// La conversación en redes (TikTok y Facebook, vía Apify): la tasa de interacción de cada hashtag y el tono de cada
// tema. Puro. Hoy lo alimenta la data de ejemplo; cuando se conecte Apify, el pipeline publica la misma forma.

// El tono de un tema sale de la diferencia entre el porcentaje de menciones positivas y el de negativas, con umbrales
// fijos (la ayuda de la tarjeta los dice): 40 puntos o más es muy positivo; 10 o más, positivo; entre −10 y 10, neutro
export const UMBRALES_TONO = { muy: 40, tono: 10 };
export function tonoDe({ positivo, negativo }) {
  const d = (positivo ?? 0) - (negativo ?? 0);
  if (d >= UMBRALES_TONO.muy) return 'muy-positivo';
  if (d >= UMBRALES_TONO.tono) return 'positivo';
  if (d <= -UMBRALES_TONO.muy) return 'muy-negativo';
  if (d <= -UMBRALES_TONO.tono) return 'negativo';
  return 'neutro';
}

// TikTok: la tasa de interacción (me gusta, comentarios y compartidos sobre las vistas), en porcentaje, de mayor a menor
export function leerTiktok(t) {
  if (!t) return null;
  const hashtags = t.hashtags.map((h) => ({ ...h, tasa: h.vistas ? (h.interaccion / h.vistas) * 100 : null }))
    .sort((a, b) => (b.tasa ?? -1) - (a.tasa ?? -1));
  return { ...t, hashtags };
}

// Facebook: cada tema con su tono, de más a menos menciones
export function leerFacebook(f) {
  if (!f) return null;
  return { ...f, temas: f.temas.map((x) => ({ ...x, tono: tonoDe(x) })).sort((a, b) => b.menciones - a.menciones) };
}
