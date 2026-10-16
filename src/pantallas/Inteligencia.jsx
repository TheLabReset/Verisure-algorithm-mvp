// Capa 2 · Inteligencia de mercado: qué mirar (alertas con umbral fijo, la competencia primero), la amenaza de las
// cámaras DIY (Google Trends) y cómo viene la pauta de cada marca en el año. Las marcas de cámaras y la inversión
// mes a mes van en el detalle de su capítulo. No calcula: pinta la vista.
import { useState } from 'react';
import { Bloque, ListaAlertas, Tabla, Grupo, Detalle, vigente } from '../sistema/Componentes.jsx';
import { Lineas, Pendiente, Histograma } from '../sistema/graficos/Graficos.jsx';
import { soles, solesCompacto, mesCorto, numero, fechaCorta } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, alertasDe, buenasDe, sinDato } from './comun.jsx';
import { mesTexto, tramoFechas } from '../textos/comun.js';
import { temporadaLectura, textosMarca, busquedasLectura, marcasDiyLectura, pautaSemanalLectura, queMirarLectura } from '../textos/lecturas.js';
import { CLIENTE } from '../cliente.js';

const GRUPOS = [
  { nivel: 'atencion', titulo: 'Piden atención' },
  { nivel: 'revisar', titulo: 'Para revisar' },
  { nivel: 'oportunidad', titulo: 'Oportunidades' },
  { nivel: 'bien', titulo: 'Lo que va bien' },
];
const MARCAS = [...CLIENTE.competencia.map((c) => c.marcaFuente), CLIENTE.marcaFuente];

const UNIVERSOS_PAUTA = [{ valor: 'atl', texto: 'ATL' }, { valor: 'digital', texto: 'Digital' }, { valor: 'todo', texto: 'Todo' }];

// La pauta semana a semana: un panel por marca (la competencia primero), las dos en la misma escala (una barra más
// alta es más inversión, sin importar de quién). El año va completo; las semanas que caen en el período elegido van
// en el color de cada marca y el resto en gris: si todo va resaltado, nada lo está. La cifra marca la más alta de
// las resaltadas. «Todo» suma ATL y digital solo para ver cuándo se prende la pauta
function PautaSemanal({ pauta, P }) {
  // arranca en ATL: «Todo» suma dos estimaciones distintas y es una vista de apoyo, no la primera
  const [elegido, setUniverso] = useState('atl');
  const opciones = UNIVERSOS_PAUTA.map((o) => ({ ...o, desactivada: !pauta[o.valor] }));
  const universo = vigente(elegido, opciones);
  const filas = pauta[universo] || [];
  const tope = Math.max(1, ...filas.flatMap((f) => f.semanas.map((s) => s.valor ?? 0)));
  const etiquetaSemana = (s, i, todas) => (i === 0 || s.fecha.slice(5, 7) !== todas[i - 1].fecha.slice(5, 7) ? mesCorto(+s.fecha.slice(5, 7)) : '');
  return (
    <Bloque universo={universo === 'todo' ? ['atl', 'digital'] : universo} {...pautaSemanalLectura(filas, universo)} alcance="semanas del año"
      ayuda={<p>Semanas de lunes a domingo. La primera y la última pueden estar incompletas.</p>}
      pie={<span>{universo === 'todo' ? 'Todo suma ATL y digital, que Integrametrics estima con métodos distintos: sirve para ver cuándo se prende la pauta, no para comparar montos.' : 'Inversión semanal estimada por Integrametrics.'}</span>}>
      <div className="q-control q-control-tarjeta"><span>Universo</span><Grupo etiqueta="Universo" valor={universo} onCambiar={setUniverso} opciones={opciones} /></div>
      <ul className="q-leyenda q-leyenda-arriba" aria-hidden="true">
        <li><span className="q-muestra q-muestra-tramo" /><span className="q-muestra q-muestra-propia-cuadro" />{P.desde === P.hasta ? 'La semana' : 'Semanas'} con días {tramoFechas(P.desde, P.hasta)}</li>
        <li><span className="q-muestra q-muestra-resto" />El resto del año</li>
      </ul>
      <div className="q-pauta-semanal">
        {filas.map((f) => (
          <div key={f.id} className="q-pauta-marca">
            <h4>{f.marca}<span>{solesCompacto(f.total)} en el año</span></h4>
            <Histograma etiqueta={`Inversión semanal de ${f.marca}`} tono={f.foco ? undefined : f.propia ? 'propia' : 'resto'} formato={(n) => (n == null ? 'sin registros' : soles(n))} alto={150} max={tope}
              resaltar={f.semanas.map((s, i) => (s.hasta >= P.desde && s.fecha <= P.hasta ? i : -1)).filter((i) => i >= 0)}
              barras={f.semanas.map((s, i, todas) => ({ nombre: `Semana del ${fechaCorta(s.fecha)}${s.parcial ? ' (incompleta)' : ''}`, corto: etiquetaSemana(s, i, todas), valor: s.valor }))} />
          </div>
        ))}
      </div>
    </Bloque>
  );
}

