// Capa 3 · Activación estratégica: las plataformas de la marca propia (Meta Ads, Google Ads y TikTok Ads) cruzadas
// con los leads y bookings de su CRM, que llega por un Google Sheets. Da lo mismo que su tablero, en su orden y sin
// repetir: los indicadores (el resumen), leads y bookings en el tiempo (3.1), Push y Pull (3.2) y la tabla de cada
// plataforma frente a su objetivo (3.3); por día, por semana y las campañas, al detalle. Hoy con data de ejemplo,
// rotulada. No calcula: pinta la vista.
import { useState } from 'react';
import { Bloque, Tabla, Resumen, Grupo, Detalle, vigente } from '../sistema/Componentes.jsx';
import { Lineas, BarrasYLinea } from '../sistema/graficos/Graficos.jsx';
import { numero, porcentaje, dolares, fechaCorta } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato } from './comun.jsx';
import { resumenTitulo } from '../textos/comun.js';
import { pushPullLectura, plataformasResumenLectura, plataformasTiempoLectura, plataformasTablaLectura, frenteObjetivoTexto, comparadoTexto, estadoObjetivo, extremoTexto, extremosAyuda, semanaRotulo } from '../textos/lecturas.js';
import { MARGEN_OBJETIVO, SEMANAS_OBJETIVO, extremos } from '../calculo/plataformas.js';

const SEMANAS_A_LA_VISTA = 12; // como el tablero del cliente: el trimestre que termina en el período
const TONO = { bien: 'mejora', cerca: null, lejos: 'empeora' };
const costo = (n) => dolares(n);
const pct = (n) => (n == null ? 'sin dato' : porcentaje(n));
const conTono = (texto, estado) => ({ texto, tono: TONO[estado] ?? null, sub: estado ? estadoObjetivo(estado).toLowerCase() : null });
const cambio = (a, b) => (a == null || !b ? null : ((a - b) / b) * 100);

