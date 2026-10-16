// Capa 4 · Históricos: cómo viene el share de la competencia (digital primero), cómo se movió la pauta de cada marca
// en el año y qué versiones tuvo. El share sigue al período elegido; el año va completo, con las semanas del período
// resaltadas. En el detalle: las cifras en soles, la inversión día por día, mes a mes y los estrenos.
// No calcula: pinta la vista.
import { useState } from 'react';
import { Play, AudioLines, Image as ImagenIcono } from 'lucide-react';
import { Bloque, Tabla, Resumen, Grupo, Detalle, VentanaAnuncios, Ventana, vigente } from '../sistema/Componentes.jsx';
import { Reparto, Lineas, Histograma, Cronograma } from '../sistema/graficos/Graficos.jsx';
import { numero, porcentaje, soles, solesCompacto, compacto, mesCorto, fechaCorta } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato, avisosDe } from './comun.jsx';
import { periodoTexto, comparacionTexto, puntosFrente, capital, plataformasTexto, mesPeriodo, mesComparacion, resumenTitulo, mesTexto, tramoFechas, tramoMeses, version, ventanaTexto } from '../textos/comun.js';
import { diasEntre, DIAS_MINIMOS } from '../calculo/periodo.js';
import { atlLectura, digitalLectura, shareLectura, presionLectura, shareSemanalLectura, pautaSemanalLectura, temporadaLectura, textosMarca, cronogramaLectura, estrenosLectura, estrenoTitulo, estrenoDato, textosDelAbanico } from '../textos/lecturas.js';
import { CLIENTE } from '../cliente.js';

const ICONO = { video: Play, audio: AudioLines, image: ImagenIcono };
const COMPETENCIA = CLIENTE.competencia[0];
const MARCAS = [...CLIENTE.competencia.map((c) => c.marcaFuente), CLIENTE.marcaFuente];
const UNIVERSOS_PAUTA = [{ valor: 'atl', texto: 'ATL' }, { valor: 'digital', texto: 'Digital' }, { valor: 'todo', texto: 'Todo' }];
const MAX_ESTRENOS = 3; // estrenos de la competencia a la vista; el resto, en el detalle

// Una pieza suelta en la ventana de anuncios: para un estreno o una fila del cronograma
const unaPieza = (nombre, x) => ({ nombre, anuncios: [{ id: x.id, titulo: x.titulo, texto: '', pie: '', plataformas: x.plataformas, desde: x.desde, hasta: x.hasta, activo: true, enlace: null, imagen: x.asset?.kind === 'image' ? x.asset.url : null, medio: x.asset && x.asset.kind !== 'image' ? x.asset : null, formato: null, arte: null }] });

// Las piezas que se estrenaron: una fila por estreno, la competencia primero; «Ver la pieza» la abre
function Estrenos({ lista, t }) {
  const [abierta, setAbierta] = useState(null);
  const e = lista.find((x) => x.id === abierta);
  const grupo = e ? unaPieza(e.nombre, { id: e.id, titulo: e.version, plataformas: [e.canal, e.franja && `franja ${e.franja.toLowerCase()}`].filter(Boolean), desde: e.fecha.slice(0, 10), asset: e.asset }) : null;
  const orden = [...lista].sort((a, b) => Number(a.propia) - Number(b.propia));
  return (
    <>
      <ol className="q-estrenos">
        {orden.map((x) => {
          const I = ICONO[x.asset?.kind];
          return (
            <li key={x.id} className={x.propia ? 'q-estreno-propio' : 'q-estreno-foco'}>
              <span className="q-estreno-marca">{x.nombre}</span>
              <span className="q-estreno-cuerpo"><b>{estrenoTitulo(x)}</b><span>{estrenoDato(x)}</span></span>
              {x.asset && <button type="button" className="q-boton q-boton-quieto" data-ver-estreno={x.id} aria-haspopup="dialog" onClick={() => setAbierta(x.id)}>{I && <I size={14} aria-hidden="true" />}Ver la pieza</button>}
            </li>
          );
        })}
      </ol>
      <VentanaAnuncios grupo={grupo} onCerrar={() => setAbierta(null)} t={{ ...t, bajada: () => 'Estreno del período' }}
        volver={() => document.querySelector(`[data-ver-estreno="${window.CSS.escape(abierta ?? '')}"]`)?.focus()} />
    </>
  );
}

