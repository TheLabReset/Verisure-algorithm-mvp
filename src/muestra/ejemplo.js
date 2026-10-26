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
  // semilla fija: la data de ejemplo no cambia con el período, para que nadie la lea como si respondiera a él
  const r = azar(semillaDe('tiktok'));
  const marcas = [...CLIENTE.competencia.map((c) => c.nombre), CLIENTE.nombre];
  const temas = ['seguridad en casa', 'cámaras de seguridad', 'alarmas', 'robos en Lima', 'cámara wifi', 'casa segura', 'tips de seguridad'];
  const hashtags = [...temas, ...marcas].map((t) => {
    const deMarca = marcas.includes(t);
    const vistas = redondo(entre(r, deMarca ? 0.4 : 1.5, deMarca ? 6 : 38) * 1e6, 1e4);
    const publicaciones = redondo(vistas / entre(r, 9000, 26000), 1);
    return { hashtag: etiqueta(t), vistas, interaccion: Math.round(vistas * entre(r, 0.03, 0.09)), publicaciones, deMarca, crecimiento: Math.round(entre(r, -35, 60)) };
  }).sort((a, b) => b.interaccion - a.interaccion);
  return { ejemplo: true, fuente: 'TikTok vía Apify, búsqueda por hashtag', hasta, desde: masDias(hasta, -27), hashtags };
}

/** Facebook: los temas de la conversación en las páginas de las marcas y del rubro, con menciones y tono. */
export function facebookDeEjemplo(hasta) {
  const r = azar(semillaDe('facebook'));
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

// Las plataformas de la marca propia, día por día, como las cruza su tablero con el CRM: inversión (en la moneda en que
// la reporta cada cuenta: Meta y TikTok en dólares, Google Ads en euros), leads y bookings (ventas del CRM). Push son las
// redes (Meta y TikTok) y Pull, la búsqueda (Google Ads). Los rangos de cada plataforma van en su moneda; los objetivos de
// costo, en dólares. Nombres de campaña genéricos del rubro; ninguna cifra sale de una cuenta real.
export const PLATAFORMAS_EJEMPLO = [
  { id: 'meta', nombre: 'Meta Ads', tipo: 'push', moneda: 'USD', diaria: [900, 1600], cpl: [34, 48], l2b: [0.1, 0.16], objetivo: { cpl: 42, cpb: 380 },
    campanas: ['Alarmas · Prospección Lima', 'Alarmas · Prospección regiones', 'Cámaras · Remarketing', 'Promoción del mes · Leads'] },
  { id: 'google', nombre: 'Google Ads', tipo: 'pull', moneda: 'EUR', diaria: [620, 1160], cpl: [19, 29], l2b: [0.12, 0.19], objetivo: { cpl: 30, cpb: 220 },
    campanas: ['Search · Marca', 'Search · Genérico alarmas', 'Search · Genérico cámaras', 'Performance Max · Leads'] },
  { id: 'tiktok', nombre: 'TikTok Ads', tipo: 'push', moneda: 'USD', diaria: [150, 450], cpl: [28, 56], l2b: [0.05, 0.1], objetivo: { cpl: 45, cpb: 600 },
    campanas: ['Alarmas · Leads in-app', 'Cámaras · Video'] },
];

// Dólares por euro: la referencia del Banco Central Europeo. Cuando se conecten las cuentas, el pipeline publica la del
// día con la data, en esta misma forma
export const TIPO_CAMBIO_EJEMPLO = { EUR: { usd: 1.1205, fecha: '2026-10-22', fuente: 'Banco Central Europeo' } };

// Objetivos del mes de ejemplo: lo que se acumula (inversión, leads, bookings), el mínimo de L2B y el tope de cada costo
export const OBJETIVOS_MES_EJEMPLO = { inversion: 72000, leads: 2300, bookings: 320, l2b: 14, cpl: 35, cpb: 240 };

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
  // los objetivos del mes, uno por mes con data: cuando se conecte, salen de una pestaña del Google Sheets del CRM
  const meses = [...new Set(dias.map((d) => d.fecha.slice(0, 7)))];
  return { ejemplo: true, fuente: 'Meta Ads, Google Ads y TikTok Ads, con el CRM desde Google Sheets', moneda: 'USD', tipoCambio: TIPO_CAMBIO_EJEMPLO,
    plataformas: PLATAFORMAS_EJEMPLO.map(({ id, nombre, tipo, moneda, objetivo, campanas }) => ({ id, nombre, tipo, moneda, objetivo, campanas })), dias,
    objetivos: meses.map((mes) => ({ mes, ...OBJETIVOS_MES_EJEMPLO })) };
}

