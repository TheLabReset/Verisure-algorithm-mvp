// Capa 1 · Captura de señales: qué hizo la competencia. Sus versiones del año en un cronograma, lo que estrenó, lo
// que tiene al aire (ATL y digital, la marca propia al final para comparar) y el OOH en el mapa.
// No calcula: pinta la vista y las lecturas de src/textos.
import { useState } from 'react';
import { Play, AudioLines, Image as ImagenIcono } from 'lucide-react';
import { Bloque, Tabla, Resumen, Abanico, VentanaAnuncios } from '../sistema/Componentes.jsx';
import { Cronograma } from '../sistema/graficos/Graficos.jsx';
import { numero, solesCompacto, soles } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato } from './comun.jsx';
import Ooh from './Ooh.jsx';
import { periodoTexto, version } from '../textos/comun.js';
import { estrenosLectura, estrenoTitulo, estrenoDato, abanicoAtlLectura, abanicoDigitalLectura, oohLectura, distritosLectura, cronogramaLectura, textosDelAbanico, textosMarca } from '../textos/lecturas.js';
import { CLIENTE } from '../cliente.js';

const ICONO = { video: Play, audio: AudioLines, image: ImagenIcono };
const COMPETENCIA = CLIENTE.competencia[0];
const MARCAS = [...CLIENTE.competencia.map((c) => c.marcaFuente), CLIENTE.marcaFuente];

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

