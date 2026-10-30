// MAIA en Vercel: /api/maia es la misma función de Netlify (netlify/functions/maia.mjs), con la clave en las
// variables de entorno del proyecto de Vercel (ANTHROPIC_API_KEY y, si se quiere, MAIA_MODELO).
import maia from '../netlify/functions/maia.mjs';

export const POST = (req) => maia(req);
// cualquier otro método: la función responde 405, igual que en Netlify
export const GET = (req) => maia(req);
