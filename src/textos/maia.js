// MAIA (Media Analyst IA): los textos del reporte semanal y de la consulta. Los hechos los arma src/calculo/semana.js
// con reglas; acá se redactan, en el mismo tono que las lecturas: observan, no ordenan. La lectura de MAIA (lo que
// escribe el modelo) es aparte y llega ya escrita en public/data/maia.json.
import { numero, soles, fechaCorta } from '../sistema/formato.js';
import { CLIENTE } from '../cliente.js';
import { lista, segun, enLetras, capital, version } from './comun.js';

const cambioTexto = (c) => (c == null ? 'sin semana anterior para comparar' : c === 0 ? 'igual que la semana anterior' : `${c > 0 ? '+' : '−'}${numero(Math.abs(c))} % frente a la semana anterior`);
const universo = (u) => (u === 'atl' ? 'ATL' : 'digital');

const HECHOS = {
  inversion: (h) => ({
    titulo: `${h.marca} invirtió ${soles(h.ahora)} en ${universo(h.universo)}`,
    dato: `${capital(cambioTexto(h.cambio))}${h.share != null ? `; ${numero(h.share)} % de la inversión ${universo(h.universo)} de la semana` : ''}.`,
  }),
  'versiones-atl': (h) => ({
    titulo: `${h.marca} sacó ${enLetras(h.cuantas, true)} ${segun(h.cuantas, 'versión ATL', 'versiones ATL')}`,
    dato: `${lista(h.nombres.slice(0, 3).map((n) => `«${version(n)}»`))}${h.nombres.length > 3 ? ` y ${numero(h.nombres.length - 3)} más` : ''}.`,
  }),
  'versiones-digitales': (h) => ({
    titulo: `${h.marca} sacó ${enLetras(h.cuantas, true)} ${segun(h.cuantas, 'versión digital nueva', 'versiones digitales nuevas')}`,
    dato: `${lista(h.nombres.slice(0, 3).map((n) => `«${version(n)}»`))}${h.nombres.length > 3 ? ` y ${numero(h.nombres.length - 3)} más` : ''}.`,
  }),
  paneles: (h) => ({
    titulo: `Se detectaron ${numero(h.cuantos)} ${segun(h.cuantos, 'panel', 'paneles')} de ${h.marca}`,
    dato: h.distritos.length ? `En ${lista(h.distritos.slice(0, 4))}${h.distritos.length > 4 ? ` y ${numero(h.distritos.length - 4)} zonas más` : ''}.` : 'Sin distrito registrado.',
  }),
  diy: (h) => ({
    titulo: `Las búsquedas de cámaras de seguridad ${h.crecimiento >= 0 ? 'suben' : 'bajan'} ${numero(Math.abs(h.crecimiento))} %`,
    dato: `Últimas 12 semanas de Google Trends frente a las mismas de un año antes${h.razon ? `; unas ${numero(h.razon, 1)} búsquedas de cámaras por cada búsqueda de «${CLIENTE.nombre.toLowerCase()}»` : ''}.`,
  }),
};

export const GRUPOS_MAIA = [
  { tema: 'competencia', titulo: `Lo que hizo ${CLIENTE.competencia.map((c) => c.nombre).join(' y ')}` },
  { tema: 'propia', titulo: CLIENTE.nombre },
  { tema: 'diy', titulo: 'Cámaras DIY' },
];
export const hechoTexto = (h) => HECHOS[h.id]?.(h) ?? null;
export const semanaTexto = (s) => `semana del ${fechaCorta(s.desde)} al ${fechaCorta(s.hasta)}`;

export const PREGUNTAS = [
  `¿Qué hizo ${CLIENTE.competencia[0].nombre} esta semana?`,
  `¿Dónde tiene paneles ${CLIENTE.competencia[0].nombre}?`,
  `¿Cómo va el share digital frente a ${CLIENTE.competencia[0].nombre}?`,
  '¿Qué marcas de cámaras DIY crecen?',
];