// ── Piezas: cada campaña con sus conjuntos (grupos de anuncios en TikTok y Google) y sus piezas, día por día, con lo
// que reporta la plataforma: inversión, impresiones, alcance nuevo, clics y leads. Estos leads son los de la plataforma
// (formularios y conversiones), no los del CRM: no se cruzan con bookings. Las piezas rotan: cada conjunto estrena una
// cada tres semanas y cada una dura según cómo le va. Cada pieza tiene un comportamiento de ejemplo (rinde, cara, se
// satura, gasta sin leads) para que la maqueta muestre todos los estados. Google, la búsqueda, es la que mejor rinde, como
// suele pasar en el rubro; TikTok, la que más prueba y más falla. Ninguna cifra sale de una cuenta real.
export const CONJUNTOS_EJEMPLO = {
  meta: [['Hogares Lima · 25 a 54'], ['Arequipa y Trujillo', 'Resto del país'], ['Visitas a la web · 30 días'], ['Amplio · Advantage+']],
  google: [['Marca exacta'], ['Alarmas para casa', 'Alarmas para negocio'], ['Cámaras para casa'], ['Recursos · Alarmas']],
  tiktok: [['Amplio · 18 a 44'], ['Intereses hogar y tecnología']],
};
const PIEZAS_TIPO = {
  meta: [['Video', 'Testimonio de cliente'], ['Imagen', 'Promoción del mes'], ['Video', 'Instalación en un día'], ['Carrusel', 'El kit completo'], ['Video', 'La central responde'], ['Imagen', 'Cámara con alarma']],
  google: [['Texto', 'Anuncio adaptable'], ['Texto', 'Anuncio adaptable'], ['Texto', 'Anuncio adaptable']],
  tiktok: [['Video', 'Creador · Mi casa'], ['Video', 'Abriendo el kit'], ['Video', 'Antes y después'], ['Video', 'Un día en la central']],
};
// comportamiento: cuánto se lleva del conjunto, su costo por lead frente al de la plataforma y su CTR; cuánto vive
const COMPORTAMIENTO = {
  rinde: { peso: 1.6, cpl: 0.62, ctr: 1.6, vida: 70 }, normal: { peso: 1, cpl: 1, ctr: 1.1, vida: 49 }, costosa: { peso: 0.8, cpl: 1.75, ctr: 0.7, vida: 35 },
  saturada: { peso: 1.3, cpl: 0.8, ctr: 1.5, vida: 63 }, 'sin-leads': { peso: 0.55, cpl: null, ctr: 0.45, vida: 16 },
};
const ORDEN_COMPORTAMIENTO = {
  google: ['rinde', 'normal', 'rinde', 'rinde', 'normal', 'costosa', 'rinde', 'normal'],
  meta: ['normal', 'rinde', 'costosa', 'saturada', 'rinde', 'sin-leads', 'rinde', 'normal'],
  tiktok: ['normal', 'costosa', 'saturada', 'rinde', 'sin-leads', 'normal', 'costosa', 'rinde'],
};
const CPM_EJEMPLO = { meta: 6.5, google: 38, tiktok: 4 }; // Google Search: se paga por clic, el CPM es alto
const CADA = 21; // días entre estrenos de un conjunto
// el nombre de una pieza: su idea y el mes en que salió; en Google, la letra del anuncio adaptable
const MESES_EJEMPLO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
const nombreBase = (plataforma, base, g) => (plataforma === 'google' ? `${base} ${'ABC'[g % 3]}` : base);