export default function Inteligencia({ capa, vista: v }) {
  const [s21, s22, s23] = capa.secciones;
  const P = v.periodo;
  const todas = [...alertasDe(v), ...buenasDe(v)];
  const t = v.analiza.temporada;
  const b = v.analiza.busquedas;
  const etiquetaMes = (m) => `${mesCorto(+m.mes.slice(5, 7))}${m.parcial ? ' (parcial)' : ''}`;
  const desdeAnioPasado = (serie) => serie.filter((p) => p.fecha >= `${Number(b.hasta.slice(0, 4)) - 1}-01-01`);
  return (
    <MarcoCapa capa={capa} vista={v} conResumen={false}>
      <SeccionDe def={s21} vista={v} conAvisos={false}>
        <Bloque universo="modelo" {...queMirarLectura(v)}
          ayuda={<><p>Cada alerta sale de una regla con un umbral fijo:</p><ul>
            <li>Una pieza nueva o una versión digital nueva de la competencia.</li>
            <li>La competencia sube {v.umbrales.subidaCompetencia} % o más su inversión frente al mes anterior (o al mismo tramo, si el mes está en curso), baja {v.umbrales.bajadaCompetencia} % o más, o se queda sin inversión.</li>
            <li>Un día de la competencia que triplica su mediana de días con inversión.</li>
            <li>Un medio con {v.umbrales.medioNuevo} % o más de la inversión ATL de la competencia, o una zona con sus paneles, que no tenía el mes anterior.</li>
            <li>Las búsquedas de cámaras suben {v.umbrales.subidaDiy} % o más frente a las mismas semanas de un año antes.</li>
            <li>Un cambio de {v.umbrales.caidaShareDigital} puntos o más en el share digital de {CLIENTE.nombre}, o {v.umbrales.dominioAtl} % o más de la inversión ATL.</li>
            <li>Días sin registros de Integrametrics.</li>
          </ul><p>Con menos de {v.umbrales.diasMinimos} días con data en el período no se lee ninguna subida, bajada ni cambio de share: un solo día raro las movería.</p></>}>
          {todas.length ? <ListaAlertas grupos={GRUPOS.map((g) => ({ ...g, items: todas.filter((a) => a.nivel === g.nivel) }))} />
            : <p className="q-nota-bloque">Sin alertas en el período.</p>}
        </Bloque>
      </SeccionDe>

      <SeccionDe def={s22} vista={v}>
        {!b ? <Bloque titulo="Cámaras de seguridad frente a la marca" universo="busquedas" estado={sinDato('no-cargo')} /> : <>
          <Bloque universo="busquedas" {...busquedasLectura(b)} alcance={`semanas al ${fechaCorta(b.hasta)}`}
            ayuda={<p>Google Trends da un índice en Perú, no la cantidad de búsquedas: 100 es la semana con más búsquedas de toda la consulta. Los términos van en una misma consulta, así que se comparan entre sí. «Cámaras de seguridad» suma las dos formas de escribirlo, por eso puede pasar de 100. La comparación es el promedio de las últimas {numero(b.semanas)} semanas completas frente a las mismas semanas de un año antes.</p>}
            pie={<span>Google Trends, Perú · consultado el {fechaCorta(b.consultado)}.</span>}>
            <Lineas etiqueta="Búsquedas semanales de cámaras y de la marca en Google Trends" formato={(n) => numero(n)} alto={260}
              series={b.series.map((s) => ({ nombre: s.nombre, resaltada: false, tono: s.propia ? 'propia' : s.id === 'camaras' ? 'tinta' : undefined, serie: desdeAnioPasado(s.serie) }))} />
          </Bloque>
          <Detalle id={`detalle-${s22.id}`} titulo="Detalle de cámaras DIY" bajada="Google Trends, Perú, por semana." vistas={['las marcas de cámaras que más se buscan']}>
            <Bloque universo="busquedas" {...marcasDiyLectura(b)} alcance={`semanas al ${fechaCorta(b.hasta)}`}
              ayuda={<p>Las cinco marcas van en otra consulta de Google Trends, con su propia escala: no se comparan con la tarjeta de cámaras y marca. Cada línea va del promedio de las mismas semanas de un año antes al de las últimas {numero(b.semanas)}.</p>}
              pie={<span>Índice promedio de 0 a 100 · {b.antesDesde ? `${fechaCorta(b.antesDesde)} a ${fechaCorta(b.antesHasta)} frente a ` : ''}{fechaCorta(b.desde)} a {fechaCorta(b.hasta)}.</span>}>
              {!b.marcas.some((m) => m.antes != null) ? <p className="q-nota-bloque">Google Trends todavía no tiene un año de historia para comparar estas semanas.</p> : <Pendiente etiqueta="Búsquedas de marcas de cámaras, un año antes y ahora" formato={(n) => numero(Math.round(n))} rotuloA="Un año antes" rotuloB="Ahora"
                resaltar={b.marcas.slice(0, 1).map((m) => m.nombre)} filas={b.marcas.filter((m) => m.antes != null).map((m) => ({ nombre: m.nombre, a: m.antes, b: m.ahora }))} />}
            </Bloque>
          </Detalle>
        </>}
      </SeccionDe>

      <SeccionDe def={s23} vista={v}>
        {!Object.keys(v.analiza.pautaSemanal).length ? <Bloque titulo="La pauta del año, semana a semana" universo="atl" estado={sinDato('no-cargo')} /> : <PautaSemanal pauta={v.analiza.pautaSemanal} P={P} />}
        <Detalle id={`detalle-${s23.id}`} titulo="Detalle de la pauta del año" bajada="Inversión estimada por Integrametrics, mes a mes." vistas={['la inversión de cada mes, por marca y universo']}>
          <Bloque universo={['atl', 'digital']} {...temporadaLectura(t)} alcance="todos los meses con data"
            ayuda={<p>El mes en curso va con los días que tienen data.</p>}
            pie={<span>Integrametrics tiene data desde {t.length ? mesTexto(t[0].mes) : 'este mes'}.</span>}>
            <Tabla etiqueta="Inversión por mes, marca y universo" numericas={[1, 2, 3, 4]} destacada={t.findIndex((m) => m.mes === P.mes)}
              columnas={['Mes', ...MARCAS.map((m) => `ATL ${textosMarca.nombreMarca(m)}`), ...MARCAS.map((m) => `Digital ${textosMarca.nombreMarca(m)}`)]}
              filas={t.map((m) => [etiquetaMes(m), ...MARCAS.map((x) => soles(m.atl[x])), ...MARCAS.map((x) => soles(m.digital[x]))])} />
          </Bloque>
        </Detalle>
      </SeccionDe>
    </MarcoCapa>
  );
}