// Cada plataforma frente a su objetivo: las columnas de su tablero, agrupadas en Push y Pull, con el Total. Bajo la
// inversión y los bookings, la parte de cada plataforma (gris lo que pone, rojo lo que trae); cada costo con su distancia
// al objetivo en una línea, en verde o rojo. En una tarjeta ancha va como tabla; en una angosta (el celular, de pie o
// echado), cada plataforma es una ficha que se lee de arriba abajo: con tres filas, comparar no pide deslizar
function Parte({ valor, tono }) {
  if (valor == null) return null;
  return <span className="q-parte-fila"><span>{porcentaje(valor)}</span><span className={`q-parte-barra q-parte-barra-${tono}`} style={{ width: `${Math.max(2, valor * 0.64)}px` }} /></span>;
}
const Frente = ({ costo: c, objetivo, estado }) => {
  const t = frenteObjetivoTexto(c, objetivo);
  return t ? <span className={`q-frente-objetivo q-frente-${estado ?? 'nada'}`}>{t}</span> : null;
};
const Costo = ({ valor, objetivo, estado, fuerte }) => (
  <span className="q-celda-costo">{fuerte ? <b>{costo(valor)}</b> : <span>{costo(valor)}</span>}<Frente costo={valor} objetivo={objetivo} estado={estado} /></span>
);
function TablaPlataformas({ x }) {
  const grupos = ['push', 'pull'].map((tipo) => ({ tipo, nombre: tipo === 'push' ? 'Push' : 'Pull', filas: x.plataformas.filter((p) => p.tipo === tipo) })).filter((g) => g.filas.length);
  const t = x.total;
  return (
    <div className="q-plataformas-vista">
      <div className="q-tabla-marco q-plataformas-ancha">
        <table className="q-tabla q-tabla-plataformas">
          <caption className="solo-lector">Cada plataforma frente a su objetivo</caption>
          <thead><tr><th scope="col">Plataforma</th><th scope="col" className="q-num">Inversión</th><th scope="col" className="q-num">Leads</th><th scope="col" className="q-num">Bookings</th><th scope="col" className="q-num">L2B</th><th scope="col">Costo por lead</th><th scope="col">Costo por booking</th></tr></thead>
          {grupos.map((g) => (
            <tbody key={g.tipo}>
              <tr className="q-fila-grupo"><th scope="rowgroup" colSpan={7}><span>{g.nombre}</span></th></tr>
              {g.filas.map((p) => (
                <tr key={p.id}>
                  <th scope="row">{p.nombre}</th>
                  <td className="q-num"><span className="q-celda-cifra">{dolares(p.inversion)}<Parte valor={p.parteInversion} tono="pone" /></span></td>
                  <td className="q-num">{numero(p.leads)}</td>
                  <td className="q-num"><span className="q-celda-cifra">{numero(p.bookings)}<Parte valor={p.parteBookings} tono="trae" /></span></td>
                  <td className="q-num">{pct(p.l2b)}</td>
                  <td><Costo valor={p.cpl} objetivo={p.objetivo.cpl} estado={p.estadoCpl} /></td>
                  <td><Costo valor={p.cpb} objetivo={p.objetivo.cpb} estado={p.estadoCpb} fuerte /></td>
                </tr>
              ))}
            </tbody>
          ))}
          <tfoot><tr><th scope="row">Total</th><td className="q-num">{dolares(t.inversion)}</td><td className="q-num">{numero(t.leads)}</td><td className="q-num">{numero(t.bookings)}</td><td className="q-num">{pct(t.l2b)}</td><td>{costo(t.cpl)}</td><td><b>{costo(t.cpb)}</b></td></tr></tfoot>
        </table>
      </div>
      <div className="q-plataformas-angosta">
        {grupos.map((g) => (
          <section key={g.tipo} className="q-fichas-grupo" aria-label={g.nombre}>
            <p className="q-fichas-grupo-nombre">{g.nombre}</p>
            {g.filas.map((p) => (
              <article key={p.id} className="q-ficha-plataforma">
                <div className="q-ficha-plataforma-cab">
                  <h4>{p.nombre}</h4>
                  <span className="q-ficha-plataforma-cpb"><span>Costo por booking</span><b>{costo(p.cpb)}</b><Frente costo={p.cpb} objetivo={p.objetivo.cpb} estado={p.estadoCpb} /></span>
                </div>
                <dl className="q-ficha-plataforma-datos">
                  <div><dt>Inversión</dt><dd>{dolares(p.inversion)}<Parte valor={p.parteInversion} tono="pone" /></dd></div>
                  <div><dt>Bookings</dt><dd>{numero(p.bookings)}<Parte valor={p.parteBookings} tono="trae" /></dd></div>
                  <div><dt>Leads</dt><dd>{numero(p.leads)}</dd></div>
                  <div><dt>L2B</dt><dd>{pct(p.l2b)}</dd></div>
                  <div className="q-ficha-plataforma-ancho"><dt>Costo por lead</dt><dd>{costo(p.cpl)} <Frente costo={p.cpl} objetivo={p.objetivo.cpl} estado={p.estadoCpl} /></dd></div>
                </dl>
              </article>
            ))}
          </section>
        ))}
        <article className="q-ficha-plataforma q-ficha-plataforma-total">
          <div className="q-ficha-plataforma-cab"><h4>Total</h4><span className="q-ficha-plataforma-cpb"><span>Costo por booking</span><b>{costo(t.cpb)}</b></span></div>
          <dl className="q-ficha-plataforma-datos">
            <div><dt>Inversión</dt><dd>{dolares(t.inversion)}</dd></div>
            <div><dt>Bookings</dt><dd>{numero(t.bookings)}</dd></div>
            <div><dt>Leads</dt><dd>{numero(t.leads)}</dd></div>
            <div><dt>L2B</dt><dd>{pct(t.l2b)}</dd></div>
            <div className="q-ficha-plataforma-ancho"><dt>Costo por lead</dt><dd>{costo(t.cpl)}</dd></div>
          </dl>
        </article>
      </div>
    </div>
  );
}

