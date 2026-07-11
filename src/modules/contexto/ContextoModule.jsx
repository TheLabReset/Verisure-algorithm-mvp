// CONTEXTO — criminalidad (SIDPOL), estacionalidad, macro (BCRP) y prensa.
// Cablea la capa de datos (fixtures/live). Cero data hardcodeada.
import { useData } from '../../data/DataContext'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import CrimeDistricts from './CrimeDistricts'
import Seasonality from './Seasonality'
import MacroRow from './MacroRow'
import NewsList from './NewsList'

export default function ContextoModule() {
  const { loading, contexto, day } = useData()

  if (loading && !contexto) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!contexto) {
    return <EmptyState title="Contexto" note="Sin datos de contexto disponibles. SIDPOL mensual · BCRP diario · prensa 8:00 a. m." />
  }

  return (
    <div className="space-y-6">
      <CrimeDistricts criminalidad={contexto.criminalidad} />
      <Seasonality estacionalidad={contexto.estacionalidad} day={day} />
      <MacroRow macro={contexto.macro} />
      <NewsList noticias={contexto.noticias} />
    </div>
  )
}
