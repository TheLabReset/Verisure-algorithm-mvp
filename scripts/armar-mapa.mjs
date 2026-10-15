// Arma public/data/mapa-lima.json: los 50 distritos de Lima Metropolitana y el Callao, simplificados y ya proyectados,
// para el mapa de OOH. Se corre una vez (los límites casi no cambian):
//   node scripts/armar-mapa.mjs osm-lima.geojson
// La entrada es un FeatureCollection con properties { nombre, provincia } por distrito, bajado de OpenStreetMap con
// Nominatim (un pedido por distrito, uno por segundo, como pide su política de uso). Licencia ODbL: el archivo derivado
// lleva la atribución «© colaboradores de OpenStreetMap» y la licencia en sus campos.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data', 'mapa-lima.json');
// Proyección equirectangular con el coseno de la latitud de Lima: a escala de ciudad la deformación no se ve
const LAT0 = -12.05, LNG0 = -77.05, K = 4000; // 1 grado de latitud = 4000 unidades del mapa
const COS = Math.cos((LAT0 * Math.PI) / 180);
export const proyectar = (lat, lng) => [(lng - LNG0) * COS * K, (LAT0 - lat) * K];
const TOLERANCIA = 1; // unidades del mapa: ~25 m en el terreno, menos de un píxel con el mapa a todo lo ancho


// Douglas-Peucker sobre un anillo ya proyectado
function simplificar(p, tol) {
  if (p.length < 4) return p;
  const marca = new Uint8Array(p.length); marca[0] = marca[p.length - 1] = 1;
  const pila = [[0, p.length - 1]];
  while (pila.length) {
    const [a, b] = pila.pop();
    let max = 0, idx = -1;
    const [x1, y1] = p[a], [x2, y2] = p[b];
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * p[i][0] - dx * p[i][1] + x2 * y1 - y2 * x1) / L; if (d > max) { max = d; idx = i; } }
    if (max > tol) { marca[idx] = 1; pila.push([a, idx], [idx, b]); }
  }
  return p.filter((_, i) => marca[i]);
}
// Un anillo cerrado empieza y termina en el mismo punto: se parte en el vértice más lejano y se simplifica cada mitad
function simplificarAnillo(p, tol) {
  let lejos = 0, max = 0;
  for (let i = 1; i < p.length; i++) { const d = Math.hypot(p[i][0] - p[0][0], p[i][1] - p[0][1]); if (d > max) { max = d; lejos = i; } }
  return [...simplificar(p.slice(0, lejos + 1), tol).slice(0, -1), ...simplificar(p.slice(lejos), tol)];
}
const r1 = (n) => Math.round(n * 10) / 10;

function armar(geo) {
  const distritos = [];
  for (const f of geo.features) {
    const pr = f.properties;
    if (!f.geometry) continue;
    const poligonos = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const anillos = poligonos.map((pol) => simplificarAnillo(pol[0].map(([lng, lat]) => proyectar(lat, lng)), TOLERANCIA).map(([x, y]) => [r1(x), r1(y)])).filter((a) => a.length >= 4);
    if (!anillos.length) continue;
    // Centro para el rótulo: el centroide del anillo más grande
    const mayor = anillos.reduce((a, b) => (b.length > a.length ? b : a));
    let A = 0, cx = 0, cy = 0;
    for (let i = 0; i < mayor.length - 1; i++) { const [x0, y0] = mayor[i], [x1, y1] = mayor[i + 1]; const c = x0 * y1 - x1 * y0; A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c; }
    distritos.push({ nombre: pr.nombre, provincia: pr.provincia, anillos, centro: [r1(cx / (3 * A)), r1(cy / (3 * A))] });
  }
  return {
    fuente: '© colaboradores de OpenStreetMap (límites administrativos de distrito, bajados con Nominatim en octubre de 2026)',
    licencia: 'ODbL 1.0 (https://opendatacommons.org/licenses/odbl/). Geometría simplificada y proyectada por scripts/armar-mapa.mjs',
    proyeccion: { lat0: LAT0, lng0: LNG0, k: K, cos: COS },
    distritos,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const geo = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const mapa = armar(geo);
  writeFileSync(OUT, JSON.stringify(mapa));
  const puntos = mapa.distritos.reduce((s, d) => s + d.anillos.reduce((t, a) => t + a.length, 0), 0);
  console.log(`mapa-lima.json · ${mapa.distritos.length} distritos · ${puntos} vértices`);
}
