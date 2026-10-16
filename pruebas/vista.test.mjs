// La vista con la data commiteada de Integrametrics: períodos, universos, alertas y textos.
// Corre contra public/data (el contrato real que publica el pipeline), no contra una muestra.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { armarVista, mesesDisponibles, partes } from '../src/calculo/vista.js';
import { periodoDelMes } from '../src/calculo/periodo.js';
import { mediosDesdeCsv, leerCsv } from '../src/fuentes/medios.js';
import { CLIENTE } from '../src/cliente.js';
import * as L from '../src/textos/lecturas.js';
import { version, medioEnFrase, tramoMeses } from '../src/textos/comun.js';
import { hechoTexto } from '../src/textos/maia.js';
import { distritoDe, proyectar } from '../src/calculo/ooh.js';
import { semanaDe } from '../src/calculo/semana.js';
import { consultar } from '../src/fuentes/trends.js';
import { armarMensajes, responder } from '../src/fuentes/maia.js';
import { preguntarMaia } from '../src/fuentes/maia-navegador.js';
import { MEDIOS, FRANJAS } from '../src/calculo/vista.js';
import { numerosRotos, revisarTextos, RELLENO } from './revisar.mjs';

const leer = (f) => readFileSync(new URL(`../public/data/${f}`, import.meta.url), 'utf8');
const contrato = JSON.parse(leer('algorithm.json'));
const medios = JSON.parse(leer('medios.json'));
const mapa = JSON.parse(leer('mapa-lima.json'));
const busquedas = JSON.parse(leer('busquedas.json'));
const MESES = mesesDisponibles(contrato.meta);
const vistaDe = (mes, estado) => armarVista(contrato, medios, { mes }, estado, { mapa, busquedas });

test('el período: mes cerrado contra el mes anterior entero, mes en curso contra los mismos días, enero sin comparación', () => {
  // un mes cerrado con mes anterior: el penúltimo con data (o junio de 2026, el ejemplo de siempre, si está)
  const cerrado = MESES.includes('2026-06') ? '2026-06' : MESES.at(-2);
  if (cerrado && cerrado !== MESES[0]) {
    const p = periodoDelMes(contrato.meta, cerrado), [a, m] = cerrado.split('-').map(Number);
    const fin = (y, mm) => `${y}-${String(mm).padStart(2, '0')}-${String(new Date(Date.UTC(y, mm, 0)).getUTCDate()).padStart(2, '0')}`;
    const [ay, am] = m === 1 ? [a - 1, 12] : [a, m - 1];
    assert.deepEqual([p.desde, p.hasta, p.parcial, p.compararDesde, p.compararHasta], [`${cerrado}-01`, fin(a, m), false, `${ay}-${String(am).padStart(2, '0')}-01`, fin(ay, am)]);
  }
  const ultimo = MESES.at(-1);
  const enCurso = periodoDelMes(contrato.meta, ultimo);
  assert.equal(enCurso.hasta, contrato.meta.lastDay);
  // la data puede terminar a mitad de mes (en curso: los mismos días, o el mes anterior entero si es más corto)
  // o el último día del mes (cerrado: el mes anterior entero)
  const finDelMesAnterior = new Date(Date.UTC(+enCurso.desde.slice(0, 4), +enCurso.desde.slice(5, 7) - 1, 0)).getUTCDate();
  const esperado = enCurso.parcial ? Math.min(+enCurso.hasta.slice(8), finDelMesAnterior) : finDelMesAnterior;
  if (enCurso.compararDesde) assert.equal(+enCurso.compararHasta.slice(8), esperado, 'el mes en curso se compara con los mismos días del mes anterior');
  assert.equal(periodoDelMes(contrato.meta, MESES[0]).compararDesde, null, 'el primer mes con data no tiene con qué compararse');
});

test('partes suma exacto 100 y no inventa share sin inversión', () => {
  assert.equal(partes([1, 1, 1]).reduce((a, b) => a + b), 100);
  assert.deepEqual(partes([0, 0]), [null, null]);
});

