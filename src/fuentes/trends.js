// Google Trends: interés de búsqueda semanal en Perú. Corre en Node (pipeline), nunca en el navegador.
// Trends no tiene API pública: se usa la misma que usa su página (explore → widgetdata). El primer pedido responde 429
// con una cookie; el segundo, con esa cookie, responde. Cada grupo de términos va en una sola consulta (hasta cinco):
// así quedan en la misma escala de 0 a 100 y se pueden comparar y sumar entre sí, pero no con otro grupo.

const BASE = 'https://trends.google.com/trends/api';
const limpiar = (texto) => JSON.parse(texto.slice(texto.indexOf('{')));

// Si sigue en 429 (límite de pedidos), reintenta con espera creciente; al final falla en rojo
const ESPERAS = [5000, 20000, 60000];
const dormir = (ms) => new Promise((ok) => setTimeout(ok, ms));
async function pedir(url, fetchImpl, estado) {
  for (let intento = 0; ; intento++) {
    const r = await fetchImpl(url, { headers: { 'user-agent': 'Mozilla/5.0 (The Algorithm by The Lab)', ...(estado.cookie ? { cookie: estado.cookie } : {}) } });
    if (r.ok) return limpiar(await r.text());
    const nueva = (r.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
    if (nueva) estado.cookie = nueva;
    if (r.status !== 429 || intento >= ESPERAS.length) throw new Error(`Google Trends respondió ${r.status}`);
    await dormir(nueva && intento === 0 ? 0 : (estado.espera ?? ESPERAS[intento]));
  }
}

// Una consulta: términos → serie semanal con un valor por término (0 a 100, escala común del grupo)
export async function consultar({ terminos, geo, desde, hasta, fetchImpl = fetch, estado = {} }) {
  if (terminos.length > 5) throw new Error('Google Trends compara hasta cinco términos por consulta');
  const req = { comparisonItem: terminos.map((keyword) => ({ keyword, geo, time: `${desde} ${hasta}` })), category: 0, property: '' };
  const ex = await pedir(`${BASE}/explore?${new URLSearchParams({ hl: 'es-419', tz: '300', req: JSON.stringify(req) })}`, fetchImpl, estado);
  const w = ex.widgets.find((x) => x.id === 'TIMESERIES');
  if (!w) throw new Error('Google Trends no devolvió la serie de tiempo');
  const d = await pedir(`${BASE}/widgetdata/multiline?${new URLSearchParams({ hl: 'es-419', tz: '300', req: JSON.stringify(w.request), token: w.token })}`, fetchImpl, estado);
  return d.default.timelineData.map((p) => ({
    semana: new Date(Number(p.time) * 1000).toISOString().slice(0, 10), // domingo en que empieza la semana
    valores: p.value,
    parcial: Boolean(p.isPartial),
  }));
}

// Un grupo de series (cada una puede juntar variantes de escritura) → { series: [{ id, nombre, valores por semana }] }
export async function bajarGrupo(grupo, { geo, desde, hasta, fetchImpl, estado }) {
  const terminos = grupo.flatMap((s) => s.terminos);
  const serie = await consultar({ terminos, geo, desde, hasta, fetchImpl, estado });
  let k = 0;
  const indices = grupo.map((s) => s.terminos.map(() => k++));
  return {
    semanas: serie.map((p) => p.semana),
    parcial: serie.map((p) => p.parcial),
    series: grupo.map((s, i) => ({ id: s.id, nombre: s.nombre, ...(s.propia ? { propia: true } : {}), valores: serie.map((p) => indices[i].reduce((t, j) => t + p.valores[j], 0)) })),
  };
}
