// Chequeos que comparten las pruebas de la vista y las de los escenarios: números rotos, y todas las lecturas,
// alertas y hechos de la semana con texto, sin undefined ni NaN, sin rayas largas y con dos frases como máximo.
import assert from 'node:assert/strict';
import * as L from '../src/textos/lecturas.js';
import { hechoTexto } from '../src/textos/maia.js';
import { MEDIOS, FRANJAS } from '../src/calculo/vista.js';

// Recorre la vista buscando NaN o Infinity: un cálculo roto se ve así antes de llegar a la pantalla
export function numerosRotos(x, ruta = 'vista', out = []) {
  if (typeof x === 'number' && !Number.isFinite(x)) out.push(ruta);
  else if (x && typeof x === 'object') for (const [k, y] of Object.entries(x)) numerosRotos(y, `${ruta}.${k}`, out);
  return out;
}

export function lecturasDe(v) {
  const P = v.periodo;
  return [
    L.estrenosLectura(v), L.abanicoAtlLectura(v.lee.abanicoAtl, P), L.abanicoDigitalLectura(v.lee.abanicoDigital, P),
    L.oohLectura(v.lee.ooh, P), L.distritosLectura(v.lee.ooh), L.cronogramaLectura(v.lee.cronograma, 'La competencia', v.analiza.pauta[0]?.serie[0]?.fecha, v.fuentes[0].corte),
    L.atlLectura(v), L.digitalLectura(v), L.shareLectura(v), L.presionLectura(v, 'atl'), L.presionLectura(v, 'digital'), L.shareSemanalLectura(v.analiza.shareSemanal),
    L.mediosLectura(v, MEDIOS), L.franjasLectura(v, FRANJAS), L.temporadaLectura(v.analiza.temporada), L.pautaLectura(v.analiza.pauta), ...Object.entries(v.analiza.pautaSemanal).map(([u, f]) => L.pautaSemanalLectura(f, u)),
    L.busquedasLectura(v.analiza.busquedas), L.marcasDiyLectura(v.analiza.busquedas),
    ...Object.entries(v.lee.medios || {}).flatMap(([m, d]) => [L.canalesLectura(d, m), L.horarioLectura(d, m), L.programasLectura(d, m)]),
  ];
}

export function revisarTextos(v, donde = '') {
  const lecturas = lecturasDe(v);
  const alertas = [...v.sugiere.queMirar, ...v.sugiere.queVaBien].map(L.alerta);
  assert.ok(alertas.every(Boolean), `${donde} una alerta no tiene texto`);
  const hechos = (v.sugiere.semana?.hechos || []).map(hechoTexto);
  assert.ok(hechos.every((h) => h?.titulo && h.dato), `${donde} un hecho de la semana no tiene texto`);
  alertas.push(...hechos.map((h) => ({ ...h, mirar: '' })));
  for (const t of [...lecturas.flatMap((x) => [x.titulo, x.lectura]), ...alertas.flatMap((a) => [a.titulo, a.dato, a.mirar])]) {
    assert.equal(typeof t, 'string', `${donde} un texto no es texto: ${t}`);
    assert.doesNotMatch(t, /undefined|NaN|null|Infinity|\[object/, `${donde} ${t}`);
    assert.doesNotMatch(t, /—/, `${donde} raya larga en «${t}»`);
  }
  for (const x of lecturas) {
    const frases = x.lectura.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ«¿])/u).filter(Boolean);
    assert.ok(frases.length <= 2, `${donde} más de dos frases: «${x.lectura}»`);
  }
  return { lecturas, alertas };
}
