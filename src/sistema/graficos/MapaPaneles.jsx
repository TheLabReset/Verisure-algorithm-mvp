// Mapa de paneles OOH sobre Leaflet. Se carga aparte (React.lazy) para que Leaflet no pese en las otras capas.
// Mapa base: los mosaicos estándar de OpenStreetMap, sin clave, calmados con un filtro que sale de los tokens
// (--mapa-filtro: gris tenue en claro, invertido en oscuro), así el mapa sigue al tema. Cada círculo es una ubicación
// (las caras de una misma torre van juntas); su tamaño sigue a la inversión estimada. La competencia va en el color
// de foco y la marca propia en su rojo, como en todos los gráficos. Un clic elige la ubicación; la ficha la pinta la pantalla.
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Un solo lugar para cambiar de proveedor de mapa base. OpenStreetMap permite un uso liviano como este (un panel
// interno, pocas personas) con atribución; si el uso crece, se cambia a un proveedor con clave (docs/marca-verisure.md)
const BASE = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  atribucion: '© <a href="https://www.openstreetmap.org/copyright">colaboradores de OpenStreetMap</a>',
};

// contornos: los límites de los distritos en [lat, lng]; se dibujan solo si el mapa base no carga (sin red, un visor
// que bloquea OpenStreetMap), para que los puntos sigan teniendo dónde leerse
const MAX_ZOOM = 19;
const radio = (inversion, max) => 7 + Math.sqrt(inversion / max) * 13;
const radioGrupo = (inversion, max) => Math.round(Math.max(16, Math.min(22, radio(inversion, max))));

// Agrupa las ubicaciones cuyos círculos se tocan a ese zoom, de cualquier marca (y en cadena: si A toca a B y B a C,
// van las tres juntas): así ningún círculo tapa a otro. Devuelve una lista de grupos; uno de uno es una ubicación suelta
function agrupar(m, us, z, max) {
  const unir = (nodos) => {
    const padre = nodos.map((_, i) => i);
    const raiz = (i) => (padre[i] === i ? i : (padre[i] = raiz(padre[i])));
    for (let i = 0; i < nodos.length; i += 1) {
      for (let j = i + 1; j < nodos.length; j += 1) if (nodos[i].p.distanceTo(nodos[j].p) < nodos[i].r + nodos[j].r) padre[raiz(i)] = raiz(j);
    }
    const grupos = new Map();
    nodos.forEach((x, i) => { const k = raiz(i); if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(...x.us); });
    return [...grupos.values()];
  };
  let grupos = unir(us.map((u) => ({ us: [u], p: m.project([u.lat, u.lng], z), r: radio(u.inversion, max) })));
  // el círculo de un grupo es más grande que sus puntos: si ahora toca a otro, se juntan (hasta que nada se toque)
  for (let vuelta = 0; vuelta < 6; vuelta += 1) {
    const nodos = grupos.map((g) => ({
      us: g, p: m.project(L.latLngBounds(g.map((u) => [u.lat, u.lng])).getCenter(), z),
      r: g.length === 1 ? radio(g[0].inversion, max) : radioGrupo(g.reduce((s, u) => s + u.inversion, 0), max),
    }));
    const otra = unir(nodos);
    if (otra.length === grupos.length) break;
    grupos = otra;
  }
  return grupos;
}

