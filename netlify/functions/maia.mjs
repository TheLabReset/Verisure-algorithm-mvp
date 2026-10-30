// Consulta a MAIA: POST /api/maia { pregunta, historial } → { respuesta }.
// La clave de Anthropic vive solo en el entorno del hosting (ANTHROPIC_API_KEY); el modelo se puede cambiar con
// MAIA_MODELO. Corre igual en Netlify y en Vercel (api/maia.mjs la reusa): en Netlify lee Netlify.env, fuera de él process.env. El contexto es public/data/maia-contexto.json del mismo sitio, que arma el pipeline cada día.
// La función queda detrás del Basic Auth del sitio (netlify/edge-functions/auth.js): reenvía esa cabecera al leer el contexto.
import { responder, MODELO } from '../../src/fuentes/maia.js';

// el entorno de Netlify si corre ahí; si no (Vercel, Node), el del proceso
const entorno = (k) => (globalThis.Netlify ? globalThis.Netlify.env.get(k) : process.env[k]);
const json = (cuerpo, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'metodo', mensaje: 'Solo POST.' }, 405);
  const clave = entorno('ANTHROPIC_API_KEY');
  if (!clave) return json({ error: 'sin-clave', mensaje: 'MAIA no tiene su clave en este sitio.' }, 503);
  let pedido;
  try { pedido = await req.json(); } catch { return json({ error: 'pedido', mensaje: 'El pedido no es JSON.' }, 400); }
  const pregunta = typeof pedido?.pregunta === 'string' ? pedido.pregunta.trim() : '';
  if (!pregunta || pregunta.length > 1000) return json({ error: 'pedido', mensaje: 'La pregunta va vacía o es muy larga.' }, 400);
  if (pedido.historial != null && !Array.isArray(pedido.historial)) return json({ error: 'pedido', mensaje: 'El historial no es una lista.' }, 400);
  const historial = (pedido.historial || []).filter((t) => t && typeof t === 'object');
  try {
    const r = await fetch(new URL('/data/maia-contexto.json', req.url), { headers: { authorization: req.headers.get('authorization') || '' } });
    // si el archivo falta, la SPA responde su HTML con 200: eso no es el contexto
    const contexto = r.ok ? await r.json().catch(() => null) : null;
    if (!contexto || typeof contexto !== 'object') return json({ error: 'contexto', mensaje: 'No se pudo leer la data de MAIA.' }, 502);
    const respuesta = await responder({ clave, modelo: entorno('MAIA_MODELO') || MODELO, contexto, pregunta, historial });
    if (!respuesta) return json({ error: 'modelo', mensaje: 'MAIA no pudo responder ahora.' }, 502);
    return json({ respuesta, corte: contexto.corte });
  } catch (e) {
    // el detalle queda en el registro de la función, no en la respuesta
    console.error('maia', e);
    return json({ error: 'modelo', mensaje: 'MAIA no pudo responder ahora.' }, 502);
  }
};

// La ruta /api/maia la pone netlify.toml, antes de la redirección de la SPA: así no depende del orden en que
// Netlify evalúa funciones con ruta propia y redirecciones.
