// Capa 2 · Inteligencia de mercado: qué mirar en el período (alertas con umbral fijo) y cómo viene el año.
// No calcula: pinta la vista. Sin índice de oportunidad: sus componentes (búsquedas, criminalidad) aún no tienen fuente.
import { Bloque, ListaAlertas, Tabla } from '../sistema/Componentes.jsx';
import { Columnas } from '../sistema/graficos/Graficos.jsx';
import { soles, solesCompacto, mesCorto } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, alertasDe, buenasDe } from './comun.jsx';
import { periodoTexto } from '../textos/comun.js';
import { temporadaLectura, textosMarca } from '../textos/lecturas.js';
import { CLIENTE } from '../cliente.js';

const GRUPOS = [
  { nivel: 'atencion', titulo: 'Piden atención' },
  { nivel: 'revisar', titulo: 'Para revisar' },
  { nivel: 'oportunidad', titulo: 'Oportunidades' },
  { nivel: 'bien', titulo: 'Lo que va bien' },
];
const MARCAS = [CLIENTE.marcaFuente, ...CLIENTE.competencia.map((c) => c.marcaFuente)];

export default function Inteligencia({ capa, vista: v }) {
  const [s21, s22] = capa.secciones;
  const P = v.periodo;
  const todas = [...alertasDe(v), ...buenasDe(v)];
  const t = v.analiza.temporada;
  const etiquetaMes = (m) => `${mesCorto(+m.mes.slice(5, 7))}${m.parcial ? ' (parcial)' : ''}`;
  return (
    <MarcoCapa capa={capa} vista={v} conResumen={false}>
      <SeccionDe def={s21} vista={v} conAvisos={false}>
        <Bloque universo="modelo" titulo="Qué mirar" lectura={todas.length ? `Lo que cambió en ${periodoTexto(P)}, ordenado por lo que pide más atención. Cada fila se abre con su dato.` : `Ninguna regla se activó en ${periodoTexto(P)}.`}
          ayuda={<><p>Cada alerta sale de una regla con un umbral fijo:</p><ul>
            <li>Una pieza nueva de la competencia.</li>
            <li>Un día de la competencia que triplica su mediana de días con inversión.</li>
            <li>Un medio con inversión de la competencia que no tenía en la comparación.</li>
            <li>Un cambio de {v.umbrales.caidaShareDigital} puntos o más en el share digital de {CLIENTE.nombre}.</li>
            <li>Días sin registros de Integrametrics.</li>
          </ul></>}>
          {todas.length ? <ListaAlertas grupos={GRUPOS.map((g) => ({ ...g, items: todas.filter((a) => a.nivel === g.nivel) }))} />
            : <p className="q-nota-bloque">Sin alertas en el período.</p>}
        </Bloque>
      </SeccionDe>

      <SeccionDe def={s22} vista={v}>
        <Bloque universo={['atl', 'digital']} {...temporadaLectura(t)} alcance="todos los meses con data"
          ayuda={<p>Inversión estimada de cada mes. ATL y digital se miden distinto: van en columnas separadas, cada una con su escala.</p>}
          pie={<span>Integrametrics tiene data desde enero de 2026. El mes en curso va con los días que tienen data.</span>}>
          <Columnas etiqueta={`Inversión de ${CLIENTE.nombre} por mes, ATL y digital`} tituloA={`ATL de ${CLIENTE.nombre}`} tituloB={`Digital de ${CLIENTE.nombre}`} formatoA={solesCompacto} formatoB={solesCompacto}
            filas={t.map((m) => ({ nombre: etiquetaMes(m), a: m.atl[CLIENTE.marcaFuente], b: m.digital[CLIENTE.marcaFuente], resaltarA: m.mes === P.mes, resaltarB: m.mes === P.mes }))} />
          <Tabla etiqueta="Inversión por mes, marca y universo" numericas={[1, 2, 3, 4]} destacada={t.findIndex((m) => m.mes === P.mes)}
            columnas={['Mes', ...MARCAS.map((m) => `ATL ${textosMarca.nombreMarca(m)}`), ...MARCAS.map((m) => `Digital ${textosMarca.nombreMarca(m)}`)]}
            filas={t.map((m) => [etiquetaMes(m), ...MARCAS.map((x) => soles(m.atl[x])), ...MARCAS.map((x) => soles(m.digital[x]))])} />
        </Bloque>
      </SeccionDe>
    </MarcoCapa>
  );
}
