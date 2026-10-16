// The Algorithm para el cliente de src/cliente.js. Lee el contrato publicado por el pipeline (public/data), arma la
// vista una sola vez por filtro y la reparte a las capas. Si la data no carga, lo dice: nunca dibuja ceros.
import { useEffect, useMemo, useState } from 'react';
import { Moon, Sun, Presentation } from 'lucide-react';
import { armarVista, mesesDisponibles } from './calculo/vista.js';
import { ESCENARIOS, aplicarEscenario } from './calculo/escenarios.js';
import { CAPAS } from './capas/estructura.js';
import { fecha, fechaCorta } from './sistema/formato.js';
import { mesTexto } from './textos/comun.js';
import { NavegacionCapas, Selector, BarraDemo, CargandoContexto, Estado, Resguardo } from './sistema/Componentes.jsx';
import Senales from './pantallas/Senales.jsx';
import Inteligencia from './pantallas/Inteligencia.jsx';
import Activacion from './pantallas/Activacion.jsx';
import Rendimiento from './pantallas/Rendimiento.jsx';
import Maia, { BotonMaia } from './pantallas/Maia.jsx';
import { CLIENTE } from './cliente.js';
import logoCliente from '../public/marca/logo-barra.svg?raw'; // logo oficial del cliente en negativo, sobre la barra oscura

const PANTALLAS = { senales: Senales, inteligencia: Inteligencia, activacion: Activacion, rendimiento: Rendimiento };
const INICIO = CAPAS[0].id;

// Preferencias del visitante: si el navegador no deja guardar, la página funciona igual
const leerPref = (k, porDefecto) => { try { return localStorage.getItem('algoritmo:' + k) || porDefecto; } catch { return porDefecto; } };
const guardarPref = (k, v) => { try { localStorage.setItem('algoritmo:' + k, v); } catch { /* sin almacenamiento */ } };
// El ancla dice la capa: «senales», «s-3-2» (un capítulo), «detalle-s-4-1» (el detalle de un capítulo), «a-…» o «b-…»
// (una alerta, en Inteligencia)
const capaDeAncla = (h) => {
  if (CAPAS.some((c) => c.id === h)) return h;
  const capitulo = h.match(/^(?:detalle-)?s-(\d)-/);
  if (capitulo) return CAPAS.find((c) => c.numero === capitulo[1])?.id || null;
  return /^(a|b)-/.test(h) ? 'inteligencia' : null;
};
const ancla = () => (typeof location !== 'undefined' ? location.hash.slice(1) : '');
const capaDeLaUrl = () => capaDeAncla(ancla()) || INICIO;
// ?escenario=… abre la demo con la data movida (src/calculo/escenarios.js); sirve también para las fotos
// un id que no es de ningún escenario se ignora: la data real no se anuncia como escenario de prueba
const escenarioDeLaUrl = () => { const id = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('escenario') : null; return ESCENARIOS.some((e) => e.id === id) ? id : null; };
const hoyIso = () => new Date().toISOString().slice(0, 10); // solo para medir el atraso de la fuente

// La data publicada por el pipeline (public/data). Solo el contrato es obligatorio: si otra fuente no carga, sus
// capítulos lo dicen y el resto sigue
function useData() {
  const [r, setR] = useState({ estado: 'cargando' });
  useEffect(() => {
    let vivo = true;
    const base = import.meta.env.BASE_URL;
    const opcional = (f) => fetch(`${base}data/${f}`).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    Promise.all([fetch(`${base}data/algorithm.json`), opcional('medios.json'), opcional('mapa-lima.json'), opcional('busquedas.json'), opcional('maia.json')])
      .then(async ([a, medios, mapa, busquedas, maia]) => {
        if (!a.ok) throw new Error(`contrato ${a.status}`);
        const contrato = await a.json();
        // un contrato sin su forma (sin meta o sin días) es una data que no cargó, no una pantalla en blanco
        if (!contrato?.meta?.lastDay || !Array.isArray(contrato.daily)) throw new Error('contrato sin meta');
        return { contrato, medios, mapa, busquedas, maia };
      })
      .then((d) => vivo && setR({ estado: 'ok', ...d }))
      .catch((e) => vivo && setR({ estado: 'no-cargo', error: e.message }));
    return () => { vivo = false; };
  }, []);
  return r;
}

