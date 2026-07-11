// Basic Auth de todo el sitio (Edge Function de Netlify).
//
// Se ACTIVA solo si BASIC_AUTH_USER y BASIC_AUTH_PASSWORD están definidas en el
// entorno de Netlify (scope "Functions"). Sin credenciales configuradas, deja pasar:
// el deploy de demostración queda abierto y no se bloquea a nadie por accidente.
// Las credenciales viven SOLO en el entorno de Netlify — nunca en el repo ni en el
// bundle del navegador. Configúralas en Site settings → Environment variables.
export default async (request, context) => {
  const user = Netlify.env.get('BASIC_AUTH_USER')
  const pass = Netlify.env.get('BASIC_AUTH_PASSWORD')

  // Sin credenciales → sitio abierto (modo demo). Continúa la petición sin tocar nada.
  if (!user || !pass) return

  const provided = request.headers.get('authorization') || ''
  const expected = 'Basic ' + btoa(`${user}:${pass}`)

  // Comparación de tiempo ~constante (no filtra la contraseña por timing).
  if (provided && timingSafeEqual(provided, expected)) return // autorizado → continúa

  return new Response('Autenticación requerida.', {
    status: 401,
    headers: {
      'www-authenticate': 'Basic realm="The Algorithm by Reset", charset="UTF-8"',
      'content-type': 'text/plain; charset=utf-8',
    },
  })
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
