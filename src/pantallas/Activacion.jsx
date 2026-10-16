// Capa 3 · Activación estratégica: las plataformas de la marca propia (Meta Ads, Google Ads y TikTok Ads) cruzadas
// con los leads y bookings de su CRM, que llega por un Google Sheets. El mismo detalle que su tablero: inversión,
// leads, bookings, L2B (de lead a booking), costo por lead y por booking; por día, por semana, Push y Pull, y cada
// plataforma con sus campañas frente a su objetivo. Hoy con data de ejemplo, rotulada. No calcula: pinta la vista.
import { useState } from 'react';
import { Bloque, Tabla, Resumen, Grupo, Detalle, Semaforo, Flujo, vigente } from '../sistema/Componentes.jsx';
import { Lineas } from '../sistema/graficos/Graficos.jsx';
import { numero, porcentaje, dolares, fechaCorta } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato } from './comun.jsx';
import { resumenTitulo, comparacionTexto } from '../textos/comun.js';
import { plataformasLectura, pushPullLectura, plataformasObjetivoLectura } from '../textos/lecturas.js';
import { MARGEN_OBJETIVO } from '../calculo/plataformas.js';

const SEMANAS_A_LA_VISTA = 12; // como el tablero del cliente: el trimestre que termina en el período
const TONO = { bien: 'mejora', cerca: null, lejos: 'empeora' };
const ESTADO = { bien: 'en objetivo', cerca: 'cerca', lejos: 'por encima' };
const costo = (n) => dolares(n);
const pct = (n) => (n == null ? 'sin dato' : porcentaje(n));
const conTono = (texto, estado) => ({ texto, tono: TONO[estado] ?? null, sub: estado ? ESTADO[estado] : null });
const cambio = (a, b) => (a == null || !b ? null : ((a - b) / b) * 100);

