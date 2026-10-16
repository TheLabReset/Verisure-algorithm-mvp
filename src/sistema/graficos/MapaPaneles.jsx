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
export default function MapaPaneles({ ubicaciones, elegida, onElegir, encuadre, etiqueta, contornos = [] }) {
  const caja = useRef(null), mapa = useRef(null), capas = useRef({});
  const [sinBase, setSinBase] = useState(false);

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
    mapa.current = m;
    return () => { m.remove(); mapa.current = null; };
  }, []);

  // Los círculos: los grandes abajo, los chicos encima, la elegida al final
  useEffect(() => {
    const g = capas.current.puntos;
    if (!g) return;
    g.clearLayers();
    const max = Math.max(1, ...ubicaciones.map((u) => u.inversion));
    const orden = [...ubicaciones].sort((a, b) => b.inversion - a.inversion || Number(a.id === elegida) - Number(b.id === elegida));
    for (const u of orden) {
      const sel = u.id === elegida;
      const c = L.circleMarker([u.lat, u.lng], {
        radius: 7 + Math.sqrt(u.inversion / max) * 13, weight: 2,
        className: `q-mapa-punto ${u.foco ? 'q-mapa-foco' : u.propia ? 'q-mapa-propia' : 'q-mapa-resto'}${sel ? ' q-mapa-elegido' : ''}`,
        bubblingMouseEvents: false,
      });
      c.bindTooltip(u.pista, { direction: 'top', offset: [0, -8], className: 'q-mapa-pista', opacity: 1 });
      c.on('click', () => onElegir(u.id));
      c.addTo(g);
      // la elegida lleva un anillo separado del círculo: se ve sobre cualquier color de foco
      if (sel) L.circleMarker([u.lat, u.lng], { radius: 7 + Math.sqrt(u.inversion / max) * 13 + 5, weight: 2, fill: false, interactive: false, className: 'q-mapa-anillo' }).addTo(g);
    }
  }, [ubicaciones, elegida, onElegir]);

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
  }, [encuadre]);

  return (
    // el modificador va en el marco: el className del div del mapa no cambia nunca, porque React borraría las clases de Leaflet
    <div className={`q-mapa-marco${sinBase ? ' q-mapa-sin-base' : ''}`}>
      <div className="q-mapa" ref={caja} role="region" aria-label={etiqueta} />
      {sinBase && <p className="q-mapa-aviso" role="status">El mapa de fondo no cargó.</p>}
    </div>
  );
}