export default function Senales({ capa, vista: v }) {
  const [s11, s12] = capa.secciones;
  const P = v.periodo, L = v.lee;
  const anio = P.desde.slice(0, 4);
  const [atlDe, setAtlDe] = useState(null);
  const [digDe, setDigDe] = useState(null);
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
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={`Resumen de ${periodoTexto(P)}`}
        pie={<span>Lo que Integrametrics registró al aire. Una pieza es nueva el día de su primera emisión; un panel cuenta el día que se detecta.</span>}
        items={[
          { rotulo: `Versiones de ${COMPETENCIA.nombre} en el año`, universo: 'atl', ir: s11.id, irTexto: s11.titulo, valor: c ? numero(c.total) : null, nota: c ? `${numero(c.atl)} en ATL y ${numero(c.digital)} en digital` : null },
          { rotulo: `Estrenos de ${COMPETENCIA.nombre}`, universo: 'atl', ir: s11.id, irTexto: s11.titulo, valor: L.estrenos ? numero(estrenosComp) : null, nota: L.estrenos ? `${numero(L.estrenos.length - estrenosComp)} de ${CLIENTE.nombre}` : null },
          { rotulo: `Versiones digitales nuevas de ${COMPETENCIA.nombre}`, universo: 'digital', ir: s11.id, irTexto: s11.titulo, valor: digComp == null ? null : numero(digComp), nota: L.abanicoDigital ? `${numero(L.abanicoDigital.propio?.anuncios.length ?? 0)} de ${CLIENTE.nombre}` : null },
          { rotulo: `Paneles de ${COMPETENCIA.nombre}`, universo: 'atl', ir: s12.id, irTexto: s12.titulo, valor: L.ooh ? numero(L.ooh.porMarca[COMPETENCIA.marcaFuente]) : null, nota: L.ooh ? `${numero(L.ooh.porMarca[CLIENTE.marcaFuente])} de ${CLIENTE.nombre}` : null },
        ]} />

      <SeccionDe def={s11} vista={v}>
        {!c ? <Bloque titulo={`Las versiones de ${COMPETENCIA.nombre} en el año`} universo="atl" estado={sinDato('no-cargo')} /> : (
          <Bloque universo={['atl', 'digital']} {...cronogramaLectura(c, COMPETENCIA.nombre)} alcance="enero a julio"
            ayuda={<p>Cada barra es una versión. ATL va llena, de su primera a su última emisión registrada. Digital va en contorno: Integrametrics registra cada variante el día que la ve, así que el tramo va de la primera a la última variante vista. Detrás, el período elegido. Un clic abre la pieza.</p>}
            pie={<span>Las {numero(c.filas.length)} versiones con más inversión estimada en el año{c.resto ? `; ${numero(c.resto)} ${c.resto === 1 ? 'versión' : 'versiones'} más con menos inversión no entran` : ''}.</span>}>
            <ul className="q-leyenda q-leyenda-arriba" aria-hidden="true"><li><span className="q-muestra q-muestra-tramo" />ATL</li><li><span className="q-muestra q-muestra-contorno" />Digital</li></ul>
            <Cronograma etiqueta={`Versiones de ${COMPETENCIA.nombre} en el año`} inicio={v.analiza.pauta[0]?.serie[0]?.fecha ?? P.desde} fin={v.fuentes[0].corte} periodo={P} formato={solesCompacto}
              onElegir={setVersion} filas={c.filas.map((f) => ({ id: f.id, nombre: version(f.version), universo: f.universo, desde: f.desde, hasta: f.hasta, valor: f.inversion, nota: f.canales.slice(0, 2).join(', ') }))} />
            <VentanaAnuncios grupo={grupoCrono} onCerrar={() => setVersion(null)} t={{ ...tVersiones, bajada: () => `Versión de ${COMPETENCIA.nombre}` }} nota={filaCrono ? soles(filaCrono.inversion) : null} />
          </Bloque>
        )}
        {!L.estrenos ? <Bloque titulo="Piezas que se estrenaron" universo="atl" estado={sinDato('no-cargo')} /> : (
          <Bloque universo="atl" {...estrenosLectura(v)}
            ayuda={<p>Integrametrics marca una pieza como nueva el día que su versión sale al aire por primera vez. Es un evento raro: en un mes de piezas ya conocidas puede no haber ninguno.</p>}
            pie={<span>TV, radio, cable, OTT y vía pública · el video, el audio o la foto son los que captó Integrametrics de la emisión.</span>}>
            {L.estrenos.length > 0 && <Estrenos lista={L.estrenos} t={tVersiones} />}
          </Bloque>
        )}
        {!L.abanicoAtl ? <Bloque titulo="Versiones ATL al aire" universo="atl" estado={sinDato('no-cargo')} /> : (
          <Bloque universo="atl" {...abanicoAtlLectura(L.abanicoAtl, P)}
            ayuda={<p>Una versión está al aire en el período si su primera y su última emisión registradas se cruzan con él. Pasa el mouse por un mazo para abrirlo; un clic muestra todas sus versiones con su video o audio.</p>}
            pie={<span>Versiones con al menos una emisión en el período · el arte es el que captó Integrametrics.</span>}>
            <Abanico lista={L.abanicoAtl} abierta={atlDe} onAbrir={setAtlDe} t={tVersiones} nota={`al aire en ${periodoTexto(P)}`} propioAlFinal />
          </Bloque>
        )}
        {!L.abanicoDigital ? <Bloque titulo="Piezas digitales nuevas" universo="digital" estado={sinDato('no-cargo')} /> : (
          <Bloque universo="digital" {...abanicoDigitalLectura(L.abanicoDigital, P)}
            ayuda={<p>Integrametrics registra cada anuncio digital con su arte. Acá va una carta por versión: las variantes de imagen o formato de una misma versión se juntan.</p>}
            pie={<span>Facebook, Instagram, Google Search y YouTube · versiones vistas por primera vez en el período.</span>}>
            {L.abanicoDigital.propio || L.abanicoDigital.grupos.length
              ? <Abanico lista={L.abanicoDigital} abierta={digDe} onAbrir={setDigDe} t={tDigital} nota={`aparecieron en ${periodoTexto(P)}`} propioAlFinal />
              : <p className="q-nota-bloque">Ninguna versión digital nueva en el período.</p>}
          </Bloque>
        )}
      </SeccionDe>

      <SeccionDe def={s12} vista={v}>
        {!L.ooh ? <Bloque titulo="Dónde están los paneles" universo="atl" estado={sinDato('no-cargo')} /> : <>
          <Bloque universo="atl" {...oohLectura(L.ooh, P)}
            ayuda={<p>Integrametrics recorre la ciudad y registra cada panel con su foto o video, sus coordenadas y una inversión estimada. Cada círculo es una ubicación: las caras de una misma torre van juntas. El distrito sale de las coordenadas, con los límites de OpenStreetMap.</p>}
            pie={<span>Paneles detectados en el período · mapa base © colaboradores de OpenStreetMap.</span>}>
            {L.ooh.paneles.length > 0 ? <Ooh o={L.ooh} t={tPaneles} nota={`detectados en ${periodoTexto(P)}`} /> : <p className="q-nota-bloque">Sin paneles detectados en el período.</p>}
          </Bloque>
          <Bloque universo="atl" ancho="mitad" {...distritosLectura(L.ooh)}
            pie={<span>Lima y el Callao por distrito; fuera de Lima, por ciudad.</span>}>
            {L.ooh.paneles.length > 0 && (
              <Tabla etiqueta="Paneles por distrito y marca" numericas={[1, 2, 3]} barra={{ columna: 3, valores: [...L.ooh.porDistrito, ...L.ooh.fueraDeLima].map((d) => d.total) }}
                columnas={['Distrito o ciudad', ...MARCAS.map(textosMarca.nombreMarca), 'Total']}
                filas={[...L.ooh.porDistrito, ...L.ooh.fueraDeLima].map((d) => [d.nombre, ...MARCAS.map((m) => numero(d[m])), numero(d.total)])} />
            )}
          </Bloque>
          <Bloque universo="atl" ancho="mitad" titulo="La pieza de cada panel" lectura="La foto o el video que captó Integrametrics en cada panel, con su dirección. La competencia va primero."
            pie={<span>Un clic en un mazo abre todos los paneles de la marca.</span>}>
            {L.ooh.paneles.length > 0
              ? <Abanico lista={L.ooh.abanico} abierta={panelDe} onAbrir={setPanelDe} t={{ ...tPaneles, titulo: (x) => x.titulo }} nota={`detectados en ${periodoTexto(P)}`} propioAlFinal />
              : <p className="q-nota-bloque">Sin paneles detectados en el período.</p>}
          </Bloque>
        </>}
      </SeccionDe>
    </MarcoCapa>
  );
}
