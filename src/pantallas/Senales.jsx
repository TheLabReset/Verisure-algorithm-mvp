// Capa 1 · Captura de señales: lo nuevo de la competencia en el período elegido (con el atajo inicial, los últimos
// siete días). Digital primero: sus piezas nuevas por mensaje. Después TV y cable, y radio, emisión por emisión con
// su digitalizado; OOH en el mapa; y al final, lo que se busca en Google y se comenta en TikTok y Facebook.
// La marca propia no va en lo nuevo de la competencia: su equipo ya sabe qué tiene al aire.
// Las marcas vigiladas (src/cliente.js) aparecen solo acá: cada tarjeta trae el filtro «Marca» cuando alguna salió en
// el período, y su aviso la elige en el filtro. Cada una va en su color (--vigilada-N), siempre con su nombre.
// No calcula: pinta la vista y las lecturas de src/textos.
import { createContext, useContext, useRef, useState } from 'react';
import { Bloque, Tabla, Resumen, Abanico, Detalle, Tono, Grupo, vigente } from '../sistema/Componentes.jsx';
import { Lineas, Pendiente } from '../sistema/graficos/Graficos.jsx';
import { numero, compacto, fechaCorta, porcentaje, variacion } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato, avisosDe } from './comun.jsx';
import Ooh from './Ooh.jsx';
import Emisiones from './Emisiones.jsx';
import { periodoTexto, version, ventanaTexto, resumenTitulo, plataformasTexto, plataformaEnFrase, capital } from '../textos/comun.js';
import { digitalSemanaLectura, atlSemanaLectura, oohLectura, distritosLectura, textosDelAbanico, textosMarca, trendsMarcasLectura, tiktokLectura, facebookLectura, TONOS, alerta, aparicionesNota, ACCION_VIGILADA, accionVigiladaEtiqueta } from '../textos/lecturas.js';
import { UMBRALES_TONO } from '../calculo/conversacion.js';
import { CLIENTE } from '../cliente.js';

const COMPETENCIA = CLIENTE.competencia[0];
const MARCAS = [...CLIENTE.competencia.map((c) => c.marcaFuente), CLIENTE.marcaFuente];
const signo = (n) => variacion(n);

// La ventana de una tarjeta que cae a lo más reciente: dice el tramo que muestra, no el elegido arriba
const ventanaDe = (x) => (x?.reciente ? ventanaTexto(x.semana.desde, x.semana.hasta) : undefined);

// ── El filtro «Marca» de cada tarjeta: la competencia y las vigiladas que salieron en el período ──
const muestraDe = (m) => `q-muestra-vigilada-${m.color}`;
// cuenta(id): lo de esa vigilada en la tarjeta; sin ninguna con algo, no hay filtro
// El filtro va sin muestra de color: el color de la vigilada se lee en el mapa y en las fichas, donde se pinta
function opcionesMarca(vig, cuenta, cuentaCompetencia) {
  const extras = (vig?.marcas || []).filter((m) => cuenta(m.id) > 0).map((m) => ({ valor: m.id, texto: `${m.nombre} · ${numero(cuenta(m.id))}` }));
  if (!extras.length) return null;
  return [{ valor: COMPETENCIA.marcaFuente, texto: cuentaCompetencia ? `${COMPETENCIA.nombre} · ${numero(cuentaCompetencia)}` : COMPETENCIA.nombre }, ...extras];
}
function FiltroMarca({ opciones, valor, onCambiar, contenedor }) {
  if (!opciones) return null;
  return <div className="q-control q-filtro-marca" ref={contenedor}><span>Marca</span><Grupo etiqueta="Marca" valor={valor} onCambiar={onCambiar} opciones={opciones} /></div>;
}
// Los avisos de la tarjeta según la marca elegida: los de la competencia con ella; los de las vigiladas siempre, con
// el botón que la elige (menos el de la que ya está a la vista, y si su marca no está en el filtro no hay botón)
function avisosConMarca(v, tarjeta, elegida, elegir, opciones) {
  const deCompetencia = elegida === COMPETENCIA.marcaFuente ? avisosDe(v, tarjeta) : [];
  const deVigiladas = (v.lee.vigiladas?.avisos || []).filter((a) => a.tarjeta === tarjeta).map((a) => {
    const t = alerta(a);
    const puede = a.marcaId !== elegida && opciones?.some((o) => o.valor === a.marcaId);
    return t && { ...t, id: `aviso-vigilada-${a.marcaId}-${tarjeta}`, accion: puede ? { texto: ACCION_VIGILADA[tarjeta], etiqueta: accionVigiladaEtiqueta(tarjeta, a.marca), alHacer: () => elegir(a.marcaId) } : null };
  }).filter(Boolean);
  return [...deCompetencia, ...deVigiladas];
}
// La marca elegida de una tarjeta: si deja de tener algo (otro período), vuelve a la competencia.
// MarcaInicial abre las tarjetas con otra marca elegida (la prueba de render la usa para pintar cada vigilada).
// Elegir desde un aviso lleva el foco al botón de esa marca en el filtro: el botón del aviso desaparece al elegir
export const MarcaInicial = createContext(null);
function useMarca(opciones) {
  const [m, setM] = useState(useContext(MarcaInicial) ?? COMPETENCIA.marcaFuente);
  const contenedor = useRef(null);
  const elegirDesdeAviso = (id) => { setM(id); requestAnimationFrame(() => contenedor.current?.querySelector('[aria-pressed="true"]')?.focus()); };
  return [opciones ? vigente(m, opciones) : COMPETENCIA.marcaFuente, setM, elegirDesdeAviso, contenedor];
}

