// MAIA — Media Analyst IA de Reset (módulo 4). Compone la síntesis del día:
// Daily Brief (card oscura ancla), Opportunity Score (IPC/IMC) y chat sobre la data.
// Cablea la capa de datos (fixtures/live). Estados diseñados (DESIGN §7).
import { useMemo } from 'react'
import { useData } from '../../data/DataContext'
import { soiComparison, detectNewPieces, diyIndex, opportunityScore } from '../../data/derive'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import DailyBrief from './DailyBrief'
import OpportunityScore from './OpportunityScore'
import MaiaChat from './MaiaChat'
import MaiaFace from './MaiaFace'
import { composeBrief } from './maiaBrief'

function demoParam() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('demo')
}

export default function MaiaModule() {
  const { loading, sourceDown, registros, digital, trends, contexto, day } = useData()
  const demo = demoParam()
  const isDown = demo === 'sourcedown' || sourceDown

  const facts = useMemo(() => {
    if (!day || !registros.length) return null
    const soi = soiComparison(registros, day)
    // En fuente caída no afirmamos piezas "de hoy" (coherente con el banner de snapshot).
    const newPieces = isDown || demo === 'empty' ? [] : detectNewPieces(registros, day)
    const diy = trends ? diyIndex(trends, digital) : null
    const score = opportunityScore(registros, trends, contexto, day)
    // Delta del Score vs. hace 7 días (varía por la presión competitiva del SOI).
    const prev = new Date(`${day}T00:00:00Z`)
    prev.setUTCDate(prev.getUTCDate() - 7)
    const scorePrev = opportunityScore(registros, trends, contexto, prev.toISOString().slice(0, 10)).score
    const scoreObj = { ...score, deltaSemana: score.score - scorePrev }
    const brief = composeBrief({ day, soi, newPieces, diy, score: scoreObj, contexto })
    return { day, soi, newPieces, diy, score: scoreObj, brief, contexto }
  }, [registros, digital, trends, contexto, day, isDown, demo])

  if (demo === 'loading' || (loading && !facts)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Sin datos para sintetizar (o previsualización del estado con ?demo=nodata).
  if (demo === 'nodata' || !facts) {
    return (
      <EmptyState
        title="MAIA — Media Analyst IA de Reset"
        note="Sin datos del día para sintetizar. MAIA lee las fuentes cada mañana a las 6:00 a. m."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Identidad de MAIA con carita (DESIGN §6.1). */}
      <div className="flex items-center gap-3">
        <MaiaFace state={facts.brief.alerta ? 'alerta' : 'reposo'} size={40} />
        <div>
          <p className="font-display text-xl text-ink sm:text-2xl">MAIA</p>
          <p className="text-sm text-ink-2">Media Analyst IA de Reset · lee las 6 fuentes del día</p>
        </div>
      </div>
      {/* Opportunity Score junto al Daily Brief (card oscura ancla), 2 columnas. */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <OpportunityScore score={facts.score} day={facts.day} />
        <DailyBrief brief={facts.brief} />
      </div>
      <MaiaChat facts={facts} />
    </div>
  )
}
