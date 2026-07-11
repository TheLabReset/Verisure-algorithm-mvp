// Helpers de formato numérico en español:
// miles con punto, decimales con coma.

export const formatES = (n, decimals = null) => {
  if (n === null || n === undefined) return '';
  if (typeof n !== 'number') return String(n);
  const fixed = decimals !== null ? n.toFixed(decimals) : String(n);
  return fixed.replace('.', ',');
};

// Agrupa miles con PUNTO de forma DETERMINISTA (no depende del ICU del navegador:
// toLocaleString('es-PE') devuelve coma en algunos runtimes como Chromium).
const groupThousands = (n) => {
  const neg = n < 0;
  const s = String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${neg ? '-' : ''}${s}`;
};

export const formatThousands = (n) => {
  if (n === null || n === undefined) return '';
  return groupThousands(n);
};

export const formatMoney = (n, decimals = 2) => `$${formatES(n, decimals)}`;
// Soles con miles en punto (es-PE): S/ 1.240.500
export const formatSoles = (n) => {
  if (n === null || n === undefined) return '';
  return `S/ ${groupThousands(n)}`;
};
export const formatPercent = (n, decimals = 1) => `${formatES(n, decimals)}%`;
// Concordancia de plural para "punto/puntos porcentuales": 1 pt · 4 pts.
export const ptsLabel = (n) => (Math.abs(Number(n)) === 1 ? 'pt' : 'pts');
export const formatCompact = (n, decimals = 1) => {
  if (n >= 1_000_000) return `${formatES(n / 1_000_000, decimals)}M`;
  if (n >= 1_000) return `${formatES(n / 1_000, decimals)}K`;
  return formatES(n);
};
