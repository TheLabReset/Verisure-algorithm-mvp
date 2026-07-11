// DEMANDA — Google Trends, share of search vs investment e índice de amenaza DIY.
// Cablea la capa de datos (fixtures/live). Cero data hardcodeada.
import { useMemo } from 'react'
import { useData } from '../../data/DataContext'
import { searchVsInvestment, diyIndex } from '../../data/derive'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import SearchVsInvestmentSlope from './SearchVsInvestmentSlope'
import SearchTrend from './SearchTrend'
import DiyThreatGauge from './DiyThreatGauge'

export default function DemandaModule() {
  const { loading, registros, digital, trends } = useData()

  const view = useMemo(() => {
    if (!trends) return null
    return {
      svi: searchVsInvestment(registros, trends),
      diy: diyIndex(trends, digital),
    }
  }, [registros, digital, trends])

  if (loading && !view) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!view) {
    return <EmptyState title="Demanda de categoría" note="Sin datos de Trends disponibles. El monitoreo corre cada mañana a las 6:00 a. m." />
  }

  return (
    <div className="space-y-6">
      <SearchVsInvestmentSlope rows={view.svi} />
      <SearchTrend trends={trends} />
      <DiyThreatGauge diy={view.diy} />
    </div>
  )
}
