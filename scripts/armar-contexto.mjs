// Arma public/data/maia-contexto.json: lo que MAIA sabe de la data, armado con la misma capa de cálculo del panel.
// Mes a mes: share e inversión por marca y universo, medios, canales, programas, horas, paneles por zona; el año:
// versiones de la competencia, estrenos y share semanal; las búsquedas de Google Trends; y los hechos de la semana.
// Lo corre el pipeline cada día, después de la data. También a mano: node scripts/armar-contexto.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { armarVista, mesesDisponibles, MEDIOS } from '../src/calculo/vista.js';
import { hechoTexto } from '../src/textos/maia.js';
import { CLIENTE } from '../src/cliente.js';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data');
const r = (n) => (n == null ? null : Math.round(n));

export function armarContexto(dir = DATA) {
  const leer = (f) => (existsSync(join(dir, f)) ? JSON.parse(readFileSync(join(dir, f), 'utf8')) : null);
  const contrato = leer('algorithm.json'), medios = leer('medios.json'), mapa = leer('mapa-lima.json'), busquedas = leer('busquedas.json');
  const extras = { mapa, busquedas };
  const meses = mesesDisponibles(contrato.meta).map((mes) => {
    const v = armarVista(contrato, medios, { mes }, {}, extras);
    const universo = (u) => (u.estado !== 'ok' ? null : Object.fromEntries(u.marcas.map((m) => [m.nombre, {
      inversion: r(m.inversion), share: m.share, sharePrevio: m.sharePrevio,
      ...(Object.keys(m.medios).length ? { medios: Object.fromEntries(Object.entries(m.medios).map(([k, x]) => [MEDIOS[k] || k, r(x)])) } : {}),
      ...(m.impresiones ? { impresiones: r(m.impresiones) } : {}),
    }])));
    const med = v.lee.medios ? Object.fromEntries(Object.entries(v.lee.medios).filter(([, x]) => x).map(([k, x]) => [CLIENTE.competencia.find((c) => c.marcaFuente === k)?.nombre ?? CLIENTE.nombre, {
      emisiones: x.emisiones, canales: x.canales.slice(0, 5), programas: x.programas.slice(0, 5), horasAltas: x.horasAltas,
    }])) : null;
    return {
      mes, parcial: v.periodo.parcial, desde: v.periodo.desde, hasta: v.periodo.hasta,
      atl: universo(v.lee.atl), digital: universo(v.lee.digital), emisiones: med,
      ooh: v.lee.ooh ? { porDistrito: v.lee.ooh.porDistrito.slice(0, 10), fueraDeLima: v.lee.ooh.fueraDeLima } : null,
      estrenos: (v.lee.estrenos || []).map((e) => ({ fecha: e.fecha.slice(0, 10), marca: e.nombre, version: e.version, canal: e.canal })),
      alertas: v.sugiere.queMirar.map((a) => a.id),
    };
  });
  const ultimo = armarVista(contrato, medios, { mes: meses.at(-1).mes }, {}, extras);
  const b = ultimo.analiza.busquedas;
  const semana = ultimo.sugiere.semana;
  return {
    corte: { integrametrics: contrato.meta.lastDay, trends: ultimo.fuentes.find((f) => f.id === 'trends')?.corte ?? null },
    marcas: { propia: CLIENTE.nombre, competencia: CLIENTE.competencia.map((c) => c.nombre) },
    meses,
    versionesCompetencia: (ultimo.lee.cronograma?.filas || []).map((f) => ({ version: f.version, universo: f.universo, desde: f.desde, hasta: f.hasta, inversion: r(f.inversion), canales: f.canales.slice(0, 4) })),
    shareSemanalCompetencia: ultimo.analiza.shareSemanal,
    busquedas: b ? {
      nota: 'Índice de 0 a 100 de Google Trends Perú dentro de cada grupo; promedio de las últimas semanas completas frente a las mismas semanas de un año antes.',
      desde: b.desde, hasta: b.hasta, razonCamarasPorMarca: b.razon && Math.round(b.razon * 10) / 10,
      categoria: b.series.map((s) => ({ termino: s.nombre, ahora: r(s.ahora), antes: r(s.antes), crecimiento: s.crecimiento })),
      marcasDiy: b.marcas.map((m) => ({ marca: m.nombre, ahora: r(m.ahora), antes: r(m.antes), crecimiento: m.crecimiento })),
    } : null,
    semana: semana ? { desde: semana.desde, hasta: semana.hasta, hechos: semana.hechos.map((h) => ({ tema: h.tema, ...hechoTexto(h) })) } : null,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const c = armarContexto();
  const texto = JSON.stringify(c);
  writeFileSync(join(DATA, 'maia-contexto.json'), texto);
  console.log(`maia-contexto.json · ${c.meses.length} meses · ${Math.round(texto.length / 1024)} KB`);
}
