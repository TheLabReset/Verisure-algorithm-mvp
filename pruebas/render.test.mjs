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
    assert.match(act, /<section class="q-resumen[^"]*"[^>]*data-ejemplo="true"/, 'el resumen de plataformas sin el sello');
    const sen = pintar('senales', v);
    for (const red of ['TikTok', 'Facebook']) {
      const tarjeta = sen.split('<article class="q-bloque ').find((t) => t.includes(`${red} vía Apify`) || t.includes(red === 'Facebook' ? 'social listening' : 'búsqueda por hashtag'));
      assert.ok(tarjeta && /data-ejemplo="true"/.test(tarjeta.slice(0, 300)), `${red}: la tarjeta de ejemplo sin el sello`);
    }
    const avisos = [...v.sugiere.queMirar, ...v.sugiere.queVaBien];
    assert.ok(avisos.every((a) => ['digital', 'tv', 'radio', 'ooh', 'medios', 'share', 'diaria'].includes(a.tarjeta)), 'un aviso apunta a una tarjeta que no tiene data real');
  }
});

// Las marcas vigiladas en la capa 1. Una vigilada de prueba con la historia de la competencia (sus mismas piezas,
// paneles y emisiones con otro nombre): así tiene algo en todos los meses. Se pinta con la competencia elegida y con
// la vigilada elegida, en cada mes y atajo: el filtro aparece, su color va en el mapa y la ficha, y no hay texto roto
import { CLIENTE } from '../src/cliente.js';
const [RIVAL] = CLIENTE.competencia, [VIG] = CLIENTE.vigiladas;
const comoVigilada = (xs) => xs.filter((x) => x.maname === RIVAL.marcaFuente).map((x) => ({ ...x, maname: VIG.marcaFuente, key: `v-${x.key}` }));
const VIGILADAS_PRUEBA = {
  meta: { marcas: [VIG.marcaFuente], historia: { [VIG.marcaFuente]: DATOS.contrato.meta.firstDay } }, daily: [], pieces: comoVigilada(DATOS.contrato.pieces), events: comoVigilada(DATOS.contrato.events), ooh: comoVigilada(DATOS.contrato.ooh),
  digital: { daily: [], pieces: comoVigilada(DATOS.contrato.digital.pieces) },
  medios: { ...DATOS.medios, emisiones: { [VIG.marcaFuente]: DATOS.medios.emisiones[RIVAL.marcaFuente] } },
};

test('render: las marcas vigiladas, con la competencia elegida y con la vigilada elegida, sin texto roto', () => {
  const malos = new Set();
  let conFiltro = 0, conColor = 0, conAviso = 0;
  const periodos = [...mesesDisponibles(DATOS.contrato.meta).map((mes) => ({ mes })), { atajo: '7d' }, { atajo: '30d' }, { desde: '2026-03-05', hasta: '2026-03-05' }];
  for (const filtros of periodos) {
    const v = armarVista(DATOS.contrato, DATOS.medios, filtros, {}, { mapa: DATOS.mapa, busquedas: DATOS.busquedas, vigiladas: VIGILADAS_PRUEBA });
    const nombres = nombresDeLaFuente(v);
    for (const marca of [null, VIG.marcaFuente]) {
      const html = pintar('senales', v, { marca });
      for (const m of textoRoto(texto(html), nombres)) malos.add(`${JSON.stringify(filtros)} ${marca ?? 'competencia'}: ${m}`);
      if (/aria-label="Marca"/.test(html)) conFiltro += 1;
      for (const g of html.match(/<div class="q-grupo" role="group" aria-label="Marca">[^]*?<\/div>/g) || []) assert.doesNotMatch(g, /q-muestra/, 'el filtro «Marca» va sin bolita de color');
      // su color en la leyenda del mapa y en la ficha de la emisión o del panel (no solo en el botón del filtro)
      if (marca && /q-leyenda[^]*?q-muestra-vigilada-1/.test(html) && /q-ficha-marca q-ficha-foco"><span class="q-muestra q-muestra-vigilada-1"/.test(html)) conColor += 1;
      if (!marca && html.includes('q-aviso-accion')) conAviso += 1;
    }
    // el resumen dice cuántas primeras apariciones tuvo, siempre con su número
    assert.match(pintar('senales', v), /Primeras apariciones de otras marcas/);
  }
  assert.deepEqual([...malos].slice(0, 12), []);
  assert.ok(conFiltro > 0 && conColor > 0 && conAviso > 0, `filtro ${conFiltro}, color ${conColor}, aviso con botón ${conAviso}: la vigilada no se pintó`);
});

test('render: sin el archivo de vigiladas, la capa 1 queda como antes', () => {
  const v = armarVista(DATOS.contrato, DATOS.medios, { atajo: '30d' }, {}, { mapa: DATOS.mapa, busquedas: DATOS.busquedas });
  const html = pintar('senales', v);
  assert.doesNotMatch(html, /aria-label="Marca"|Primeras apariciones de otras marcas|q-muestra-vigilada/);
});

test('búsquedas: con el grupo de competencia aparece el filtro; sin él, la tarjeta queda como antes', async () => {
  const { CLIENTE } = await import('../src/cliente.js');
  const { competenciaBusquedasLectura, competenciaBusquedasPie, competenciaBusquedasAyuda } = await import('../src/textos/lecturas.js');
  const diy = DATOS.busquedas.marcasDiy;
  // el grupo de competencia con la forma del archivo (las series de las cámaras, con los nombres de las empresas)
  const competencia = { ...diy, series: CLIENTE.busquedas.competencia.map((c, i) => ({ ...diy.series[i], id: c.id, nombre: c.nombre })) };
  const con = armarVista(DATOS.contrato, DATOS.medios, { atajo: '30d' }, {}, { mapa: DATOS.mapa, busquedas: { ...DATOS.busquedas, competencia } });
  const sin = armarVista(DATOS.contrato, DATOS.medios, { atajo: '30d' }, {}, { mapa: DATOS.mapa, busquedas: { ...DATOS.busquedas, competencia: undefined } });
  const c = con.analiza.busquedas.competencia;
  assert.equal(c.marcas.length, CLIENTE.busquedas.competencia.length);
  assert.ok(c.marcas.every((m, i, xs) => i === 0 || xs[i - 1].ahora >= m.ahora), 'de la más buscada a la menos');
  assert.equal(sin.analiza.busquedas.competencia, null);
  assert.match(pintar('senales', con), /aria-label="Búsquedas"/, 'con el grupo, el filtro Cámaras DIY | Competencia');
  assert.doesNotMatch(pintar('senales', sin), /aria-label="Búsquedas"/, 'sin el grupo, no hay filtro');
  // los textos: la competencia primero, las que suman empleo en el pie y la que no se mide en la ayuda
  const l = competenciaBusquedasLectura(c);
  assert.ok(l.titulo.startsWith(c.marcas[0].nombre));
  if (l.lectura) assert.ok(l.lectura.startsWith(CLIENTE.competencia[0].nombre), 'la lectura empieza por la competencia');
  for (const x of CLIENTE.busquedas.competencia.filter((y) => y.empleo)) assert.match(competenciaBusquedasPie('2026-10-20'), new RegExp(x.nombre));
  for (const n of CLIENTE.busquedas.sinMedir) assert.match(competenciaBusquedasAyuda(12), new RegExp(n));
});
