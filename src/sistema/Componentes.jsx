// Componentes de Quincha. No calculan: reciben cifras ya armadas por src/calculo y textos por src/textos.
import { Component, createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, ArrowRight, CircleHelp, Megaphone, Contact, Search, MessagesSquare, Globe,
  Sigma, CircleCheck, TriangleAlert, CloudOff, Inbox, CalendarX2, CircleDashed, Hourglass, FlaskConical,
  Eye, TrendingUp, Bot, Calendar, Pin, ChevronDown, CornerDownRight, ListChecks, X, Layers, ArrowUpRight as Ir,
  ExternalLink, Check, Play, Pause, RotateCcw, RotateCw, Tv, MonitorSmartphone, AudioLines, Image as ImagenIcono, PanelRightOpen, ZoomIn, ZoomOut, Maximize2, Minimize2, ThumbsUp, ThumbsDown, Minus,
} from 'lucide-react';
import { NO_MEDIDO, variacion, numero } from './formato.js';

// ── Universos: qué se cuenta y de dónde. El icono ayuda a reconocerlo sin leer; el color no se usa ──
export const UNIVERSOS = {
  pauta: { icono: Megaphone, nombre: 'Pauta' },
  crm: { icono: Contact, nombre: 'CRM' },
  busquedas: { icono: Search, nombre: 'Búsquedas' },
  conversacion: { icono: MessagesSquare, nombre: 'Conversación' },
  web: { icono: Globe, nombre: 'Sitio web' },
  modelo: { icono: Sigma, nombre: 'Reglas' },
  atl: { icono: Tv, nombre: 'ATL' },
  digital: { icono: MonitorSmartphone, nombre: 'Digital' },
  plataformas: { icono: Layers, nombre: 'Plataformas y CRM' },
};

export function Chip({ tipo = 'neutro', icono: Icono, children, titulo }) {
  return (
    <span className={`q-chip${tipo === 'neutro' ? '' : ' q-chip-' + tipo}`} title={titulo}>
      {Icono && <Icono size={13} aria-hidden="true" strokeWidth={2.2} />}
      {children}
    </span>
  );
}

export const ChipUniverso = ({ universo, children }) => {
  const u = UNIVERSOS[universo];
  return <Chip tipo="universo" icono={u.icono}>{children || u.nombre}</Chip>;
};

const ICONO_FUENTE = { ok: CircleCheck, parcial: TriangleAlert, 'no-cargo': CloudOff, ejemplo: FlaskConical };
export function ChipFuente({ nombre, estado, detalle }) {
  return <Chip tipo={estado === 'ok' ? 'fuente' : estado === 'ejemplo' ? 'ejemplo' : 'atencion'} icono={ICONO_FUENTE[estado]} titulo={detalle}>{nombre}{detalle ? ` · ${detalle}` : ''}</Chip>;
}

export const SelloMuestra = ({ children }) => (
  <span className="q-sello-muestra"><FlaskConical size={13} aria-hidden="true" />{children}</span>
);

// ── Cifra con su variación ──
// mejorSi: 'sube' o 'baja' decide el color; la flecha y el signo siempre van, así el color nunca va solo
export function Cifra({ valor, rotulo, tamano = 'grande', delta, dataClave }) {
  const sinDato = valor == null || valor === NO_MEDIDO;
  return (
    <div className={`q-cifra q-cifra-${tamano}${sinDato ? ' q-cifra-sin-dato' : ''}`}>
      <span className="q-cifra-valor" data-clave={dataClave}>{sinDato ? NO_MEDIDO : valor}</span>
      {rotulo && <span className="q-cifra-rotulo">{rotulo}</span>}
      {delta && <Delta {...delta} />}
    </div>
  );
}

// mejorSi: 'sube', 'baja' o 'neutro' (la inversión: ni mejora ni empeora, va en gris); unidad 'pts' para puntos
export function Delta({ cambio, mejorSi = 'sube', referencia, motivo, decimales = 0, unidad = '%' }) {
  if (cambio == null) return <span className="q-delta">{motivo || 'sin comparación'}</span>;
  const redondo = +cambio.toFixed(decimales);
  const tono = redondo === 0 || mejorSi === 'neutro' ? 'igual' : (redondo > 0) === (mejorSi === 'sube') ? 'mejora' : 'empeora';
  const Flecha = redondo === 0 ? ArrowRight : redondo > 0 ? ArrowUpRight : ArrowDownRight;
  const texto = unidad === 'pts' ? `${redondo > 0 ? '+' : redondo < 0 ? '−' : ''}${numero(Math.abs(cambio), decimales)} ${Math.abs(redondo) === 1 ? 'pt' : 'pts'}` : variacion(cambio, decimales);
  return (
    <span className={`q-delta q-delta-${tono}`}>
      <span className="q-delta-valor"><Flecha size={15} aria-hidden="true" strokeWidth={2.4} />{texto}</span>
      {referencia && <span>{referencia}</span>}
    </span>
  );
}

// ── Ayuda (toggletip): se abre con clic o Enter, se cierra con Esc o al tocar fuera ──
export function Ayuda({ titulo = 'Cómo se calcula', children }) {
  const [abierta, setAbierta] = useState(false);
  const id = useId();
  const ref = useRef(null), globo = useRef(null);
  // el globo nunca sale de la pantalla: al abrirlo (y si cambia el ancho) se mide y se corre hacia adentro, con 16 px
  // de margen. Anclado al botón, se saldría por la izquierda cuando el botón no está pegado al borde derecho
  useLayoutEffect(() => {
    const g = globo.current;
    if (!abierta || !g) return undefined;
    const ubicar = () => {
      g.style.transform = '';
      const r = g.getBoundingClientRect(), m = 16, ancho = document.documentElement.clientWidth;
      const dx = r.left < m ? m - r.left : r.right > ancho - m ? ancho - m - r.right : 0;
      if (dx) g.style.transform = `translateX(${Math.round(dx)}px)`;
    };
    ubicar();
    window.addEventListener('resize', ubicar);
    return () => window.removeEventListener('resize', ubicar);
  }, [abierta]);
  useEffect(() => {
    if (!abierta) return undefined;
    const fuera = (e) => { if (!ref.current?.contains(e.target)) setAbierta(false); };
    const tecla = (e) => { if (e.key === 'Escape') setAbierta(false); };
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('pointerdown', fuera); document.removeEventListener('keydown', tecla); };
  }, [abierta]);
  return (
    <div className="q-ayuda" ref={ref}>
      <button type="button" className="q-ayuda-boton" aria-expanded={abierta} aria-controls={id} onClick={() => setAbierta((a) => !a)}>
        <CircleHelp size={16} aria-hidden="true" /><span className="solo-lector">{titulo}</span>
      </button>
      <div id={id} ref={globo} className="q-ayuda-globo" role="note" hidden={!abierta}>
        <b>{titulo}</b>
        {children}
      </div>
    </div>
  );
}