// Digital: un mazo por mensaje con sus piezas nuevas, y la lista de mensajes con sus plataformas
function DigitalSemana({ d, anio, avisos, nombre = COMPETENCIA.nombre, filtro }) {
  const [abierta, setAbierta] = useState(null);
  const t = textosDelAbanico(anio, { uno: 'pieza', varios: 'piezas' });
  const lista = { ...d.abanico, grupos: d.abanico.grupos.map((g) => ({ ...g, nombre: version(g.nombre) })) };
  return (
    <Bloque universo="digital" {...digitalSemanaLectura(d, nombre)} ventana={ventanaDe(d)} avisos={avisos}
      ayuda={<p>Una pieza es nueva el día en que Integrametrics la ve por primera vez. Las piezas van agrupadas por su mensaje, que es el nombre de la versión; un mensaje es nuevo si no se había visto antes.</p>}
      pie={<span>{capital(plataformasTexto(d.plataformas || []) || 'Plataformas digitales')} · Integrametrics digital.</span>}>
      {filtro}
      {d.piezas ? <>
        <Abanico key={nombre} lista={lista} abierta={abierta} onAbrir={setAbierta} t={t} nota={`vistas por primera vez ${ventanaTexto(d.semana.desde, d.semana.hasta)}`} />
        <Tabla etiqueta={`Mensajes digitales de ${nombre}`} numericas={[1]}
          columnas={['Mensaje', 'Piezas', 'Plataformas', 'Visto por primera vez']}
          filas={d.mensajes.map((m) => [version(m.mensaje), numero(m.piezas), m.plataformas.map(plataformaEnFrase).join(', ') || 'sin dato', m.nuevo && !d.sinHistoria ? `${fechaCorta(m.primeraVez)}, nuevo` : fechaCorta(m.primeraVez)])} />
      </> : <p className="q-nota-bloque">Sin piezas digitales de {nombre} registradas.</p>}
    </Bloque>
  );
}

function AtlSemana({ a, medio, universo, avisos, titulo, nombre = COMPETENCIA.nombre, filtro }) {
  if (!a) return <Bloque titulo={titulo} universo={universo} estado={sinDato('no-cargo')} />;
  return (
    <Bloque universo={universo} {...atlSemanaLectura(a, medio, nombre)} ventana={ventanaDe(a)} avisos={avisos}
      ayuda={<p>Cada fila es una emisión. Una emisión de cadena nacional repetida en sus señales regionales cuenta una sola vez. El digitalizado es el de la versión que Integrametrics guardó.</p>}
      pie={<span>Integrametrics, emisión por emisión{a.emisiones.length > 1 ? ` · las ${numero(a.emisiones.length)} están en la lista` : ''}.</span>}>
      {filtro}
      {a.emisiones.length ? <Emisiones key={nombre} a={a} etiqueta={`Emisiones de ${nombre} en ${medio}`} /> : <p className="q-nota-bloque">Sin emisiones registradas.</p>}
    </Bloque>
  );
}

