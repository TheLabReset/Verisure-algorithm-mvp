// Capa 1 · Captura de señales: qué hizo la competencia. Tres vistas generales: sus versiones del año con lo que
// estrenó en el período, lo que tiene al aire (ATL o digital, la marca propia al final para comparar) y el mapa de
// paneles. Los paneles por distrito y la pieza de cada panel van en el detalle de OOH.
// No calcula: pinta la vista y las lecturas de src/textos.
import { useState } from 'react';
import { Play, AudioLines, Image as ImagenIcono } from 'lucide-react';
import { Bloque, Tabla, Resumen, Abanico, VentanaAnuncios, Detalle, Grupo, Ventana, vigente } from '../sistema/Componentes.jsx';
import { Cronograma } from '../sistema/graficos/Graficos.jsx';
import { numero, solesCompacto, soles } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato } from './comun.jsx';
import Ooh from './Ooh.jsx';
import { periodoTexto, version, tramoMeses, tramoFechas } from '../textos/comun.js';
import { estrenosLectura, estrenoTitulo, estrenoDato, abanicoAtlLectura, abanicoDigitalLectura, oohLectura, distritosLectura, cronogramaLectura, textosDelAbanico, textosMarca } from '../textos/lecturas.js';
import { CLIENTE } from '../cliente.js';

const ICONO = { video: Play, audio: AudioLines, image: ImagenIcono };
const COMPETENCIA = CLIENTE.competencia[0];
const MARCAS = [...CLIENTE.competencia.map((c) => c.marcaFuente), CLIENTE.marcaFuente];
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

// Lo que tiene al aire: un solo abanico con ATL o digital. ATL cuenta las versiones con emisiones en el período;
// digital, las vistas por primera vez en el período (Integrametrics registra cada variante el día que la ve)
function AlAire({ L, P, tVersiones, tDigital }) {
  const [elegido, setU] = useState('atl');
  const opcionesU = [{ valor: 'atl', texto: 'ATL', desactivada: !L.abanicoAtl }, { valor: 'digital', texto: 'Digital', desactivada: !L.abanicoDigital }];
  const u = vigente(elegido, opcionesU);
  const [abierta, setAbierta] = useState(null);
  if (!L.abanicoAtl && !L.abanicoDigital) return <Bloque titulo="Lo que tiene al aire" universo={['atl', 'digital']} estado={sinDato('no-cargo')} />;
  const atl = u === 'atl';
  const lista = atl ? L.abanicoAtl : L.abanicoDigital;
  const vacia = !lista.propio && !lista.grupos.length;
  const cambiar = (x) => { setU(x); setAbierta(null); };
  return (
    <Bloque universo={u} {...(atl ? abanicoAtlLectura(L.abanicoAtl, P) : abanicoDigitalLectura(L.abanicoDigital, P))}
      ayuda={atl
        ? <p>Una versión cuenta en el período si su primera y su última emisión registradas se cruzan con él.</p>
        : <p>Una carta por versión vista por primera vez en el período; las variantes de imagen o formato de una versión van juntas.</p>}
      pie={<span>{atl ? 'TV, radio, cable, OTT y vía pública.' : 'Facebook, Instagram, Google Search y YouTube.'}</span>}>
      <div className="q-control q-control-tarjeta"><span>Universo</span>
        <Grupo etiqueta="Universo" valor={u} onCambiar={cambiar} opciones={opcionesU} />
      </div>
      {vacia ? <p className="q-nota-bloque">{atl ? 'Ninguna versión ATL en el período.' : 'Ninguna versión digital nueva en el período.'}</p>
        : <Abanico key={u} lista={lista} abierta={abierta} onAbrir={setAbierta} t={atl ? tVersiones : tDigital} nota={atl ? `al aire en ${periodoTexto(P)}` : `aparecieron en ${periodoTexto(P)}`} propioAlFinal />}
    </Bloque>
  );
}