// ── Selector de período: atajos y, aparte, dos fechas para cualquier tramo ──
// El panel nunca sale de la pantalla: se mide y se corre hacia adentro, como la ayuda
export function SelectorPeriodo({ texto, atajo, atajos, desde, hasta, min, max, comparacion, aviso, onAtajo, onRango }) {
  const [abierto, setAbierto] = useState(false);
  const [borrador, setBorrador] = useState({ desde, hasta });
  const id = useId();
  const ref = useRef(null), panel = useRef(null);
  useEffect(() => { setBorrador({ desde, hasta }); }, [desde, hasta]);
  useLayoutEffect(() => {
    const g = panel.current;
    if (!abierto || !g) return undefined;
    const ubicar = () => {
      g.style.transform = '';
      const r = g.getBoundingClientRect(), m = 16, ancho = document.documentElement.clientWidth;
      const dx = r.left < m ? m - r.left : r.right > ancho - m ? ancho - m - r.right : 0;
      if (dx) g.style.transform = `translateX(${Math.round(dx)}px)`;
    };
    ubicar();
    window.addEventListener('resize', ubicar);
    return () => window.removeEventListener('resize', ubicar);
  }, [abierto]);
  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => { if (!ref.current?.contains(e.target)) setAbierto(false); };
    const tecla = (e) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('pointerdown', fuera); document.removeEventListener('keydown', tecla); };
  }, [abierto]);
  const valida = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || '') && d >= min && d <= max;
  const aplicar = (b) => { if (valida(b.desde) && valida(b.hasta) && b.desde <= b.hasta) onRango(b.desde, b.hasta); };
  // una fecha fuera de la data o un «desde» después del «hasta» no cambia el período: se marca el campo y se dice por qué
  const malDesde = !valida(borrador.desde) || (valida(borrador.hasta) && borrador.desde > borrador.hasta), malHasta = !valida(borrador.hasta);
  const nombre = atajos.find((a) => a.id === atajo)?.nombre;
  return (
    <div className="q-periodo" ref={ref}>
      <button type="button" className="q-periodo-boton" aria-haspopup="dialog" aria-expanded={abierto} aria-controls={id} onClick={() => setAbierto((a) => !a)}>
        <Calendar size={16} aria-hidden="true" /><span>{texto}</span>{nombre && <small>{nombre}</small>}<ChevronDown size={16} aria-hidden="true" />
      </button>
      <div id={id} ref={panel} className="q-periodo-panel" role="dialog" aria-label="Elegir período" hidden={!abierto}>
        <p className="q-periodo-titulo">Atajos</p>
        <div className="q-periodo-atajos">
          {atajos.map((a) => (
            <button key={a.id} type="button" aria-pressed={a.id === atajo} onClick={() => { onAtajo(a.id); setAbierto(false); }}>
              <span>{a.nombre}</span>{a.id === atajo && <Check size={16} aria-hidden="true" />}
            </button>
          ))}
        </div>
        <p className="q-periodo-titulo">Fechas</p>
        <div className="q-periodo-rango">
          <label>Desde<input type="date" value={borrador.desde} min={min} max={valida(borrador.hasta) ? borrador.hasta : max} aria-invalid={malDesde} onChange={(e) => { const b = { ...borrador, desde: e.target.value }; setBorrador(b); aplicar(b); }} /></label>
          <label>Hasta<input type="date" value={borrador.hasta} min={valida(borrador.desde) ? borrador.desde : min} max={max} aria-invalid={malHasta} onChange={(e) => { const b = { ...borrador, hasta: e.target.value }; setBorrador(b); aplicar(b); }} /></label>
        </div>
        {(malDesde || malHasta) && aviso && <p className="q-periodo-error" role="alert">{aviso}</p>}
        {comparacion && <p className="q-periodo-nota">{comparacion}</p>}
      </div>
    </div>
  );
}

// ── Estados: lo que no hay se dice, nunca se dibuja como cero ──
const ESTADOS = {
  'no-cargo': { icono: CloudOff, titulo: 'La fuente no cargó', atencion: true },
  'sin-datos': { icono: Inbox, titulo: 'Sin datos en este período' },
  fuera: { icono: CalendarX2, titulo: 'Fuera de la muestra' },
  'no-medido': { icono: CircleDashed, titulo: 'No se midió' },
  parcial: { icono: TriangleAlert, titulo: 'Dato parcial', atencion: true },
  abierta: { icono: Hourglass, titulo: 'Cohorte abierta' },
};
export function Estado({ tipo, titulo, children }) {
  if (tipo === 'cargando') return <div className="q-esqueleto" aria-busy="true" aria-label="Cargando"><i /><i /><i /></div>;
  const e = ESTADOS[tipo];
  const Icono = e.icono;
  return (
    <div className={`q-estado${e.atencion ? ' q-estado-atencion' : ''}`} role="status" data-estado={tipo}>
      <Icono size={18} aria-hidden="true" />
      <div><b>{titulo || e.titulo}</b>{children}</div>
    </div>
  );
}

// ── Resguardo: si una parte no se puede pintar con la data de hoy, dice eso en su lugar y el resto del panel sigue.
// La data se mueve: una forma que nadie previó no debe dejar la pantalla en blanco. El error queda en la consola.
export class Resguardo extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error('Resguardo', this.props.donde, error); }
  render() {
    if (!this.state.error) return this.props.children;
    const aviso = <Estado tipo="no-cargo" titulo={`${this.props.donde || 'Esta parte'} no se pudo armar con la data de hoy`}><p>El resto del panel sigue al día.</p></Estado>;
    return this.props.envoltura ? <div className="q-envoltura q-capa-vacia">{aviso}</div> : aviso;
  }
}

// ── Bloque: una tarjeta, una lectura, un universo (o dos lado a lado, como ATL y digital: se nombran, no se suman) ──
// Misma estructura siempre (cabecera, cuerpo, pie con la fuente) para que las tarjetas vecinas se alineen fila por fila.
// Cada tarjeta dice su ventana arriba a la derecha: con calendario si sigue el período elegido, con alfiler si no
// (una cohorte, la última lectura, los meses que vienen). El período de la capa llega por contexto.
export const VentanaContexto = createContext(null);
// Demo: mientras «carga», cada tarjeta muestra su esqueleto en lugar del cuerpo
export const CargandoContexto = createContext(false);
// Los detalles abiertos de entrada: solo para la prueba de render, que pinta cada capa con su panel de detalle
export const DetallesAbiertos = createContext(false);
export function Ventana({ texto, fija }) {
  const Icono = fija ? Pin : Calendar;
  return <span className={`q-ventana${fija ? ' q-ventana-fija' : ''}`} title={fija ? 'No sigue el período elegido' : 'Sigue el período elegido'}><Icono size={12} aria-hidden="true" />{texto}</span>;
}

// avisos: lo que la regla encontró en el dato de esta tarjeta, en una línea cada uno (nivel y frase), debajo de la
// lectura. ejemplo: la tarjeta pinta data de ejemplo (fuente por conectar) y lo dice arriba, a la vista
export function Bloque({ titulo, lectura, universo, ancho = 'completo', alcance, ventana, estado, ayuda, pie, children, id, avisos = [], ejemplo = false }) {
  const us = [].concat(universo ?? []).map((k) => UNIVERSOS[k]).filter(Boolean);
  const periodo = useContext(VentanaContexto);
  const cargando = useContext(CargandoContexto);
  const texto = alcance || (ventana === false ? null : ventana || periodo);
  if (cargando) estado = { tipo: 'cargando', reemplaza: true };
  return (
    <article className={`q-bloque q-${ancho}`} id={id} data-estado={estado?.tipo || 'ok'} data-ejemplo={ejemplo || undefined}>
      <header className="q-bloque-cab">
        <div className="q-bloque-titulo">
          <h3>{titulo}</h3>
          <div className="q-bloque-marcas">
            {ejemplo && <span className="q-ejemplo"><FlaskConical size={13} aria-hidden="true" />Data de ejemplo</span>}
            {texto && <Ventana texto={texto} fija={!!alcance} />}
            {ayuda && <Ayuda>{ayuda}</Ayuda>}
          </div>
        </div>
        {lectura && !estado?.reemplaza && <p className="q-bloque-lectura">{lectura}</p>}
        {avisos.length > 0 && !estado?.reemplaza && <AvisosTarjeta avisos={avisos} />}
      </header>
      <div className="q-bloque-cuerpo">
        {estado && <Estado tipo={estado.tipo} titulo={estado.titulo}>{estado.texto && <p>{estado.texto}</p>}</Estado>}
        {!estado?.reemplaza && <Resguardo donde="El gráfico">{children}</Resguardo>}
      </div>
      <footer className="q-bloque-pie">
        {us.map((u) => <span key={u.nombre} className="q-pie-universo"><u.icono size={13} aria-hidden="true" />{u.nombre}</span>)}
        {pie}
      </footer>
    </article>
  );
}

// ── Flujo: una fila por plataforma y una columna por paso (inversión, reportado, en el CRM, inscritos).
// Cada paso dice su cifra y debajo su costo o su razón; la flecha marca que un paso sale del anterior ──
export function Flujo({ etiqueta, columnas, filas, nota }) {
  return (
    <div className="q-flujo" role="table" aria-label={etiqueta} style={{ '--pasos': columnas.length }}>
      <div className="q-flujo-fila q-flujo-cab" role="row">
        <span role="columnheader" />
        {columnas.map((c) => <span key={c} role="columnheader">{c}</span>)}
      </div>
      {filas.map((f, i) => (
        <div key={f.nombre} className="q-flujo-fila" role="row">
          <span className="q-flujo-nombre" role="rowheader">{f.clase !== null && <span className={`q-muestra ${f.clase ?? `q-p${i}`}`} aria-hidden="true" />}{f.nombre}</span>
          {f.pasos.map((p, j) => (
            <span key={j} className="q-flujo-paso" role="cell">
              {j > 0 && <ArrowRight className="q-flujo-flecha" size={14} aria-hidden="true" />}
              <i className="q-flujo-rotulo" aria-hidden="true">{columnas[j]}</i>
              <b>{p.valor}</b>{p.nota && <span>{p.nota}</span>}
            </span>
          ))}
        </div>
      ))}
      {nota && <p className="q-nota-bloque">{nota}</p>}
    </div>
  );
}

