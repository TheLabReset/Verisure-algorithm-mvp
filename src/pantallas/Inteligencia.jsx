// Capa 2 · Inteligencia de mercado: qué mirar (alertas con umbral fijo, la competencia primero), la amenaza de las
// cámaras DIY (Google Trends) y cómo viene la pauta de cada marca en el año. No calcula: pinta la vista.
import { useState } from 'react';
import { Bloque, ListaAlertas, Tabla, Grupo } from '../sistema/Componentes.jsx';
import { Lineas, Pendiente, Histograma } from '../sistema/graficos/Graficos.jsx';
import { soles, solesCompacto, mesCorto, numero, fechaCorta } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, alertasDe, buenasDe, sinDato } from './comun.jsx';
import { periodoTexto } from '../textos/comun.js';
import { temporadaLectura, textosMarca, busquedasLectura, marcasDiyLectura, pautaSemanalLectura } from '../textos/lecturas.js';
import { CLIENTE } from '../cliente.js';

const GRUPOS = [
  { nivel: 'atencion', titulo: 'Piden atención' },
  { nivel: 'revisar', titulo: 'Para revisar' },
  { nivel: 'oportunidad', titulo: 'Oportunidades' },
  { nivel: 'bien', titulo: 'Lo que va bien' },
];
const MARCAS = [...CLIENTE.competencia.map((c) => c.marcaFuente), CLIENTE.marcaFuente];
const POR_CONECTAR = [
  { titulo: 'Precios de cámaras en marketplaces', detalle: 'Mercado Libre, Falabella y Sodimac: cuánto cuesta una cámara frente a la cuota mensual de una alarma. La API de Mercado Libre pide credenciales de aplicación.' },
  { titulo: 'Anuncios de marcas de cámaras', detalle: 'Meta Ad Library: qué piezas tienen al aire Ezviz, Xiaomi o Tapo. Pide un token de acceso verificado.' },
  { titulo: 'Retail que pauta cámaras', detalle: 'Integrametrics: las versiones de tiendas que nombran cámaras de seguridad. Pide bajar la categoría completa, no solo seguridad.' },
];

const UNIVERSOS_PAUTA = [{ valor: 'atl', texto: 'ATL' }, { valor: 'digital', texto: 'Digital' }, { valor: 'todo', texto: 'Todo' }];

