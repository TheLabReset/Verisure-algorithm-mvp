// La función de Netlify de MAIA, con el entorno de Netlify y la red simulados: sin clave dice que no la tiene,
// rechaza pedidos malos, reenvía el Basic Auth al leer el contexto y nunca inventa una respuesta si el modelo falla.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import funcion from '../netlify/functions/maia.mjs';

const fetchOriginal = globalThis.fetch;
afterEach(() => { globalThis.fetch = fetchOriginal; delete globalThis.Netlify; });
const entorno = (vars) => { globalThis.Netlify = { env: { get: (k) => vars[k] } }; };
const pedido = (cuerpo, headers = {}) => new Request('https://panel.ejemplo/api/maia', { method: 'POST', headers, body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo) });
const leer = async (r) => ({ status: r.status, cuerpo: await r.json() });

test('MAIA: /api/maia va a la función antes de la redirección de la SPA, y solo acepta POST', async () => {
  const toml = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
  const api = toml.indexOf('from = "/api/maia"'), spa = toml.indexOf('from = "/*"');
  assert.ok(api >= 0 && api < spa, 'la regla de /api/maia tiene que ir antes que la de la SPA');
  assert.match(toml.slice(api, spa), /to = "\/\.netlify\/functions\/maia"/);
  entorno({ ANTHROPIC_API_KEY: 'k' });
  assert.equal((await funcion(new Request('https://panel.ejemplo/api/maia'))).status, 405);
});

test('MAIA: sin clave responde sin-clave y no llama a nadie', async () => {
  entorno({});
  globalThis.fetch = () => { throw new Error('no debía llamar'); };
  const r = await leer(await funcion(pedido({ pregunta: 'hola' })));
  assert.deepEqual([r.status, r.cuerpo.error], [503, 'sin-clave']);
});

test('MAIA: pedidos vacíos, muy largos o que no son JSON se rechazan', async () => {
  entorno({ ANTHROPIC_API_KEY: 'k' });
  for (const c of ['no es json', { pregunta: '' }, { pregunta: 'x'.repeat(1001) }]) assert.equal((await funcion(pedido(c))).status, 400);
});

test('MAIA: lee el contexto con el mismo Basic Auth y devuelve la respuesta del modelo', async () => {
  entorno({ ANTHROPIC_API_KEY: 'clave-secreta', MAIA_MODELO: 'modelo-x' });
  const vistos = [];
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    vistos.push({ u, init });
    if (u.endsWith('/data/maia-contexto.json')) return new Response(JSON.stringify({ corte: { integrametrics: '2026-07-13' }, meses: [] }));
    return new Response(JSON.stringify({ content: [{ type: 'text', text: 'Respuesta con la data.' }] }));
  };
  const r = await leer(await funcion(pedido({ pregunta: '¿Qué hizo la competencia?' }, { authorization: 'Basic abc' })));
  assert.equal(r.status, 200);
  assert.equal(r.cuerpo.respuesta, 'Respuesta con la data.');
  const ctx = vistos.find((v) => v.u.endsWith('/data/maia-contexto.json'));
  assert.equal(new Headers(ctx.init.headers).get('authorization'), 'Basic abc');
  const modelo = vistos.find((v) => !v.u.endsWith('.json'));
  assert.equal(JSON.parse(modelo.init.body).model, 'modelo-x');
  assert.equal(new Headers(modelo.init.headers).get('x-api-key'), 'clave-secreta');
});

test('MAIA: si el modelo o el contexto fallan, dice que no pudo; nunca inventa', async () => {
  entorno({ ANTHROPIC_API_KEY: 'k' });
  globalThis.fetch = async (url) => (String(url).endsWith('.json') ? new Response('{}', { status: 404 }) : new Response('{}'));
  assert.equal((await leer(await funcion(pedido({ pregunta: 'hola' })))).cuerpo.error, 'contexto');
  globalThis.fetch = async (url) => (String(url).endsWith('.json') ? new Response('{"meses":[]}') : new Response('caído', { status: 529 }));
  const r = await leer(await funcion(pedido({ pregunta: 'hola' })));
  assert.deepEqual([r.status, r.cuerpo.error, r.cuerpo.respuesta], [502, 'modelo', undefined]);
});

test('MAIA: una respuesta vacía del modelo no llega como respuesta, y un historial que no es lista se rechaza', async () => {
  entorno({ ANTHROPIC_API_KEY: 'k' });
  globalThis.fetch = async (url) => (String(url).endsWith('.json') ? new Response('{"meses":[]}') : new Response(JSON.stringify({ content: [{ type: 'text', text: '   ' }] })));
  const r = await leer(await funcion(pedido({ pregunta: 'hola' })));
  assert.deepEqual([r.status, r.cuerpo.error, r.cuerpo.detalle], [502, 'modelo', undefined]);
  for (const historial of ['texto', { a: 1 }]) assert.equal((await funcion(pedido({ pregunta: 'hola', historial }))).status, 400);
  globalThis.fetch = async (url) => (String(url).endsWith('.json') ? new Response('{"meses":[]}') : new Response(JSON.stringify({ content: [{ type: 'text', text: 'Bien.' }] })));
  assert.equal((await leer(await funcion(pedido({ pregunta: 'hola', historial: [null, { rol: 'usuario', texto: 'antes' }] })))).cuerpo.respuesta, 'Bien.');
});

test('MAIA: si el contexto llega como HTML (falta el archivo y responde la SPA), dice que no pudo leerlo', async () => {
  entorno({ ANTHROPIC_API_KEY: 'k' });
  globalThis.fetch = async (url) => (String(url).endsWith('.json') ? new Response('<!doctype html><html></html>', { headers: { 'content-type': 'text/html' } }) : new Response('{}'));
  assert.equal((await leer(await funcion(pedido({ pregunta: 'hola' })))).cuerpo.error, 'contexto');
});

test('MAIA en el navegador: una respuesta vacía o HTML es un error, nunca una burbuja vacía', async () => {
  const { preguntarMaia } = await import('../src/fuentes/maia-navegador.js');
  assert.deepEqual(await preguntarMaia('x', [], async () => new Response('<!doctype html>', { status: 200 })), { error: 'modelo' });
  assert.deepEqual(await preguntarMaia('x', [], async () => new Response(JSON.stringify({ respuesta: '' }))), { error: 'modelo' });
});

test('Acceso: /api/maia y /data quedan detrás del Basic Auth, y una clave con ñ funciona', async () => {
  const toml = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
  assert.match(toml, /\[\[edge_functions\]\]\s*\n\s*path = "\/\*"\s*\n\s*function = "auth"/);
  const { default: auth } = await import('../netlify/edge-functions/auth.js');
  entorno({ BASIC_AUTH_USER: 'lab', BASIC_AUTH_PASSWORD: 'contraseña' });
  const conClave = 'Basic ' + Buffer.from('lab:contraseña', 'utf8').toString('base64');
  assert.equal((await auth(new Request('https://panel.ejemplo/data/maia-contexto.json'), {}))?.status, 401);
  assert.equal(await auth(new Request('https://panel.ejemplo/api/maia', { headers: { authorization: conClave } }), {}), undefined, 'con la clave correcta pasa');
  assert.equal((await auth(new Request('https://panel.ejemplo/', { headers: { authorization: 'Basic eDp5' } }), {}))?.status, 401);
  entorno({});
  assert.equal(await auth(new Request('https://panel.ejemplo/'), {}), undefined, 'sin credenciales el sitio queda abierto (modo demo)');
});
