// Helpers de formato numérico para WIN (formato US):
// miles con coma, decimales con punto.

export const formatES = (n, decimals = null) => {
  if (n === null || n === undefined) return '';
  if (typeof n !== 'number') return String(n);
  return decimals !== null ? n.toFixed(decimals) : String(n);
};

export const formatThousands = (n) => {
  if (n === null || n === undefined) return '';
  return Number(n).toLocaleString('en-US');
};

export const formatMoney = (n, decimals = 2) => {
  return `$${formatES(n, decimals)}`;
};

export const formatPercent = (n, decimals = 1) => {
  return `${formatES(n, decimals)}%`;
};

export const formatCompact = (n, decimals = 1) => {
  if (n >= 1_000_000) return `${formatES(n / 1_000_000, decimals)}M`;
  if (n >= 1_000) return `${formatES(n / 1_000, decimals)}K`;
  return formatES(n);
};
