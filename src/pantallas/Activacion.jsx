// Capa 3 · Activación estratégica: dónde y cuándo está la inversión de cada marca, según Integrametrics.
// Medios, franjas y canales (dónde), y horas, días y programas (cuándo). No calcula: pinta la vista.
import { useState } from 'react';
import { Bloque, Tabla, Resumen, Grupo } from '../sistema/Componentes.jsx';
import { Columnas, Barras } from '../sistema/graficos/Graficos.jsx';
import { numero, porcentaje, soles, solesCompacto } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, HorasYDias, sinDato } from './comun.jsx';
import { periodoTexto, version, horasTexto } from '../textos/comun.js';
import { mediosLectura, franjasLectura, canalesLectura, horarioLectura, programasLectura, textosMarca } from '../textos/lecturas.js';
import { MEDIOS, FRANJAS } from '../calculo/vista.js';
import { CLIENTE } from '../cliente.js';

const MARCAS = [CLIENTE.marcaFuente, ...CLIENTE.competencia.map((c) => c.marcaFuente)];
const ORDEN_MEDIOS = ['TV ABIERTA', 'CABLE', 'RADIO', 'OTT', 'OOH'];

export default function Activacion({ capa, vista: v }) {
  const [s31, s32] = capa.secciones;
  const P = v.periodo, atl = v.lee.atl, med = v.lee.medios;
  const [marca, setMarca] = useState(CLIENTE.marcaFuente);
  const ok = atl.estado === 'ok';
  const [a, b] = ok ? atl.marcas : [];
  const deMarca = med?.[marca];
  const propiaMed = med?.[CLIENTE.marcaFuente];
  const opcionesMarca = MARCAS.map((m) => ({ valor: m, texto: textosMarca.nombreMarca(m), desactivada: !med?.[m] }));
  const pctDe = (obj, k) => { const t = Object.values(obj).reduce((s, x) => s + x, 0); return t ? Math.round((obj[k] || 0) / t * 100) : null; };
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={`Resumen de ${periodoTexto(P)}`}
        pie={<span>Inversión estimada por Integrametrics a precio de tarifa; emisiones registradas en TV, radio, cable, OTT y vía pública.</span>}
        items={[
          { rotulo: `Medio principal de ${CLIENTE.nombre}`, universo: 'atl', ir: s31.id, irTexto: s31.titulo, valor: ok && a.inversion ? (MEDIOS[Object.entries(a.medios).sort((x, y) => y[1] - x[1])[0][0]] ?? null) : null, nota: ok && a.inversion ? `${porcentaje(pctDe(a.medios, Object.entries(a.medios).sort((x, y) => y[1] - x[1])[0][0]))} de su inversión ATL` : null },
          { rotulo: `Canales de ${CLIENTE.nombre}`, universo: 'atl', ir: s31.id, irTexto: s31.titulo, valor: propiaMed ? numero(propiaMed.totalCanales) : null, nota: propiaMed?.canales[0] ? `${propiaMed.canales[0].nombre} es el principal` : null },
          { rotulo: `Emisiones de ${CLIENTE.nombre}`, universo: 'atl', ir: s32.id, irTexto: s32.titulo, valor: propiaMed ? numero(propiaMed.emisiones) : null, nota: propiaMed?.horasAltas.length ? `más ${horasTexto(propiaMed.horasAltas)}` : null },
          { rotulo: 'Programas', universo: 'atl', ir: s32.id, irTexto: s32.titulo, valor: propiaMed ? numero(propiaMed.totalProgramas) : null, nota: propiaMed ? `con emisiones de ${CLIENTE.nombre}` : null },
        ]} />

      <SeccionDe def={s31} vista={v}>
        {!ok ? <Bloque titulo="Inversión por medio" universo="atl" estado={sinDato(atl.estado)} /> : <>
          <Bloque universo="atl" {...mediosLectura(v, MEDIOS)}
            ayuda={<p>Cada columna tiene su propia escala: compara cómo reparte cada marca su inversión, no cuánto pone una frente a la otra. Para eso está el share, en Rendimiento.</p>}
            pie={<span>Inversión ATL estimada por medio. Las emisiones de OTT llegan sin inversión estimada de Integrametrics.</span>}>
            <Columnas etiqueta="Inversión ATL por medio y marca" tituloA={a.nombre} tituloB={b?.nombre} formatoA={solesCompacto} formatoB={solesCompacto}
              filas={ORDEN_MEDIOS.map((k) => ({ nombre: MEDIOS[k], a: a.medios[k] || 0, b: b ? b.medios[k] || 0 : null }))} />
            <Tabla etiqueta="Inversión ATL por medio y marca, en soles y en parte de cada marca" numericas={[1, 2, 3, 4]}
              columnas={['Medio', a.nombre, 'De su total', b?.nombre, 'De su total']}
              filas={ORDEN_MEDIOS.map((k) => [MEDIOS[k], soles(a.medios[k] || 0), porcentaje(pctDe(a.medios, k)), b ? soles(b.medios[k] || 0) : 'sin dato', b ? porcentaje(pctDe(b.medios, k)) : 'sin dato'])} />
          </Bloque>
          <Bloque universo="atl" ancho="mitad" {...franjasLectura(v, FRANJAS)}
            pie={<span>Parte de las emisiones de cada marca en cada franja horaria de la TV y la radio.</span>}>
            <Tabla etiqueta="Emisiones por franja y marca" numericas={[1, 2]}
              columnas={['Franja', ...atl.marcas.map((m) => m.nombre)]}
              filas={v.analiza.franjas.map((k) => [FRANJAS[k], ...atl.marcas.map((m) => porcentaje(pctDe(m.franjas, k)))])} />
          </Bloque>
          <Bloque universo="atl" ancho="mitad" {...canalesLectura(propiaMed, CLIENTE.marcaFuente)}
            pie={<span>Los ocho canales con más inversión estimada de {CLIENTE.nombre} en el mes.</span>}>
            {propiaMed ? <Barras etiqueta={`Inversión de ${CLIENTE.nombre} por canal`} formato={solesCompacto} filas={propiaMed.canales.map((c) => ({ nombre: c.nombre, valor: c.valor }))} />
              : <p className="q-nota-bloque">Sin emisiones en el período.</p>}
          </Bloque>
        </>}
      </SeccionDe>

      <SeccionDe def={s32} vista={v}>
        {!med ? <Bloque titulo="Cuándo sale al aire" universo="atl" estado={sinDato(ok ? 'sin-datos' : atl.estado)} /> : <>
          <div className="q-control q-control-bloque"><span>Marca</span><Grupo etiqueta="Marca" valor={marca} onCambiar={setMarca} opciones={opcionesMarca} /></div>
          <Bloque universo="atl" {...horarioLectura(deMarca, marca)}
            ayuda={<p>Emisiones registradas por Integrametrics con su hora exacta: promedio por día del período en cada hora, y promedio por cada día de la semana. Es el insumo para que el BI de {CLIENTE.nombre} cruce las emisiones con su curva de llamadas.</p>}
            pie={<span>Emisiones de TV, radio, cable y OTT con hora registrada.</span>}>
            {deMarca ? <HorasYDias porHora={deMarca.porHora} horasAltas={deMarca.horasAltas} porDiaSemana={deMarca.porDiaSemana} diaMayor={deMarca.diaMayor} que="Emisiones" formato={(n) => (n == null ? 'sin dato' : numero(n, n < 10 ? 1 : 0))} />
              : <p className="q-nota-bloque">Sin emisiones en el período.</p>}
          </Bloque>
          <Bloque universo="atl" {...programasLectura(deMarca, marca)}
            pie={<span>Los ocho programas con más emisiones en el mes.</span>}>
            {deMarca?.programas.length ? <Barras etiqueta={`Emisiones de ${textosMarca.nombreMarca(marca)} por programa`} formato={(n) => numero(n)} filas={deMarca.programas.map((p) => ({ nombre: version(p.nombre), valor: p.valor }))} />
              : <p className="q-nota-bloque">Sin programas registrados en el período.</p>}
          </Bloque>
        </>}
      </SeccionDe>
    </MarcoCapa>
  );
}
