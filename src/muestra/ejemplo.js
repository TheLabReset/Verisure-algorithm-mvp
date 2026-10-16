// Data de ejemplo para las vistas cuya fuente todavía no está conectada: TikTok y la conversación en Facebook (Apify)
// y las plataformas de la marca propia con su CRM (Meta Ads, Google Ads, TikTok Ads y un Google Sheets).
// Sirve para ver la maqueta, no para leer el mercado: cada tarjeta que la usa lo dice con el rótulo «Data de ejemplo»,
// nunca entra a los avisos ni a MAIA, y una prueba lo revisa. Semilla fija: la misma data en cada carga.
// Cuando la fuente se conecte, el pipeline publica su archivo en public/data y este generador deja de usarse.

import { CLIENTE } from '../cliente.js';

// Generador con semilla (mulberry32): el mismo número de corrida en corrida
function azar(semilla) {
  let a = semilla >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const semillaDe = (texto) => [...texto].reduce((s, c) => (Math.imul(s, 31) + c.charCodeAt(0)) >>> 0, 7);
const entre = (r, a, b) => a + (b - a) * r();
const redondo = (n, paso) => Math.round(n / paso) * paso;
const masDias = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

const sinTildes = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');
const etiqueta = (t) => `#${sinTildes(t).toLowerCase().replace(/[^a-z0-9]/g, '')}`;

/** TikTok: los hashtags del rubro y de las marcas, con vistas, interacción y publicaciones de las últimas semanas. */
export function tiktokDeEjemplo(hasta) {
  const r = azar(semillaDe(`tiktok|${hasta}`));
  const marcas = [...CLIENTE.competencia.map((c) => c.nombre), CLIENTE.nombre];
  const temas = ['seguridad en casa', 'cámaras de seguridad', 'alarmas', 'robos en Lima', 'cámara wifi', 'casa segura', 'tips de seguridad'];
  const hashtags = [...temas, ...marcas].map((t) => {
    const deMarca = marcas.includes(t);
    const vistas = redondo(entre(r, deMarca ? 0.4 : 1.5, deMarca ? 6 : 38) * 1e6, 1e4);
    const publicaciones = redondo(vistas / entre(r, 9000, 26000), 1);
    return { hashtag: etiqueta(t), vistas, interaccion: Math.round(vistas * entre(r, 0.03, 0.09)), publicaciones, deMarca, crecimiento: Math.round(entre(r, -35, 60)) };
  }).sort((a, b) => b.interaccion - a.interaccion);
  return { ejemplo: true, fuente: 'TikTok vía Apify, búsqueda por hashtag', hasta, hashtags };
}

/** Facebook: los temas de la conversación en las páginas de las marcas y del rubro, con menciones y tono. */
export function facebookDeEjemplo(hasta) {
  const r = azar(semillaDe(`facebook|${hasta}`));
  const temas = ['Robos en el barrio', 'Precio y cuota mensual', 'Instalación y visita técnica', 'Atención al cliente', 'Cámaras que se ven desde el celular', 'Respuesta ante una alarma', 'Promociones'];
  const lista = temas.map((t) => {
    const menciones = Math.round(entre(r, 40, 520));
    const positivo = entre(r, 0.1, 0.6), negativo = entre(r, 0.05, 1 - positivo);
    return { tema: t, menciones, positivo: Math.round(positivo * 100), negativo: Math.round(negativo * 100), neutro: 100 - Math.round(positivo * 100) - Math.round(negativo * 100) };
  }).sort((a, b) => b.menciones - a.menciones);
  const paginas = [...CLIENTE.competencia.map((c) => ({ nombre: c.nombre, foco: true })), { nombre: CLIENTE.nombre, propia: true }].map((p) => ({
    ...p, publicaciones: Math.round(entre(r, 6, 22)), interaccion: Math.round(entre(r, 1500, 26000)), comentarios: Math.round(entre(r, 120, 2400)),
  }));
  return { ejemplo: true, fuente: 'Meta, social listening vía Apify', hasta, desde: masDias(hasta, -27), temas: lista, paginas };
}

// Las plataformas de la marca propia, día por día, como las cruza su tablero con el CRM: inversión (en dólares, como
// la reportan las plataformas), leads y bookings (ventas del CRM). Push son las redes (Meta y TikTok) y Pull, la
// búsqueda (Google Ads). Nombres de campaña genéricos del rubro; ninguna cifra sale de una cuenta real.
export const PLATAFORMAS_EJEMPLO = [
  { id: 'meta', nombre: 'Meta Ads', tipo: 'push', diaria: [900, 1600], cpl: [34, 48], l2b: [0.1, 0.16], objetivo: { cpl: 42, cpb: 380 },
    campanas: ['Alarmas · Prospección Lima', 'Alarmas · Prospección regiones', 'Cámaras · Remarketing', 'Promoción del mes · Leads'] },
  { id: 'google', nombre: 'Google Ads', tipo: 'pull', diaria: [700, 1300], cpl: [21, 32], l2b: [0.12, 0.19], objetivo: { cpl: 30, cpb: 220 },
    campanas: ['Search · Marca', 'Search · Genérico alarmas', 'Search · Genérico cámaras', 'Performance Max · Leads'] },
  { id: 'tiktok', nombre: 'TikTok Ads', tipo: 'push', diaria: [150, 450], cpl: [28, 56], l2b: [0.05, 0.1], objetivo: { cpl: 45, cpb: 600 },
    campanas: ['Alarmas · Leads in-app', 'Cámaras · Video'] },
];

/** Días de `desde` a `hasta`: cada uno con inversión, leads y bookings por plataforma. Cada día tiene su semilla. */
export function plataformasDeEjemplo(desde, hasta) {
  const dias = [];
  for (let d = desde; d <= hasta; d = masDias(d, 1)) {
    const finDeSemana = [0, 6].includes(new Date(`${d}T00:00:00Z`).getUTCDay());
    const fila = { fecha: d };
    for (const p of PLATAFORMAS_EJEMPLO) {
      const r = azar(semillaDe(`${p.id}|${d}`));
      const inversion = Math.round(entre(r, ...p.diaria) * (finDeSemana ? 0.75 : 1));
      const leads = Math.max(0, Math.round(inversion / entre(r, ...p.cpl)));
      const bookings = Math.round(leads * entre(r, ...p.l2b));
      // el reparto del día entre campañas: pesos que cambian poco de un día a otro
      const pesos = p.campanas.map((_, i) => 1 + i * 0.15 + r() * 0.6);
      const total = pesos.reduce((x, y) => x + y, 0);
      fila[p.id] = { inversion, leads, bookings, campanas: pesos.map((w) => w / total) };
    }
    dias.push(fila);
  }
  return { ejemplo: true, fuente: 'Meta Ads, Google Ads y TikTok Ads, con el CRM desde Google Sheets', moneda: 'USD', plataformas: PLATAFORMAS_EJEMPLO.map(({ id, nombre, tipo, objetivo, campanas }) => ({ id, nombre, tipo, objetivo, campanas })), dias };
}
