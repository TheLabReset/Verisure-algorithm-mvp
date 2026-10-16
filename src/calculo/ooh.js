// OOH: los paneles del período sobre el mapa. Cada panel de Lima va a su distrito por coordenadas, no por la
// «localidad» de Integrametrics (que trae barrios como Monterrico y nombres repetidos como Magdalena / Magdalena del
// Mar). Los paneles fuera de Lima y el Callao se juntan por ciudad. Puro: recibe los límites ya proyectados.

// Ciudades con paneles fuera de Lima: el panel va a la más cercana a menos de 60 km
const CIUDADES = [
  { nombre: 'Arequipa', lat: -16.399, lng: -71.537 }, { nombre: 'Trujillo', lat: -8.112, lng: -79.029 },
  { nombre: 'Chiclayo', lat: -6.771, lng: -79.841 }, { nombre: 'Piura', lat: -5.194, lng: -80.632 },
  { nombre: 'Cusco', lat: -13.532, lng: -71.967 }, { nombre: 'Huancayo', lat: -12.065, lng: -75.204 },
  { nombre: 'Ica', lat: -14.068, lng: -75.729 }, { nombre: 'Chimbote', lat: -9.075, lng: -78.593 },
];
const km = (a, b) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 111 * Math.cos((a.lat * Math.PI) / 180));

// Los límites de los distritos de Lima de vuelta a latitud y longitud: el respaldo del mapa cuando el mapa base no carga
export function contornos(mapa) {
  if (!mapa?.distritos) return [];
  const { lat0, lng0, k, cos } = mapa.proyeccion;
  return mapa.distritos.flatMap((d) => d.anillos.map((a) => a.map(([x, y]) => [Math.round((lat0 - y / k) * 1e5) / 1e5, Math.round((x / (cos * k) + lng0) * 1e5) / 1e5])));
}

export const proyectar = (mapa, lat, lng) => {
  const { lat0, lng0, k, cos } = mapa.proyeccion;
  return [(lng - lng0) * cos * k, (lat0 - lat) * k];
};

// Punto en polígono por rayo, sobre los anillos ya proyectados
function dentro([x, y], anillo) {
  let si = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i], [xj, yj] = anillo[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) si = !si;
  }
  return si;
}
// Distancia de un punto al borde de un anillo (en unidades del mapa)
function alBorde([x, y], anillo) {
  let min = Infinity;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [x1, y1] = anillo[j], [x2, y2] = anillo[i];
    const dx = x2 - x1, dy = y2 - y1, t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy || 1)));
    min = Math.min(min, Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)));
  }
  return min;
}
// Un panel justo en un límite puede caer en la rendija que deja la simplificación: va al distrito con el borde más
// cercano, si está a menos de ~500 m (20 unidades del mapa)
// El mapa llama «Lima» al distrito del centro; en pantalla es el Cercado, para no confundirlo con la ciudad
const nombreDistrito = (n) => (n === 'Lima' ? 'Cercado de Lima' : n);
export function distritoDe(mapa, punto) {
  const d = mapa.distritos.find((x) => x.anillos.some((a) => dentro(punto, a)));
  if (d) return nombreDistrito(d.nombre);
  const [cerca, dist] = mapa.distritos.map((x) => [x, Math.min(...x.anillos.map((a) => alBorde(punto, a)))]).sort((a, b) => a[1] - b[1])[0] || [];
  return cerca && dist < 20 ? nombreDistrito(cerca.nombre) : null;
}

// paneles: los del contrato que se cruzan con el período, con `marca` (id de la fuente)
export function leerOoh(paneles, mapa, marcas) {
  const conCoordenadas = (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng);
  const lista = paneles.map((p) => {
    const distrito = mapa && conCoordenadas(p) ? distritoDe(mapa, proyectar(mapa, p.lat, p.lng)) : null;
    const ciudad = distrito ? 'Lima' : conCoordenadas(p) ? CIUDADES.map((c) => [c, km(c, p)]).sort((a, b) => a[1] - b[1]).find(([, d]) => d < 60)?.[0].nombre ?? null : null;
    return { ...p, distrito, ciudad };
  });

  // Una ubicación por punto del mapa: las caras de una misma torre o pantalla van juntas. Lima y cada ciudad son zonas
  const ubicaciones = new Map();
  for (const p of lista.filter(conCoordenadas)) {
    const k = `${p.marca}|${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
    if (!ubicaciones.has(k)) ubicaciones.set(k, { id: k, marca: p.marca, lat: p.lat, lng: p.lng, zona: p.distrito ? 'Lima' : p.ciudad || 'Otras ciudades', distrito: p.distrito, paneles: [], inversion: 0 });
    const q = ubicaciones.get(k);
    q.paneles.push(p); q.inversion += p.spend || 0;
  }
  const puntos = [...ubicaciones.values()].sort((a, b) => b.inversion - a.inversion);
  const zonas = [...new Set(puntos.map((u) => u.zona))].map((nombre) => {
    const us = puntos.filter((u) => u.zona === nombre);
    return { nombre, ubicaciones: us.length, paneles: us.reduce((s, u) => s + u.paneles.length, 0), encuadre: us.map((u) => [u.lat, u.lng]) };
  }).sort((a, b) => (a.nombre === 'Lima' ? -1 : b.nombre === 'Lima' ? 1 : b.paneles - a.paneles));

  const cuenta = (filtro, clave) => {
    const m = new Map();
    for (const p of lista.filter(filtro)) {
      const k = p[clave] || 'Sin coordenadas';
      if (!m.has(k)) m.set(k, Object.fromEntries(marcas.map((x) => [x, 0])));
      if (m.get(k)[p.marca] != null) m.get(k)[p.marca] += 1;
    }
    return [...m.entries()].map(([nombre, c]) => ({ nombre, ...c, total: Object.values(c).reduce((s, n) => s + n, 0) }))
      .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre));
  };
  const enLima = lista.filter((p) => p.distrito).length;
  return {
    puntos, zonas,
    porDistrito: cuenta((p) => p.distrito, 'distrito'),
    fueraDeLima: cuenta((p) => !p.distrito, 'ciudad'),
    enLima, fuera: lista.length - enLima,
  };
}
