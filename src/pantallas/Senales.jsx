// Capa 1 · Captura de señales: qué salió al aire en la categoría. Las piezas que se estrenaron, las versiones al aire
// de cada marca (ATL y digital) y la vía pública. No calcula: pinta la vista y las lecturas de src/textos.
import { useState } from 'react';
import { Play, AudioLines, Image as ImagenIcono } from 'lucide-react';
import { Bloque, Tabla, Resumen, Abanico, VentanaAnuncios } from '../sistema/Componentes.jsx';
import { numero } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato } from './comun.jsx';
import { periodoTexto } from '../textos/comun.js';
import { estrenosLectura, estrenoTitulo, estrenoDato, abanicoAtlLectura, abanicoDigitalLectura, viaPublicaLectura, textosDelAbanico, textosMarca } from '../textos/lecturas.js';
import { CLIENTE } from '../cliente.js';

const ICONO = { video: Play, audio: AudioLines, image: ImagenIcono };

// Las piezas que se estrenaron: una fila por estreno; «Ver la pieza» la abre con su video, audio o imagen
function Estrenos({ lista, t }) {
  const [abierta, setAbierta] = useState(null);
  const e = lista.find((x) => x.id === abierta);
  const grupo = e ? { nombre: e.nombre, anuncios: [{ id: e.id, titulo: e.version, texto: '', pie: '', plataformas: [e.canal, e.franja && `franja ${e.franja.toLowerCase()}`].filter(Boolean), desde: e.fecha.slice(0, 10), activo: true, enlace: null, imagen: e.asset?.kind === 'image' ? e.asset.url : null, medio: e.asset && e.asset.kind !== 'image' ? e.asset : null, formato: null, arte: null }] } : null;
  return (
    <>
      <ol className="q-estrenos">
        {lista.map((x) => {
          const I = ICONO[x.asset?.kind];
          return (
            <li key={x.id} className={x.propia ? 'q-estreno-propio' : ''}>
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
  const tVersiones = textosDelAbanico(anio);
  const tDigital = textosDelAbanico(anio, { uno: 'pieza', varios: 'piezas' });
  const tPaneles = textosDelAbanico(anio, { uno: 'panel', varios: 'paneles' });
  const deCompetencia = (L.estrenos || []).filter((e) => !e.propia).length;
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={`Resumen de ${periodoTexto(P)}`}
        pie={<span>Lo que Integrametrics registró al aire en {periodoTexto(P)}. Una pieza es nueva el día de su primera emisión.</span>}
        items={[
          { rotulo: 'Piezas nuevas', universo: 'atl', ir: s11.id, irTexto: s11.titulo, valor: L.estrenos ? numero(L.estrenos.length) : null, nota: L.estrenos ? `${numero(deCompetencia)} de la competencia` : null },
          { rotulo: `Versiones ATL de ${CLIENTE.nombre}`, universo: 'atl', ir: s11.id, irTexto: s11.titulo, valor: L.abanicoAtl ? numero(L.abanicoAtl.propio?.anuncios.length ?? 0) : null, nota: L.abanicoAtl ? `${numero(L.abanicoAtl.total)} de la competencia` : null },
          { rotulo: 'Piezas digitales nuevas', universo: 'digital', ir: s11.id, irTexto: s11.titulo, valor: L.abanicoDigital ? numero((L.abanicoDigital.propio?.anuncios.length ?? 0) + L.abanicoDigital.total) : null, nota: L.abanicoDigital ? `${numero(L.abanicoDigital.total)} de la competencia` : null },
          { rotulo: 'Paneles detectados', universo: 'atl', ir: s12.id, irTexto: s12.titulo, valor: L.viaPublica ? numero(L.viaPublica.paneles) : null, nota: L.viaPublica ? `${numero(L.viaPublica.porDistrito.length)} distritos` : null },
        ]} />

      <SeccionDe def={s11} vista={v}>
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
            <Abanico lista={L.abanicoAtl} abierta={atlDe} onAbrir={setAtlDe} t={tVersiones} nota={`al aire en ${periodoTexto(P)}`} />
          </Bloque>
        )}
        {!L.abanicoDigital ? <Bloque titulo="Piezas digitales nuevas" universo="digital" estado={sinDato('no-cargo')} /> : (
          <Bloque universo="digital" {...abanicoDigitalLectura(L.abanicoDigital, P)}
            ayuda={<p>Integrametrics registra cada anuncio digital con su arte. Acá va una carta por versión: las variantes de imagen o formato de una misma versión se juntan.</p>}
            pie={<span>Facebook, Instagram, Google Search y YouTube · versiones vistas por primera vez en el período.</span>}>
            {L.abanicoDigital.propio || L.abanicoDigital.grupos.length
              ? <Abanico lista={L.abanicoDigital} abierta={digDe} onAbrir={setDigDe} t={tDigital} nota={`aparecieron en ${periodoTexto(P)}`} />
              : <p className="q-nota-bloque">Ninguna versión digital nueva en el período.</p>}
          </Bloque>
        )}
      </SeccionDe>

      <SeccionDe def={s12} vista={v}>
        {!L.viaPublica ? <Bloque titulo="Vía pública" universo="atl" estado={sinDato('no-cargo')} /> : <>
          <Bloque universo="atl" ancho="mitad" {...viaPublicaLectura(L.viaPublica, P)}
            pie={<span>Paneles detectados por Integrametrics en el período, por distrito.</span>}>
            {L.viaPublica.paneles > 0 && (
              <Tabla etiqueta="Paneles por distrito y marca" numericas={[1, 2, 3]} barra={{ columna: 3, valores: L.viaPublica.porDistrito.map((d) => d.total) }}
                columnas={['Distrito', ...[CLIENTE.marcaFuente, ...CLIENTE.competencia.map((c) => c.marcaFuente)].map(textosMarca.nombreMarca), 'Total']}
                filas={L.viaPublica.porDistrito.map((d) => [d.nombre, ...[CLIENTE.marcaFuente, ...CLIENTE.competencia.map((c) => c.marcaFuente)].map((m) => numero(d[m])), numero(d.total)])} />
            )}
          </Bloque>
          <Bloque universo="atl" ancho="mitad" titulo="La pieza de cada panel" lectura="La foto o el video que captó Integrametrics en cada panel, con su dirección."
            pie={<span>Un clic en un mazo abre todos los paneles de la marca.</span>}>
            {L.viaPublica.paneles > 0
              ? <Abanico lista={L.viaPublica.abanico} abierta={panelDe} onAbrir={setPanelDe} t={{ ...tPaneles, titulo: (x) => x.titulo }} nota={`detectados en ${periodoTexto(P)}`} />
              : <p className="q-nota-bloque">Sin paneles detectados en el período.</p>}
          </Bloque>
        </>}
      </SeccionDe>
    </MarcoCapa>
  );
}
