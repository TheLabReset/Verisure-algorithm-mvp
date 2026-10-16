// Capa 3 · Activación estratégica: dónde y cuándo está la inversión de la competencia, con la marca propia para
// comparar. A la vista: el reparto por medio (partes de un todo por marca) y la semana día × hora (mapa de calor).
// En el detalle: la inversión por medio en soles, las franjas (mancuernas), los canales y los programas.
// No calcula: pinta la vista.
import { useState } from 'react';
import { Bloque, Tabla, Resumen, Grupo, Detalle } from '../sistema/Componentes.jsx';
import { Franja, Pesas, Barras, MapaCalor } from '../sistema/graficos/Graficos.jsx';
import { numero, porcentaje, soles, solesCompacto } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato } from './comun.jsx';
import { periodoTexto, version, horasTexto } from '../textos/comun.js';
import { mediosLectura, franjasLectura, canalesLectura, horarioLectura, programasLectura, textosMarca } from '../textos/lecturas.js';
import { MEDIOS, FRANJAS } from '../calculo/vista.js';
import { CLIENTE } from '../cliente.js';

const COMPETENCIA = CLIENTE.competencia[0];
const MARCAS = [...CLIENTE.competencia.map((c) => c.marcaFuente), CLIENTE.marcaFuente];
const ORDEN_MEDIOS = ['TV ABIERTA', 'RADIO', 'OOH', 'CABLE', 'OTT'];
// Color fijo por medio en todas las franjas (el color sigue al medio, no al orden). Radio va en tinta y no en el
// naranja de categoría, que se confunde con el amarillo de la competencia; el resto en gris
const CLASE_MEDIO = { 'TV ABIERTA': 'q-p0', RADIO: 'q-p-tinta', OOH: 'q-p2', CABLE: 'q-p5', OTT: 'q-p5' };

function MezclaMedios({ m }) {
  const principales = ['TV ABIERTA', 'RADIO', 'OOH'].map((k) => ({ nombre: MEDIOS[k], valor: m.medios[k] || 0, pct: m.mezclaMedios[k] ?? 0, clase: CLASE_MEDIO[k] }));
  const resto = ['CABLE', 'OTT'].reduce((s, k) => s + (m.medios[k] || 0), 0);
  const restoPct = ['CABLE', 'OTT'].reduce((s, k) => s + (m.mezclaMedios[k] ?? 0), 0);
  const partes = [...principales, { nombre: 'Cable y OTT', valor: resto, pct: restoPct, clase: 'q-p5' }].filter((p) => p.valor > 0);
  return (
    <div className="q-mezcla">
      <h4>{m.nombre}<span>{solesCompacto(m.inversion)} en ATL</span></h4>
      {partes.length ? <Franja etiqueta={`Reparto de la inversión ATL de ${m.nombre} por medio`} partes={partes} verTabla={false} /> : <p className="q-nota-bloque">Sin inversión ATL en el período.</p>}
    </div>
  );
}

