// Catálogo de estados de Quincha: un solo lugar donde cada estado del panel tiene su tono y su icono. La palabra que
// se lee vive en src/textos (aquí solo va el nombre interno). Un estado nuevo se agrega aquí, nunca en una pantalla:
// así una pastilla «costosa» se ve igual en cualquier tabla y en cualquier cliente. Guía: docs/guia-rapida.md.
import { CircleCheck, TriangleAlert, CloudOff, FlaskConical, ArrowUp, BatteryLow, Hourglass, CircleDashed, Eye, TrendingUp, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

// Los tonos: el color que toma una etiqueta. Cada uno sale de un token semántico (componentes.css, «Etiqueta»)
//  · neutro: sin juicio · fuerte: dato principal · bien: favorable · atencion: dato parcial o para revisar
//  · alerta: desfavorable, sin urgencia · grave: desfavorable y urgente · barra: sobre la barra oscura
//  · ejemplo: data de ejemplo de una fuente por conectar (borde punteado)
export const TONOS = ['neutro', 'fuerte', 'bien', 'atencion', 'alerta', 'grave', 'barra', 'ejemplo'];

export const ESTADOS = {
  // fuentes de data (chips de la cabecera y del capítulo) y el sello de la data de ejemplo
  'fuente-ok': { tono: 'neutro', icono: CircleCheck },
  'fuente-parcial': { tono: 'atencion', icono: TriangleAlert },
  'fuente-no-cargo': { tono: 'atencion', icono: CloudOff },
  'fuente-ejemplo': { tono: 'ejemplo', icono: FlaskConical },
  // niveles de una alerta (Qué mirar y los avisos de cada tarjeta)
  'nivel-atencion': { tono: 'grave', icono: TriangleAlert },
  'nivel-revisar': { tono: 'atencion', icono: Eye },
  'nivel-oportunidad': { tono: 'bien', icono: TrendingUp },
  'nivel-bien': { tono: 'bien', icono: CircleCheck },
  // frente al objetivo (semáforo), con los colores de los niveles
  'objetivo-bien': { tono: 'bien', icono: CircleCheck },
  'objetivo-cerca': { tono: 'atencion', icono: Eye },
  'objetivo-lejos': { tono: 'grave', icono: TriangleAlert },
  // el tono de un tema de la conversación
  'tono-muy-positivo': { tono: 'bien', icono: ThumbsUp },
  'tono-positivo': { tono: 'bien', icono: ThumbsUp },
  'tono-neutro': { tono: 'neutro', icono: Minus },
  'tono-negativo': { tono: 'alerta', icono: ThumbsDown },
  'tono-muy-negativo': { tono: 'alerta', icono: ThumbsDown },
  // piezas y campañas (con juicio, en pastilla llena)
  'sin-leads': { tono: 'grave', icono: TriangleAlert },
  costosa: { tono: 'alerta', icono: ArrowUp },
  saturada: { tono: 'atencion', icono: BatteryLow },
  rinde: { tono: 'bien', icono: CircleCheck },
  aprendizaje: { tono: 'neutro', icono: Hourglass },
  'poca-data': { tono: 'neutro', icono: CircleDashed },
};

export const estadoDe = (nombre) => {
  const e = ESTADOS[nombre];
  if (!e) throw new Error(`estado sin catálogo: «${nombre}» (se agrega en src/sistema/estados.js)`);
  return e;
};
