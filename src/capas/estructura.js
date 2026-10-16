import { CLIENTE } from '../cliente.js';
// Las cuatro capas de The Algorithm para este cliente: un algoritmo outside-in, solo con señales externas.
// Es el estándar de docs/guia-algoritmo.md: las capas no cambian; los capítulos aparecen cuando su fuente existe.
// Fuentes de hoy: Integrametrics (ATL y digital) y Google Trends. Lo principal es la competencia: cada capa empieza
// por lo que hizo. SIDPOL, marketplaces y el Power BI del cliente, cuando se conecten, suman capítulos aquí.

const competencia = CLIENTE.competencia.map((c) => c.nombre).join(' y ');

export const CAPAS = [
  {
    id: 'senales', numero: '1', nombre: 'Captura de señales', descripcion: `Qué hizo ${competencia} y qué salió al aire`,
    titulo: 'Captura de señales', bajada: `Qué hizo ${competencia}: sus versiones en el año, lo que estrenó, lo que tiene en ATL y digital, y dónde están sus paneles.`,
    secciones: [
      { id: 's-1-1', numero: '1.1', titulo: 'Qué hizo la competencia', pregunta: `¿Qué versiones tuvo ${competencia} en el año, qué estrenó y qué tiene al aire en el período?`, universos: ['atl', 'digital'], fuentes: ['atl', 'digital'] },
      { id: 's-1-2', numero: '1.2', titulo: 'OOH', pregunta: '¿Dónde están los paneles de cada marca y qué pieza lleva cada uno?', universos: ['atl'], fuentes: ['atl'] },
    ],
  },
  {
    id: 'inteligencia', numero: '2', nombre: 'Inteligencia de mercado', descripcion: 'Qué mirar, cámaras DIY y el año',
    titulo: 'Inteligencia de mercado', bajada: 'Qué mirar en el período, cuánto se buscan las cámaras que uno instala solo y cómo viene la pauta de cada marca en el año.',
    secciones: [
      { id: 's-2-1', numero: '2.1', titulo: 'Qué mirar', pregunta: '¿Qué cambió en la competencia y qué conviene revisar?', universos: ['modelo'], fuentes: ['atl', 'digital', 'trends'] },
      { id: 's-2-2', numero: '2.2', titulo: 'Cámaras DIY', pregunta: '¿Cuánto se buscan las cámaras que uno instala solo, frente a la marca, y qué marcas crecen?', universos: ['busquedas'], fuentes: ['trends'] },
      { id: 's-2-3', numero: '2.3', titulo: 'Cómo viene el año', pregunta: '¿Cuándo se prende y se apaga la pauta de cada marca, y cuánto invierte mes a mes?', universos: ['atl', 'digital'], fuentes: ['atl', 'digital'] },
    ],
  },
  {
    id: 'activacion', numero: '3', nombre: 'Activación estratégica', descripcion: 'Dónde y cuándo está la inversión',
    titulo: 'Activación estratégica', bajada: `Dónde y cuándo está la inversión de ${competencia} y de ${CLIENTE.nombre}, según Integrametrics.`,
    secciones: [
      { id: 's-3-1', numero: '3.1', titulo: 'Dónde está la inversión', pregunta: '¿Cómo reparte cada marca su inversión entre medios, canales y franjas?', universos: ['atl', 'digital'], fuentes: ['atl', 'digital'] },
      { id: 's-3-2', numero: '3.2', titulo: 'Cuándo sale al aire', pregunta: '¿En qué horas, días y programas emite cada marca?', universos: ['atl'], fuentes: ['atl'] },
    ],
  },
  {
    id: 'rendimiento', numero: '4', nombre: 'Rendimiento y optimización', descripcion: 'Cómo viene el período frente al anterior',
    titulo: 'Rendimiento y optimización', bajada: `Cómo viene el share de ${competencia} frente al período anterior y semana a semana.`,
    secciones: [
      { id: 's-4-1', numero: '4.1', titulo: 'Cómo viene el período', pregunta: `¿Qué parte de la inversión pone ${competencia} frente al mes anterior, y cómo viene semana a semana?`, universos: ['atl', 'digital'], fuentes: ['atl', 'digital'] },
    ],
  },
];

export const seccion = (id) => CAPAS.flatMap((c) => c.secciones).find((s) => s.id === id);
export const seccionPorNumero = (n) => CAPAS.flatMap((c) => c.secciones).find((s) => s.numero === n);