for (const mes of MESES) {
  test(`${mes}: la vista no tiene números rotos y cada universo suma 100 por su lado`, () => {
    const v = vistaDe(mes);
    assert.deepEqual(numerosRotos(v), []);
    for (const u of [v.lee.atl, v.lee.digital]) {
      if (u.estado !== 'ok' || !u.total) continue;
      assert.equal(u.marcas.reduce((a, m) => a + m.share, 0), 100);
      assert.equal(u.marcas.filter((m) => m.propia).length, 1);
    }
    // ATL y digital no se suman: cada total sale solo de su universo
    if (v.lee.atl.estado === 'ok' && v.lee.digital.estado === 'ok') {
      const deAtl = v.lee.atl.marcas.reduce((a, m) => a + m.inversion, 0);
      assert.ok(Math.abs(deAtl - v.lee.atl.total) < 1);
    }
  });

  test(`${mes}: las lecturas no dicen undefined ni NaN y no pasan de dos frases`, () => {
    revisarTextos(vistaDe(mes));
  });
}

test('la competencia va primero: foco en las marcas y en las alertas', () => {
  const v = vistaDe('2026-06');
  assert.ok(v.lee.atl.marcas.every((m) => m.foco === !m.propia));
  const q = v.sugiere.queMirar;
  const primeraPropia = q.findIndex((a) => !a.competencia);
  assert.ok(primeraPropia === -1 || q.slice(primeraPropia).every((a) => !a.competencia), 'una alerta de la competencia quedó después de una propia');
});

test('OOH: cada panel de Lima cae en un distrito por coordenadas y las cuentas cuadran', () => {
  assert.equal(distritoDe(mapa, proyectar(mapa, -12.1197, -77.0297)), 'Miraflores'); // el parque Kennedy
  assert.equal(distritoDe(mapa, proyectar(mapa, -16.4, -71.54)), null); // Arequipa no está en el mapa de Lima
  for (const mes of MESES) {
    const o = vistaDe(mes).lee.ooh;
    const total = Object.values(o.porMarca).reduce((s, n) => s + n, 0);
    assert.equal(o.paneles.length, total);
    assert.equal([...o.porDistrito, ...o.fueraDeLima].reduce((s, d) => s + d.total, 0), total, `${mes}: los distritos no suman los paneles`);
    assert.equal(o.ubicaciones.reduce((s, u) => s + u.paneles.length, 0), o.paneles.filter((p) => Number.isFinite(p.lat)).length);
    assert.ok(!o.porDistrito.some((d) => d.nombre === 'Sin coordenadas'), `${mes}: un panel de Lima quedó sin distrito`);
  }
});

test('la semana de MAIA es la última de lunes a domingo completa', () => {
  const s = semanaDe({ firstDay: '2026-01-01', lastDay: '2026-07-13' }); // lunes
  assert.deepEqual([s.desde, s.hasta, s.previaDesde], ['2026-07-06', '2026-07-12', '2026-06-29']);
  assert.equal(semanaDe({ firstDay: '2026-01-01', lastDay: '2026-07-12' }).hasta, '2026-07-12'); // domingo
});

test('búsquedas: la razón y el crecimiento salen de la misma ventana de semanas completas', () => {
  const b = vistaDe('2026-06').analiza.busquedas;
  assert.equal(b.semanas, 12);
  const cam = b.series.find((s) => s.id === 'camaras');
  assert.ok(Math.abs(b.razon - cam.ahora / b.marca.ahora) < 1e-9);
  assert.ok(cam.serie.every((p) => p.valor == null || (p.valor >= 0 && p.valor <= 200)));
});

