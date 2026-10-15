// Mapa de paneles OOH sobre Leaflet. Se carga aparte (React.lazy) para que Leaflet no pese en las otras capas.
// Mapa base: los mosaicos estándar de OpenStreetMap, sin clave, calmados con un filtro que sale de los tokens
// (--mapa-filtro: gris tenue en claro, invertido en oscuro), así el mapa sigue al tema. Cada círculo es una ubicación
// (las caras de una misma torre van juntas); su tamaño sigue a la inversión estimada. La competencia va en el color
// de foco y la marca propia en gris, como en todos los gráficos. Un clic elige la ubicación; la ficha la pinta la pantalla.
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Un solo lugar para cambiar de proveedor de mapa base. OpenStreetMap permite un uso liviano como este (un panel
// interno, pocas personas) con atribución; si el uso crece, se cambia a un proveedor con clave (docs/marca-verisure.md)
const BASE = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  atribucion: '© <a href="https://www.openstreetmap.org/copyright">colaboradores de OpenStreetMap</a>',
};

export default function MapaPaneles({ ubicaciones, elegida, onElegir, encuadre, etiqueta }) {
  const caja = useRef(null), mapa = useRef(null), capas = useRef({});

  // El mapa se crea una vez
  useEffect(() => {
    const m = L.map(caja.current, { scrollWheelZoom: false, zoomControl: false, attributionControl: true, preferCanvas: false });
    L.control.zoom({ position: 'topright', zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(m);
    m.attributionControl.setPrefix(false);
    L.tileLayer(BASE.url, { attribution: BASE.atribucion, maxZoom: 19 }).addTo(m);
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
        className: `q-mapa-punto ${u.foco ? 'q-mapa-foco' : 'q-mapa-resto'}${sel ? ' q-mapa-elegido' : ''}`,
        bubblingMouseEvents: false,
      });
      c.bindTooltip(u.pista, { direction: 'top', offset: [0, -8], className: 'q-mapa-pista', opacity: 1 });
      c.on('click', () => onElegir(u.id));
      c.addTo(g);
      // la elegida lleva un anillo separado del círculo: se ve sobre cualquier color de foco
      if (sel) L.circleMarker([u.lat, u.lng], { radius: 7 + Math.sqrt(u.inversion / max) * 13 + 5, weight: 2, fill: false, interactive: false, className: 'q-mapa-anillo' }).addTo(g);
    }
  }, [ubicaciones, elegida, onElegir]);

  // Encuadre: los paneles de la zona elegida (Lima o una ciudad)
  useEffect(() => {
    const m = mapa.current;
    if (!m || !encuadre?.length) return;
    const b = L.latLngBounds(encuadre);
    m.fitBounds(b.pad(0.15), { maxZoom: 15, animate: false });
  }, [encuadre]);

  return <div className="q-mapa" ref={caja} role="region" aria-label={etiqueta} />;
}