// textoGrupo(us): la pista y el título de la lista de un grupo; rotulo(u): cómo se nombra cada ubicación en esa lista
export default function MapaPaneles({ ubicaciones, elegida, onElegir, encuadre, etiqueta, contornos = [], textoGrupo, rotulo }) {
  const caja = useRef(null), mapa = useRef(null), capas = useRef({});
  const [sinBase, setSinBase] = useState(false);
  const [zoom, setZoom] = useState(null);
  // la lista de un grupo que ni el zoom máximo separa (dos caras de un mismo edificio): dónde se abre y qué trae
  const [lista, setLista] = useState(null);

  // El mapa se crea una vez
  useEffect(() => {
    const m = L.map(caja.current, { scrollWheelZoom: false, zoomControl: false, attributionControl: true, preferCanvas: false });
    L.control.zoom({ position: 'topright', zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(m);
    m.attributionControl.setPrefix(false);
    // sin mapa base solo si no cargó ningún mosaico; si después carga alguno, vuelve el mapa base
    let fallas = 0, cargados = 0;
    L.tileLayer(BASE.url, { attribution: BASE.atribucion, maxZoom: 19 })
      .on('tileerror', () => { fallas += 1; if (fallas >= 3 && !cargados) setSinBase(true); })
      .on('tileload', () => { cargados += 1; setSinBase(false); })
      .addTo(m);
    // un pane debajo de los puntos y encima del mapa base
    m.createPane('contornos').style.zIndex = Number(getComputedStyle(m.getPane('overlayPane')).zIndex) - 1;
    capas.current.contornos = L.layerGroup().addTo(m);
    capas.current.puntos = L.layerGroup().addTo(m);
    m.on('zoomend', () => setZoom(m.getZoom()));
    m.on('movestart zoomstart click', () => setLista(null));
    mapa.current = m;
    return () => { m.remove(); mapa.current = null; };
  }, []);

  // Los círculos: los grandes abajo, los chicos encima, la elegida al final. Los que se tapan a este zoom van en un
  // solo círculo con su número; tocarlo acerca el mapa lo justo para separarlos
  useEffect(() => {
    const g = capas.current.puntos, m = mapa.current;
    if (!g || !m || zoom == null) return;
    g.clearLayers();
    const max = Math.max(1, ...ubicaciones.map((u) => u.inversion));
    const grupos = agrupar(m, ubicaciones, zoom, max)
      .map((us) => ({ us, inversion: us.reduce((s, u) => s + u.inversion, 0), sel: us.some((u) => u.id === elegida) }))
      .sort((a, b) => b.inversion - a.inversion || Number(a.sel) - Number(b.sel));
    // una marca vigilada (capa 1) va en su propio color, el de su lugar en cliente.js
    const clase = (u) => (u.vigilada ? `q-mapa-vigilada-${u.vigilada}` : u.foco ? 'q-mapa-foco' : u.propia ? 'q-mapa-propia' : 'q-mapa-resto');
    for (const grupo of grupos) {
      const [u] = grupo.us;
      if (grupo.us.length === 1) {
        const r = radio(u.inversion, max);
        const c = L.circleMarker([u.lat, u.lng], { radius: r, weight: 2, className: `q-mapa-punto ${clase(u)}${grupo.sel ? ' q-mapa-elegido' : ''}`, bubblingMouseEvents: false });
        c.bindTooltip(u.pista, { direction: 'top', offset: [0, -8], className: 'q-mapa-pista', opacity: 1 });
        c.on('click', () => onElegir(u.id));
        c.addTo(g);
        // la elegida lleva un anillo separado del círculo: se ve sobre cualquier color de foco
        if (grupo.sel) L.circleMarker([u.lat, u.lng], { radius: r + 5, weight: 2, fill: false, interactive: false, className: 'q-mapa-anillo' }).addTo(g);
        continue;
      }
      const b = L.latLngBounds(grupo.us.map((x) => [x.lat, x.lng]));
      const d = 2 * radioGrupo(grupo.inversion, max);
      const texto = textoGrupo(grupo.us);
      // el aro lleva el color de cada marca en proporción a sus ubicaciones; el número va al centro, en tinta
      const aro = [['q-mapa-foco', 'var(--resalte)'], ['q-mapa-vigilada-1', 'var(--vigilada-1)'], ['q-mapa-vigilada-2', 'var(--vigilada-2)'], ['q-mapa-vigilada-3', 'var(--vigilada-3)'], ['q-mapa-vigilada-4', 'var(--vigilada-4)'], ['q-mapa-propia', 'var(--propia)'], ['q-mapa-resto', 'var(--borde-control)']]
        .map(([c, color]) => [color, grupo.us.filter((x) => clase(x) === c).length]).filter(([, n]) => n);
      let acum = 0;
      const tramos = aro.map(([color, n]) => { const a = acum; acum += (n / grupo.us.length) * 100; return `${color} ${a}% ${acum}%`; }).join(', ');
      const icono = L.divIcon({ className: '', iconSize: [d, d], html: `<span class="q-mapa-grupo${grupo.sel ? ' q-mapa-elegido' : ''}" style="width:${d}px;height:${d}px;background:conic-gradient(${tramos})"><b>${grupo.us.length}</b></span>` });
      const mk = L.marker(b.getCenter(), { icon: icono, keyboard: true, title: texto.titulo, alt: texto.titulo, bubblingMouseEvents: false, riseOnHover: true });
      mk.bindTooltip(texto.pista, { direction: 'top', offset: [0, -d / 2], className: 'q-mapa-pista', opacity: 1 });
      mk.on('click', (e) => {
        L.DomEvent.stop(e);
        // el zoom más bajo que los separa a todos; si ninguno alcanza, el máximo si al menos se separan en parte
        const z0 = m.getZoom();
        let z = null;
        for (let k = z0 + 1; k <= MAX_ZOOM; k += 1) if (agrupar(m, grupo.us, k, max).length === grupo.us.length) { z = k; break; }
        if (z == null && z0 < MAX_ZOOM && agrupar(m, grupo.us, MAX_ZOOM, max).length > 1) z = MAX_ZOOM;
        // a lo más cuatro niveles por toque: un salto mayor pierde de vista dónde estaba (lo que quede junto, otro toque)
        if (z != null) z = Math.min(z, z0 + 4);
        if (z != null) {
          // sin salirse del marco: si el grupo no entra a ese zoom, el que entra (y se vuelve a tocar lo que quede junto)
          const cabe = m.getBoundsZoom(b, false, L.point(80, 80));
          m.flyTo(b.getCenter(), Math.max(z0 + 1, Math.min(z, cabe)), { duration: 0.5 });
          return;
        }
        mk.closeTooltip();
        const p = m.latLngToContainerPoint(b.getCenter()), w = m.getSize().x;
        setLista({ x: Math.min(Math.max(p.x, 150), w - 150), y: p.y, titulo: texto.titulo, us: [...grupo.us].sort((x, y) => y.inversion - x.inversion) });
      });
      mk.addTo(g);
    }
  }, [ubicaciones, elegida, onElegir, zoom, textoGrupo]);

  // la lista se cierra con Escape
  useEffect(() => {
    if (!lista) return undefined;
    const tecla = (e) => { if (e.key === 'Escape') setLista(null); };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [lista]);

  // Sin mapa base: los límites de los distritos, debajo de los puntos
  useEffect(() => {
    const g = capas.current.contornos;
    if (!g) return;
    g.clearLayers();
    if (!sinBase) return;
    for (const anillo of contornos) L.polygon(anillo, { pane: 'contornos', className: 'q-mapa-distrito', interactive: false, weight: 1 }).addTo(g);
  }, [sinBase, contornos]);

  // Encuadre: los paneles de la zona elegida (Lima o una ciudad)
  useEffect(() => {
    const m = mapa.current;
    if (!m || !encuadre?.length) return;
    const b = L.latLngBounds(encuadre);
    m.fitBounds(b.pad(0.15), { maxZoom: 15, animate: false });
    setZoom(m.getZoom());
  }, [encuadre]);

  return (
    // el modificador va en el marco: el className del div del mapa no cambia nunca, porque React borraría las clases de Leaflet
    <div className={`q-mapa-marco${sinBase ? ' q-mapa-sin-base' : ''}`}>
      <div className="q-mapa" ref={caja} role="region" aria-label={etiqueta} />
      {sinBase && <p className="q-mapa-aviso" role="status">El mapa de fondo no cargó.</p>}
      {lista && (
        <div className="q-mapa-lista" role="dialog" aria-label={lista.titulo} style={{ left: lista.x, top: lista.y }}>
          <p>{lista.titulo}</p>
          <ul>
            {lista.us.map((u) => (
              <li key={u.id}><button type="button" aria-pressed={u.id === elegida} onClick={() => { onElegir(u.id); setLista(null); }}>
                <span className={`q-muestra ${u.vigilada ? `q-muestra-vigilada-${u.vigilada}` : u.foco ? 'q-muestra-mapa-foco' : u.propia ? 'q-muestra-mapa-propia' : 'q-muestra-mapa-resto'}`} aria-hidden="true" /><span>{rotulo(u)}</span>
              </button></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
