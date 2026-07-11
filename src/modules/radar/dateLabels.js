// Etiquetas de fecha es-PE, deterministas (aritmética UTC, sin sorpresas de zona).
const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function fmtDayLong(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return `${DOW[dt.getUTCDay()]} ${d} ${MON[m - 1]}`
}

export function fmtDayFull(iso) {
  return iso ? `${fmtDayLong(iso)} ${iso.slice(0, 4)}` : ''
}

// "11 jun" (sin día de semana) para ejes de tiempo compactos.
export function fmtDayShort(iso) {
  if (!iso) return ''
  const [, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${d} ${MON[m - 1]}`
}
