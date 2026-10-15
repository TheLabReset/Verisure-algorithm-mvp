// Consulta a MAIA: POST /api/maia { pregunta, historial } → { respuesta }.
// La clave de Anthropic vive solo en el entorno de Netlify (ANTHROPIC_API_KEY); el modelo se puede cambiar con
// MAIA_MODELO. El contexto es public/data/maia-contexto.json del mismo sitio, que arma el pipeline cada día.
// La función queda detrás del Basic Auth del sitio (netlify/edge-functions/auth.js): reenvía esa cabecera al leer el contexto.
import { responder, MODELO } from '../../src/fuentes/maia.js';

const json = (cuerpo, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'metodo', mensaje: 'Solo POST.' }, 405);
  const clave = Netlify.env.get('ANTHROPIC_API_KEY');
  if (!clave) return json({ error: 'sin-clave', mensaje: 'MAIA no tiene su clave en este sitio.' }, 503);
  let pedido;
  try { pedido = await req.json(); } catch { return json({ error: 'pedido', mensaje: 'El pedido no es JSON.' }, 400); }
  const pregunta = typeof pedido?.pregunta === 'string' ? pedido.pregunta.trim() : '';
  if (!pregunta || pregunta.length > 1000) return json({ error: 'pedido', mensaje: 'La pregunta va vacía o es muy larga.' }, 400);
  try {
    const r = await fetch(new URL('/data/maia-contexto.json', req.url), { headers: { authorization: req.headers.get('authorization') || '' } });
    if (!r.ok) return json({ error: 'contexto', mensaje: 'No se pudo leer la data de MAIA.' }, 502);
    const contexto = await r.json();
    const respuesta = await responder({ clave, modelo: Netlify.env.get('MAIA_MODELO') || MODELO, contexto, pregunta, historial: pedido.historial });
    return json({ respuesta, corte: contexto.corte });
  } catch (e) {
    return json({ error: 'modelo', mensaje: 'MAIA no pudo responder ahora.', detalle: String(e.message || e).slice(0, 200) }, 502);
  }
};

export const config = { path: '/api/maia' };
