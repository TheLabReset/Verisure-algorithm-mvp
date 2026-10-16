// Render de verdad: cada capa, en cada escenario y cada mes, se pinta con React (con sus paneles de detalle abiertos)
// y el texto que queda en pantalla no lleva números rotos, rayas largas ni relleno. Las pruebas de la vista revisan
// los datos y las lecturas; esta revisa lo que arman las pantallas con ellos: chips, pies, ayudas, tablas, rótulos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { armarVista, mesesDisponibles } from '../src/calculo/vista.js';
import { ESCENARIOS, aplicarEscenario } from '../src/calculo/escenarios.js';
import { periodoDelMes, DIAS_MINIMOS } from '../src/calculo/periodo.js';
import { textoRoto, nombresDeLaFuente } from './revisar.mjs';

const raiz = new URL('../', import.meta.url);
const leer = (f) => JSON.parse(readFileSync(new URL(`public/data/${f}`, raiz), 'utf8'));
const DATOS = { contrato: leer('algorithm.json'), medios: leer('medios.json'), mapa: leer('mapa-lima.json'), busquedas: leer('busquedas.json') };

// dentro de node_modules, para que el bundle encuentre react y react-dom del proyecto
const salida = new URL('node_modules/.cache/prueba-render/entrada.mjs', raiz);
mkdirSync(new URL('./', salida), { recursive: true });
await build({
  entryPoints: [fileURLToPath(new URL('pruebas/render-entrada.jsx', raiz))], outfile: fileURLToPath(salida),
  bundle: true, platform: 'node', format: 'esm', jsx: 'automatic', logLevel: 'silent',
  external: ['react', 'react-dom', 'lucide-react'], loader: { '.css': 'empty' },
  plugins: [{ name: 'sin-mapa', setup(b) {
    b.onResolve({ filter: /MapaPaneles\.jsx$/ }, () => ({ path: 'mapa', namespace: 'sin-mapa' }));
    b.onLoad({ filter: /.*/, namespace: 'sin-mapa' }, () => ({ contents: 'export default function MapaPaneles() { return null; }', loader: 'js' }));
  } }],
});
const { pintar, pintarMaia, IDS } = await import(`${salida.href}?${Date.now()}`);

// el texto que se lee: sin etiquetas, con los atributos que se leen en voz alta o al pasar el mouse
const texto = (html) => [...html.matchAll(/(?:aria-label|title|data-pista)="([^"]*)"/g)].map((m) => m[1]).join(' \n') + ' \n' + html.replace(/<[^>]+>/g, ' \n');

test('la prueba pinta cada capa y abre los detalles', () => {
  // un mes con data suficiente para que cada capa tenga su detalle (el último puede tener un solo día)
  const conData = (P) => DATOS.contrato.daily.filter((d) => d.fecha >= P.desde && d.fecha <= P.hasta).length;
  const mes = [...mesesDisponibles(DATOS.contrato.meta)].reverse().find((m) => conData(periodoDelMes(DATOS.contrato.meta, m)) >= DIAS_MINIMOS);
  const v = armarVista(DATOS.contrato, DATOS.medios, { mes }, {}, { mapa: DATOS.mapa, busquedas: DATOS.busquedas });
  assert.deepEqual(IDS, ['senales', 'inteligencia', 'activacion', 'rendimiento']);
  for (const id of IDS) {
    const html = pintar(id, v);
    assert.match(html, /q-detalle-cuerpo/, `${id}: el detalle no se pintó`);
    assert.ok(html.length > 5000, `${id}: la capa salió casi vacía`);
  }
});

for (const e of [{ id: null, titulo: 'Data real' }, ...ESCENARIOS]) {
  test(`render «${e.titulo}»: cada capa, cada mes, sin texto roto`, () => {
    const d = aplicarEscenario(e.id, DATOS);
    const malos = new Set();
    for (const mes of mesesDisponibles(d.contrato.meta)) {
      const v = armarVista(d.contrato, d.medios, { mes }, {}, { mapa: d.mapa, busquedas: d.busquedas });
      const nombres = nombresDeLaFuente(v);
      for (const id of IDS) for (const m of textoRoto(texto(pintar(id, v)), nombres)) malos.add(`${id} ${mes}: ${m}`);
      for (const m of textoRoto(texto(pintarMaia(v, null)), nombres)) malos.add(`maia ${mes}: ${m}`);
    }
    assert.deepEqual([...malos].slice(0, 12), []);
  });
}

// Los estados de la barra Demo: cada fuente caída y la carga, en cada mes, con los avisos que trae cada uno
test('render: fuentes caídas y cargando, sin texto roto', () => {
  const malos = new Set();
  for (const mes of mesesDisponibles(DATOS.contrato.meta)) {
    for (const caida of ['atl', 'digital', 'trends', null]) {
      const v = armarVista(DATOS.contrato, DATOS.medios, { mes }, { fuentesCaidas: caida ? [caida] : [] }, { mapa: DATOS.mapa, busquedas: DATOS.busquedas });
      const nombres = nombresDeLaFuente(v);
      for (const id of IDS) for (const m of textoRoto(texto(pintar(id, v, { cargando: !caida })), nombres)) malos.add(`${id} ${mes} ${caida ?? 'cargando'}: ${m}`);
    }
  }
  assert.deepEqual([...malos].slice(0, 12), []);
});