// ── Sugerencia del modelo: una frase que se puede decidir, su detalle y, al costado, una columna por plataforma.
// Se distingue de un dato leído: lleva el robot y el rótulo, y sus supuestos van en la ayuda ──
export function SugerenciaModelo({ titulo, detalle, columnas = [], ayuda, pie }) {
  return (
    <article className="q-bloque q-completo q-modelo">
      <header className="q-modelo-cab">
        <span className="q-modelo-icono" aria-hidden="true"><Bot size={16} /></span>
        <span className="q-modelo-rotulo">Sugerencia del modelo</span>
        {ayuda && <Ayuda>{ayuda}</Ayuda>}
      </header>
      <div className="q-modelo-cuerpo">
        <div className="q-modelo-texto">
          <p className="q-modelo-titulo">{titulo}</p>
          {detalle && <p className="q-modelo-detalle">{detalle}</p>}
        </div>
        {columnas.length > 0 && (
          <ul className="q-modelo-columnas">
            {columnas.map((c, i) => (
              <li key={c.nombre}>
                <span className="q-modelo-nombre"><span className={`q-muestra q-p${i}`} aria-hidden="true" />{c.nombre}</span>
                <span className="q-modelo-valor">{c.valor}</span>
                <span className="q-modelo-unidad">{c.unidad}</span>
                {c.nota && <span className="q-modelo-nota">{c.nota}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      <footer className="q-bloque-pie">{pie}</footer>
    </article>
  );
}

// ── Capítulo: un panel que agrupa las tarjetas de una fuente. Se lee como parte del flujo, no como un corte ──
export const numeroCapitulo = (numero) => String(numero).split('.').at(-1).padStart(2, '0');
export function Seccion({ id, numero, titulo, pregunta, fuentes = [], avisos, children }) {
  const conProblema = fuentes.filter((f) => f.estado !== 'ok');
  return (
    <section className="q-capitulo" id={id} aria-labelledby={id + '-t'} data-seccion={numero}>
      <header className="q-capitulo-cab">
        <span className="q-capitulo-num" aria-hidden="true">{numeroCapitulo(numero)}</span>
        <div>
          <h2 id={id + '-t'}>{titulo}</h2>
          {pregunta && <p>{pregunta}</p>}
        </div>
        {conProblema.length > 0 && <div className="q-capitulo-avisos">{conProblema.map((f) => <ChipFuente key={f.nombre} {...f} />)}</div>}
      </header>
      {avisos}
      <div className="q-capitulo-cuerpo">{children}</div>
    </section>
  );
}

// ── Alertas: el nivel lleva icono, palabra y color (el color nunca va solo) ──
export const NIVELES = {
  atencion: { icono: TriangleAlert, nombre: 'Atención' },
  revisar: { icono: Eye, nombre: 'Para revisar' },
  oportunidad: { icono: TrendingUp, nombre: 'Oportunidad' },
  bien: { icono: CircleCheck, nombre: 'Va bien' },
};

export function Alerta({ id, nivel, titulo, dato, mirar, fuente, ir, irTexto }) {
  const n = NIVELES[nivel];
  return (
    <article className={`q-alerta q-alerta-${nivel}`} id={id}>
      <div className="q-alerta-cab">
        <span className="q-nivel"><n.icono size={14} aria-hidden="true" strokeWidth={2.4} />{n.nombre}</span>
        <span className="q-alerta-fuente">{fuente}</span>
      </div>
      <h3>{titulo}</h3>
      <p className="q-alerta-dato">{dato}</p>
      {mirar && <p className="q-alerta-mirar"><b>{nivel === 'bien' ? 'Qué sostener:' : 'Qué mirar:'}</b> {mirar}</p>}
      {ir && <a className="q-alerta-ir" href={'#' + ir}>Ver el dato en {irTexto}<Ir size={14} aria-hidden="true" /></a>}
    </article>
  );
}

// Qué mirar, compacto: una lista numerada por nivel. Cada fila dice el dato en el título y la acción debajo;
// al abrirla, el detalle y el enlace a la tarjeta que lo sostiene. Un ancla #a-… abre su fila.
export function ListaAlertas({ grupos }) {
  useEffect(() => {
    const abrir = () => { const el = document.getElementById(location.hash.slice(1)); if (el?.tagName === 'DETAILS') el.open = true; };
    abrir();
    window.addEventListener('hashchange', abrir);
    return () => window.removeEventListener('hashchange', abrir);
  }, []);
  let n = 0;
  return (
    <div className="q-lista-alertas">
      {grupos.filter((g) => g.items.length).map((g) => (
        <section key={g.nivel} className={`q-lista-grupo q-alerta-${g.nivel}`} aria-label={g.titulo}>
          <h3>{g.titulo} <span>{g.items.length}</span></h3>
          <ol>
            {g.items.map((a) => {
              n += 1;
              const nv = NIVELES[a.nivel];
              return (
                <li key={a.id}>
                  <details id={a.id} className="q-fila-alerta">
                    <summary>
                      <span className="q-fila-num">{n}</span>
                      <span className="q-fila-cuerpo">
                        <span className="q-fila-titulo"><span className="q-nivel" title={nv.nombre}><nv.icono size={14} aria-hidden="true" strokeWidth={2.4} /><span className="solo-lector">{nv.nombre}: </span></span>{a.titulo}</span>
                        {a.mirar && <span className="q-fila-mirar"><CornerDownRight size={14} aria-hidden="true" />{a.mirar}</span>}
                      </span>
                      <span className="q-fila-fuente">{a.fuente}</span>
                      <ChevronDown className="q-fila-abrir" size={16} aria-hidden="true" />
                    </summary>
                    <div className="q-fila-detalle">
                      <p>{a.dato}</p>
                      {a.ir && <a className="q-alerta-ir" href={'#' + (a.irA || a.ir)}>Ver el dato en {a.irTexto}<Ir size={14} aria-hidden="true" /></a>}
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

// Avisos de un capítulo: una línea por alerta, que lleva a su fila en Qué mirar
// Frente al objetivo: icono y palabra (el color nunca va solo), con los colores de los niveles de alerta
// el texto llega escrito desde src/textos (dice el margen del objetivo)
const SEMAFORO = { bien: { nivel: 'bien', icono: CircleCheck }, cerca: { nivel: 'revisar', icono: Eye }, lejos: { nivel: 'atencion', icono: TriangleAlert } };
// El tono de un tema de la conversación: icono y palabra sobre un fondo suave (verde, rojo o sin color si es neutro)
const TONO_ICONO = { 'muy-positivo': ThumbsUp, positivo: ThumbsUp, neutro: Minus, negativo: ThumbsDown, 'muy-negativo': ThumbsDown };
export function Tono({ tono, texto }) {
  const Icono = TONO_ICONO[tono];
  if (!Icono) return null;
  return <span className={`q-tono q-tono-${tono}`}><Icono size={14} aria-hidden="true" />{texto}</span>;
}
export function Semaforo({ estado, texto }) {
  const x = SEMAFORO[estado];
  if (!x) return null;
  return <span className={`q-nivel q-alerta-${x.nivel}`}><x.icono size={14} aria-hidden="true" strokeWidth={2.4} />{texto}</span>;
}

// Los avisos de una tarjeta: el nivel (icono y palabra, el color nunca va solo) y la frase, sin enlace a otro lado.
// accion: un botón que cambia lo que muestra la misma tarjeta (el aviso de una marca vigilada la elige en el filtro)
export function AvisosTarjeta({ avisos }) {
  return (
    <ul className="q-avisos-tarjeta" aria-label="Avisos de esta tarjeta">
      {avisos.map((a) => {
        const n = NIVELES[a.nivel];
        return (
          <li key={a.id} className={`q-alerta-${a.nivel}`}><span className="q-nivel"><n.icono size={14} aria-hidden="true" strokeWidth={2.4} />{n.nombre}</span>
            <span>{a.titulo}{a.accion && <> <button type="button" className="q-aviso-accion" onClick={a.accion.alHacer} aria-label={a.accion.etiqueta}>{a.accion.texto}</button></>}</span>
          </li>
        );
      })}
    </ul>
  );
}

// Texto con énfasis: una frase armada en src/textos como segmentos { t, cifra, tono }.
// cifra va en negrita; tono 'empeora' o 'mejora' colorea solo ese tramo (la distancia al objetivo), nunca la frase entera
export function Frase({ segmentos }) {
  return <>{segmentos.map((g, i) => (g.cifra ? <b key={i}>{g.t}</b> : g.tono ? <span key={i} className={'q-tono-' + g.tono}>{g.t}</span> : <span key={i}>{g.t}</span>))}</>;
}

// ── Resumen de la capa: pocas cifras, cada una lleva a su capítulo ──
// frases: una línea por plataforma debajo de las cifras (cuánto pagó y qué tan lejos quedó de su objetivo).
// Se eligió la frase y no una barra: se lee sin aprender a leer nada y no compite con las cifras de arriba.
// Una línea chica de una serie (las últimas semanas de una cifra del resumen): sin ejes, solo la forma y el último punto
export function Chispa({ valores, etiqueta, tono }) {
  const vs = (valores || []).filter((v) => v != null);
  if (vs.length < 2) return null;
  const w = 120, h = 28, p = 3, min = Math.min(...vs), max = Math.max(...vs), r = max - min || 1;
  const pts = vs.map((v, i) => [p + (i * (w - 2 * p)) / (vs.length - 1), p + ((max - v) / r) * (h - 2 * p)]);
  return (
    <svg className={`q-chispa${tono ? ` q-chispa-${tono}` : ''}`} width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={etiqueta}>
      <polyline points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} />
      <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="2.5" />
    </svg>
  );
}

// comparado: contra qué fechas se miden los cambios de las cifras; va al pie, dentro de la tarjeta (los cambios solo dicen
// cuánto y hacia dónde, nunca repiten la cifra anterior)
// neutro: las flechas van en gris porque el color queda para el objetivo (objetivo: «/ 320» al lado de la cifra; avance: el
// porcentaje del objetivo, con su tono)
export function Resumen({ titulo, items, pie, frases = [], ejemplo = false, lectura, comparado, neutro = false }) {
  const cargando = useContext(CargandoContexto);
  if (cargando) return <section className="q-resumen" id="resumen"><h2 className="q-resumen-titulo">{titulo}</h2><Estado tipo="cargando" /></section>;
  return (
    <section className={`q-resumen${neutro ? ' q-resumen-neutro' : ''}`} aria-labelledby="resumen-t" id="resumen" data-ejemplo={ejemplo || undefined}>
      <div className="q-resumen-cab"><h2 id="resumen-t" className="q-resumen-titulo">{titulo}</h2>{ejemplo && <span className="q-ejemplo"><FlaskConical size={13} aria-hidden="true" />Data de ejemplo</span>}</div>
      {lectura && <p className="q-resumen-lectura">{lectura}</p>}
      <ul className={`q-resumen-cifras${items.some((i) => i.chispa) ? ' q-resumen-con-chispa' : ''}`}>
        {items.map((i) => {
          const u = UNIVERSOS[i.universo];
          return (
            <li key={i.rotulo}>
              <span className="q-resumen-rotulo">{i.serie != null && <span className={`q-punto q-p${i.serie}`} aria-hidden="true" />}{i.rotulo}</span>
              <span className={`q-cifra-valor${i.valor == null ? ' q-cifra-sin-dato' : ''}`} data-clave={i.dataClave}>{i.valor ?? NO_MEDIDO}{i.objetivo && <span className="q-resumen-objetivo"> / {i.objetivo}</span>}</span>
              {i.avance ? (
                <span className="q-resumen-avance">
                  <span className={`q-avance${i.avance.tono ? ` q-avance-${i.avance.tono}` : ''}`} aria-label={`${i.avance.texto} del objetivo`}>{i.avance.texto}</span>
                  {i.delta && <Delta {...i.delta} />}
                </span>
              ) : i.delta ? <Delta {...i.delta} /> : i.nota ? <span className="q-delta">{i.nota}</span> : <span aria-hidden="true" />}
              {i.chispa && <Chispa valores={i.chispa} etiqueta={i.chispaEtiqueta} tono={i.chispaTono} />}
              {i.ir && <a className="q-resumen-ir" href={'#' + i.ir}>{u && <u.icono size={13} aria-hidden="true" />}{i.irTexto}</a>}
            </li>
          );
        })}
      </ul>
      {frases.length > 0 && (
        <ul className="q-resumen-frases">
          {frases.map((f, k) => <li key={k}><span className={`q-punto q-p${f.serie}`} aria-hidden="true" /><span><Frase segmentos={f.segmentos} /></span></li>)}
        </ul>
      )}
      {(pie || comparado) && <footer className="q-bloque-pie">{comparado && <span className="q-resumen-comparado">{comparado}</span>}{pie}</footer>}
    </section>
  );
}

// ── Fecha de cada fuente, en una línea: el punto dice el estado y el texto también ──
export function FuentesCapa({ fuentes }) {
  return (
    <ul className="q-fuentes" aria-label="Fuentes y fecha de corte">
      {fuentes.map((f) => (
        <li key={f.nombre} className={`q-fuente-${f.estado}`}><i aria-hidden="true" />{f.nombre} <span>{f.detalle}</span></li>
      ))}
    </ul>
  );
}

// ── Navegación entre las tres capas: pestañas de texto, sin peso de tarjeta ──
export function NavegacionCapas({ capas, activa, onCambiar }) {
  // en el celular la barra se desliza: la capa activa se trae a la vista al cargar y al cambiar (solo en horizontal)
  const nav = useRef(null);
  useEffect(() => {
    const n = nav.current, a = n?.querySelector('[aria-current="page"]');
    if (!n || !a || n.scrollWidth <= n.clientWidth) return;
    const rn = n.getBoundingClientRect(), ra = a.getBoundingClientRect();
    n.scrollLeft += ra.left - rn.left - (rn.width - ra.width) / 2;
  }, [activa]);
  return (
    <nav ref={nav} className="q-capas" aria-label="Capas del algoritmo">
      <ol>
        {capas.map((c) => (
          <li key={c.id}>
            <a href={'#' + c.id} aria-current={c.id === activa ? 'page' : undefined} title={c.descripcion}
              onClick={(e) => { e.preventDefault(); onCambiar(c.id); }}>
              <span className="q-capa-num" aria-hidden="true">{c.numero}</span>{c.nombre}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ── Índice de la capa: al costado, fijo, marca el capítulo que se está leyendo ──
// Activo = el último capítulo cuyo inicio ya pasó bajo la barra fija; arriba de todo, el primero (Resumen);
// al llegar al final de la página, el último. Se mide en cada scroll, no con umbrales que dejan huecos.
// Un clic baja al capítulo sin cambiar de capa; «Resumen» apunta a su capa, así un ancla compartida no se pierde.
export function IndiceCapa({ secciones, etiqueta, conResumen = true, capaId }) {
  const ids = [...(conResumen ? ['resumen'] : []), ...secciones.map((s) => s.id)];
  const [activa, setActiva] = useState(ids[0]);
  useEffect(() => {
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      const tope = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--alto-capas')) || 0;
      let actual = ids[0];
      for (const id of ids) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= tope + 32) actual = id; }
      if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) actual = ids.at(-1);
      setActiva(actual);
    };
    const alMover = () => { if (!cuadro) cuadro = requestAnimationFrame(medir); };
    medir();
    window.addEventListener('scroll', alMover, { passive: true });
    window.addEventListener('resize', alMover);
    return () => { window.removeEventListener('scroll', alMover); window.removeEventListener('resize', alMover); cancelAnimationFrame(cuadro); };
  }, [secciones]); // eslint-disable-line react-hooks/exhaustive-deps
  const ir = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'start', behavior: quieto ? 'auto' : 'smooth' });
    // en un marco aislado (la página publicada) cambiar la dirección puede no estar permitido: el salto ya ocurrió
    try { history.replaceState(null, '', '#' + (id === 'resumen' && capaId ? capaId : id)); } catch { /* sin dirección, igual baja */ }
  };
  return (
    <nav className="q-indice" aria-label={etiqueta}>
      <span className="q-indice-titulo">En esta capa</span>
      <ol>
        {conResumen && <li><a href={'#' + (capaId || 'resumen')} onClick={(e) => ir(e, 'resumen')} aria-current={activa === 'resumen' ? 'true' : undefined}>Resumen</a></li>}
        {secciones.map((s) => (
          <li key={s.id}><a href={'#' + s.id} onClick={(e) => ir(e, s.id)} aria-current={s.id === activa ? 'true' : undefined}>{s.titulo}</a></li>
        ))}
      </ol>
    </nav>
  );
}

// ── Opciones excluyentes ──
// La opción que vale: la elegida si sigue disponible; si no (la fuente se cayó, cambió el mes), la primera que lo esté.
// Así una elección vieja nunca deja una tarjeta vacía ni un control con una opción desactivada como elegida.
export const vigente = (valor, opciones) => (opciones.some((o) => o.valor === valor && !o.desactivada) ? valor : opciones.find((o) => !o.desactivada)?.valor ?? valor);

// Con más de MAX_GRUPO opciones (más ciudades, más marcas) los botones ya no caben en un celular: pasa a ser una lista
const MAX_GRUPO = 4;
export function Grupo({ etiqueta, opciones, valor, onCambiar }) {
  if (opciones.length > MAX_GRUPO) {
    return (
      <select className="q-selector" aria-label={etiqueta} value={valor} onChange={(e) => onCambiar(e.target.value)}>
        {opciones.map((o) => <option key={o.valor} value={o.valor} disabled={o.desactivada}>{o.texto}</option>)}
      </select>
    );
  }
  return (
    <div className="q-grupo" role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button key={o.valor} type="button" aria-pressed={o.valor === valor} onClick={() => onCambiar(o.valor)} disabled={o.desactivada} title={o.titulo}>{o.muestra && <span className={`q-muestra ${o.muestra}`} aria-hidden="true" />}{o.texto}</button>
      ))}
    </div>
  );
}

export function Selector({ etiqueta, opciones, valor, onCambiar }) {
  return (
    <label className="q-control">
      <span>{etiqueta}</span>
      <select className="q-selector" value={valor} onChange={(e) => onCambiar(e.target.value)}>
        {opciones.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
      </select>
    </label>
  );
}

// ── Tabla: números a la derecha, primera columna como encabezado de fila ──
// barra: { columna, valores } pone una barra delgada junto a la cifra de esa columna (magnitud de un vistazo).
// Una celda puede ser texto o { texto, sub, tono }: sub va debajo en gris; tono 'empeora' o 'mejora' colorea la cifra.
// destacada: índice de la fila que se resalta (la propia marca, la página nueva).
const celda = (v) => (v && typeof v === 'object' && !Array.isArray(v) && 'texto' in v ? v : { texto: v });
// mejor y peor: { fila, texto } para marcar dos filas (la de mejor y la de peor desempeño) con fondo verde o rojo claro.
// A pedido del equipo se ve solo el resaltado; el texto queda para el lector de pantalla y la ayuda de la tarjeta lo explica
export function Tabla({ etiqueta, columnas, filas, numericas = [], barra, destacada, apagadas = [], mejor, peor }) {
  const positivos = barra ? barra.valores.filter((x) => x != null && x > 0) : [];
  const max = positivos.length ? Math.max(...positivos) : 1;
  return (
    <div className="q-tabla-marco" role="region" aria-label={etiqueta} tabIndex={0}>
      <table className="q-tabla">
        <thead><tr>{columnas.map((c, j) => <th key={c} scope="col" className={numericas.includes(j) ? 'q-num' : undefined}>{c}</th>)}</tr></thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className={i === mejor?.fila ? 'q-fila-mejor' : i === peor?.fila ? 'q-fila-peor' : i === destacada ? 'q-fila-destacada' : apagadas.includes(i) ? 'q-fila-apagada' : undefined}>{f.map((v, j) => {
              const c = celda(v);
              const contenido = <>{c.texto}{c.sub && <span className="q-tabla-sub">{c.sub}</span>}</>;
              const marca = i === mejor?.fila ? mejor : i === peor?.fila ? peor : null;
              if (j === 0) return <th key={j} scope="row">{contenido}{marca && <span className="solo-lector"> ({marca.texto})</span>}</th>;
              const clase = [numericas.includes(j) && 'q-num', c.tono && 'q-tono-' + c.tono].filter(Boolean).join(' ') || undefined;
              if (barra && j === barra.columna) {
                const valor = barra.valores[i];
                return <td key={j} className={clase}><span className="q-celda-barra"><i aria-hidden="true" style={{ width: valor == null ? 0 : `${(valor / max) * 100}%` }} /><span>{contenido}</span></span></td>;
              }
              return <td key={j} className={clase}>{contenido}</td>;
            })}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Datos({ pares }) {
  return <dl className="q-datos">{pares.map(([k, v]) => [<dt key={k + 't'}>{k}</dt>, <dd key={k + 'd'}>{v}</dd>])}</dl>;
}

// ── Panel lateral (Qué se monitorea): se abre desde la cabecera de la capa; Esc o la X lo cierran ──
export function PanelLateral({ titulo, bajada, abierto, onCerrar, children, className = '' }) {
  const ref = useRef(null);
  const tituloId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
    // con el panel abierto, la rueda no mueve la página de atrás (igual que en las ventanas)
    if (!abierto) return undefined; // un panel cerrado no toca la clase: podría haber una ventana abierta
    document.documentElement.classList.add('q-sin-desplazar');
    return () => document.documentElement.classList.remove('q-sin-desplazar');
  }, [abierto]);
  return (
    <dialog ref={ref} className={`q-panel ${className}`} aria-labelledby={tituloId} onClose={onCerrar} onClick={(e) => { if (e.target === ref.current) onCerrar(); }}>
      <div className="q-panel-cuerpo">
        <header className="q-panel-cab">
          <div><h2 id={tituloId}>{titulo}</h2>{bajada && <p>{bajada}</p>}</div>
          <button type="button" className="q-boton q-boton-quieto" onClick={onCerrar} aria-label="Cerrar"><X size={18} aria-hidden="true" /></button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

// ── Detalle de un capítulo: la vista general queda siempre a la vista y lo minucioso se abre aparte, en el panel
// de la derecha. El botón nombra lo que hay adentro, para que nada quede escondido sin aviso. Un ancla #detalle-…
// (la que usan las alertas cuyo dato vive en el detalle) lo abre. El contenido se arma solo con el panel abierto.
export function Detalle({ id, titulo, bajada, vistas, children }) {
  const [abierto, setAbierto] = useState(useContext(DetallesAbiertos));
  useEffect(() => {
    // el ancla lo abre; si el ancla cambia (el botón Atrás), lo cierra. Un detalle abierto con clic no tiene ancla
    // propia, así que solo se cierra si antes lo había abierto el ancla
    let porAncla = false;
    const mirar = () => {
      if (location.hash === '#' + id) { porAncla = true; setAbierto(true); }
      else if (porAncla) { porAncla = false; setAbierto(false); }
    };
    mirar();
    window.addEventListener('hashchange', mirar);
    return () => window.removeEventListener('hashchange', mirar);
  }, [id]);
  const boton = useRef(null);
  const cerrar = () => {
    setAbierto(false);
    // el ancla que lo abrió vuelve a ser la del capítulo: la capa sigue en la dirección y pedir el detalle otra vez lo abre
    if (location.hash === '#' + id) history.replaceState(null, '', `${location.pathname}${location.search}#${id.replace(/^detalle-/, '')}`);
    // si se abrió desde un enlace no hubo botón que recupere el foco: vuelve al botón del detalle
    setTimeout(() => { if (!document.activeElement || document.activeElement === document.body) boton.current?.focus(); }, 60);
  };
  return (
    <div className="q-detalle" id={id}>
      <button ref={boton} type="button" className="q-boton q-detalle-boton" aria-haspopup="dialog" aria-expanded={abierto} onClick={() => setAbierto(true)}>
        <PanelRightOpen size={16} aria-hidden="true" />
        <span>Ver el detalle<span className="q-detalle-vistas">: {vistas.length > 1 ? `${vistas.slice(0, -1).join(', ')} y ${vistas.at(-1)}` : vistas[0]}</span></span>
      </button>
      <PanelLateral titulo={titulo} bajada={bajada} abierto={abierto} onCerrar={cerrar} className="q-panel-detalle">
        {abierto && <div className="q-detalle-cuerpo">{children}</div>}
      </PanelLateral>
    </div>
  );
}

export function Monitoreo({ grupos }) {
  return (
    <div className="q-monitoreo">
      {grupos.map((g) => (
        <section key={g.titulo}>
          <h3>{g.titulo} <span>{g.items.length}</span></h3>
          <ul className="q-palabras">{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>
      ))}
    </div>
  );
}

export function BotonMonitoreo({ onClick }) {
  return <button type="button" className="q-boton q-boton-chico" onClick={onClick}><ListChecks size={15} aria-hidden="true" />Qué se monitorea</button>;
}

// ── Barra de la demo: muestra en vivo cómo responde el panel cuando carga o cuando una fuente no llega ──
// escenarios (opcional): un selector más para ver la misma data movida para un lado o para el otro
export function BarraDemo({ opciones, valor, onCambiar, escenarios, escenario, onEscenario }) {
  return (
    <div className="q-barra-demo" role="group" aria-label="Estados de la demo">
      <span><Layers size={14} aria-hidden="true" />Demo</span>
      {opciones.map((o) => <button key={o.valor} type="button" aria-pressed={o.valor === valor} onClick={() => onCambiar(o.valor)}>{o.texto}</button>)}
      {escenarios && (
        <select className="q-barra-demo-escenario" aria-label="Escenario de data" value={escenario || ''} onChange={(e) => onEscenario(e.target.value || null)}>
          <option value="">Data real</option>
          {escenarios.map((e) => <option key={e.id} value={e.id}>{e.titulo}</option>)}
        </select>
      )}
    </div>
  );
}

// ── Ventana modal genérica (<dialog> nativo): atrapa el foco, Escape la cierra, solo se desplaza su cuerpo.
// El clic en el velo cierra solo si empezó en el velo. Al cerrar, el foco vuelve a quien la abrió (o a `volver`).
// Escape sale primero de la pantalla completa: ese mismo Escape no cierra la ventana que queda detrás
let salidaPantalla = 0;
if (typeof document !== 'undefined') document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) salidaPantalla = Date.now(); });
export function Dialogo({ abierto, titulo, bajada, onCerrar, volver, children }) {
  const ref = useRef(null);
  const previo = useRef(null);
  const enVelo = useRef(false);
  const tituloId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) {
      previo.current = document.activeElement;
      d.showModal();
      document.documentElement.classList.add('q-sin-desplazar');
      d.querySelector('.q-dialogo-cerrar')?.focus();
    }
    if (!abierto && d.open) d.close();
  }, [abierto]);
  useEffect(() => () => document.documentElement.classList.remove('q-sin-desplazar'), []);
  const alCerrar = () => {
    // una foto ampliada se abre sobre la ventana de anuncios: al cerrarla, la de abajo sigue sin desplazar la página
    if (!document.querySelector('dialog.q-dialogo[open]')) document.documentElement.classList.remove('q-sin-desplazar');
    const v = previo.current;
    if (v?.isConnected && v.offsetParent !== null) v.focus(); else volver?.();
    if (abierto) onCerrar?.();
  };
  return (
    <dialog ref={ref} className="q-dialogo" aria-labelledby={tituloId} onClose={alCerrar}
      onCancel={(e) => { e.preventDefault(); if (document.fullscreenElement || Date.now() - salidaPantalla < 500) return; ref.current?.close(); }}
      onPointerDown={(e) => { enVelo.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (e.target === e.currentTarget && enVelo.current) ref.current?.close(); enVelo.current = false; }}>
      <div className="q-dialogo-marco">
        <header className="q-dialogo-cab">
          <div><h2 id={tituloId}>{titulo}</h2>{bajada && <p>{bajada}</p>}</div>
          <button type="button" className="q-boton q-boton-quieto q-dialogo-cerrar" onClick={() => ref.current?.close()} aria-label="Cerrar"><X size={18} aria-hidden="true" /></button>
        </header>
        <div className="q-dialogo-cuerpo">{abierto ? children : null}</div>
      </div>
    </dialog>
  );
}

// ── Visor de una foto: la foto entera, con zoom (botones, rueda, doble clic o dos dedos) y arrastre cuando está
// ampliada. Para las fotos de panel, que llegan verticales y en la ficha se ven chicas.
const ZOOM_MAX = 5;
export function VisorFoto({ abierto, onCerrar, src, alt, titulo, bajada, volver }) {
  const [z, setZ] = useState({ s: 1, x: 0, y: 0 });
  const caja = useRef(null), punteros = useRef(new Map()), inicio = useRef(null);
  useEffect(() => { if (abierto) setZ({ s: 1, x: 0, y: 0 }); }, [abierto, src]);
  const acotar = ({ s, x, y }) => {
    const r = caja.current?.getBoundingClientRect(), n = Math.min(ZOOM_MAX, Math.max(1, s));
    if (!r || n === 1) return { s: n, x: 0, y: 0 };
    const mx = (r.width * (n - 1)) / 2, my = (r.height * (n - 1)) / 2;
    return { s: n, x: Math.min(mx, Math.max(-mx, x)), y: Math.min(my, Math.max(-my, y)) };
  };
  const zoom = (f) => setZ((v) => acotar({ ...v, s: v.s * f }));
  // la rueda acerca y aleja sin mover la página: el listener no puede ser pasivo
  useEffect(() => {
    const el = caja.current;
    if (!abierto || !el) return undefined;
    const rueda = (e) => { e.preventDefault(); setZ((v) => acotar({ ...v, s: v.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15) })); };
    el.addEventListener('wheel', rueda, { passive: false });
    return () => el.removeEventListener('wheel', rueda);
  }, [abierto]); // eslint-disable-line react-hooks/exhaustive-deps
  const bajar = (e) => { caja.current?.setPointerCapture(e.pointerId); punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); inicio.current = null; };
  const mover = (e) => {
    const ps = punteros.current;
    if (!ps.has(e.pointerId)) return;
    const antes = ps.get(e.pointerId);
    ps.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ps.size === 2) {
      // dos dedos: la distancia entre ellos marca el zoom
      const [a, b] = [...ps.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (inicio.current) setZ((v) => acotar({ ...v, s: v.s * (d / inicio.current) }));
      inicio.current = d;
    } else setZ((v) => (v.s > 1 ? acotar({ ...v, x: v.x + e.clientX - antes.x, y: v.y + e.clientY - antes.y }) : v));
  };
  const soltar = (e) => { punteros.current.delete(e.pointerId); inicio.current = null; };
  return (
    <Dialogo abierto={abierto} onCerrar={onCerrar} titulo={titulo} bajada={bajada} volver={volver}>
      <div className="q-visor">
        <div className="q-visor-controles" role="group" aria-label="Zoom de la foto">
          <button type="button" className="q-boton q-boton-chico" onClick={() => zoom(1.5)} disabled={z.s >= ZOOM_MAX} aria-label="Acercar"><ZoomIn size={16} aria-hidden="true" /></button>
          <button type="button" className="q-boton q-boton-chico" onClick={() => zoom(1 / 1.5)} disabled={z.s <= 1} aria-label="Alejar"><ZoomOut size={16} aria-hidden="true" /></button>
          <button type="button" className="q-boton q-boton-chico" onClick={() => setZ({ s: 1, x: 0, y: 0 })} disabled={z.s === 1}>Ver entera</button>
        </div>
        <div ref={caja} className={`q-visor-lienzo${z.s > 1 ? ' q-visor-ampliado' : ''}`} onPointerDown={bajar} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar}
          onDoubleClick={() => setZ((v) => (v.s > 1 ? { s: 1, x: 0, y: 0 } : acotar({ ...v, s: 2.5 })))}>
          <img src={src} alt={alt} draggable={false} referrerPolicy="no-referrer" style={{ transform: `translate(${z.x}px, ${z.y}px) scale(${z.s})` }} />
        </div>
      </div>
    </Dialogo>
  );
}

// ── Pieza de muestra: la demo no reproduce anuncios reales. Composición neutra con el tema y el formato ──
export function ArteMuestra({ a, grande = false }) {
  const marca = a.formato === 'Video' ? <Play size={grande ? 18 : 12} aria-hidden="true" />
    : a.formato === 'Carrusel' ? <span aria-hidden="true"><i /><i /><i /></span> : null;
  const tema = <span className="q-arte-tema">{a.titulo}</span>;
  return (
    <span className={`q-arte q-arte-${a.arte ?? 0}${grande ? ' q-arte-grande' : ''}`}>
      {a.arte ? <>{tema}<span className="q-arte-bloque" /></> : <><span className="q-arte-bloque" />{tema}</>}
      {marca && <span className="q-arte-marca">{marca}</span>}
    </span>
  );
}

// ── Reproductor de audio y video: botón grande, barra de avance que se agarra con el dedo, el tiempo a la vista y
// saltos de 10 segundos. Los controles del navegador quedan chicos en una tarjeta angosta ──
const reloj = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');
// Suena un solo medio a la vez: el play de uno pausa a los demás, también a los que quedaron detrás de una ventana
let excluyente = false;
export function unSoloMedio() {
  if (excluyente || typeof document === 'undefined') return;
  excluyente = true;
  document.addEventListener('play', (e) => {
    for (const m of document.querySelectorAll('audio, video')) if (m !== e.target && !m.paused && !m.muted) m.pause();
  }, true);
}
// La pantalla completa: el marco entero (el video y su barra) o, donde el navegador no lo deja (el iPhone), el video solo
function usePantallaCompleta(marco, video) {
  const [completa, setCompleta] = useState(false);
  useEffect(() => {
    const cambio = () => setCompleta(!!marco.current && document.fullscreenElement === marco.current);
    document.addEventListener('fullscreenchange', cambio);
    return () => document.removeEventListener('fullscreenchange', cambio);
  }, [marco]);
  const alternar = () => {
    if (document.fullscreenElement) { document.exitFullscreen?.(); return; }
    const c = marco.current, v = video?.current;
    const respaldo = () => v?.webkitEnterFullscreen?.();
    if (c?.requestFullscreen) c.requestFullscreen().catch(respaldo); else respaldo();
  };
  return [completa, alternar];
}
// Segundos de reproducción sin un cuadro nuevo de video para dar por hecho que el equipo no puede mostrar la imagen
const SIN_CUADROS_S = 2;
// Un digitalizado anómalo pesa mucho más de lo que pide su imagen: bits por píxel a 30 cuadros. Entre los 510 videos de
// la fuente (octubre de 2026) el más alto normal llega a 0,27 y el que el iPhone no muestra, a 1,58
const BITS_POR_PIXEL_RARO = 0.8;
export function Reproductor({ src, tipo, etiqueta, onError }) {
  const ref = useRef(null), marco = useRef(null);
  const [completa, pantalla] = usePantallaCompleta(marco, ref);
  useEffect(() => { unSoloMedio(); const m = ref.current; return () => m?.pause(); }, []);
  const [sonando, setSonando] = useState(false), [t, setT] = useState(0), [total, setTotal] = useState(0);
  // un video que el equipo no puede decodificar (algunos digitalizados pasan los límites de su propio formato) suena
  // sin imagen: se detecta porque el audio avanza y no llegan cuadros, y se ofrece abrirlo aparte
  const [sinImagen, setSinImagen] = useState(false), [pesado, setPesado] = useState(false);
  const cuadros = useRef({ n: -1, t: 0 }), mostrados = useRef(null);
  // los cuadros que el equipo de verdad pone en pantalla (requestVideoFrameCallback); si no lo tiene, los decodificados
  useEffect(() => {
    const m = ref.current;
    if (tipo !== 'video' || !m?.requestVideoFrameCallback) return undefined;
    let id;
    const cuadro = (_, meta) => { mostrados.current = meta.presentedFrames; id = m.requestVideoFrameCallback(cuadro); };
    mostrados.current = 0;
    id = m.requestVideoFrameCallback(cuadro);
    return () => m.cancelVideoFrameCallback?.(id);
  }, [tipo, src]);
  const vigilar = (m) => {
    if (tipo !== 'video' || m.paused || m.seeking || sinImagen) return;
    if (m.readyState >= 1 && m.videoWidth === 0) { setSinImagen(true); return; }
    const q = m.getVideoPlaybackQuality?.();
    const vistos = mostrados.current ?? (q ? q.totalVideoFrames - q.droppedVideoFrames : null);
    if (vistos == null) return;
    if (vistos !== cuadros.current.n) cuadros.current = { n: vistos, t: m.currentTime };
    else if (m.currentTime - cuadros.current.t > SIN_CUADROS_S) setSinImagen(true);
  };
  // antes del play: con su peso (lo dice el almacenamiento de la fuente) y su duración, un video anómalo se avisa
  const medirPeso = async (m) => {
    if (tipo !== 'video' || !src || !m.duration || !m.videoWidth) return;
    try {
      // sin caché: la respuesta guardada del propio video viene sin el permiso CORS y el navegador la reusaría
      const bytes = Number((await fetch(src, { method: 'HEAD', cache: 'no-store' })).headers.get('content-length'));
      if (bytes && (bytes * 8) / m.duration / (m.videoWidth * m.videoHeight * 30) > BITS_POR_PIXEL_RARO) setPesado(true);
    } catch { /* sin el peso no se avisa: el video sigue igual */ }
  };
  const el = () => ref.current;
  const alternar = () => { const m = el(); if (!m) return; if (m.paused) m.play().catch(() => {}); else m.pause(); };
  const saltar = (n) => { const m = el(); if (m) m.currentTime = Math.max(0, Math.min(m.duration || 0, m.currentTime + n)); };
  // en el video, «#t=0.1» hace que el teléfono dibuje un cuadro antes del play (sin él, el iPhone deja el recuadro vacío)
  const fuente = tipo === 'video' && src && !src.includes('#') ? `${src}#t=0.1` : src;
  const eventos = { ref, src: fuente, preload: 'metadata', onPlay: () => setSonando(true), onPause: () => setSonando(false), onEnded: () => setSonando(false),
    onTimeUpdate: (e) => { setT(e.currentTarget.currentTime); vigilar(e.currentTarget); }, onSeeked: () => { cuadros.current = { n: -1, t: 0 }; },
    onLoadedMetadata: (e) => { setTotal(e.currentTarget.duration); medirPeso(e.currentTarget); }, onDurationChange: (e) => setTotal(e.currentTarget.duration), onError };
  return (
    <div ref={marco} className={`q-reproductor q-reproductor-${tipo}`}>
      {tipo === 'video' ? (
        <div className="q-reproductor-pantalla">
          <video {...eventos} playsInline aria-label={etiqueta} onClick={alternar} />
          {sinImagen && (
            <p className="q-reproductor-aviso" role="status">Este equipo no puede mostrar la imagen de este video; el audio sigue.
              <a href={src} target="_blank" rel="noopener noreferrer">Abrir el video aparte</a></p>
          )}
        </div>
      ) : <><audio {...eventos} aria-label={etiqueta} /><span className="q-reproductor-onda" aria-hidden="true"><AudioLines size={28} /></span></>}
      {pesado && !sinImagen && (
        <p className="q-reproductor-nota">Integrametrics guardó este video en un formato que algunos celulares no pueden mostrar: puede sonar sin imagen. <a href={src} target="_blank" rel="noopener noreferrer">Abrir el video aparte</a></p>
      )}
      <div className="q-reproductor-barra">
        <button type="button" className="q-reproductor-boton q-reproductor-play" onClick={alternar} aria-label={sonando ? 'Pausar' : 'Reproducir'}>{sonando ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}</button>
        <button type="button" className="q-reproductor-boton q-reproductor-salto" onClick={() => saltar(-10)} aria-label="Retroceder 10 segundos"><RotateCcw size={18} aria-hidden="true" /></button>
        <input type="range" className="q-reproductor-avance" min={0} max={total || 0} step={0.1} value={Math.min(t, total || 0)} aria-label={`Avance de ${etiqueta}`}
          aria-valuetext={`${reloj(t)} de ${reloj(total)}`} onChange={(e) => { const m = el(); if (m) { m.currentTime = Number(e.target.value); setT(m.currentTime); } }}
          style={{ '--avance': total ? `${(Math.min(t, total) / total) * 100}%` : '0%' }} />
        <button type="button" className="q-reproductor-boton q-reproductor-salto" onClick={() => saltar(10)} aria-label="Adelantar 10 segundos"><RotateCw size={18} aria-hidden="true" /></button>
        <span className="q-reproductor-tiempo">{reloj(t)} / {reloj(total)}</span>
        {tipo === 'video' && <button type="button" className="q-reproductor-boton q-reproductor-ampliar" onClick={pantalla} aria-label={completa ? 'Salir de la pantalla completa' : 'Ver en pantalla completa'}>{completa ? <Minimize2 size={18} aria-hidden="true" /> : <Maximize2 size={18} aria-hidden="true" />}</button>}
      </div>
    </div>
  );
}

// ── Un anuncio HTML de un portal, como lo guardó la fuente: en un marco aislado, reducido al ancho de la tarjeta y con
// su botón de pantalla completa. El marco corre sus scripts en su propio origen (el almacenamiento de Integrametrics,
// que nunca es el del panel: htmlDe solo deja pasar esa dirección), así que no toca el panel, no abre ventanas y no
// navega. El tamaño va en el nombre del archivo («…_1366x1296.html»); si no está, va en un cuadrado ──
export function PiezaHtml({ url, etiqueta }) {
  const [, w = 300, h = 300] = (url.match(/_(\d+)x(\d+)\.html?(?:[?#]|$)/i) || []).map(Number);
  const marco = useRef(null);
  const [esc, setEsc] = useState({ s: 0, x: 0, y: 0 });
  const [completa, pantalla] = usePantallaCompleta(marco);
  useLayoutEffect(() => {
    const c = marco.current;
    if (!c || typeof ResizeObserver === 'undefined') return undefined;
    const medir = () => { const r = c.getBoundingClientRect(), s = Math.min(r.width / w, r.height / h); setEsc({ s, x: (r.width - w * s) / 2, y: (r.height - h * s) / 2 }); };
    medir();
    const o = new ResizeObserver(medir); o.observe(c);
    return () => o.disconnect();
  }, [w, h]);
  return (
    <div ref={marco} className="q-pieza-html" style={{ aspectRatio: `${w} / ${h}` }}>
      <iframe src={url} title={etiqueta} width={w} height={h} sandbox="allow-scripts allow-same-origin" loading="lazy" referrerPolicy="no-referrer" tabIndex={-1}
        style={{ transform: `translate(${esc.x}px, ${esc.y}px) scale(${esc.s || 0.001})` }} />
      <button type="button" className="q-pieza-ampliar" onClick={pantalla} aria-label={completa ? 'Salir de la pantalla completa' : `Ver en pantalla completa: ${etiqueta}`}>
        {completa ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
      </button>
    </div>
  );
}

// ── Un anuncio entero, en la ventana. Una imagen que no carga sale; la tarjeta sigue sin ella ──
function TarjetaAnuncio({ a, anunciante, t }) {
  const [rota, setRota] = useState(false), [videoRoto, setVideoRoto] = useState(false); // el video o el audio
  const [ampliada, setAmpliada] = useState(false);
  const meta = t.meta(a);
  const texto = a.texto || t.texto(a);
  const alt = `Imagen del anuncio de ${anunciante}`;
  return (
    <article className="q-anuncio" data-anuncio={a.id}>
      {a.imagen && !rota && <div className="q-anuncio-pieza">
        <img src={a.imagen} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setRota(true)} />
        <button type="button" className="q-ficha-ampliar" onClick={() => setAmpliada(true)} aria-label="Ampliar la imagen del anuncio"><span className="q-ficha-ampliar-icono" aria-hidden="true"><Maximize2 size={16} /></span></button>
        <VisorFoto abierto={ampliada} onCerrar={() => setAmpliada(false)} src={a.imagen} alt={alt} titulo={a.titulo || anunciante} bajada={meta} />
      </div>}
      {!a.imagen && a.html && <div className="q-anuncio-pieza q-anuncio-pieza-html"><PiezaHtml url={a.html} etiqueta={`Anuncio de ${a.titulo || anunciante}`} /></div>}
      {!a.imagen && a.arte != null && <div className="q-anuncio-pieza"><ArteMuestra a={a} grande /></div>}
      {a.medio?.kind === 'video' && (videoRoto ? <p className="q-nota-bloque">El video de esta pieza no cargó.</p>
        : <div className="q-anuncio-reproductor"><Reproductor tipo="video" src={a.medio.url} etiqueta={`Video de ${a.titulo || anunciante}`} onError={() => setVideoRoto(true)} /></div>)}
      {a.medio?.kind === 'audio' && (videoRoto ? <p className="q-nota-bloque">El audio de esta pieza no cargó.</p>
        : <div className="q-anuncio-reproductor"><Reproductor tipo="audio" src={a.medio.url} etiqueta={`Audio de ${a.titulo || anunciante}`} onError={() => setVideoRoto(true)} /></div>)}
      <div className="q-anuncio-cuerpo">
        {a.titulo && <h3>{t.titulo ? t.titulo(a) : a.titulo}</h3>}
        {texto && <p className="q-anuncio-texto">{texto}</p>}
        {meta && <p className="q-anuncio-meta">{meta}</p>}
        {a.enlace && (
          <a className="q-anuncio-enlace" href={a.enlace} target="_blank" rel="noopener noreferrer">
            Ver en la biblioteca de Meta<ExternalLink size={14} aria-hidden="true" /><span className="solo-lector"> (se abre en otra pestaña)</span>
          </a>
        )}
      </div>
    </article>
  );
}

// ── La ventana con todos los anuncios de un anunciante. La usan el abanico y la ficha de la competencia ──
export function VentanaAnuncios({ grupo, onCerrar, volver, t, nota }) {
  return (
    <Dialogo abierto={!!grupo} onCerrar={onCerrar} volver={volver} titulo={grupo ? `Anuncios de ${grupo.nombre}` : ''}
      bajada={grupo ? [t.bajada(grupo), nota].filter(Boolean).join(' · ') : null}>
      {grupo && (
        <div className="q-anuncios-grilla" data-anuncios={grupo.nombre}>
          {grupo.anuncios.map((a) => <TarjetaAnuncio key={a.id} a={a} anunciante={grupo.nombre} t={t} />)}
        </div>
      )}
    </Dialogo>
  );
}

// La marca del formato en una carta sin imagen: video, audio o imagen
const ICONO_FORMATO = { Video: Play, Audio: AudioLines, Imagen: ImagenIcono };
function MarcaFormato({ formato }) {
  const I = ICONO_FORMATO[formato];
  return I ? <span className="q-carta-formato" aria-hidden="true"><I size={14} /></span> : null;
}

// ── El mazo: las tres piezas más recientes apiladas; con el mouse o el foco se abren en abanico ──
function Mazo({ g, onAbrir, propio, t }) {
  const [rotas, setRotas] = useState(() => new Set());
  // una pieza en video se ve por su primer cuadro (el navegador lo pinta con preload="metadata"); sin imagen ni video, el texto
  const verse = (a) => (a.imagen || a.medio?.kind === 'video') && !rotas.has(a.id);
  const conImagen = g.anuncios.filter(verse).slice(0, 3);
  const cartas = conImagen.length ? conImagen : g.anuncios.slice(0, 3);
  const pila = [...cartas].reverse(); // la más reciente se dibuja última: queda encima
  const n = g.anuncios.length;
  return (
    <button type="button" className="q-mazo" onClick={() => onAbrir(g.nombre)} data-anunciante={g.nombre} aria-haspopup="dialog">
      <span className="q-mazo-pila" aria-hidden="true">
        {pila.map((a, i) => {
          const conImg = verse(a) && conImagen.length;
          const rota = () => setRotas((r) => new Set(r).add(a.id));
          return (
            <span key={a.id} className={`q-carta${!conImg && a.arte == null ? ' q-carta-texto' : ''}`} style={{ '--d': i - (pila.length - 1) / 2 }} data-previa={a.id}>
              {conImg && a.imagen ? <img src={a.imagen} alt="" loading="lazy" referrerPolicy="no-referrer" onError={rota} />
                : conImg ? <><video src={`${a.medio.url}#t=0.5`} muted playsInline preload="metadata" tabIndex={-1} onError={rota} /><span className="q-carta-play"><Play size={16} aria-hidden="true" /></span></>
                : a.arte != null ? <ArteMuestra a={a} /> : <><span>{t.titulo ? t.titulo(a) : a.titulo || a.texto}</span><MarcaFormato formato={a.formato} /></>}
            </span>
          );
        })}
      </span>
      <span className="q-mazo-nombre">{g.nombre}{propio && <span className="q-mazo-propio">{t.propio}</span>}</span>
      <span className="q-mazo-dato"><b>{t.cuenta(n)}</b>{t.detalle(g) && ` · ${t.detalle(g)}`}</span>
      <span className="q-mazo-ver">{t.ver(n)}<ArrowRight size={14} aria-hidden="true" /></span>
    </button>
  );
}

// ── Abanico de anuncios: un mazo por anunciante (la marca propia aparte) y la ventana con todos ──
// `abierta` vive en quien lo usa, para que otro control pueda abrir la misma ventana. Los textos llegan en `t`.
// propioAlFinal: cuando lo principal es la competencia, la marca propia va última, para comparar.
export function Abanico({ lista, abierta, onAbrir, t, nota, propioAlFinal = false }) {
  const todos = (propioAlFinal ? [...lista.grupos, lista.propio] : [lista.propio, ...lista.grupos]).filter(Boolean);
  const grupo = todos.find((g) => g.nombre === abierta) ?? null;
  const volver = () => document.querySelector(`[data-anunciante="${window.CSS.escape(abierta ?? '')}"]`)?.focus();
  return (
    <div className="q-anuncios">
      <div className="q-mazos">{todos.map((g) => <Mazo key={g.nombre} g={g} onAbrir={onAbrir} propio={g === lista.propio} t={t} />)}</div>
      {t.sinContenido && <p className="q-nota-bloque" data-sin-contenido>{t.sinContenido}</p>}
      <VentanaAnuncios grupo={grupo} onCerrar={() => onAbrir(null)} volver={volver} t={t} nota={nota} />
    </div>
  );
}