test('Google Trends: reintenta el 429 con la cookie y lee la serie', async () => {
  const respuestas = [
    new Response('', { status: 429, headers: { 'set-cookie': 'NID=abc; path=/' } }),
    new Response(`)]}'\n${JSON.stringify({ widgets: [{ id: 'TIMESERIES', request: {}, token: 't' }] })}`, { status: 200 }),
    new Response(`)]}',\n${JSON.stringify({ default: { timelineData: [{ time: '1735430400', value: [3, 4], isPartial: false }] } })}`, { status: 200 }),
  ];
  const vistos = [];
  const fetchImpl = async (url, op) => { vistos.push(op.headers.cookie || ''); return respuestas.shift(); };
  const serie = await consultar({ terminos: ['a', 'b'], geo: 'PE', desde: '2025-01-01', hasta: '2025-01-31', fetchImpl });
  assert.deepEqual(serie, [{ semana: '2024-12-29', valores: [3, 4], parcial: false }]);
  assert.deepEqual(vistos, ['', 'NID=abc', 'NID=abc']);
});

test('MAIA: mensajes alternados, la pregunta al final y la clave solo en la cabecera', async () => {
  const m = armarMensajes([{ rol: 'maia', texto: 'hola' }, { rol: 'usuario', texto: 'a' }, { rol: 'usuario', texto: 'b' }, { rol: 'maia', texto: 'c' }, { rol: 'aviso', texto: 'x' }], '¿y?');
  assert.deepEqual(m.map((x) => x.role), ['user', 'assistant', 'user']);
  assert.equal(m.at(-1).content, '¿y?');
  let pedido;
  const fetchImpl = async (url, op) => { pedido = { url, op }; return new Response(JSON.stringify({ content: [{ type: 'text', text: 'Respuesta' }] }), { status: 200 }); };
  const r = await responder({ clave: 'k', contexto: { corte: 'x' }, pregunta: '¿Qué hizo?', historial: [], fetchImpl });
  assert.equal(r, 'Respuesta');
  const cuerpo = JSON.parse(pedido.op.body);
  assert.equal(pedido.op.headers['x-api-key'], 'k');
  assert.ok(!pedido.op.body.includes('"k"'), 'la clave no va en el cuerpo');
  assert.equal(cuerpo.system[1].cache_control.type, 'ephemeral');
  await assert.rejects(() => responder({ clave: '', contexto: {}, pregunta: 'x', fetchImpl }), /ANTHROPIC_API_KEY/);
});

test('MAIA en el navegador: sin función o sin clave lo dice, nunca inventa una respuesta', async () => {
  assert.deepEqual(await preguntarMaia('x', [], async () => new Response('', { status: 404 })), { error: 'sin-funcion' });
  assert.deepEqual(await preguntarMaia('x', [], async () => new Response(JSON.stringify({ error: 'sin-clave' }), { status: 503 })), { error: 'sin-clave' });
  assert.deepEqual(await preguntarMaia('x', [], async () => { throw new Error('red'); }), { error: 'sin-red' });
  assert.equal((await preguntarMaia('x', [], async () => new Response(JSON.stringify({ respuesta: 'ok' }), { status: 200 }))).respuesta, 'ok');
});

test('si una fuente no cargó, sus bloques quedan sin dato y el resto sigue', () => {
  const sinAtl = vistaDe('2026-06', { fuentesCaidas: ['atl'] });
  assert.equal(sinAtl.lee.atl.estado, 'no-cargo');
  assert.equal(sinAtl.lee.medios, null);
  assert.equal(sinAtl.lee.digital.estado, 'ok');
  const sinDigital = vistaDe('2026-06', { fuentesCaidas: ['digital'] });
  assert.equal(sinDigital.lee.abanicoDigital, null);
  assert.equal(sinDigital.lee.atl.estado, 'ok');
  const sinTrends = vistaDe('2026-06', { fuentesCaidas: ['trends'] });
  assert.equal(sinTrends.analiza.busquedas, null);
  assert.equal(sinTrends.fuentes.find((f) => f.id === 'trends').estado, 'no-cargo');
});

