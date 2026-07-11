// Opportunity Score (MAIA, DESIGN §6.3) — síntesis del día en un solo número.
// ÚNICO uso de --grad-brand (arco de progreso). Debajo: IPC e IMC como barras
// simples, cada una con una lectura de una frase. Todo derivado (no hardcode).

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
function scoreRead(s) {
  if (s >= 70) return 'Momento favorable para pisar el acelerador en eficacia y alivio.'
  if (s >= 45) return 'Oportunidad moderada: selectividad por franja y territorio.'
  return 'Oportunidad baja hoy: conviene conservar y observar.'
}

function IndexBar({ sigla, nombre, value, read }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm text-ink">
          <span className="font-semibold">{sigla}</span> · {nombre}
        </p>
        <p className="text-sm font-semibold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-pill" style={{ background: 'var(--wash)' }}>
        <div className="h-full rounded-pill" style={{ width: `${value}%`, background: 'var(--ink)' }} />
      </div>
      <p className="mt-1.5 text-xs text-ink-2">{read}</p>
    </div>
  )
}

export default function OpportunityScore({ score }) {
  if (!score) return null
  const { score: s, ipc, imc } = score

  return (
    <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <h3 className="font-display text-xl text-ink sm:text-2xl">Oportunidad del día</h3>
      <p className="mt-1 text-sm text-ink-2">
        Opportunity Score · síntesis de presión competitiva y momento de categoría
      </p>

      <div className="mt-4 grid gap-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center">
        <div className="mx-auto w-[180px]">
          <div className="score-ring" style={{ '--p': s }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-ink" style={{ fontSize: 48, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s}</span>
              <span className="mt-1 text-xs text-ink-2">de 100</span>
            </div>
          </div>
          <p className="mt-3 text-center text-sm text-ink-2">{scoreRead(s)}</p>
        </div>

        <div className="space-y-4">
          <IndexBar sigla="IPC" nombre="Índice de Presión Competitiva" value={ipc} read={ipcRead(ipc)} />
          <IndexBar sigla="IMC" nombre="Índice de Momento de Categoría" value={imc} read={imcRead(imc)} />
        </div>
      </div>

      <p className="mt-4 border-t border-line pt-3 text-xs text-ink-2">
        IPC = Índice de Presión Competitiva · IMC = Índice de Momento de Categoría · Score = momento penalizado por presión rival · ilustrativo, se afina con data real.
      </p>
    </section>
  )
}