// La pauta semana a semana: un panel por marca (la competencia primero), las dos en la misma escala (una barra más
// alta es más inversión, sin importar de quién). El año va completo; las semanas que caen en el período elegido van
// en el color de cada marca y el resto en gris: si todo va resaltado, nada lo está. «Todo» suma ATL y digital solo
// para ver cuándo se prende la pauta
function PautaSemanal({ pauta, P }) {
  // arranca en digital: es lo que más sigue el equipo de la marca; «Todo» suma dos estimaciones distintas
  const [elegido, setUniverso] = useState('digital');
  const opciones = UNIVERSOS_PAUTA.map((o) => ({ ...o, desactivada: !pauta[o.valor] }));
  const universo = vigente(elegido, opciones);
  const filas = pauta[universo] || [];
  const tope = Math.max(1, ...filas.flatMap((f) => f.semanas.map((s) => s.valor ?? 0)));
  const etiquetaSemana = (s, i, todas) => (i === 0 || s.fecha.slice(5, 7) !== todas[i - 1].fecha.slice(5, 7) ? mesCorto(+s.fecha.slice(5, 7)) : '');
  return (
    <Bloque universo={universo === 'todo' ? ['atl', 'digital'] : universo} {...pautaSemanalLectura(filas, universo)} alcance="semanas del año"
      ayuda={<p>Semanas de lunes a domingo; la primera empieza el día que empieza la data y la última puede estar en curso. La altura sigue a la raíz cuadrada de la inversión, con un mismo tope para las dos marcas: las semanas chicas se ven y la barra más alta siempre es la de más inversión.</p>}
      pie={<span>{universo === 'todo' ? 'Todo suma ATL y digital, que Integrametrics estima con métodos distintos: sirve para ver cuándo se prende la pauta, no para comparar montos.' : 'Inversión semanal estimada por Integrametrics.'}</span>}>
      <div className="q-control q-control-tarjeta"><span>Universo</span><Grupo etiqueta="Universo" valor={universo} onCambiar={setUniverso} opciones={opciones} /></div>
      <ul className="q-leyenda q-leyenda-arriba" aria-hidden="true">
        <li><span className="q-muestra q-muestra-tramo" /><span className="q-muestra q-muestra-propia-cuadro" />{P.desde === P.hasta ? `La semana que incluye ${tramoFechas(P.desde, P.hasta)}` : `Semanas con días ${tramoFechas(P.desde, P.hasta)}`}</li>
        <li><span className="q-muestra q-muestra-resto" />El resto del año</li>
      </ul>
      <div className="q-pauta-semanal">
        {filas.map((f) => (
          <div key={f.id} className="q-pauta-marca">
            <h4>{f.marca}<span>{solesCompacto(f.total)} en el año</span></h4>
            <Histograma etiqueta={`Inversión semanal de ${f.marca}`} tono={f.foco ? undefined : f.propia ? 'propia' : 'resto'} formato={(n) => (n == null ? 'sin registros' : soles(n))} alto={150} max={tope} escala="raiz"
              resaltar={f.semanas.map((s, i) => (s.hasta >= P.desde && s.fecha <= P.hasta ? i : -1)).filter((i) => i >= 0)}
              barras={f.semanas.map((s, i, todas) => ({ nombre: !s.parcial ? `Semana del ${fechaCorta(s.fecha)}` : i === todas.length - 1 ? `Semana del ${fechaCorta(s.fecha)} (en curso)` : `Del ${fechaCorta(s.fecha)} al ${fechaCorta(s.hasta)}`, corto: etiquetaSemana(s, i, todas), valor: s.valor }))} />
          </div>
        ))}
      </div>
    </Bloque>
  );
}

