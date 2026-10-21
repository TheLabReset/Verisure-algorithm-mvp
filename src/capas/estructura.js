import { CLIENTE } from '../cliente.js';
// Las cuatro capas de The Algorithm para este cliente: un algoritmo outside-in, solo con señales externas.
// Es el estándar de docs/guia-algoritmo.md: las capas no cambian; los capítulos aparecen cuando su fuente existe.
// Fuentes de hoy: Integrametrics (ATL y digital) y Google Trends. Lo principal es la competencia: cada capa empieza
// por lo que hizo. TikTok y Facebook (Apify) y las plataformas del cliente con su CRM van con data de ejemplo,
// rotulada, hasta que se conecten.

const competencia = CLIENTE.competencia.map((c) => c.nombre).join(' y ');
// en lo nuevo de la capa 1 también salen las marcas vigiladas: la pregunta las incluye
const yOtras = CLIENTE.vigiladas?.length ? `${competencia} u otra marca` : competencia;

export const CAPAS = [
  {
    id: 'senales', numero: '1', nombre: 'Captura de señales', descripcion: `Lo nuevo de ${competencia} en el período`,
    titulo: 'Captura de señales', bajada: `Lo que hizo ${competencia} en el período: digital primero, después TV y cable, radio y vía pública, y lo que se busca y se comenta.`,
    secciones: [
      { id: 's-1-1', numero: '1.1', titulo: 'Digital', pregunta: `¿Qué piezas y mensajes digitales nuevos tuvo ${yOtras} en el período?`, universos: ['digital'], fuentes: ['digital'] },
      { id: 's-1-2', numero: '1.2', titulo: 'TV y cable', pregunta: `¿Qué emitió ${yOtras} en TV y cable, en qué programas y con qué tipo de aviso?`, universos: ['atl'], fuentes: ['atl'] },
      { id: 's-1-3', numero: '1.3', titulo: 'Radio', pregunta: `¿Qué emitió ${yOtras} en radio, en qué emisoras y programas?`, universos: ['atl'], fuentes: ['atl'] },
      { id: 's-1-4', numero: '1.4', titulo: 'OOH', pregunta: '¿Dónde están los paneles de cada marca y qué pieza lleva cada uno?', universos: ['atl'], fuentes: ['atl'] },
      { id: 's-1-5', numero: '1.5', titulo: 'Tendencias', pregunta: '¿Qué marcas de cámaras se buscan en Google y qué se comenta en TikTok y Facebook?', universos: ['busquedas', 'conversacion'], fuentes: ['trends', 'apify'] },
    ],
  },
  {
    id: 'inteligencia', numero: '2', nombre: 'Inteligencia de mercado', descripcion: 'Dónde, cómo y cuándo compra medios la competencia',
    titulo: 'Inteligencia de mercado', bajada: `Cómo se mueve ${competencia}: dónde pone su inversión, qué medios compra frente a ${CLIENTE.nombre} y cuándo sale al aire.`,
    secciones: [
      { id: 's-2-1', numero: '2.1', titulo: 'Dónde está la inversión', pregunta: '¿Dónde aparece cada marca en digital y cómo reparte su inversión ATL?', universos: ['digital', 'atl'], fuentes: ['digital', 'atl'] },
      { id: 's-2-2', numero: '2.2', titulo: 'Compra de medios', pregunta: `¿En qué canales, programas y tipos de aviso compra ${competencia}, frente a ${CLIENTE.nombre}?`, universos: ['atl'], fuentes: ['atl'] },
      { id: 's-2-3', numero: '2.3', titulo: 'Cuándo sale al aire', pregunta: '¿En qué horas, días y programas emite cada marca?', universos: ['atl'], fuentes: ['atl'] },
    ],
  },
  {
    id: 'activacion', numero: '3', nombre: 'Activación estratégica', descripcion: `Las plataformas de ${CLIENTE.nombre} cruzadas con su CRM`,
    titulo: 'Activación estratégica', bajada: `Meta Ads, Google Ads y TikTok Ads de ${CLIENTE.nombre}, cruzadas con los leads y bookings de su CRM.`,
    secciones: [
      { id: 's-3-1', numero: '3.1', titulo: 'Leads y bookings en el tiempo', pregunta: '¿Cuántos leads y bookings llegan cada semana o cada día?', universos: ['plataformas'], fuentes: ['plataformas'] },
      { id: 's-3-2', numero: '3.2', titulo: 'Push y Pull', pregunta: '¿Cómo convierten las redes frente a la búsqueda, semana a semana?', universos: ['plataformas'], fuentes: ['plataformas'] },
      { id: 's-3-3', numero: '3.3', titulo: 'Cada plataforma frente a su objetivo', pregunta: '¿Cuánto invierte, cuántos leads y bookings trae y a qué costo cada plataforma, frente a su objetivo?', universos: ['plataformas'], fuentes: ['plataformas'] },
    ],
  },
  {
    id: 'rendimiento', numero: '4', nombre: 'Históricos', descripcion: 'El share de inversión, el año y las versiones de cada marca',
    titulo: 'Históricos', bajada: `Cómo viene el share de inversión publicitaria de ${competencia}, cómo se movió la pauta en el año y qué versiones tuvo.`,
    secciones: [
      { id: 's-4-1', numero: '4.1', titulo: 'Cómo viene el período', pregunta: `¿Qué parte de la inversión publicitaria pone ${competencia} y cómo viene semana a semana?`, universos: ['digital', 'atl'], fuentes: ['digital', 'atl'] },
      { id: 's-4-2', numero: '4.2', titulo: 'Cómo viene el año', pregunta: '¿Cuándo se prende y se apaga la pauta de cada marca, y cuánto invierte mes a mes?', universos: ['digital', 'atl'], fuentes: ['digital', 'atl'] },
      { id: 's-4-3', numero: '4.3', titulo: 'Versiones en el año', pregunta: `¿Qué versiones tuvo ${competencia} en el año, en ATL y en digital?`, universos: ['atl', 'digital'], fuentes: ['atl', 'digital'] },
    ],
  },
];

export const seccion = (id) => CAPAS.flatMap((c) => c.secciones).find((s) => s.id === id);
export const seccionPorNumero = (n) => CAPAS.flatMap((c) => c.secciones).find((s) => s.numero === n);
