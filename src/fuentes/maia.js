// MAIA (Media Analyst IA): el modelo que escribe la lectura semanal y responde consultas sobre la data. Corre solo en
// el servidor (la función de Netlify y el pipeline): la clave de Anthropic nunca llega al navegador.
// MAIA no ve la API de Integrametrics ni registros crudos: ve el contexto que arma scripts/armar-contexto.mjs con la
// misma capa de cálculo del panel, así que no puede decir una cifra que el panel no tenga.
import { CLIENTE } from '../cliente.js';

export const MODELO = 'claude-opus-5-5';
const API = 'https://api.anthropic.com/v1/messages';

const competencia = CLIENTE.competencia.map((c) => c.nombre).join(' y ');
export const REGLAS = `Eres MAIA, la analista de medios de The Algorithm (by The Lab) para ${CLIENTE.nombreLargo}, ${CLIENTE.rubro}. Su competencia es ${competencia}.
Respondes solo con la data del contexto que viene abajo. Si algo no está en el contexto, dices que no tienes ese dato y qué fuente haría falta; nunca lo estimas ni lo inventas.
Lo principal es la competencia: qué hizo ${competencia}. ${CLIENTE.nombre} va para comparar, salvo que pregunten por ${CLIENTE.nombre}.
Reglas de la data:
- La inversión es estimada por Integrametrics a precio de tarifa, no lo que se pagó. ATL (TV, radio, cable, OTT, vía pública) y digital (redes, Google Search, YouTube y sitios de noticias) se estiman distinto: nunca los sumes.
- Google Trends es un índice, no un volumen: 100 es la semana con más búsquedas de cada grupo de términos (cámaras de seguridad suma dos términos y puede pasar de 100); solo se comparan términos del mismo grupo.
- Toda comparación dice frente a qué (el mes anterior, la semana anterior, las mismas semanas de un año antes).
- Di siempre hasta qué fecha llega la data (corte), porque puede estar atrasada.
Cómo escribes: español peruano, frases cortas, sin rayas largas. Observas y explicas lo que muestra la data; no das órdenes. Si te piden una recomendación, dices qué conviene mirar y por qué, sin prometer resultados. Cifras en soles como «S/ 1 234» y porcentajes como «12 %». Respuestas de 120 palabras como máximo, salvo que pidan detalle.`;

// Una llamada a la API de mensajes. El contexto va en un bloque cacheado: se reusa entre preguntas.
export async function pedirClaude({ clave, modelo = MODELO, contexto, mensajes, maxTokens = 700, fetchImpl = fetch }) {
  if (!clave) throw new Error('falta ANTHROPIC_API_KEY');
  const r = await fetchImpl(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': clave, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: modelo, max_tokens: maxTokens,
      system: [{ type: 'text', text: REGLAS }, { type: 'text', text: `Contexto (JSON):\n${JSON.stringify(contexto)}`, cache_control: { type: 'ephemeral' } }],
      messages: mensajes,
    }),
  });
  if (!r.ok) throw new Error(`Anthropic respondió ${r.status}`);
  const d = await r.json();
  return (d.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
}

// La consulta: el historial corto (hasta 8 turnos) más la pregunta nueva, con roles alternados
export function armarMensajes(historial, pregunta) {
  const turnos = (historial || []).filter((t) => (t.rol === 'usuario' || t.rol === 'maia') && typeof t.texto === 'string' && t.texto.trim()).slice(-8)
    .map((t) => ({ role: t.rol === 'usuario' ? 'user' : 'assistant', content: t.texto.slice(0, 2000) }));
  while (turnos.length && turnos[0].role !== 'user') turnos.shift();
  const mensajes = [];
  for (const t of turnos) { if (mensajes.at(-1)?.role === t.role) mensajes.at(-1).content += `\n${t.content}`; else mensajes.push({ ...t }); }
  if (mensajes.at(-1)?.role === 'user') mensajes.pop(); // la pregunta nueva siempre cierra
  mensajes.push({ role: 'user', content: pregunta.slice(0, 1000) });
  return mensajes;
}
export const responder = ({ clave, modelo, contexto, pregunta, historial, fetchImpl }) =>
  pedirClaude({ clave, modelo, contexto, mensajes: armarMensajes(historial, pregunta), fetchImpl });

// La lectura semanal: sobre los hechos de la semana, ya calculados y redactados por reglas
export function pedidoReporte(semana) {
  return `Escribe la lectura de MAIA para la semana del ${semana.desde} al ${semana.hasta}. Estos son los hechos de la semana, ya calculados:
${semana.hechos.map((h) => `- ${h.titulo}. ${h.dato}`).join('\n')}
Escribe tres párrafos cortos como máximo: primero lo que hizo ${competencia}, después ${CLIENTE.nombre} y al final las búsquedas de cámaras DIY si hay hechos. Explica qué significa cada hecho con la data del contexto (meses anteriores, versiones, paneles). No repitas la lista; no uses títulos ni viñetas.`;
}
export const redactarReporte = ({ clave, modelo, contexto, semana, fetchImpl }) =>
  pedirClaude({ clave, modelo, contexto, mensajes: [{ role: 'user', content: pedidoReporte(semana) }], maxTokens: 900, fetchImpl });