const pts = (n) => (n == null ? 'sin comparación' : n === 0 ? 'igual' : `${n > 0 ? '+' : '−'}${numero(Math.abs(n))} pts`);

// Con menos días que el mínimo no se lee el cambio de share, igual que en las lecturas y las alertas
function TablaShare({ u, P, etiqueta, conImpresiones }) {
  const orden = [...u.marcas].sort((a, b) => Number(a.propia) - Number(b.propia));
  const corto = diasEntre(P.desde, P.hasta) + 1 < DIAS_MINIMOS;
  return (
    <Tabla etiqueta={etiqueta} numericas={conImpresiones ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]} destacada={orden.findIndex((m) => m.foco)}
      columnas={['Marca', 'Inversión estimada', ...(conImpresiones ? ['Impresiones'] : []), 'Share', 'Share antes', 'Cambio']}
      filas={orden.map((m) => [m.nombre, soles(m.inversion), ...(conImpresiones ? [compacto(m.impresiones)] : []), porcentaje(m.share), m.sharePrevio == null ? 'sin dato' : porcentaje(m.sharePrevio),
        corto ? 'sin comparación' : { texto: pts(m.cambioPts), tono: !m.foco || !m.cambioPts ? null : m.cambioPts > 0 ? 'empeora' : 'mejora' }])} />
  );
}

// Share antes y ahora, por marca: la competencia arriba; la comparación en gris, el período en el color de cada marca
// El reparto del universo entre la competencia y la marca propia: este período y, debajo, la comparación
function ShareMarcas({ u, etiqueta, rotuloAhora, rotuloA, conAntes }) {
  const orden = [...u.marcas].sort((a, b) => Number(a.propia) - Number(b.propia));
  const parte = (m, k) => ({ nombre: m.nombre, valor: m[k], clase: m.propia ? 'q-parte-propia' : 'q-parte-foco', claseAntes: m.propia ? 'q-parte-propia-antes' : 'q-parte-foco-antes' });
  const formato = (n) => (n == null ? 'sin dato' : n > 0 && n < 1 ? 'menos de 1 %' : porcentaje(n));
  return <Reparto etiqueta={etiqueta} formato={formato} ahora={orden.map((m) => parte(m, 'share'))}
    antes={conAntes && orden.every((m) => m.sharePrevio != null) ? orden.map((m) => parte(m, 'sharePrevio')) : null} rotuloAhora={rotuloAhora} rotuloAntes={rotuloA} />;
}