export function piezasDeEjemplo(datos) {
  const dias = datos.dias, desde = dias[0].fecha, hasta = dias.at(-1).fecha;
  const piezas = [], conjuntos = [];
  // las piezas de cada conjunto: una generación cada CADA días, desde antes del primer día para que siempre haya al aire
  const dia0 = masDias(desde, -45), total = Math.ceil((Date.parse(hasta) - Date.parse(dia0)) / 864e5 / CADA) + 1;
  let n = 0;
  for (const p of PLATAFORMAS_EJEMPLO) {
    CONJUNTOS_EJEMPLO[p.id].forEach((lista, ci) => lista.forEach((nombreConjunto, k) => {
      const conjunto = { id: `${p.id}-${ci}-${k}`, plataforma: p.id, campana: p.campanas[ci], nombre: nombreConjunto, campanaIndice: ci, de: lista.length };
      conjuntos.push(conjunto);
      for (let g = 0; g < total; g++) {
        const orden = ORDEN_COMPORTAMIENTO[p.id], comp = orden[(n + g * 3) % orden.length];
        const [formato, base] = PIEZAS_TIPO[p.id][(n + g) % PIEZAS_TIPO[p.id].length];
        // dura su vida, pero nunca menos que hasta el estreno siguiente: el conjunto no se queda sin piezas al aire, y la
        // inversión de las piezas suma la de su plataforma todos los días
        const inicio = masDias(dia0, g * CADA + (n % 5)), siguiente = masDias(dia0, (g + 1) * CADA + (n % 5));
        const fin = [masDias(inicio, COMPORTAMIENTO[comp].vida), masDias(siguiente, 1)].sort().at(-1);
        if (fin < desde || inicio > hasta) continue;
        piezas.push({ id: `${conjunto.id}-${g}`, plataforma: p.id, conjunto: conjunto.id, campana: conjunto.campana, nombre: `${nombreBase(p.id, base, g)} · ${MESES_EJEMPLO[+inicio.slice(5, 7) - 1]}`, formato, inicio, fin: fin <= hasta ? fin : null, comportamiento: comp });
      }
      n++;
    }));
  }
  // cada día: la inversión de la campaña (el reparto del día) entre sus conjuntos y entre las piezas al aire
  const porDia = dias.map((d) => {
    const fila = { fecha: d.fecha };
    for (const c of conjuntos) {
      const pl = d[c.plataforma], inversionConjunto = pl.inversion * pl.campanas[c.campanaIndice] / c.de;
      const alAire = piezas.filter((x) => x.conjunto === c.id && x.inicio <= d.fecha && (!x.fin || x.fin >= d.fecha));
      const edad = (x) => Math.round((Date.parse(d.fecha) - Date.parse(x.inicio)) / 864e5);
      // una pieza que se satura se lleva más al principio y su costo sube desde la tercera semana
      const cansancio = (x) => (x.comportamiento === 'saturada' ? Math.max(0, edad(x) - 21) / 28 : 0);
      const peso = (x) => COMPORTAMIENTO[x.comportamiento].peso * (edad(x) < 3 ? 0.6 : 1) * (1 - Math.min(0.5, cansancio(x) * 0.4));
      const suma = alAire.reduce((s, x) => s + peso(x), 0);
      for (const x of alAire) {
        const r = azar(semillaDe(`${x.id}|${d.fecha}`)), comp = COMPORTAMIENTO[x.comportamiento];
        const inversion = suma ? inversionConjunto * peso(x) / suma : 0;
        const cplBase = (x.plataforma === 'google' ? 0.9 : 0.85) * entre(r, ...PLATAFORMAS_EJEMPLO.find((q) => q.id === x.plataforma).cpl);
        // las primeras jornadas cuestan más: la plataforma todavía está aprendiendo
        const cpl = comp.cpl == null ? null : cplBase * comp.cpl * (1 + cansancio(x) * 1.2) * (edad(x) < 5 ? 1.3 : 1);
        const leads = cpl == null ? 0 : Math.max(0, Math.round(inversion / cpl + (r() - 0.5)));
        const impresiones = Math.round((inversion / CPM_EJEMPLO[x.plataforma]) * 1000 * entre(r, 0.9, 1.1));
        const ctr = (comp.ctr / 100) * (1 - Math.min(0.6, cansancio(x) * 0.7)) * entre(r, 0.85, 1.15);
        // alcance nuevo: cada día la pieza llega a menos gente que no la había visto (la frecuencia sube con la edad)
        const alcance = Math.round(impresiones / (1 + edad(x) * (x.plataforma === 'google' ? 0.005 : 0.06)));
        fila[x.id] = { inversion, impresiones, alcance, clics: Math.round(impresiones * ctr), leads };
      }
    }
    return fila;
  });
  return { ejemplo: true, fuente: 'Meta Ads, Google Ads y TikTok Ads, lo que reporta cada plataforma', conjuntos, piezas, dias: porDia };
}