test('la fuente se marca atrasada cuando pasan más días que el umbral sin data nueva', () => {
  const al = (hoy) => vistaDe('2026-06', { hoy }).fuentes[0];
  assert.equal(al(contrato.meta.lastDay).estado, 'ok');
  const tarde = al('2026-12-31');
  assert.equal(tarde.estado, 'parcial');
  assert.ok(tarde.atraso > 3);
});

test('medios.json es lo que sale del CSV commiteado', () => {
  const desdeCsv = mediosDesdeCsv(leer('export.csv'));
  assert.deepEqual(desdeCsv, medios, 'medios.json quedó viejo: correr npm run medios');
});

test('leerCsv respeta comillas, comas y comillas dobles dentro de un campo', () => {
  assert.deepEqual(leerCsv('a,b\n"x, y","di ""hola"""\n'), [{ a: 'x, y', b: 'di "hola"' }]);
});

// Texto de relleno: frases que explican la interfaz, repiten lo que el gráfico ya muestra o usan jerga interna.
// El socio lee lecturas, pies y ayudas; ninguna de estas frases le dice algo que no vea ya.
test('ningún texto que ve el socio es relleno ni jerga interna', () => {
  const carpeta = (c) => readdirSync(new URL(`../${c}/`, import.meta.url)).filter((f) => /\.(jsx?|mjs)$/.test(f)).map((f) => `${c}/${f}`);
  const archivos = ['src/textos/lecturas.js', 'src/textos/maia.js', 'src/textos/comun.js', 'src/capas/estructura.js', 'src/App.jsx',
    ...carpeta('src/pantallas'), ...carpeta('src/sistema'), ...carpeta('src/sistema/graficos')];
  // las funciones de Netlify y src/fuentes no muestran texto: sus mensajes se traducen en el panel, que sí se revisa en render.test.mjs
  const malos = [];
  for (const f of archivos) {
    // solo el texto: se saltan los comentarios y las importaciones
    // los comentarios al final de una línea de código también se saltan (no los de una URL: «https://»)
    const s = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*|import )/.test(l))
      .map((l) => l.replace(/(^|[^:'"`])\/\/ .*$/, '$1')).join('\n').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const [re, por] of [...RELLENO, [/—/, 'raya larga']]) { const m = s.match(re); if (m) malos.push(`${f}: «${m[0]}» (${por})`); }
  }
  assert.deepEqual(malos, []);
});

test('una versión digital es nueva el mes en que se ve por primera vez, no cada vez que aparece una variante', () => {
  const [rival] = CLIENTE.competencia;
  const primera = new Map();
  for (const p of contrato.digital.pieces.filter((x) => x.maname === rival.marcaFuente)) { const d = p.firstEmission.slice(0, 10); if (!primera.has(p.vname) || d < primera.get(p.vname)) primera.set(p.vname, d); }
  for (const mes of MESES) {
    const esperadas = [...primera.values()].filter((d) => d.startsWith(mes)).length;
    const g = vistaDe(mes).lee.abanicoDigital.grupos.find((x) => x.nombre === rival.nombre);
    assert.equal(g?.anuncios.length ?? 0, esperadas, `${mes}: versiones digitales nuevas`);
  }
});

test('las semanas de la pauta y del share van de lunes a domingo, como las de MAIA', () => {
  const v = vistaDe(MESES.at(-1));
  for (const filas of Object.values(v.analiza.pautaSemanal)) for (const f of filas) for (const s of f.semanas.slice(1)) assert.equal(new Date(`${s.fecha}T00:00:00Z`).getUTCDay(), 1, `la semana del ${s.fecha} no empieza en lunes`);
  for (const serie of [v.analiza.shareSemanal.atl, v.analiza.shareSemanal.digital].filter(Boolean)) for (const s of serie.slice(1)) assert.equal(new Date(`${s.fecha}T00:00:00Z`).getUTCDay(), 1);
});

test('el tramo de meses sale de la data, no de un texto fijo', () => {
  assert.equal(tramoMeses('2026-01-01', '2026-07-13'), 'entre enero y julio');
  assert.equal(tramoMeses('2026-01-01', '2026-07-13', 'de'), 'enero a julio');
  assert.equal(tramoMeses('2026-07-01', '2026-07-01'), 'en julio');
  assert.equal(tramoMeses('2026-12-01', '2027-02-10'), 'entre diciembre de 2026 y febrero de 2027');
  assert.equal(tramoMeses(null, '2026-07-01'), 'en el año');
});

test('las lecturas de la vista no traen meses escritos a mano', () => {
  // si la data empieza en marzo, el cronograma no puede decir «entre enero y julio»
  const v = vistaDe(MESES.at(-1));
  const x = L.cronogramaLectura(v.lee.cronograma, 'La competencia', '2026-03-01', '2026-07-13');
  assert.match(x.lectura, /entre marzo y julio/);
});

test('nombres de versión y medios dentro de una frase', () => {
  assert.equal(version('ATV NOTICIAS AMANECER'), 'ATV noticias amanecer');
  assert.equal(medioEnFrase('TV abierta'), 'TV abierta');
  assert.equal(medioEnFrase('Vía pública'), 'vía pública');
});

// Duplicar el repo para otra marca: el nombre de la marca, de su competencia y de su rubro viven solo en src/cliente.js.
// Si aparecen escritos en otro archivo, al cambiar de cliente quedarían textos con el nombre equivocado.
test('la marca, su competencia y su rubro solo se escriben en src/cliente.js', () => {
  // tokens.css es la paleta del cliente: se reescribe entera con cada marca, así que puede nombrarla
  const permitidos = new Set(['src/cliente.js', 'src/sistema/tokens.css']);
  const archivos = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? archivos(p) : /\.(jsx?|mjs|css)$/.test(n) ? [p] : []; });
  const palabras = [CLIENTE.nombre, CLIENTE.nombreLargo, CLIENTE.marcaFuente, ...CLIENTE.competencia.flatMap((c) => [c.nombre, c.marcaFuente]), CLIENTE.rubroPlural];
  const fugas = [...archivos('src'), ...archivos('scripts')].filter((p) => !permitidos.has(p)).flatMap((p) => {
    const texto = readFileSync(p, 'utf8');
    return palabras.filter((w) => new RegExp(`(?<![\\w-])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`).test(texto)).map((w) => `${p}: ${w}`);
  });
  assert.deepEqual(fugas, [], 'la marca o su competencia quedaron escritas fuera de src/cliente.js');
});

