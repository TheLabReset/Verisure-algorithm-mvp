// MAIA — Media Analyst IA de Reset (módulo 4). Compone la síntesis del período desde el
// CONTRATO: Daily Brief (card oscura ancla) con deltas vs. período anterior, Opportunity
// Score (IPC/IMC) y chat sobre la data. Estados diseñados (DESIGN §7).
import { useMemo } from 'react'
import { useData } from '../../data/DataContext'
import { soiComparison, eventsInRange, opportunityScore, deltas as computeDeltas, priorWindow } from '../../data/views'
import { diyIndex } from '../../data/derive'
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
  const { loading, sourceDown, contract, trends, contexto, range } = useData()
  const demo = demoParam()
  const isDown = demo === 'sourcedown' || sourceDown
  const { from, to } = range || {}

  const facts = useMemo(() => {
    if (!contract || !from || !to) return null
    const soi = soiComparison(contract, from, to)
    // Estrenos del período (eppm = alias de tono, para brief/chat). Vacío en fuente caída.
    const events = isDown || demo === 'empty' ? [] : eventsInRange(contract, from, to)
    const newPieces = events.map((e) => ({ ...e, eppm: e.tone }))
    const diy = trends ? diyIndex(trends, []) : null
    const d = computeDeltas(contract, from, to)
    const score = opportunityScore(contract, trends, contexto, from, to)
    const pw = priorWindow(from, to)
    const scorePrev = opportunityScore(contract, trends, contexto, pw.from, pw.to).score
    const scoreObj = { ...score, deltaSemana: score.score - scorePrev }
    const brief = composeBrief({ day: to, soi, newPieces, diy, score: scoreObj, contexto, deltas: d })
    return { day: to, soi, newPieces, diy, score: scoreObj, brief, contexto, deltas: d }
  }, [contract, trends, contexto, from, to, isDown, demo])

  if (demo === 'loading' || (loading && !facts)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (demo === 'nodata' || !facts) {
    return (
      <EmptyState
        title="MAIA — Media Analyst IA de Reset"
        note="Sin datos del período para sintetizar. MAIA lee las fuentes cada mañana a las 6:00 a. m."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MaiaFace state={facts.brief.alerta ? 'alerta' : 'reposo'} size={40} />
        <div>
          <p className="font-display text-xl text-ink sm:text-2xl">MAIA</p>
          <p className="text-sm text-ink-2">Media Analyst IA de Reset · lee las 6 fuentes del día</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <OpportunityScore score={facts.score} day={facts.day} />
        <DailyBrief brief={facts.brief} />
      </div>
      <MaiaChat facts={facts} />
    </div>
  )
}
