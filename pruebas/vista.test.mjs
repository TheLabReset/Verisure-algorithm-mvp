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
import { version, medioEnFrase } from '../src/textos/comun.js';
import { hechoTexto } from '../src/textos/maia.js';
import { distritoDe, proyectar } from '../src/calculo/ooh.js';
import { semanaDe } from '../src/calculo/semana.js';
import { consultar } from '../src/fuentes/trends.js';
import { armarMensajes, responder } from '../src/fuentes/maia.js';
import { preguntarMaia } from '../src/fuentes/maia-navegador.js';
import { MEDIOS, FRANJAS } from '../src/calculo/vista.js';

const leer = (f) => readFileSync(new URL(`../public/data/${f}`, import.meta.url), 'utf8');
const contrato = JSON.parse(leer('algorithm.json'));
const medios = JSON.parse(leer('medios.json'));
const mapa = JSON.parse(leer('mapa-lima.json'));
const busquedas = JSON.parse(leer('busquedas.json'));
const MESES = mesesDisponibles(contrato.meta);
const vistaDe = (mes, estado) => armarVista(contrato, medios, { mes }, estado, { mapa, busquedas });

// Recorre la vista buscando NaN o Infinity: un cálculo roto se ve así antes de llegar a la pantalla
function numerosRotos(x, ruta = 'vista', out = []) {
  if (typeof x === 'number' && !Number.isFinite(x)) out.push(ruta);
  else if (x && typeof x === 'object') for (const [k, y] of Object.entries(x)) numerosRotos(y, `${ruta}.${k}`, out);
  return out;
}

test('el período: mes cerrado contra el mes anterior entero, mes en curso contra los mismos días, enero sin comparación', () => {
  const junio = periodoDelMes(contrato.meta, '2026-06');
  assert.deepEqual([junio.desde, junio.hasta, junio.parcial, junio.compararDesde, junio.compararHasta], ['2026-06-01', '2026-06-30', false, '2026-05-01', '2026-05-31']);
  const ultimo = MESES.at(-1);
  const enCurso = periodoDelMes(contrato.meta, ultimo);
  assert.equal(enCurso.hasta, contrato.meta.lastDay);
  assert.equal(enCurso.compararHasta.slice(8), enCurso.hasta.slice(8), 'el mes en curso se compara con los mismos días del mes anterior');
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
    const v = vistaDe(mes);
    const P = v.periodo;
    const lecturas = [
      L.estrenosLectura(v), L.abanicoAtlLectura(v.lee.abanicoAtl, P), L.abanicoDigitalLectura(v.lee.abanicoDigital, P),
      L.oohLectura(v.lee.ooh, P), L.distritosLectura(v.lee.ooh), L.cronogramaLectura(v.lee.cronograma, 'la competencia'),
      L.atlLectura(v), L.digitalLectura(v), L.presionLectura(v, 'atl'), L.presionLectura(v, 'digital'), L.shareSemanalLectura(v.analiza.shareSemanal),
      L.mediosLectura(v, MEDIOS), L.franjasLectura(v, FRANJAS), L.temporadaLectura(v.analiza.temporada), L.pautaLectura(v.analiza.pauta), ...Object.entries(v.analiza.pautaSemanal).map(([u, f]) => L.pautaSemanalLectura(f, u)),
      L.busquedasLectura(v.analiza.busquedas), L.marcasDiyLectura(v.analiza.busquedas),
      ...Object.entries(v.lee.medios || {}).flatMap(([m, d]) => [L.canalesLectura(d, m), L.horarioLectura(d, m), L.programasLectura(d, m)]),
    ];
    const alertas = [...v.sugiere.queMirar, ...v.sugiere.queVaBien].map(L.alerta);
    assert.ok(alertas.every(Boolean), 'una alerta no tiene texto');
    const hechos = (v.sugiere.semana?.hechos || []).map(hechoTexto);
    assert.ok(hechos.every((h) => h?.titulo && h.dato), 'un hecho de la semana no tiene texto');
    alertas.push(...hechos.map((h) => ({ ...h, mirar: '' })));
    for (const t of [...lecturas.flatMap((x) => [x.titulo, x.lectura]), ...alertas.flatMap((a) => [a.titulo, a.dato, a.mirar])]) {
      assert.equal(typeof t, 'string');
      assert.doesNotMatch(t, /undefined|NaN|null|\[object/, t);
      assert.doesNotMatch(t, /—/, `raya larga en «${t}»`);
    }
    for (const x of lecturas) {
      const frases = x.lectura.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ«¿])/u).filter(Boolean);
      assert.ok(frases.length <= 2, `más de dos frases: «${x.lectura}»`);
    }
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