export default function Activacion({ capa, vista: v }) {
  const [s31, s32, s33] = capa.secciones;
  const P = v.periodo, x = v.ejemplo.plataformas;
  const [elegida, setPlataforma] = useState('meta');
  if (!x) return <MarcoCapa capa={capa} vista={v}><SeccionDe def={s31} vista={v}><Bloque titulo="Plataformas y CRM" universo="plataformas" estado={sinDato('sin-datos')} /></SeccionDe></MarcoCapa>;
  const opciones = x.plataformas.map((p) => ({ valor: p.id, texto: p.nombre }));
  const plat = x.plataformas.find((p) => p.id === vigente(elegida, opciones));
  const t = x.total, a = x.totalPrevio;
  const frente = comparacionTexto(P);
  const delta = (k, mejorSi) => (a ? { cambio: cambio(t[k], a[k]), mejorSi, referencia: `frente a ${frente}` } : null);
  const ultimas = (semanas) => semanas.slice(-SEMANAS_A_LA_VISTA).reverse();
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={resumenTitulo(P)} ejemplo
        pie={<span>{x.fuente}. Inversión en dólares, como la reportan las plataformas.</span>}
        items={[
          { rotulo: 'Inversión', universo: 'plataformas', ir: s31.id, irTexto: s31.titulo, valor: dolares(t.inversion), nota: a ? `${dolares(a.inversion)} en ${frente}` : null },
          { rotulo: 'Leads', universo: 'plataformas', ir: s31.id, irTexto: s31.titulo, valor: numero(t.leads), delta: delta('leads', 'sube') },
          { rotulo: 'Bookings', universo: 'plataformas', ir: s31.id, irTexto: s31.titulo, valor: numero(t.bookings), delta: delta('bookings', 'sube') },
          { rotulo: 'L2B', universo: 'plataformas', ir: s32.id, irTexto: s32.titulo, valor: pct(t.l2b), nota: a ? `${pct(a.l2b)} en ${frente}` : null },
          { rotulo: 'Costo por lead', universo: 'plataformas', ir: s33.id, irTexto: s33.titulo, valor: costo(t.cpl), delta: delta('cpl', 'baja') },
          { rotulo: 'Costo por booking', universo: 'plataformas', ir: s33.id, irTexto: s33.titulo, valor: costo(t.cpb), delta: delta('cpb', 'baja') },
        ]} />

      <SeccionDe def={s31} vista={v}>
        <Bloque universo="plataformas" {...plataformasLectura(x)} ejemplo
          ayuda={<p>L2B: de cada 100 leads, cuántos llegan a booking, una venta en el CRM. El costo por booking es la inversión dividida entre los bookings.</p>}
          pie={<span>{x.fuente}.</span>}>
          <Flujo etiqueta="De la inversión al booking, por plataforma" columnas={['Inversión', 'Leads', 'Bookings']}
            filas={[...x.plataformas.map((p) => ({ nombre: p.nombre, clase: null, pasos: [{ valor: dolares(p.inversion) }, { valor: numero(p.leads), nota: `${costo(p.cpl)} por lead` }, { valor: numero(p.bookings), nota: `${costo(p.cpb)} por booking · ${pct(p.l2b)} de los leads` }] })),
              { nombre: 'Las tres', clase: null, pasos: [{ valor: dolares(t.inversion) }, { valor: numero(t.leads), nota: `${costo(t.cpl)} por lead` }, { valor: numero(t.bookings), nota: `${costo(t.cpb)} por booking · ${pct(t.l2b)} de los leads` }] }]} />
        </Bloque>
        <Bloque universo="plataformas" titulo="Leads y bookings, día por día" ejemplo
          pie={<span>Las tres plataformas juntas. El costo de cada día va en el detalle.</span>}>
          <Lineas etiqueta="Leads y bookings por día" formato={(n) => numero(n)} alto={220}
            series={[{ nombre: 'Leads', tono: 'tinta', serie: x.diaria.map((d) => ({ fecha: d.fecha, valor: d.leads })) }, { nombre: 'Bookings', tono: 'propia', serie: x.diaria.map((d) => ({ fecha: d.fecha, valor: d.bookings })) }]} />
        </Bloque>
        <Detalle id={`detalle-${s31.id}`} titulo="Detalle de las plataformas, día por día" bajada="Data de ejemplo, por conectar." vistas={['inversión, leads, bookings y costos de cada día']}>
          <Bloque universo="plataformas" titulo="Cada día del período" ejemplo pie={<span>{x.fuente}.</span>}>
            <Tabla etiqueta="Inversión, leads, bookings y costos por día" numericas={[1, 2, 3, 4, 5, 6]}
              columnas={['Día', 'Inversión', 'Leads', 'Bookings', 'L2B', 'Costo por lead', 'Costo por booking']}
              filas={[...x.diaria].reverse().map((d) => [fechaCorta(d.fecha), dolares(d.inversion), numero(d.leads), numero(d.bookings), pct(d.l2b), costo(d.cpl), costo(d.cpb)])} />
          </Bloque>
        </Detalle>
      </SeccionDe>

      <SeccionDe def={s32} vista={v}>
        <Bloque universo="plataformas" {...pushPullLectura(x)} alcance={`${SEMANAS_A_LA_VISTA} semanas al ${fechaCorta(P.hasta)}`} ejemplo
          ayuda={<p>Push son las redes, donde el anuncio busca a la persona (Meta y TikTok). Pull es la búsqueda, donde la persona busca la marca o el servicio (Google Ads). Semanas de lunes a domingo; la última puede estar incompleta.</p>}
          pie={<span>{x.fuente}.</span>}>
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
        <Bloque universo="plataformas" {...plataformasObjetivoLectura(x)} ejemplo
          ayuda={<p>Cada costo se compara con el objetivo de su plataforma: en objetivo si queda en él o por debajo, cerca hasta {porcentaje(MARGEN_OBJETIVO)} arriba, y por encima si pasa de ahí.</p>}
          pie={<span>{x.fuente}.</span>}>
          <ul className="q-plataformas">
            {x.plataformas.map((p) => (
              <li key={p.id} className="q-plataforma">
                <h4>{p.nombre}<span>{p.tipo === 'push' ? 'Push' : 'Pull'}</span></h4>
                <div className="q-plataforma-cifra"><span>Costo por booking</span><b>{costo(p.cpb)}</b><Semaforo estado={p.estadoCpb} /><small>Objetivo: {costo(p.objetivo.cpb)}</small></div>
                <dl className="q-ficha-datos">
                  <div><dt>Costo por lead</dt><dd>{costo(p.cpl)} <Semaforo estado={p.estadoCpl} /></dd></div>
                  <div><dt>Bookings</dt><dd>{numero(p.bookings)} de {numero(p.leads)} leads</dd></div>
                  <div><dt>L2B</dt><dd>{pct(p.l2b)}</dd></div>
                  <div><dt>Inversión</dt><dd>{dolares(p.inversion)}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
        </Bloque>
        <Bloque universo="plataformas" titulo="Costo por booking, semana a semana" alcance={`${SEMANAS_A_LA_VISTA} semanas al ${fechaCorta(P.hasta)}`} ejemplo
          pie={<span>Semanas de lunes a domingo; la última puede estar incompleta.</span>}>
          <Lineas etiqueta="Costo por booking semanal de cada plataforma" formato={(n) => (n == null ? 'sin dato' : costo(n))} alto={240} elegible
            elegidaInicial={Math.max(0, x.plataformas.findIndex((p) => p.estadoCpb === 'lejos'))}
            series={x.plataformas.map((p) => ({ nombre: p.nombre, leyenda: `${p.nombre} (objetivo ${costo(p.objetivo.cpb)})`, serie: p.semanas.slice(-SEMANAS_A_LA_VISTA).map((s) => ({ fecha: s.desde, valor: s.cpb == null ? null : Math.round(s.cpb) })) }))} />
        </Bloque>
        <Detalle id={`detalle-${s33.id}`} titulo="Detalle de cada plataforma" bajada="Data de ejemplo, por conectar." vistas={['cada plataforma semana a semana', 'sus campañas']}>
          <Bloque universo="plataformas" titulo={`${plat.nombre}, semana a semana`} ejemplo pie={<span>{x.fuente}.</span>}>
            <div className="q-control q-control-tarjeta"><span>Plataforma</span><Grupo etiqueta="Plataforma" valor={plat.id} onCambiar={setPlataforma} opciones={opciones} /></div>
            <Tabla etiqueta={`${plat.nombre} por semana`} numericas={[1, 2, 3, 4, 5, 6]}
              columnas={['Semana', 'Inversión', 'Leads', 'Bookings', 'L2B', 'Costo por lead', 'Costo por booking']}
              filas={ultimas(plat.semanas).map((s) => [`${fechaCorta(s.desde)}${s.dias < 7 ? ' (incompleta)' : ''}`, dolares(s.inversion), numero(s.leads), numero(s.bookings), pct(s.l2b), conTono(costo(s.cpl), s.estadoCpl), conTono(costo(s.cpb), s.estadoCpb)])} />
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