// Cada tarjeta de la capa 1 con su filtro «Marca»: la competencia por omisión, o una vigilada que salió en el período
function DigitalConMarca({ v, d, anio }) {
  const g = v.lee.vigiladas;
  const opciones = opcionesMarca(g, (id) => g?.digital?.[id]?.piezas || 0, d && !d.reciente ? d.piezas : 0);
  const [marca, setMarca, desdeAviso, contenedor] = useMarca(opciones);
  const m = g?.marcas.find((x) => x.id === marca);
  const filtro = <FiltroMarca opciones={opciones} valor={marca} onCambiar={setMarca} contenedor={contenedor} />;
  const avisos = avisosConMarca(v, 'digital', marca, desdeAviso, opciones);
  if (m) return <DigitalSemana d={g.digital[m.id]} anio={anio} avisos={avisos} nombre={m.nombre} filtro={filtro} />;
  return !d ? <Bloque titulo="Lo nuevo en digital" universo="digital" estado={sinDato('no-cargo')} /> : <DigitalSemana d={d} anio={anio} avisos={avisos} filtro={filtro} />;
}
function AtlConMarca({ v, a, apartado, medio, titulo }) {
  const g = v.lee.vigiladas;
  const opciones = opcionesMarca(g, (id) => g?.[apartado]?.[id]?.emisiones.length || 0, a && !a.reciente ? a.emisiones.length : 0);
  const [marca, setMarca, desdeAviso, contenedor] = useMarca(opciones);
  const m = g?.marcas.find((x) => x.id === marca);
  const filtro = <FiltroMarca opciones={opciones} valor={marca} onCambiar={setMarca} contenedor={contenedor} />;
  const avisos = avisosConMarca(v, apartado, marca, desdeAviso, opciones);
  if (m) return <AtlSemana a={{ ...g[apartado][m.id], muestra: muestraDe(m) }} medio={medio} universo="atl" titulo={titulo} avisos={avisos} nombre={m.nombre} filtro={filtro} />;
  return <AtlSemana a={a} medio={medio} universo="atl" titulo={titulo} avisos={avisos} filtro={filtro} />;
}

function OohConMarca({ v, P, tPaneles }) {
  const g = v.lee.vigiladas, o0 = v.lee.ooh;
  const opciones = opcionesMarca(g, (id) => g?.ooh?.[id]?.porMarca[id] || 0, o0.porMarca[COMPETENCIA.marcaFuente]);
  const [marca, setMarca, desdeAviso, contenedor] = useMarca(opciones);
  const m = g?.marcas.find((x) => x.id === marca);
  // con una vigilada elegida, el mapa trae sus paneles y los de la marca propia, como el de la competencia
  const o = m ? g.ooh[m.id] : o0;
  return (
    <Bloque universo="atl" {...oohLectura(o, P, m ? { nombre: m.nombre, marcaFuente: m.id } : undefined)} avisos={avisosConMarca(v, 'ooh', marca, desdeAviso, opciones)}
      ayuda={<p>Cada círculo es una ubicación: las caras de una misma torre van juntas. El distrito sale de las coordenadas de Integrametrics y los límites de OpenStreetMap.</p>}
      pie={<span>Paneles detectados en el período · mapa base © colaboradores de OpenStreetMap.</span>}>
      <FiltroMarca opciones={opciones} valor={marca} onCambiar={setMarca} contenedor={contenedor} />
      {o.paneles.length > 0 ? <Ooh key={marca} o={o} t={tPaneles} nota={`detectados en ${periodoTexto(P)}`} /> : <p className="q-nota-bloque">Sin paneles detectados en el período.</p>}
    </Bloque>
  );
}

