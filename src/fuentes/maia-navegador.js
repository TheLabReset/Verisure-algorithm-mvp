// La consulta a MAIA desde el navegador: llama a la función de Netlify (/api/maia), que tiene la clave y el contexto.
// Nunca inventa una respuesta: si MAIA no está conectada, lo dice con el motivo.
export async function preguntarMaia(pregunta, historial, fetchImpl = fetch) {
  let r;
  try {
    r = await fetchImpl('/api/maia', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pregunta, historial }) });
  } catch {
    return { error: 'sin-red' };
  }
  if (r.status === 404 || r.status === 405) return { error: 'sin-funcion' }; // vista previa local o un sitio sin la función
  const d = await r.json().catch(() => null);
  if (!r.ok) return { error: d?.error === 'sin-clave' ? 'sin-clave' : 'modelo' };
  // una respuesta vacía o que no es JSON (por ejemplo, el HTML del panel) no es una respuesta de MAIA
  if (typeof d?.respuesta !== 'string' || !d.respuesta.trim()) return { error: 'modelo' };
  return { respuesta: d.respuesta, corte: d?.corte || null };
}