export default function Senales({ capa, vista: v }) {
  const [s11, s12] = capa.secciones;
  const P = v.periodo, L = v.lee;
  const anio = P.desde.slice(0, 4);
  const [panelDe, setPanelDe] = useState(null);
  const [version_, setVersion] = useState(null);
  const tVersiones = textosDelAbanico(anio);
  const tDigital = textosDelAbanico(anio, { uno: 'pieza', varios: 'piezas' });
  const tPaneles = textosDelAbanico(anio, { uno: 'panel', varios: 'paneles' });
  const estrenosComp = (L.estrenos || []).filter((e) => !e.propia).length;
  const c = L.cronograma;
  const filaCrono = c?.filas.find((f) => f.id === version_);
  const grupoCrono = filaCrono ? unaPieza(COMPETENCIA.nombre, { id: filaCrono.id, titulo: filaCrono.version, plataformas: filaCrono.canales, desde: filaCrono.desde, hasta: filaCrono.hasta, asset: filaCrono.asset }) : null;
  const digComp = L.abanicoDigital?.grupos.reduce((s, g) => s + g.anuncios.length, 0) ?? null;
  // las versiones de la competencia que se estrenaron en el período se marcan en el cronograma
  const nuevas = new Set((L.estrenos || []).filter((e) => !e.propia).map((e) => e.version));
  const estrenos = L.estrenos ? estrenosLectura(v) : null;
  const inicio = v.analiza.pauta[0]?.serie[0]?.fecha ?? P.desde;
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={`Resumen de ${periodoTexto(P)}`}
        pie={<span>Integrametrics. Una pieza es nueva el día de su primera emisión; un panel cuenta desde el día que se detecta.</span>}
        items={[
          { rotulo: `Versiones de ${COMPETENCIA.nombre} en el año`, universo: 'atl', ir: s11.id, irTexto: s11.titulo, valor: c ? numero(c.total) : null, nota: c ? `${numero(c.atl)} en ATL y ${numero(c.digital)} en digital` : null },
          { rotulo: `Estrenos de ${COMPETENCIA.nombre}`, universo: 'atl', ir: s11.id, irTexto: s11.titulo, valor: L.estrenos ? numero(estrenosComp) : null, nota: L.estrenos ? `${numero(L.estrenos.length - estrenosComp)} de ${CLIENTE.nombre}` : null },
          { rotulo: `Versiones digitales nuevas de ${COMPETENCIA.nombre}`, universo: 'digital', ir: s11.id, irTexto: s11.titulo, valor: digComp == null ? null : numero(digComp), nota: L.abanicoDigital ? `${numero(L.abanicoDigital.propio?.anuncios.length ?? 0)} de ${CLIENTE.nombre}` : null },
          { rotulo: `Paneles de ${COMPETENCIA.nombre}`, universo: 'atl', ir: s12.id, irTexto: s12.titulo, valor: L.ooh ? numero(L.ooh.porMarca[COMPETENCIA.marcaFuente]) : null, nota: L.ooh ? `${numero(L.ooh.porMarca[CLIENTE.marcaFuente])} de ${CLIENTE.nombre}` : null },
        ]} />

      <SeccionDe def={s11} vista={v}>
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
                <h4>{estrenos.titulo}<Ventana texto={tramoFechas(P.desde, P.hasta).replace(/^del /, '')} /></h4>
                <p>{estrenos.lectura}</p>
                {/* a la vista, solo los de la competencia (hasta tres); la lista completa va en el detalle */}
                {estrenosComp > 0 && <Estrenos lista={L.estrenos.filter((e) => !e.propia).slice(0, MAX_ESTRENOS)} t={tVersiones} />}
              </div>
            )}
          </Bloque>
        )}
        <AlAire L={L} P={P} tVersiones={tVersiones} tDigital={tDigital} />
        {L.estrenos?.length > Math.min(estrenosComp, MAX_ESTRENOS) && (
          <Detalle id={`detalle-${s11.id}`} titulo="Estrenos del período" bajada={`Integrametrics, ${periodoTexto(P)}.`} vistas={['todos los estrenos, de las dos marcas']}>
            <Bloque universo="atl" {...estrenos}
              ayuda={<p>Una pieza es nueva el día en que su versión se emite por primera vez.</p>}
              pie={<span>TV, radio, cable, OTT y vía pública.</span>}>
              <Estrenos lista={L.estrenos} t={tVersiones} />
            </Bloque>
          </Detalle>
        )}
      </SeccionDe>

      <SeccionDe def={s12} vista={v}>
        {!L.ooh ? <Bloque titulo="Dónde están los paneles" universo="atl" estado={sinDato('no-cargo')} /> : <>
          <Bloque universo="atl" {...oohLectura(L.ooh, P)}
            ayuda={<p>Cada círculo es una ubicación: las caras de una misma torre van juntas. El distrito sale de las coordenadas de Integrametrics y los límites de OpenStreetMap.</p>}
            pie={<span>Paneles detectados en el período · mapa base © colaboradores de OpenStreetMap.</span>}>
            {L.ooh.paneles.length > 0 ? <Ooh o={L.ooh} t={tPaneles} nota={`detectados en ${periodoTexto(P)}`} /> : <p className="q-nota-bloque">Sin paneles detectados en el período.</p>}
          </Bloque>
          {L.ooh.paneles.length > 0 && (
            <Detalle id={`detalle-${s12.id}`} titulo="Detalle de OOH" bajada={`Paneles detectados en ${periodoTexto(P)}.`} vistas={['paneles por distrito', 'la pieza de cada panel']}>
              <Bloque universo="atl" {...distritosLectura(L.ooh)}
                pie={<span>Lima y el Callao por distrito; fuera de Lima, por ciudad.</span>}>
                <Tabla etiqueta="Paneles por distrito y marca" numericas={[1, 2, 3]} barra={{ columna: 3, valores: [...L.ooh.porDistrito, ...L.ooh.fueraDeLima].map((d) => d.total) }}
                  columnas={['Distrito o ciudad', ...MARCAS.map(textosMarca.nombreMarca), 'Total']}
                  filas={[...L.ooh.porDistrito, ...L.ooh.fueraDeLima].map((d) => [d.nombre, ...MARCAS.map((m) => numero(d[m])), numero(d.total)])} />
              </Bloque>
              <Bloque universo="atl" titulo="La pieza de cada panel">
                <Abanico lista={L.ooh.abanico} abierta={panelDe} onAbrir={setPanelDe} t={{ ...tPaneles, titulo: (x) => x.titulo }} nota={`detectados en ${periodoTexto(P)}`} propioAlFinal />
              </Bloque>
            </Detalle>
          )}
        </>}
      </SeccionDe>
    </MarcoCapa>
  );
}