export default function Activacion({ capa, vista: v }) {
  const [s31, s32] = capa.secciones;
  const P = v.periodo, atl = v.lee.atl, med = v.lee.medios;
  const [marca, setMarca] = useState(COMPETENCIA.marcaFuente);
  const ok = atl.estado === 'ok';
  const orden = ok ? [...atl.marcas].sort((a, b) => Number(a.propia) - Number(b.propia)) : [];
  const [r, p] = orden;
  const deMarca = med?.[marca];
  const compMed = med?.[COMPETENCIA.marcaFuente];
  const opcionesMarca = MARCAS.map((m) => ({ valor: m, texto: textosMarca.nombreMarca(m), desactivada: !med?.[m] }));
  const principal = (m) => Object.entries(m.mezclaMedios).sort((a, b) => b[1] - a[1])[0];
  const control = <div className="q-control q-control-tarjeta"><span>Marca</span><Grupo etiqueta="Marca" valor={marca} onCambiar={setMarca} opciones={opcionesMarca} /></div>;
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={`Resumen de ${periodoTexto(P)}`}
        pie={<span>Inversión estimada por Integrametrics a precio de tarifa; emisiones registradas en TV, radio, cable, OTT y vía pública.</span>}
        items={[
          { rotulo: `Medio principal de ${COMPETENCIA.nombre}`, universo: 'atl', ir: s31.id, irTexto: s31.titulo, valor: ok && r.inversion ? MEDIOS[principal(r)[0]] ?? null : null, nota: ok && r.inversion ? `${porcentaje(principal(r)[1])} de su inversión ATL` : null },
          { rotulo: `Emisiones de ${COMPETENCIA.nombre}`, universo: 'atl', ir: s32.id, irTexto: s32.titulo, valor: compMed ? numero(compMed.emisiones) : null, nota: med?.[CLIENTE.marcaFuente] ? `${numero(med[CLIENTE.marcaFuente].emisiones)} de ${CLIENTE.nombre}` : null },
          { rotulo: `Canales de ${COMPETENCIA.nombre}`, universo: 'atl', ir: s31.id, irTexto: s31.titulo, valor: compMed ? numero(compMed.totalCanales) : null, nota: compMed?.canales[0] ? `${compMed.canales[0].nombre} es el principal` : null },
          { rotulo: `Hora con más emisiones de ${COMPETENCIA.nombre}`, universo: 'atl', ir: s32.id, irTexto: s32.titulo, valor: compMed?.horasAltas.length ? `${compMed.horasAltas[0]} h` : null, nota: compMed?.horasAltas.length ? `más ${horasTexto(compMed.horasAltas)}` : null },
        ]} />

      <SeccionDe def={s31} vista={v}>
        {!ok ? <Bloque titulo="Cómo reparte cada marca su inversión ATL" universo="atl" estado={sinDato(atl.estado)} /> : <>
          <Bloque universo="atl" {...mediosLectura(v, MEDIOS)}
            ayuda={<p>Cada franja es el total ATL de una marca repartido por medio. Para comparar montos entre marcas está el share, en Rendimiento.</p>}
            pie={<span>Inversión ATL estimada por Integrametrics. OTT llega sin inversión estimada.</span>}>
            <div className="q-mezclas">{orden.map((m) => <MezclaMedios key={m.id} m={m} />)}</div>
          </Bloque>
          <Detalle id={`detalle-${s31.id}`} titulo="Detalle de dónde está la inversión" bajada={`Integrametrics, ${periodoTexto(P)}.`} vistas={['la inversión por medio en soles', 'las franjas horarias', 'los canales de cada marca']}>
            <Bloque universo="atl" titulo="Inversión ATL por medio, en soles"
              pie={<span>Inversión ATL estimada por Integrametrics a precio de tarifa.</span>}>
              <Tabla etiqueta="Inversión ATL por medio y marca, en soles y en parte de cada marca" numericas={[1, 2, 3, 4]}
                columnas={['Medio', r.nombre, 'De su total', p?.nombre, 'De su total']}
                filas={ORDEN_MEDIOS.map((k) => [MEDIOS[k], soles(r.medios[k] || 0), porcentaje(r.mezclaMedios[k] ?? 0), p ? soles(p.medios[k] || 0) : 'sin dato', p ? porcentaje(p.mezclaMedios[k] ?? 0) : 'sin dato'])} />
            </Bloque>
            <Bloque universo="atl" {...franjasLectura(v, FRANJAS)}
              pie={<span>Emisiones de TV y radio por franja horaria.</span>}>
              <Pesas etiqueta="Parte de las emisiones de cada marca por franja" formato={(n) => (n == null ? 'sin dato' : porcentaje(n))} max={100} rotuloA={p?.nombre} rotuloB={r.nombre} tonoA="propia"
                filas={v.analiza.franjas.map((k) => ({ nombre: FRANJAS[k], a: p?.mezclaFranjas[k] ?? 0, b: r.mezclaFranjas[k] ?? 0 }))} />
            </Bloque>
            <Bloque universo="atl" {...canalesLectura(deMarca, marca)}
              pie={<span>Los ocho canales con más inversión estimada.</span>}>
              {control}
              {deMarca?.canales.length ? <Barras etiqueta={`Inversión de ${textosMarca.nombreMarca(marca)} por canal`} tono={marca === CLIENTE.marcaFuente ? 'propia' : undefined} formato={solesCompacto} filas={deMarca.canales.map((c) => ({ nombre: c.nombre, valor: c.valor }))} />
                : <p className="q-nota-bloque">Sin emisiones en el período.</p>}
            </Bloque>
          </Detalle>
        </>}
      </SeccionDe>

      <SeccionDe def={s32} vista={v}>
        {!med ? <Bloque titulo="Cuándo sale al aire" universo="atl" estado={sinDato(ok ? 'sin-datos' : atl.estado)} /> : <>
          <Bloque universo="atl" {...horarioLectura(deMarca, marca)}
            ayuda={<p>Cada celda es el promedio de emisiones en esa hora y ese día de la semana, en el período.</p>}
            pie={<span>Emisiones de TV, radio, cable y OTT con hora registrada.</span>}>
            {control}
            {deMarca?.matriz?.length ? <MapaCalor etiqueta={`Emisiones de ${textosMarca.nombreMarca(marca)} por día de la semana y hora`} tono={marca === CLIENTE.marcaFuente ? 'propia' : 'foco'} matriz={deMarca.matriz} formato={(n) => (n == null ? 'sin dato' : numero(n, n > 0 && n < 10 ? 1 : 0))} />
              : <p className="q-nota-bloque">Sin emisiones con hora en el período.</p>}
          </Bloque>
          <Detalle id={`detalle-${s32.id}`} titulo="Detalle de cuándo sale al aire" bajada={`Integrametrics, ${periodoTexto(P)}.`} vistas={['los programas de cada marca']}>
            <Bloque universo="atl" {...programasLectura(deMarca, marca)}
              pie={<span>Los ocho programas con más emisiones.</span>}>
              {control}
              {deMarca?.programas.length ? <Barras etiqueta={`Emisiones de ${textosMarca.nombreMarca(marca)} por programa`} tono={marca === CLIENTE.marcaFuente ? 'propia' : undefined} formato={(n) => numero(n)} filas={deMarca.programas.map((x) => ({ nombre: version(x.nombre), valor: x.valor }))} />
                : <p className="q-nota-bloque">Sin programas registrados en el período.</p>}
            </Bloque>
          </Detalle>
        </>}
      </SeccionDe>
    </MarcoCapa>
  );
}
