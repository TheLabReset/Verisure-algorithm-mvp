// Opportunity Score (MAIA, DESIGN §6.3) — síntesis del día en un solo número.
// ÚNICO uso de --grad-brand (arco de progreso). Ring centrado arriba + delta semanal;
// debajo IPC e IMC como barras con lectura de una frase. Todo derivado (no hardcode).
import { fmtDayLong } from '../radar/dateLabels'

// Lecturas derivadas del valor (el texto afirma sobre el índice).
function ipcRead(v) {
  if (v >= 60) return 'La competencia presiona fuerte: SOV en disputa con demanda caliente.'
  if (v >= 35) return 'Presión competitiva media; hay espacio para ganar participación.'
  return 'Presión competitiva baja: ventana para construir presencia con menos ruido.'
}
function imcRead(v) {
  if (v >= 70) return 'Momento de categoría caliente (demanda, criminalidad y estacionalidad alineadas).'
  if (v >= 45) return 'Momento de categoría templado; la demanda acompaña pero sin pico.'
  return 'Momento de categoría frío: la demanda de fondo está baja.'
}
function scoreTitle(s) {
  if (s >= 70) return 'Momento favorable para presionar'
  if (s >= 45) return 'Oportunidad moderada del día'
  return 'Momento de cautela'
}

function IndexBar({ label, value, read, shade = 'var(--ink)' }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-sm font-semibold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-pill" style={{ background: 'var(--wash)' }}>
        <div className="h-full rounded-pill" style={{ width: `${value}%`, background: shade }} />
      </div>
      <p className="mt-1.5 text-xs text-ink-2">{read}</p>
    </div>
  )
}

export default function OpportunityScore({ score, day }) {
  if (!score) return null
  const { score: s, ipc, imc, deltaSemana } = score

  return (
    <section className="flex h-full flex-col rounded-card bg-surface p-5 shadow-card sm:p-6">
      <h3 className="font-display text-xl text-ink sm:text-2xl">{scoreTitle(s)}</h3>
      <p className="mt-1 text-sm text-ink-2">Opportunity Score{day ? ` · ${fmtDayLong(day)}` : ''}</p>

      <div className="mt-4 flex flex-col items-center">
        <div className="score-ring w-[168px]" style={{ '--p': s }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-ink" style={{ fontSize: 48, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s}</span>
            <span className="mt-1 text-xs text-ink-2">de 100</span>
          </div>
        </div>
        {deltaSemana != null && deltaSemana !== 0 ? (
          <p className="mt-3 text-sm font-semibold" style={{ color: deltaSemana > 0 ? 'var(--positive)' : 'var(--caution)', fontVariantNumeric: 'tabular-nums' }}>
            {deltaSemana > 0 ? '+' : '−'}{Math.abs(deltaSemana)} vs. semana pasada
          </p>
        ) : null}
      </div>

      <div className="mt-6 space-y-4">
        <IndexBar label="Presión competitiva (IPC)" value={ipc} read={ipcRead(ipc)} shade="var(--ink-2)" />
        <IndexBar label="Momento de categoría (IMC)" value={imc} read={imcRead(imc)} shade="var(--ink)" />
      </div>

      <p className="mt-auto border-t border-line pt-3 text-xs text-ink-2">
        IPC = Índice de Presión Competitiva · IMC = Índice de Momento de Categoría · Score = momento penalizado por presión rival · ilustrativo.
      </p>
    </section>
  )
}
