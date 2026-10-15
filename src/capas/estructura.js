import { CLIENTE } from '../cliente.js';
// Las cuatro capas de The Algorithm para este cliente: un algoritmo outside-in, solo con señales externas.
// Es el estándar de docs/guia-algoritmo.md: las capas no cambian; los capítulos aparecen cuando su fuente existe.
// Hoy la fuente es Integrametrics (ATL y digital). Google Trends, SIDPOL y el Power BI del cliente, cuando se
// conecten, suman capítulos aquí (Qué se busca, El entorno, Lo que mide su Power BI).

const competencia = CLIENTE.competencia.map((c) => c.nombre).join(' y ');

export const CAPAS = [
  {
    id: 'senales', numero: '1', nombre: 'Captura de señales', descripcion: 'Qué salió al aire en la categoría',
    titulo: 'Captura de señales', bajada: `Qué salió al aire en la categoría: las piezas nuevas y todo lo que ${CLIENTE.nombre} y ${competencia} tienen en pauta.`,
    secciones: [
      { id: 's-1-1', numero: '1.1', titulo: 'Qué salió al aire', pregunta: '¿Qué piezas se estrenaron en el período y qué versiones siguen al aire?', universos: ['atl', 'digital'], fuentes: ['atl', 'digital'] },
      { id: 's-1-2', numero: '1.2', titulo: 'Vía pública', pregunta: '¿Dónde están los paneles de cada marca?', universos: ['atl'], fuentes: ['atl'] },
    ],
  },
  {
    id: 'inteligencia', numero: '2', nombre: 'Inteligencia de mercado', descripcion: 'Qué mirar y cómo viene el año',
    titulo: 'Inteligencia de mercado', bajada: 'Qué mirar en el período y cómo viene la inversión de la categoría en el año.',
    secciones: [
      { id: 's-2-1', numero: '2.1', titulo: 'Qué mirar', pregunta: '¿Qué cambió en la competencia y qué conviene revisar?', universos: ['modelo'], fuentes: ['atl', 'digital'] },
      { id: 's-2-2', numero: '2.2', titulo: 'Cómo viene el año', pregunta: '¿Cuánto invirtió cada marca mes a mes, en ATL y en digital?', universos: ['atl', 'digital'], fuentes: ['atl', 'digital'] },
    ],
  },
  {
    id: 'activacion', numero: '3', nombre: 'Activación estratégica', descripcion: 'Dónde y cuándo está la inversión',
    titulo: 'Activación estratégica', bajada: `Dónde y cuándo está la inversión de ${CLIENTE.nombre} y de ${competencia}, según Integrametrics.`,
    secciones: [
      { id: 's-3-1', numero: '3.1', titulo: 'Dónde está la inversión', pregunta: 'Cómo se reparte entre medios, canales y franjas.', universos: ['atl', 'digital'], fuentes: ['atl', 'digital'] },
      { id: 's-3-2', numero: '3.2', titulo: 'Cuándo sale al aire', pregunta: 'Las horas, los días y los programas con más emisiones.', universos: ['atl'], fuentes: ['atl'] },
    ],
  },
  {
    id: 'rendimiento', numero: '4', nombre: 'Rendimiento y optimización', descripcion: 'Cómo viene el período frente al anterior',
    titulo: 'Rendimiento y optimización', bajada: 'Cómo viene la presión publicitaria del período frente al anterior.',
    secciones: [
      { id: 's-4-1', numero: '4.1', titulo: 'Cómo viene el período', pregunta: 'Share of investment en ATL y en digital, y la inversión día por día.', universos: ['atl', 'digital'], fuentes: ['atl', 'digital'] },
    ],
  },
];

export const seccion = (id) => CAPAS.flatMap((c) => c.secciones).find((s) => s.id === id);
export const seccionPorNumero = (n) => CAPAS.flatMap((c) => c.secciones).find((s) => s.numero === n);
