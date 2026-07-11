// RADAR — Integrametrics + ad libraries (el corazón del producto).
// Fase 0: placeholder. Componentes reales (jugada del día, SOI, timeline,
// Ad Museum, mapa OOH) se construyen en Fase 2 sobre la capa de datos (Fase 1).
import EmptyState from '../../components/ui/EmptyState'

export default function RadarModule() {
  return (
    <EmptyState
      title="Radar de competencia"
      note="Qué emitió Prosegur, Securitas y la categoría hoy, con inversión estimada y piezas nuevas. Se cablea a la capa de datos en la Fase 2."
    />
  )
}
