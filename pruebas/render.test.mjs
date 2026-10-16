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

// El selector de período: cada atajo, un día suelto, el primer día de la data y un tramo que cruza meses
test('render: cada atajo y tramos libres, sin texto roto', () => {
  const malos = new Set();
  const { firstDay } = DATOS.contrato.meta;
  for (const filtros of [{ atajo: '7d' }, { atajo: '30d' }, { atajo: 'mes' }, { atajo: 'mes-pasado' }, { atajo: '6m' }, { desde: '2026-03-05', hasta: '2026-03-05' }, { desde: firstDay, hasta: firstDay }, { desde: '2026-04-20', hasta: '2026-05-10' }]) {
    const v = armarVista(DATOS.contrato, DATOS.medios, filtros, {}, { mapa: DATOS.mapa, busquedas: DATOS.busquedas });
    const nombres = nombresDeLaFuente(v);
    for (const id of IDS) for (const m of textoRoto(texto(pintar(id, v)), nombres)) malos.add(`${id} ${JSON.stringify(filtros)}: ${m}`);
  }
  assert.deepEqual([...malos].slice(0, 12), []);
});

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

// La data de ejemplo se dice: cada tarjeta y el resumen de la capa de plataformas llevan el sello, y las tarjetas de
// TikTok y Facebook también. Y no entra a los avisos: ninguna regla apunta a una tarjeta de ejemplo
test('la data de ejemplo lleva su sello y no entra a los avisos', () => {
  for (const filtros of [{ atajo: '7d' }, { atajo: 'mes-pasado' }, { desde: '2026-03-05', hasta: '2026-03-05' }]) {
    const v = armarVista(DATOS.contrato, DATOS.medios, filtros, {}, { mapa: DATOS.mapa, busquedas: DATOS.busquedas });
    const act = pintar('activacion', v);
    const bloques = (act.match(/<article class="q-bloque /g) || []).length;
    const sellados = (act.match(/<article class="q-bloque [^"]*"[^>]*data-ejemplo="true"/g) || []).length;
    assert.ok(bloques > 0 && sellados === bloques, `${JSON.stringify(filtros)}: ${bloques - sellados} tarjetas de plataformas sin el sello`);
    assert.match(act, /<section class="q-resumen"[^>]*data-ejemplo="true"/, 'el resumen de plataformas sin el sello');
    const sen = pintar('senales', v);
    for (const red of ['TikTok', 'Facebook']) {
      const tarjeta = sen.split('<article class="q-bloque ').find((t) => t.includes(`${red} vía Apify`) || t.includes(red === 'Facebook' ? 'social listening' : 'búsqueda por hashtag'));
      assert.ok(tarjeta && /data-ejemplo="true"/.test(tarjeta.slice(0, 300)), `${red}: la tarjeta de ejemplo sin el sello`);
    }
    const avisos = [...v.sugiere.queMirar, ...v.sugiere.queVaBien];
    assert.ok(avisos.every((a) => ['digital', 'tv', 'radio', 'ooh', 'medios', 'share', 'diaria'].includes(a.tarjeta)), 'un aviso apunta a una tarjeta que no tiene data real');
  }
});