// Un archivo opcional que llega con otra forma (vacío, de otra versión) cuenta como que no llegó: la capa lo dice
test('búsquedas o mapa con otra forma no tumban la vista', () => {
  for (const raro of [{}, [], { categoria: { semanas: [] } }, { categoria: {} }, 'texto']) {
    const v = armarVista(contrato, medios, { mes: MESES.at(-1) }, {}, { mapa: raro, busquedas: raro });
    assert.equal(v.analiza.busquedas, null);
    assert.equal(v.fuentes.find((f) => f.id === 'trends').estado, 'no-cargo');
    revisarTextos(v);
  }
});

// Con la fuente atrasada, el último mes no está «en curso»: se dice hasta qué día tiene data
test('el último mes con la fuente atrasada no se lee como en curso', () => {
  const ultimo = MESES.at(-1), P0 = periodoDelMes(contrato.meta, ultimo);
  if (!P0.parcial) return;
  const lejos = new Date(Date.parse(`${contrato.meta.lastDay}T00:00:00Z`) + 30 * 864e5).toISOString().slice(0, 10);
  const v = armarVista(contrato, medios, { mes: ultimo }, { hoy: lejos }, { mapa, busquedas });
  assert.equal(v.periodo.enCurso, false);
  assert.doesNotMatch(L.estrenosLectura(v).lectura + L.atlLectura(v).lectura, /lo que va de/);
  assert.equal(armarVista(contrato, medios, { mes: ultimo }, { hoy: contrato.meta.lastDay }, { mapa, busquedas }).periodo.enCurso, undefined);
});