export default function Senales({ capa, vista: v }) {
  const [s11, s12, s13, s14, s15] = capa.secciones;
  const P = v.periodo, L = v.lee, E = v.ejemplo;
  const anio = P.desde.slice(0, 4);
  const [panelDe, setPanelDe] = useState(null);
  const tPaneles = textosDelAbanico(anio, { uno: 'panel', varios: 'paneles' });
  const d = L.digitalSemana, tv = L.tvSemana, radio = L.radioSemana, b = v.analiza.busquedas;
  const conTrends = Boolean(b?.marcas.some((m) => m.antes != null)); // el detalle muestra un año antes solo si Trends lo trae
  const enPeriodo = (x) => x && !x.reciente;
  const desdeUnAnio = (serie) => serie.filter((p) => p.fecha >= `${Number(P.hasta.slice(0, 4)) - 1}${P.hasta.slice(4)}` && p.fecha <= P.hasta);
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={resumenTitulo(P)}
        pie={<span>Integrametrics.</span>}
        items={[
          { rotulo: `Piezas digitales nuevas de ${COMPETENCIA.nombre}`, universo: 'digital', ir: s11.id, irTexto: s11.titulo, valor: d ? numero(enPeriodo(d) ? d.piezas : 0) : null, nota: d && enPeriodo(d) ? `${numero(d.mensajes.length)} ${d.mensajes.length === 1 ? 'mensaje' : 'mensajes'}` : d?.piezas ? `la última, del ${fechaCorta(d.semana.hasta)}` : null },
          { rotulo: `Emisiones en TV y cable de ${COMPETENCIA.nombre}`, universo: 'atl', ir: s12.id, irTexto: s12.titulo, valor: tv ? numero(enPeriodo(tv) ? tv.emisiones.length : 0) : null, nota: tv && !enPeriodo(tv) && tv.emisiones.length ? `la última, del ${fechaCorta(tv.semana.hasta)}` : tv && enPeriodo(tv) ? `${numero(tv.canales)} ${tv.canales === 1 ? 'canal' : 'canales'}` : null },
          { rotulo: `Emisiones en radio de ${COMPETENCIA.nombre}`, universo: 'atl', ir: s13.id, irTexto: s13.titulo, valor: radio ? numero(enPeriodo(radio) ? radio.emisiones.length : 0) : null, nota: radio && !enPeriodo(radio) && radio.emisiones.length ? `la última, del ${fechaCorta(radio.semana.hasta)}` : radio && enPeriodo(radio) ? `${numero(radio.canales)} ${radio.canales === 1 ? 'emisora' : 'emisoras'}` : null },
          { rotulo: `Paneles de ${COMPETENCIA.nombre}`, universo: 'atl', ir: s14.id, irTexto: s14.titulo, valor: L.ooh ? numero(L.ooh.porMarca[COMPETENCIA.marcaFuente]) : null, nota: L.ooh ? `${numero(L.ooh.porMarca[CLIENTE.marcaFuente])} de ${CLIENTE.nombre}` : null },
          // las marcas vigiladas: cuántas versiones se vieron por primera vez en el período, y a qué tarjeta ir
          ...(L.vigiladas ? [(() => {
            const ap = L.vigiladas.apariciones, c = L.vigiladas.contadas, s = { digital: s11, tv: s12, radio: s13, ooh: s14 }[ap[0]?.tarjeta];
            // sin ninguna fuente contada (caída o sin historia antes del período) es un hueco, no un cero
            return { rotulo: 'Primeras apariciones de otras marcas', valor: c.digital || c.atl ? numero(ap.length) : null, nota: c.digital || c.atl ? aparicionesNota(ap, L.vigiladas.marcas, c) : null, ir: s?.id, irTexto: s?.titulo };
          })()] : []),
        ]} />

      <SeccionDe def={s11} vista={v}>
        <DigitalConMarca v={v} d={d} anio={anio} />
      </SeccionDe>

      <SeccionDe def={s12} vista={v}>
        <AtlConMarca v={v} a={tv} apartado="tv" medio="TV y cable" titulo="TV y cable" />
      </SeccionDe>

      <SeccionDe def={s13} vista={v}>
        <AtlConMarca v={v} a={radio} apartado="radio" medio="radio" titulo="Radio" />
      </SeccionDe>

      <SeccionDe def={s14} vista={v}>
        {!L.ooh ? <Bloque titulo="Dónde están los paneles" universo="atl" estado={sinDato('no-cargo')} /> : <>
          <OohConMarca v={v} P={P} tPaneles={tPaneles} />
          {L.ooh.paneles.length > 0 && (
            <Detalle id={`detalle-${s14.id}`} titulo="Detalle de OOH" bajada={`Paneles de ${COMPETENCIA.nombre} y ${CLIENTE.nombre} detectados en ${periodoTexto(P)}.`} vistas={['paneles por distrito', 'la pieza de cada panel']}>
              <Bloque universo="atl" {...distritosLectura(L.ooh)}
                pie={<span>Lima y el Callao por distrito; fuera de Lima, por ciudad.</span>}>
                <Tabla etiqueta="Paneles por distrito y marca" numericas={[1, 2, 3]} barra={{ columna: 3, valores: [...L.ooh.porDistrito, ...L.ooh.fueraDeLima].map((x) => x.total) }}
                  columnas={['Distrito o ciudad', ...MARCAS.map(textosMarca.nombreMarca), 'Total']}
                  filas={[...L.ooh.porDistrito, ...L.ooh.fueraDeLima].map((x) => [x.nombre, ...MARCAS.map((m) => numero(x[m])), numero(x.total)])} />
              </Bloque>
              <Bloque universo="atl" titulo="La pieza de cada panel">
                <Abanico lista={L.ooh.abanico} abierta={panelDe} onAbrir={setPanelDe} t={{ ...tPaneles, titulo: (x) => x.titulo }} nota={`detectados en ${periodoTexto(P)}`} propioAlFinal />
              </Bloque>
            </Detalle>
          )}
        </>}
      </SeccionDe>

      <SeccionDe def={s15} vista={v}>
        {!b ? <Bloque titulo="Las marcas de cámaras en Google" universo="busquedas" estado={sinDato('no-cargo')} /> : (
          <Bloque universo="busquedas" {...trendsMarcasLectura(b)} alcance={`semanas al ${fechaCorta(b.hasta)}`}
            ayuda={<p>Google Trends da un índice en Perú, no la cantidad de búsquedas: 100 es la semana con más búsquedas de la consulta. Las cinco marcas van en la misma consulta, así que se comparan entre sí. El porcentaje de cada marca compara el promedio de las últimas {numero(b.semanas)} semanas completas frente a las mismas semanas de un año antes.</p>}
            pie={<span>Google Trends, Perú · consultado el {fechaCorta(b.consultado)}.</span>}>
            <Lineas etiqueta="Búsquedas semanales de marcas de cámaras en Google Trends, un año hasta el período" formato={(n) => numero(n)} alto={280} elegible
              series={b.marcas.map((m) => ({ nombre: m.nombre, leyenda: m.crecimiento == null ? m.nombre : `${m.nombre} ${signo(m.crecimiento)}`, serie: desdeUnAnio(b.serieMarcas.find((x) => x.id === m.id)?.serie || []) }))} />
          </Bloque>
        )}
        <Bloque universo="conversacion" {...tiktokLectura(E.tiktok)} ejemplo ancho="mitad" ventana={ventanaTexto(E.tiktok.desde, E.tiktok.hasta)}
          ayuda={<p>La tasa de interacción es la parte de las vistas que dio me gusta, comentó o compartió. Se conectará con Apify.</p>}
          pie={<span>{E.tiktok.fuente}, del {fechaCorta(E.tiktok.desde)} al {fechaCorta(E.tiktok.hasta)}.</span>}>
          <Tabla etiqueta="Hashtags en TikTok" numericas={[1, 2, 3]} barra={{ columna: 1, valores: E.tiktok.hashtags.map((h) => h.tasa) }}
            columnas={['Hashtag', 'Tasa de interacción', 'Vistas', 'Publicaciones']}
            filas={E.tiktok.hashtags.map((h) => [h.hashtag, porcentaje(h.tasa, 1), compacto(h.vistas), numero(h.publicaciones)])} />
        </Bloque>
        <Bloque universo="conversacion" {...facebookLectura(E.facebook)} ejemplo ancho="mitad" ventana={ventanaTexto(E.facebook.desde, E.facebook.hasta)}
          ayuda={<p>Los temas de los comentarios en las páginas de las marcas y del rubro. El tono resta las menciones negativas a las positivas: {numero(UMBRALES_TONO.muy)} puntos o más es muy positivo; {numero(UMBRALES_TONO.tono)} o más, positivo; entre −{numero(UMBRALES_TONO.tono)} y {numero(UMBRALES_TONO.tono)}, neutro (y lo mismo hacia lo negativo). Se conectará con Apify.</p>}
          pie={<span>{E.facebook.fuente}, del {fechaCorta(E.facebook.desde)} al {fechaCorta(E.facebook.hasta)}.</span>}>
          <Tabla etiqueta="Temas de la conversación en Facebook" numericas={[1]} barra={{ columna: 1, valores: E.facebook.temas.map((t) => t.menciones) }}
            columnas={['Tema', 'Menciones', 'Tono']}
            filas={E.facebook.temas.map((t) => [t.tema, numero(t.menciones), <Tono key="tono" tono={t.tono} texto={TONOS[t.tono]} />])} />
        </Bloque>
        <Detalle id={`detalle-${s15.id}`} titulo="Detalle de las tendencias" bajada="Google Trends, Perú, por semana; TikTok y Facebook con data de ejemplo, por conectar."
          vistas={[...(conTrends ? ['las marcas de cámaras, un año antes y ahora'] : []), 'las páginas de Facebook de cada marca', 'el tono de cada tema en porcentajes']}>
          {conTrends && (
            <Bloque universo="busquedas" titulo="Las marcas de cámaras, un año antes y ahora" alcance={`semanas al ${fechaCorta(b.hasta)}`}
              pie={<span>Índice promedio de 0 a 100 · {fechaCorta(b.desde)} a {fechaCorta(b.hasta)} de {b.hasta.slice(0, 4)}{b.antesDesde ? ` frente a ${fechaCorta(b.antesDesde)} a ${fechaCorta(b.antesHasta)} de ${b.antesHasta.slice(0, 4)}` : ''}.</span>}>
              <Pendiente etiqueta="Búsquedas de marcas de cámaras, un año antes y ahora" formato={(n) => numero(Math.round(n))} rotuloA="Un año antes" rotuloB="Ahora"
                resaltar={b.marcas.slice(0, 1).map((m) => m.nombre)} filas={b.marcas.filter((m) => m.antes != null).map((m) => ({ nombre: m.nombre, a: m.antes, b: m.ahora }))} />
            </Bloque>
          )}
          <Bloque universo="conversacion" titulo="Las páginas de cada marca" ejemplo pie={<span>{E.facebook.fuente}.</span>}>
            <Tabla etiqueta="Páginas de Facebook de cada marca" numericas={[1, 2, 3]}
              columnas={['Página', 'Publicaciones', 'Interacciones', 'Comentarios']}
              filas={E.facebook.paginas.map((x) => [x.nombre, numero(x.publicaciones), numero(x.interaccion), numero(x.comentarios)])} />
          </Bloque>
          <Bloque universo="conversacion" titulo="El tono de cada tema" ejemplo pie={<span>Parte de las menciones de cada tema.</span>}>
            <Tabla etiqueta="Tono de cada tema de Facebook" numericas={[1, 2, 3]}
              columnas={['Tema', 'Positivo', 'Neutro', 'Negativo']}
              filas={E.facebook.temas.map((t) => [t.tema, porcentaje(t.positivo), porcentaje(t.neutro), porcentaje(t.negativo)])} />
          </Bloque>
        </Detalle>
      </SeccionDe>
    </MarcoCapa>
  );
}
