// Configuración de los 4 módulos de The Algorithm v2.
// El nombre de producto del 4º módulo es MAIA (Media Analyst IA de Reset);
// el blueprint lo llamaba internamente "COPILOT" — mismo módulo.
//
// La "frescura por fuente" (DESIGN §2) se declara por módulo y debe ser honesta.
// Los textos de frescura aquí son la cadencia real documentada de cada fuente.

export const MODULES = [
  {
    id: 'radar',
    label: 'Radar',
    freshness: 'Integrametrics · actualizado hoy 6:00 a. m.',
  },
  {
    id: 'demanda',
    label: 'Demanda',
    freshness: 'Google Trends · diario · marketplaces estimado',
  },
  {
    id: 'contexto',
    label: 'Contexto',
    freshness: 'SIDPOL mensual · BCRP diario · prensa 8:00 a. m.',
  },
  {
    id: 'maia',
    label: 'MAIA',
    freshness: 'MAIA — Media Analyst IA de Reset · lee las 6 fuentes del día',
  },
]

export const DEFAULT_MODULE = 'radar'
