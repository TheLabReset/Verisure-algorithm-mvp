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
    const brief = composeBrief({ day, soi, newPieces, diy, score, contexto })
    return { day, soi, newPieces, diy, score, brief, contexto }
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
      <DailyBrief brief={facts.brief} />
      <OpportunityScore score={facts.score} />
      <MaiaChat facts={facts} />
    </div>
  )
}
