// DEMANDA — Google Trends, share of search vs investment (real, del contrato) e índice de
// amenaza DIY. El share of search viene de Trends (fixture honesto hasta su conector); el
// share of investment es REAL (contrato). Cero data hardcodeada.
import { useMemo } from 'react'
import { useData } from '../../data/DataContext'
import { searchVsInvestment } from '../../data/views'
import { diyIndex } from '../../data/derive'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import SearchVsInvestmentSlope from './SearchVsInvestmentSlope'
import SearchTrend from './SearchTrend'
import DiyThreatGauge from './DiyThreatGauge'

export default function DemandaModule() {
  const { loading, contract, trends, range } = useData()
  const { from, to } = range || {}

  const view = useMemo(() => {
    if (!trends || !contract || !from || !to) return null
    return {
      svi: searchVsInvestment(contract, trends, from, to),
      diy: diyIndex(trends, []),
    }
  }, [contract, trends, from, to])

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
      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <SearchTrend trends={trends} />
        <DiyThreatGauge diy={view.diy} />
      </div>
    </div>
  )
}