export default function Activacion({ capa, vista: v }) {
  const [s31, s32, s33] = capa.secciones;
  const P = v.periodo, x = v.ejemplo.plataformas;
  const [elegida, setPlataforma] = useState('meta');
  const [escala, setEscala] = useState('semanas');
  if (!x) return <MarcoCapa capa={capa} vista={v}><SeccionDe def={s31} vista={v}><Bloque titulo="Plataformas y CRM" universo="plataformas" estado={sinDato('sin-datos')} /></SeccionDe></MarcoCapa>;
  const opciones = x.plataformas.map((p) => ({ valor: p.id, texto: p.nombre }));
  const plat = x.plataformas.find((p) => p.id === vigente(elegida, opciones));
  const t = x.total, a = x.totalPrevio;
  // el cambio de cada cifra, solo cuánto y hacia dónde: contra qué fechas, al pie del resumen
  // con un decimal bajo 10 %, como en la lectura
  const delta = (k, mejorSi) => { const c = a ? cambio(t[k], a[k]) : null; return c == null ? null : { cambio: c, mejorSi, decimales: Math.abs(c) < 10 ? 1 : 0 }; };
  const ultimas = (semanas) => semanas.slice(-SEMANAS_A_LA_VISTA).reverse();
  // la línea de cada cifra: las últimas semanas enteras (la en curso no se compara con semanas completas)
  const enteras = x.semanas.filter((s) => s.dias >= 7).slice(-(SEMANAS_A_LA_VISTA - 1));
  const chispa = (k) => (enteras.length > 1 ? enteras.map((s) => s[k]) : null);
  const chispaEtiqueta = (que) => `${que} de las últimas ${numero(enteras.length)} semanas completas`;
  // las filas de mejor y peor desempeño de una tabla, en el orden en que se pintan
  const marcas = (lista, unidad) => {
    const e = extremos(lista), fila = (f) => (f ? { fila: lista.indexOf(f) } : null);
    return { mejor: e.mejor && { ...fila(e.mejor), texto: extremoTexto('mejor', unidad) }, peor: e.peor && { ...fila(e.peor), texto: extremoTexto('peor', unidad) } };
  };
  const semanas = x.semanas.slice(-SEMANAS_A_LA_VISTA);
  const puntos = escala === 'semanas'
    ? semanas.map((s) => ({ fecha: s.desde, nombre: semanaRotulo(s), corto: fechaCorta(s.desde), barra: s.bookings, linea: s.leads, parcial: s.dias < 7 }))
    : x.diaria.map((d) => ({ fecha: d.fecha, nombre: fechaCorta(d.fecha), barra: d.bookings, linea: d.leads, parcial: false }));
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={resumenTitulo(P)} ejemplo lectura={plataformasResumenLectura(x)}
        comparado={a ? comparadoTexto(P) : null}
        pie={<span>{x.fuente}. Inversión en dólares, como la reportan las plataformas.</span>}
        items={[
          { rotulo: 'Inversión', universo: 'plataformas', ir: s33.id, irTexto: s33.titulo, valor: dolares(t.inversion), delta: delta('inversion', 'neutro'), chispa: chispa('inversion'), chispaEtiqueta: chispaEtiqueta('Inversión') },
          { rotulo: 'Leads', universo: 'plataformas', ir: s31.id, irTexto: s31.titulo, valor: numero(t.leads), delta: delta('leads', 'sube'), chispa: chispa('leads'), chispaEtiqueta: chispaEtiqueta('Leads') },
          { rotulo: 'Bookings', universo: 'plataformas', ir: s31.id, irTexto: s31.titulo, valor: numero(t.bookings), delta: delta('bookings', 'sube'), chispa: chispa('bookings'), chispaEtiqueta: chispaEtiqueta('Bookings'), chispaTono: 'propia' },
          { rotulo: 'L2B', universo: 'plataformas', ir: s32.id, irTexto: s32.titulo, valor: pct(t.l2b), delta: a && t.l2b != null && a.l2b != null ? { cambio: t.l2b - a.l2b, mejorSi: 'sube', decimales: 1, unidad: 'pts' } : null, chispa: chispa('l2b'), chispaEtiqueta: chispaEtiqueta('L2B') },
          { rotulo: 'Costo por lead', universo: 'plataformas', ir: s33.id, irTexto: s33.titulo, valor: costo(t.cpl), delta: delta('cpl', 'baja'), chispa: chispa('cpl'), chispaEtiqueta: chispaEtiqueta('Costo por lead') },
          { rotulo: 'Costo por booking', universo: 'plataformas', ir: s33.id, irTexto: s33.titulo, valor: costo(t.cpb), delta: delta('cpb', 'baja'), chispa: chispa('cpb'), chispaEtiqueta: chispaEtiqueta('Costo por booking') },
        ]} />

      <SeccionDe def={s31} vista={v}>
        <Bloque universo="plataformas" {...(escala === 'semanas' ? plataformasTiempoLectura(semanas, 'semana') : plataformasTiempoLectura(x.diaria, 'dia'))} ejemplo alcance={escala === 'semanas' ? `${numero(semanas.length)} semanas al ${fechaCorta(P.hasta)}` : undefined}
          ayuda={<p>Arriba los bookings y abajo los leads, con el mismo eje de fechas. L2B: de cada 100 leads, cuántos llegan a booking. Semanas de lunes a domingo; la que va en curso, más clara.</p>}
          pie={<span>{x.fuente}.</span>}>
          <div className="q-control q-control-tarjeta"><span>Ver por</span><Grupo etiqueta="Ver por" valor={escala} onCambiar={setEscala} opciones={[{ valor: 'semanas', texto: 'Semanas' }, { valor: 'dias', texto: 'Días' }]} /></div>
          <BarrasYLinea etiqueta={`Bookings y leads por ${escala === 'semanas' ? 'semana' : 'día'}`} rotuloBarras="Bookings" rotuloLinea="Leads" puntos={puntos} />
        </Bloque>
        <Detalle id={`detalle-${s31.id}`} titulo="Detalle de las plataformas, día por día" bajada="Data de ejemplo, por conectar." vistas={['inversión, leads, bookings y costos de cada día']}>
          <Bloque universo="plataformas" titulo="Cada día del período" ejemplo pie={<span>{x.fuente}.</span>} ayuda={<p>{extremosAyuda('día')}</p>}>
            <Tabla etiqueta="Inversión, leads, bookings y costos por día" numericas={[1, 2, 3, 4, 5, 6]}
              columnas={['Día', 'Inversión', 'Leads', 'Bookings', 'L2B', 'Costo por lead', 'Costo por booking']}
              {...marcas([...x.diaria].reverse(), 'día')}
              filas={[...x.diaria].reverse().map((d) => [fechaCorta(d.fecha), dolares(d.inversion), numero(d.leads), numero(d.bookings), pct(d.l2b), costo(d.cpl), costo(d.cpb)])} />
          </Bloque>
        </Detalle>
      </SeccionDe>

      <SeccionDe def={s32} vista={v}>
        <Bloque universo="plataformas" {...pushPullLectura(x)} ejemplo
          ayuda={<p>Push son las redes, donde el anuncio busca a la persona (Meta y TikTok). Pull es la búsqueda, donde la persona busca la marca o el servicio (Google Ads). El título lee el período; el gráfico, las semanas de lunes a domingo, y la última puede estar en curso.</p>}
          pie={<span>{x.fuente} · el gráfico, {numero(SEMANAS_A_LA_VISTA)} semanas al {fechaCorta(P.hasta)}.</span>}>
          <Lineas etiqueta="L2B semanal de Push y Pull" formato={(n) => (n == null ? 'sin dato' : porcentaje(n))} alto={220}
            series={x.tipos.map((g) => ({ nombre: g.tipo === 'push' ? 'Push' : 'Pull', tono: g.tipo === 'push' ? 'tinta' : 'propia', discontinua: g.tipo === 'push', serie: g.semanas.slice(-SEMANAS_A_LA_VISTA).map((s) => ({ fecha: s.desde, valor: s.l2b })) }))} />
        </Bloque>
        <Detalle id={`detalle-${s32.id}`} titulo="Detalle de Push y Pull" bajada="Data de ejemplo, por conectar." vistas={['Push y Pull en cifras']}>
          <Bloque universo="plataformas" titulo="Push y Pull en el período" ejemplo pie={<span>{x.fuente}.</span>}>
            <Tabla etiqueta="Push y Pull en el período" numericas={[1, 2, 3, 4, 5, 6]}
              columnas={['Tipo', 'Inversión', 'Leads', 'Bookings', 'L2B', 'Costo por lead', 'Costo por booking']}
              filas={x.tipos.map((g) => [g.tipo === 'push' ? 'Push (Meta y TikTok)' : 'Pull (Google Ads)', dolares(g.inversion), numero(g.leads), numero(g.bookings), pct(g.l2b), costo(g.cpl), costo(g.cpb)])} />
          </Bloque>
        </Detalle>
      </SeccionDe>

      <SeccionDe def={s33} vista={v}>
        <Bloque universo="plataformas" {...plataformasTablaLectura(x)} ejemplo
          ayuda={<p>Bajo la inversión y los bookings, la parte de cada plataforma en el total: en gris lo que pone, en rojo lo que trae. Cada costo se compara con el objetivo de su plataforma: en objetivo si queda en él o por debajo; si no, cuánto lo pasa: hasta {porcentaje(MARGEN_OBJETIVO)} o más. Las semanas por encima se cuentan en las últimas {numero(SEMANAS_OBJETIVO)} semanas completas.</p>}
          pie={<span>{x.fuente}.</span>}>
          <TablaPlataformas x={x} />
        </Bloque>
        <Detalle id={`detalle-${s33.id}`} titulo="Detalle de cada plataforma" bajada="Data de ejemplo, por conectar." vistas={['el costo por booking de cada una, semana a semana', 'cada plataforma semana a semana', 'sus campañas']}>
          <Bloque universo="plataformas" titulo="Costo por booking, semana a semana" alcance={`${SEMANAS_A_LA_VISTA} semanas al ${fechaCorta(P.hasta)}`} ejemplo
            pie={<span>Semanas de lunes a domingo; la última puede estar en curso.</span>}>
            <Lineas etiqueta="Costo por booking semanal de cada plataforma" formato={(n) => (n == null ? 'sin dato' : costo(n))} alto={240} elegible
              elegidaInicial={Math.max(0, x.plataformas.findIndex((p) => p.estadoCpb === 'lejos'))}
              series={x.plataformas.map((p) => ({ nombre: p.nombre, leyenda: `${p.nombre} (objetivo ${costo(p.objetivo.cpb)})`, serie: p.semanas.slice(-SEMANAS_A_LA_VISTA).map((s) => ({ fecha: s.desde, valor: s.cpb == null ? null : Math.round(s.cpb) })) }))} />
          </Bloque>
          <Bloque universo="plataformas" titulo={`${plat.nombre}, semana a semana`} ejemplo pie={<span>{x.fuente}.</span>} ayuda={<p>{extremosAyuda('semana')}</p>}>
            <div className="q-control q-control-tarjeta"><span>Plataforma</span><Grupo etiqueta="Plataforma" valor={plat.id} onCambiar={setPlataforma} opciones={opciones} /></div>
            <Tabla etiqueta={`${plat.nombre} por semana`} numericas={[1, 2, 3, 4, 5, 6]}
              columnas={['Semana', 'Inversión', 'Leads', 'Bookings', 'L2B', 'Costo por lead', 'Costo por booking']}
              {...marcas(ultimas(plat.semanas), 'semana')}
              filas={ultimas(plat.semanas).map((s) => [semanaRotulo(s), dolares(s.inversion), numero(s.leads), numero(s.bookings), pct(s.l2b), conTono(costo(s.cpl), s.estadoCpl), conTono(costo(s.cpb), s.estadoCpb)])} />
          </Bloque>
          <Bloque universo="plataformas" titulo={`Las campañas de ${plat.nombre}`} ejemplo pie={<span>Campañas del período, de más a menos inversión.</span>}>
            <div className="q-control q-control-tarjeta"><span>Plataforma</span><Grupo etiqueta="Plataforma" valor={plat.id} onCambiar={setPlataforma} opciones={opciones} /></div>
            <Tabla etiqueta={`Campañas de ${plat.nombre}`} numericas={[1, 2, 3, 4, 5, 6]}
              columnas={['Campaña', 'Inversión', 'Leads', 'Bookings', 'L2B', 'Costo por lead', 'Costo por booking']}
              filas={plat.campanas.map((c) => [c.nombre, dolares(c.inversion), numero(Math.round(c.leads)), numero(Math.round(c.bookings)), pct(c.l2b), costo(c.cpl), costo(c.cpb)])} />
          </Bloque>
        </Detalle>
      </SeccionDe>
    </MarcoCapa>
  );
}
