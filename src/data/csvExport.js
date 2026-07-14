// Export CSV en DIMENSIONES COMPARTIDAS con el BI de Verisure (blueprint §A.7 / §B.3).
// Llaves de interoperabilidad: fecha, hora, zona, taxonomía de canal → su Power BI ya
// filtra por esas dimensiones y puede cruzar contra L2B/PACE/CPS en su casa.
// Flujo de data en una sola dirección: hacia adentro de ellos.
//
// Función pura: registros → string CSV. Sin efectos.

const CSV_COLUMNS = [
  'fecha', // YYYY-MM-DD
  'hora', // HH:MM (hora local)
  'zona', // zonificación comercial / ciudad-localidad
  'grupo_medio', // TELEVISIÓN / RADIO / VÍA PÚBLICA
  'medio', // canal (AMÉRICA TV, RPP…)
  'programa',
  'marca',
  'version',
  'franja', // DIA / PRIME / NOCHE / MADRUGADA
  'tipo', // SPOT TV / SPOT RADIO / VÍA PÚBLICA
  'inversion_soles',
  'inversion_dolares',
  'tipo_cambio',
]

function esc(v) {
  if (v === null || v === undefined) return ''
  const s = String(v)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// tipoCambio: S/ por USD (del contexto BCRP) para normalización EUR/USD/PEN.
export function registrosToCSV(registros, { tipoCambio = null } = {}) {
  const lines = [CSV_COLUMNS.join(',')]
  for (const r of registros) {
    const fecha = (r.fecha || '').slice(0, 10)
    // La doc lista HOUR/MINUTE en mayúscula, pero la API real los devuelve en minúscula.
    const hh = r.HOUR ?? r.hour
    const mm = r.MINUTE ?? r.minute
    const hora =
      hh != null && mm != null
        ? `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
        : (r.fecha || '').slice(11, 16)
    const zona = r.localidad || r.ciuname || ''
    const inv = Number(r.rinversion) || 0
    const invUSD =
      r.rinversion_dolares != null
        ? r.rinversion_dolares
        : tipoCambio
          ? Math.round((inv / tipoCambio) * 10) / 10
          : ''
    const row = [
      fecha,
      hora,
      zona,
      r.gname || '',
      r.mname || '',
      r.progname || '',
      r.maname || '',
      r.vname || '',
      r.franja || '',
      r.tname || '',
      inv,
      invUSD,
      tipoCambio ?? '',
    ]
    lines.push(row.map(esc).join(','))
  }
  return lines.join('\n')
}

export { CSV_COLUMNS }
