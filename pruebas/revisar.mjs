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

// Relleno: textos que explican la pantalla en vez de decir algo de la data, o jerga interna que el socio no usa
export const RELLENO = [
  [/\bclic\b|pasa el mouse/i, 'explica cómo usar la pantalla'],
  [/en la misma escala/i, 'explica la escala'],
  [/cada carta es|van juntas en una carta/i, 'explica el abanico'],
  [/en la comparación/i, 'no dice frente a qué compara'],
  [/componente|pipeline|netlify|api_key|secrets|\/api\//i, 'jerga interna'],
  [/cabe destacar|es importante señalar|en definitiva|asimismo/i, 'muletilla'],
];

// Lo que se ve en pantalla: sin cálculos rotos, sin rayas largas, sin relleno. Devuelve cada problema con su contexto
export function textoRoto(t) {
  const out = [];
  const contexto = (i, largo) => t.slice(Math.max(0, i - 40), i + largo + 40).replace(/\s+/g, ' ').trim();
  for (const [re, por] of [[/undefined|NaN|\bnull\b|Infinity|\[object/g, 'cálculo roto'], [/—/g, 'raya larga'], ...RELLENO.map(([r, por]) => [new RegExp(r.source, 'gi'), por])]) {
    for (const m of t.matchAll(re)) out.push(`${por}: «${contexto(m.index, m[0].length)}»`);
  }
  return out;
}

export function lecturasDe(v) {
  const P = v.periodo;
  return [
    L.estrenosLectura(v), L.abanicoAtlLectura(v.lee.abanicoAtl, P), L.abanicoDigitalLectura(v.lee.abanicoDigital, P),
    L.oohLectura(v.lee.ooh, P), L.distritosLectura(v.lee.ooh), L.cronogramaLectura(v.lee.cronograma, 'La competencia', v.analiza.pauta[0]?.serie[0]?.fecha, v.fuentes[0].corte),
    L.atlLectura(v), L.digitalLectura(v), L.shareLectura(v), L.presionLectura(v, 'atl'), L.presionLectura(v, 'digital'), L.shareSemanalLectura(v.analiza.shareSemanal),
    L.mediosLectura(v, MEDIOS), L.franjasLectura(v, FRANJAS), L.temporadaLectura(v.analiza.temporada), L.pautaLectura(v.analiza.pauta), ...Object.entries(v.analiza.pautaSemanal).map(([u, f]) => L.pautaSemanalLectura(f, u)),
    L.busquedasLectura(v.analiza.busquedas), L.queMirarLectura(v), L.marcasDiyLectura(v.analiza.busquedas),
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
  // lo que solo se ve al abrir una ventana (un estreno, un panel, una versión del abanico): la prueba de render no lo pinta
  const anio = Number(v.periodo.hasta.slice(0, 4));
  const ventanas = [
    ...(v.lee.estrenos || []).flatMap((e) => [L.estrenoTitulo(e), L.estrenoDato(e)]),
    ...(v.lee.ooh?.paneles || []).map(L.panelTitulo),
    ...[v.lee.abanicoAtl, v.lee.abanicoDigital].filter(Boolean).flatMap((ab) => {
      const t = L.textosDelAbanico(anio);
      return ab.grupos.flatMap((g) => [t.bajada(g), t.detalle(g), ...g.anuncios.flatMap((x) => [t.titulo(x), t.meta(x)])]);
    }),
  ];
  for (const t of [...lecturas.flatMap((x) => [x.titulo, x.lectura]), ...alertas.flatMap((a) => [a.titulo, a.dato, a.mirar]), ...ventanas]) {
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