export default function Rendimiento({ capa, vista: v }) {
  const [s41, s42, s43] = capa.secciones;
  const P = v.periodo, atl = v.lee.atl, dig = v.lee.digital;
  // ATL primero: las alertas que llevan al día por día (un pico, un día sin registros) son de ATL
  const [elegidoDiario, setDiario] = useState('atl');
  const opcionesDiario = [{ valor: 'atl', texto: 'ATL', desactivada: atl.estado !== 'ok' }, { valor: 'digital', texto: 'Digital', desactivada: dig.estado !== 'ok' }];
  const diario = vigente(elegidoDiario, opcionesDiario);
  const ok = (x) => x.estado === 'ok';
  const rival = (u) => u.marcas.find((m) => m.foco);
  const rivalId = COMPETENCIA.marcaFuente;
  const comparacion = comparacionTexto(P);
  const rotuloA = mesComparacion(P), rotuloAhora = mesPeriodo(P);
  const corto = !comparacion || diasEntre(P.desde, P.hasta) + 1 < DIAS_MINIMOS; // sin la barra de antes, como las lecturas
  const s = v.analiza.shareSemanal;
  const t = v.analiza.temporada;
  const etiquetaMes = (m) => `${mesCorto(+m.mes.slice(5, 7))}${m.parcial ? ' (parcial)' : ''}`;
  const [version_, setVersion] = useState(null);
  const tVersiones = textosDelAbanico(P.desde.slice(0, 4));
  const c = v.lee.cronograma;
  const filaCrono = c?.filas.find((f) => f.id === version_);
  const grupoCrono = filaCrono ? unaPieza(COMPETENCIA.nombre, { id: filaCrono.id, titulo: filaCrono.version, plataformas: filaCrono.canales, desde: filaCrono.desde, hasta: filaCrono.hasta, asset: filaCrono.asset }) : null;
  const estrenosComp = (v.lee.estrenos || []).filter((e) => !e.propia).length;
  const nuevas = new Set((v.lee.estrenos || []).filter((e) => !e.propia).map((e) => e.version));
  const estrenos = v.lee.estrenos ? estrenosLectura(v) : null;
  const inicio = v.analiza.pauta[0]?.serie[0]?.fecha ?? P.desde;
  const u = v.lee[diario];
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={resumenTitulo(P)}
        pie={<span>Inversión estimada por Integrametrics a precio de tarifa.</span>}
        items={[
          { rotulo: `Share digital de ${s.marca}`, universo: 'digital', ir: s41.id, irTexto: s41.titulo, valor: ok(dig) ? porcentaje(rival(dig).share) : null, nota: ok(dig) ? capital(puntosFrente(rival(dig).cambioPts, P) || `de ${solesCompacto(dig.total)} en total`) : null },
          { rotulo: `Inversión digital de ${s.marca}`, universo: 'digital', ir: s41.id, irTexto: s41.titulo, valor: ok(dig) ? solesCompacto(rival(dig).inversion) : null, nota: ok(dig) ? `${compacto(rival(dig).impresiones)} impresiones` : null },
          { rotulo: `Share ATL de ${s.marca}`, universo: 'atl', ir: s41.id, irTexto: s41.titulo, valor: ok(atl) ? porcentaje(rival(atl).share) : null, nota: ok(atl) ? capital(puntosFrente(rival(atl).cambioPts, P) || `de ${solesCompacto(atl.total)} en total`) : null },
          { rotulo: `Inversión ATL de ${s.marca}`, universo: 'atl', ir: s41.id, irTexto: s41.titulo, valor: ok(atl) ? solesCompacto(rival(atl).inversion) : null, nota: v.lee.mediosDelPeriodo?.[rivalId] ? `${numero(v.lee.mediosDelPeriodo[rivalId].emisiones)} ${v.lee.mediosDelPeriodo[rivalId].emisiones === 1 ? 'emisión' : 'emisiones'} al aire` : null },
        ]} />

      <SeccionDe def={s41} vista={v}>
        {!ok(dig) && !ok(atl) ? <Bloque titulo="Share of investment" universo={['digital', 'atl']} estado={sinDato(dig.estado)} /> : (
          <Bloque universo={[...(ok(dig) ? ['digital'] : []), ...(ok(atl) ? ['atl'] : [])]} {...shareLectura(v)} avisos={avisosDe(v, 'share')}
            ayuda={<p>Share of investment: la parte de la inversión de la categoría que pone cada marca. Digital son las redes, Google Search, YouTube y los sitios que mide Integrametrics; ATL es TV abierta, cable, radio, OTT y vía pública. Integrametrics estima cada uno con un método distinto, por eso no se suman.</p>}
            pie={<span>Inversión estimada por Integrametrics a precio de tarifa.</span>}>
            <div className="q-share-universos">
              {[['Digital', dig], ['ATL', atl]].map(([n, x]) => (
                <div key={n} className="q-pauta-marca">
                  <h4>{n}{!ok(x) && <span>no cargó</span>}</h4>
                  {ok(x) ? <ShareMarcas u={x} etiqueta={`Share de la inversión ${n === 'ATL' ? 'ATL' : 'digital'} por marca, antes y ahora`} rotuloAhora={rotuloAhora} rotuloA={rotuloA} conAntes={!corto} />
                    : <p className="q-nota-bloque">Integrametrics {n === 'ATL' ? 'ATL' : 'digital'} no cargó: este universo no se muestra.</p>}
                </div>
              ))}
            </div>
          </Bloque>
        )}
        {(s.atl || s.digital) && (
          <Bloque universo={['atl', 'digital']} {...shareSemanalLectura(s)} alcance="semanas del año"
            ayuda={<p>La parte de la inversión de cada semana (lunes a domingo) que pone {s.marca}, en ATL y en digital, cada una sobre su propio universo. La primera semana empieza el día que empieza la data y la última puede estar en curso.</p>}
            pie={<span>Inversión estimada por Integrametrics.</span>}>
            <Lineas etiqueta={`Share semanal de ${s.marca}, ATL y digital`} formato={(n) => porcentaje(n)} alto={240}
              series={[...(s.digital ? [{ nombre: 'Digital', resaltada: true, serie: s.digital }] : []), ...(s.atl ? [{ nombre: 'ATL', resaltada: true, discontinua: true, serie: s.atl }] : [])]} />
          </Bloque>
        )}
        {(ok(dig) || ok(atl)) && (
          <Detalle id={`detalle-${s41.id}`} titulo="Detalle de cómo viene el período" bajada={`Integrametrics, ${periodoTexto(P)}.`} vistas={['la inversión y el share en soles', 'la inversión día por día']}>
            {ok(dig) && (
              <Bloque universo="digital" {...digitalLectura(v)} pie={<span>{capital(plataformasTexto(dig.plataformas || []) || 'Plataformas digitales')}.</span>}>
                <TablaShare u={dig} P={P} etiqueta="Inversión, impresiones y share digital por marca" conImpresiones />
              </Bloque>
            )}
            {ok(atl) && (
              <Bloque universo="atl" {...atlLectura(v)} pie={<span>TV abierta, cable, radio, OTT y vía pública.</span>}>
                <TablaShare u={atl} P={P} etiqueta="Inversión y share ATL por marca" />
              </Bloque>
            )}
          {ok(u) && (
            <Bloque universo={diario} {...presionLectura(v, diario)} avisos={avisosDe(v, 'diaria')}
              pie={<span>Inversión estimada por Integrametrics. Un día sin registros queda como hueco, no como cero.</span>}>
              <div className="q-control q-control-tarjeta"><span>Universo</span><Grupo etiqueta="Universo" valor={diario} onCambiar={setDiario} opciones={opcionesDiario} /></div>
              <Lineas etiqueta={`Inversión ${diario === 'atl' ? 'ATL' : 'digital'} por día y por marca`} formato={solesCompacto}
                series={[...u.marcas].sort((a, b) => Number(a.foco) - Number(b.foco)).map((m) => ({ nombre: m.nombre, resaltada: m.foco, tono: m.propia ? 'propia' : undefined, serie: u.diaria.map((d) => ({ fecha: d.fecha, valor: d.valores[m.id] })) }))} />
            </Bloque>
          )}
          </Detalle>
        )}
      </SeccionDe>

      <SeccionDe def={s42} vista={v}>
        {!Object.keys(v.analiza.pautaSemanal).length ? <Bloque titulo="La pauta del año, semana a semana" universo="atl" estado={sinDato('no-cargo')} /> : <PautaSemanal pauta={v.analiza.pautaSemanal} P={P} />}
        <Detalle id={`detalle-${s42.id}`} titulo="Detalle de la pauta del año" bajada="Inversión estimada por Integrametrics, mes a mes." vistas={['la inversión de cada mes, por marca y universo']}>
          <Bloque universo={['atl', 'digital']} {...temporadaLectura(t)} alcance="todos los meses con data"
            ayuda={<p>El mes en curso va con los días que tienen data.</p>}
            pie={<span>Integrametrics tiene data desde {t.length ? mesTexto(t[0].mes) : 'este mes'}.</span>}>
            <Tabla etiqueta="Inversión por mes, marca y universo" numericas={[1, 2, 3, 4]} destacada={t.findIndex((m) => m.mes === P.mes)}
              columnas={['Mes', ...MARCAS.map((m) => `Digital ${textosMarca.nombreMarca(m)}`), ...MARCAS.map((m) => `ATL ${textosMarca.nombreMarca(m)}`)]}
              filas={t.map((m) => [etiquetaMes(m), ...MARCAS.map((x) => soles(m.digital[x])), ...MARCAS.map((x) => soles(m.atl[x]))])} />
          </Bloque>
        </Detalle>
      </SeccionDe>

      <SeccionDe def={s43} vista={v}>
        {!c ? <Bloque titulo={`Las versiones de ${COMPETENCIA.nombre} en el año`} universo="atl" estado={sinDato('no-cargo')} /> : (
          <Bloque universo={['atl', 'digital']} {...cronogramaLectura(c, COMPETENCIA.nombre, inicio, v.fuentes[0].corte)} alcance={tramoMeses(inicio, v.fuentes[0].corte, 'de')}
            ayuda={<p>ATL va llena, de su primera a su última emisión registrada. Digital va en contorno, de la primera a la última variante vista. Detrás, el período elegido.</p>}
            pie={<span>Las {numero(c.filas.length)} versiones con más inversión estimada en el año{c.resto ? `; ${numero(c.resto)} ${c.resto === 1 ? 'versión' : 'versiones'} más con menos inversión no entran` : ''}. Los estrenos son de TV, radio, cable, OTT y vía pública.</span>}>
            <ul className="q-leyenda q-leyenda-arriba" aria-hidden="true"><li><span className="q-muestra q-muestra-tramo" />ATL</li><li><span className="q-muestra q-muestra-contorno" />Digital</li></ul>
            <Cronograma etiqueta={`Versiones de ${COMPETENCIA.nombre} en el año`} inicio={inicio} fin={v.fuentes[0].corte} periodo={P} formato={solesCompacto}
              onElegir={setVersion} filas={c.filas.map((f) => ({ id: f.id, nombre: version(f.version), universo: f.universo, desde: f.desde, hasta: f.hasta, valor: f.inversion, nota: [nuevas.has(f.version) && 'nueva en el período', ...f.canales.slice(0, 2)].filter(Boolean).join(', ') }))} />
            <VentanaAnuncios grupo={grupoCrono} onCerrar={() => setVersion(null)} t={{ ...tVersiones, bajada: () => `Versión de ${COMPETENCIA.nombre}` }} nota={filaCrono ? soles(filaCrono.inversion) : null} />
            {estrenos && (
              <div className="q-subbloque">
                {/* la tarjeta es del año (alfiler); los estrenos son del período elegido y lo dicen con su calendario */}
                <h4>{estrenos.titulo}<Ventana texto={ventanaTexto(P.desde, P.hasta)} /></h4>
                <p>{estrenos.lectura}</p>
                {estrenosComp > 0 && <Estrenos lista={v.lee.estrenos.filter((e) => !e.propia).slice(0, MAX_ESTRENOS)} t={tVersiones} />}
              </div>
            )}
          </Bloque>
        )}
        {v.lee.estrenos?.length > Math.min(estrenosComp, MAX_ESTRENOS) && (
          <Detalle id={`detalle-${s43.id}`} titulo="Estrenos del período" bajada={`Integrametrics, ${periodoTexto(P)}.`} vistas={['todos los estrenos, de las dos marcas']}>
            <Bloque universo="atl" {...estrenos}
              ayuda={<p>Una pieza es nueva el día en que su versión se emite por primera vez.</p>}
              pie={<span>TV, radio, cable, OTT y vía pública.</span>}>
              <Estrenos lista={v.lee.estrenos} t={tVersiones} />
            </Bloque>
          </Detalle>
        )}
      </SeccionDe>
    </MarcoCapa>
  );
}