export default function App() {
  const cargada = useData();
  const [escenario, setEscenario] = useState(escenarioDeLaUrl);
  const data = useMemo(() => (cargada.estado === 'ok' && escenario ? aplicarEscenario(escenario, cargada) : cargada), [cargada, escenario]);
  const meses = useMemo(() => (data.contrato ? mesesDisponibles(data.contrato.meta) : []), [data.contrato]);
  const [mes, setMes] = useState(null);
  const mesActivo = mes || meses.at(-1);
  const [capa, setCapa] = useState(capaDeLaUrl);
  const [tema, setTema] = useState(() => leerPref('tema-elegido', 'light'));
  const [demo, setDemo] = useState('datos');
  const [presentar, setPresentar] = useState(false);
  const [maiaAbierta, setMaiaAbierta] = useState(false);
  useEffect(() => { document.documentElement.dataset.theme = tema; }, [tema]);
  useEffect(() => { if (presentar) document.documentElement.dataset.presentar = ''; else delete document.documentElement.dataset.presentar; }, [presentar]);
  const cambiarTema = () => { const t = tema === 'dark' ? 'light' : 'dark'; setTema(t); guardarPref('tema-elegido', t); };
  useEffect(() => {
    // un ancla que no dice capa (#resumen, una alerta ya abierta) deja la capa donde está; nunca devuelve a la primera
    const alCambiar = () => setCapa((c) => capaDeAncla(ancla()) || c);
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);
  useEffect(() => {
    const h = ancla();
    if (!h || CAPAS.some((c) => c.id === h)) return undefined;
    const t = setTimeout(() => document.getElementById(h)?.scrollIntoView({ block: 'start' }), 60);
    return () => clearTimeout(t);
  }, [capa, data.estado]);
  // Alto real de la barra fija (pestañas y filtros): lo usan el índice y los saltos a un capítulo
  useEffect(() => {
    const barra = document.querySelector('.q-filtros');
    if (!barra) return undefined;
    const medir = () => document.documentElement.style.setProperty('--alto-capas', `${getComputedStyle(barra).position === 'sticky' ? barra.offsetHeight : 0}px`);
    const ro = new ResizeObserver(medir);
    ro.observe(barra);
    window.addEventListener('resize', medir);
    medir();
    return () => { ro.disconnect(); window.removeEventListener('resize', medir); };
  }, []);
  const irACapa = (id) => { setCapa(id); history.replaceState(null, '', '#' + id); window.scrollTo({ top: 0 }); };

  // armarVista corre fuera del Resguardo de cada capa: si la data trae algo que el cálculo no esperaba, se dice que
  // no se pudo armar, en vez de dejar la pantalla en blanco
  const armada = useMemo(() => {
    if (data.estado !== 'ok' || !mesActivo) return null;
    const caidas = ['atl', 'digital', 'trends'].includes(demo) ? [demo] : [];
    try {
      return { vista: armarVista(data.contrato, data.medios, { mes: mesActivo }, { fuentesCaidas: caidas, hoy: hoyIso() }, { mapa: data.mapa, busquedas: data.busquedas }) };
    } catch (e) {
      console.error('armarVista', e);
      return { fallo: true };
    }
  }, [data, mesActivo, demo]);
  const vista = armada?.vista ?? null;
  const actual = CAPAS.find((c) => c.id === capa);
  const Pantalla = PANTALLAS[capa];
  const cargando = data.estado === 'cargando' || demo === 'cargando';

  return (
    <div className="q-pagina">
      <header className="q-barra">
        <div className="q-envoltura q-barra-fila">
          <a className="q-marca" href={'#' + INICIO} onClick={(e) => { e.preventDefault(); irACapa(INICIO); }} aria-label={`The Algorithm para ${CLIENTE.nombreLargo}, ir al inicio`}>
            <span className="q-marca-cliente" aria-hidden="true" dangerouslySetInnerHTML={{ __html: logoCliente }} />
            <span className="q-marca-producto"><b>The Algorithm</b><span>By The Lab</span></span>
          </a>
          <div className="q-barra-controles">
            {data.contrato && <span className="q-sello-datos">Datos al {fecha(data.contrato.meta.lastDay)}</span>}
            {vista && <BotonMaia onClick={() => setMaiaAbierta(true)} />}
            <button type="button" className="q-boton q-boton-quieto q-boton-presentar" aria-pressed={presentar} onClick={() => setPresentar((x) => !x)}>
              <Presentation size={16} aria-hidden="true" /><span>Presentar</span>
            </button>
            <button type="button" className="q-boton q-boton-quieto" onClick={cambiarTema} aria-label={tema === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}>
              {tema === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* un escenario o un estado de la demo nunca se ve como data real, tampoco al presentar */}
      {(escenario || demo !== 'datos') && (
        <div className="q-aviso-demo" role="status">
          <div className="q-envoltura">
            {escenario ? `Escenario de prueba: ${ESCENARIOS.find((e) => e.id === escenario)?.titulo ?? escenario}. Las cifras no son reales.`
              : demo === 'cargando' ? 'Demo: así se ve el panel mientras carga.' : `Demo: así se ve el panel si ${{ atl: 'Integrametrics ATL', digital: 'Integrametrics digital', trends: 'Google Trends' }[demo]} no carga.`}
          </div>
        </div>
      )}
      <div className="q-filtros">
        <div className="q-envoltura q-filtros-fila">
          <NavegacionCapas capas={CAPAS} activa={capa} onCambiar={irACapa} />
          <div className="q-filtros-controles">
            {meses.length > 0 && (
              <Selector etiqueta="Mes" valor={mesActivo} onCambiar={setMes}
                opciones={[...meses].reverse().map((m) => ({ valor: m, texto: vista && m === vista.periodo.mes && vista.periodo.parcial ? `${mesTexto(m)} (${vista.periodo.enCurso === false ? `hasta el ${fechaCorta(vista.periodo.hasta)}` : 'en curso'})` : mesTexto(m) }))} />
            )}
            {vista && <span className="q-control-nota">{vista.periodo.compararDesde ? 'Comparado con el mes anterior' + (vista.periodo.parcial ? ', mismo tramo de días' : '') : 'Sin mes anterior para comparar'}</span>}
          </div>
        </div>
      </div>

      <main>
        {data.estado === 'no-cargo' || armada?.fallo ? (
          <div className="q-envoltura q-capa-vacia">
            <Estado tipo="no-cargo" titulo="La data no cargó">No se pudo leer la data del panel. No se muestran cifras viejas ni inventadas: vuelve a intentar en unos minutos.</Estado>
          </div>
        ) : (
          <CargandoContexto.Provider value={cargando}>
            {vista ? <Resguardo key={`${capa}-${escenario}-${mesActivo}-${demo}`} donde="Esta capa" envoltura><Pantalla capa={actual} vista={vista} irACapa={irACapa} /></Resguardo> : <div className="q-envoltura q-capa-vacia"><Estado tipo="cargando" titulo="Cargando la data" /></div>}
          </CargandoContexto.Provider>
        )}
      </main>
      <BarraDemo valor={demo} onCambiar={setDemo} opciones={[
        { valor: 'datos', texto: 'Datos' }, { valor: 'cargando', texto: 'Cargando' },
        { valor: 'atl', texto: 'ATL no cargó' }, { valor: 'digital', texto: 'Digital no cargó' }, { valor: 'trends', texto: 'Trends no cargó' },
      ]} escenarios={ESCENARIOS} escenario={escenario} onEscenario={setEscenario} />
      {vista && <Maia abierta={maiaAbierta} onCerrar={() => setMaiaAbierta(false)} vista={vista} reporte={data.maia} />}

      <footer className="q-envoltura q-pie">
        <p>Las cifras salen de Integrametrics (inversión estimada a precio de tarifa) y de Google Trends. El panel no usa data de ventas ni de clientes de {CLIENTE.nombre}.</p>
        <p>The Algorithm · By The Lab</p>
      </footer>
    </div>
  );
}