// La pauta semana a semana: un panel por marca (la competencia primero), cada uno con su escala, y las semanas del
// período elegido resaltadas. «Todo» suma ATL y digital solo para ver cuándo se prende la pauta
function PautaSemanal({ pauta, P }) {
  const [universo, setUniverso] = useState(pauta.digital ? 'todo' : Object.keys(pauta)[0]);
  const filas = pauta[universo] || [];
  const opciones = UNIVERSOS_PAUTA.map((o) => ({ ...o, desactivada: !pauta[o.valor] }));
  const etiquetaSemana = (s, i, todas) => (i === 0 || s.fecha.slice(5, 7) !== todas[i - 1].fecha.slice(5, 7) ? mesCorto(+s.fecha.slice(5, 7)) : '');
  return (
    <Bloque universo={universo === 'todo' ? ['atl', 'digital'] : universo} {...pautaSemanalLectura(filas, universo)} alcance="semanas del año"
      ayuda={<p>Cada columna es una semana de siete días. Cada marca tiene su propia escala: se lee cuándo se prende y se apaga su pauta, no cuánto pone una frente a la otra (para eso está el share, en Rendimiento). En oscuro, las semanas del período elegido.</p>}
      pie={<span>{universo === 'todo' ? 'Todo suma ATL y digital, que Integrametrics estima con métodos distintos: sirve para ver cuándo se prende la pauta, no para comparar montos.' : 'Inversión semanal estimada por Integrametrics.'}</span>}>
      <div className="q-control q-control-tarjeta"><span>Universo</span><Grupo etiqueta="Universo" valor={universo} onCambiar={setUniverso} opciones={opciones} /></div>
      <div className="q-pauta-semanal">
        {filas.map((f) => (
          <div key={f.id} className="q-pauta-marca">
            <h4>{f.marca}<span>{solesCompacto(f.total)} en el año</span></h4>
            <Histograma etiqueta={`Inversión semanal de ${f.marca}`} tono={f.foco ? undefined : f.propia ? 'propia' : 'resto'} formato={(n) => (n == null ? 'sin registros' : soles(n))} alto={150}
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
        <Bloque universo="modelo" titulo="Qué mirar" lectura={todas.length ? `Lo que cambió en ${periodoTexto(P)}, con lo de la competencia primero. Cada fila se abre con su dato.` : `Ninguna regla se activó en ${periodoTexto(P)}.`}
          ayuda={<><p>Cada alerta sale de una regla con un umbral fijo:</p><ul>
            <li>Una pieza nueva o una versión digital nueva de la competencia.</li>
            <li>La competencia sube {v.umbrales.subidaCompetencia} % o más su inversión frente a la comparación.</li>
            <li>Un día de la competencia que triplica su mediana de días con inversión.</li>
            <li>Un medio o una zona con paneles de la competencia que no tenía en la comparación.</li>
            <li>Las búsquedas de cámaras suben {v.umbrales.subidaDiy} % o más frente a las mismas semanas de un año antes.</li>
            <li>Un cambio de {v.umbrales.caidaShareDigital} puntos o más en el share digital de {CLIENTE.nombre}.</li>
            <li>Días sin registros de Integrametrics.</li>
          </ul></>}>
          {todas.length ? <ListaAlertas grupos={GRUPOS.map((g) => ({ ...g, items: todas.filter((a) => a.nivel === g.nivel) }))} />
            : <p className="q-nota-bloque">Sin alertas en el período.</p>}
        </Bloque>
      </SeccionDe>

      <SeccionDe def={s22} vista={v}>
        {!b ? <Bloque titulo="Cámaras de seguridad frente a la marca" universo="busquedas" estado={sinDato('no-cargo')} /> : <>
          <Bloque universo="busquedas" {...busquedasLectura(b)} alcance={`semanas al ${fechaCorta(b.hasta)}`}
            ayuda={<p>Google Trends da un índice de 0 a 100 en Perú, no la cantidad de búsquedas. Los tres términos van en una misma consulta, así que se comparan entre sí. «Cámaras de seguridad» junta las dos formas de escribirlo. La comparación es el promedio de las últimas {numero(b.semanas)} semanas completas frente a las mismas semanas de un año antes.</p>}
            pie={<span>Google Trends, Perú, por semana · consultado el {fechaCorta(b.consultado)}. No sigue el mes elegido: Trends va al día.</span>}>
            <Lineas etiqueta="Búsquedas semanales de cámaras y de la marca en Google Trends" formato={(n) => numero(n)} alto={260}
              series={b.series.map((s) => ({ nombre: s.nombre, resaltada: s.id === 'camaras', tono: s.propia ? 'propia' : undefined, serie: desdeAnioPasado(s.serie) }))} />
          </Bloque>
          <Bloque universo="busquedas" ancho="mitad" {...marcasDiyLectura(b)} alcance={`semanas al ${fechaCorta(b.hasta)}`}
            ayuda={<p>Las cinco marcas van en otra consulta de Google Trends, con su propia escala: no se comparan con la tarjeta de al lado. Cada línea une el promedio de las mismas semanas de un año antes con el de las últimas {numero(b.semanas)}.</p>}
            pie={<span>Índice promedio de 0 a 100 · {fechaCorta(b.antesDesde)} a {fechaCorta(b.antesHasta)} frente a {fechaCorta(b.desde)} a {fechaCorta(b.hasta)}.</span>}>
            <Pendiente etiqueta="Búsquedas de marcas de cámaras, un año antes y ahora" formato={(n) => numero(Math.round(n))} rotuloA="Un año antes" rotuloB="Ahora"
              resaltar={b.marcas.slice(0, 1).map((m) => m.nombre)} filas={b.marcas.filter((m) => m.antes != null).map((m) => ({ nombre: m.nombre, a: m.antes, b: m.ahora }))} />
          </Bloque>
          <Bloque universo="busquedas" ancho="mitad" ventana={false} titulo="Lo que falta conectar" lectura="Las búsquedas dicen cuánto interés hay; el precio y la pauta de las cámaras dirían cuánta presión hacen. Estas fuentes suman al capítulo cuando se conecten."
            pie={<span>Se activan a pedido; ninguna toca data de {CLIENTE.nombre}.</span>}>
            <ul className="q-por-conectar">{POR_CONECTAR.map((x) => <li key={x.titulo}><b>{x.titulo}</b><span>{x.detalle}</span></li>)}</ul>
          </Bloque>
        </>}
      </SeccionDe>

      <SeccionDe def={s23} vista={v}>
        {!Object.keys(v.analiza.pautaSemanal).length ? <Bloque titulo="La pauta del año, semana a semana" universo="atl" estado={sinDato('no-cargo')} /> : <PautaSemanal pauta={v.analiza.pautaSemanal} P={P} />}
        <Bloque universo={['atl', 'digital']} {...temporadaLectura(t)} alcance="todos los meses con data"
          ayuda={<p>Inversión estimada de cada mes, por marca y universo. El mes en curso va con los días que tienen data.</p>}
          pie={<span>Integrametrics tiene data desde enero de 2026.</span>}>
          <Tabla etiqueta="Inversión por mes, marca y universo" numericas={[1, 2, 3, 4]} destacada={t.findIndex((m) => m.mes === P.mes)}
            columnas={['Mes', ...MARCAS.map((m) => `ATL ${textosMarca.nombreMarca(m)}`), ...MARCAS.map((m) => `Digital ${textosMarca.nombreMarca(m)}`)]}
            filas={t.map((m) => [etiquetaMes(m), ...MARCAS.map((x) => soles(m.atl[x])), ...MARCAS.map((x) => soles(m.digital[x]))])} />
        </Bloque>
      </SeccionDe>
    </MarcoCapa>
  );
}
