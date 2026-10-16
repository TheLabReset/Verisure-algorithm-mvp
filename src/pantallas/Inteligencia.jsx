// Capa 2 · Inteligencia de mercado: cómo se mueve la competencia, con la marca propia para comparar. Dónde pone su
// inversión (digital primero, por plataforma; después ATL, por medio), qué medios compra canal por canal frente a la
// marca propia, y cuándo sale al aire (la semana día × hora y sus programas). No calcula: pinta la vista.
import { useState } from 'react';
import { Bloque, Tabla, Resumen, Grupo, Detalle, vigente } from '../sistema/Componentes.jsx';
import { Franja, Pesas, Barras, MapaCalor } from '../sistema/graficos/Graficos.jsx';
import { numero, porcentaje, parte, soles, solesCompacto, fechaCorta } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato, avisosDe } from './comun.jsx';
import { periodoTexto, version, horasTexto, enLetras, resumenTitulo, tipoAviso, GRUPOS_DIGITALES, nombreGrupoDigital, ventanaTexto, lista, ventanaPatron } from '../textos/comun.js';
import { mediosLectura, franjasLectura, canalesLectura, horarioLectura, programasLectura, textosMarca, digitalPlataformasLectura, compraLectura, recorteTexto, sinCompraTexto, todosTipoTexto } from '../textos/lecturas.js';
import { MEDIOS, FRANJAS } from '../calculo/vista.js';
import { CLIENTE } from '../cliente.js';

const COMPETENCIA = CLIENTE.competencia[0];
const MARCAS = [...CLIENTE.competencia.map((c) => c.marcaFuente), CLIENTE.marcaFuente];
const ORDEN_MEDIOS = ['TV ABIERTA', 'RADIO', 'OOH', 'CABLE', 'OTT'];
// Color fijo por medio y por plataforma (el color sigue a la categoría, no al orden). Radio y Facebook van en tinta y
// no en el naranja de categoría, que se confunde con el amarillo de la competencia; el resto en gris
const CLASE_MEDIO = { 'TV ABIERTA': 'q-p0', RADIO: 'q-p-tinta', OOH: 'q-p2', CABLE: 'q-p5', OTT: 'q-p5' };
const CLASE_DIGITAL = { FACEBOOK: 'q-p-tinta', INSTAGRAM: 'q-p0', YOUTUBE: 'q-p2', OTROS: 'q-p5' };
const GRUPO_MEDIO = { 'TV ABIERTA': 'TV abierta', CABLE: 'Cable', RADIO: 'Radio', 'OTT STREAMING/LIVE': 'OTT y streaming' };

function MezclaMedios({ m }) {
  // la parte sale del monto, sin redondear: Cable y OTT con inversión no se escribe «0 %»
  const pct = (valor) => (m.inversion ? (valor / m.inversion) * 100 : 0);
  const principales = ['TV ABIERTA', 'RADIO', 'OOH'].map((k) => ({ nombre: MEDIOS[k], valor: m.medios[k] || 0, pct: pct(m.medios[k] || 0), clase: CLASE_MEDIO[k] }));
  const resto = ['CABLE', 'OTT'].reduce((s, k) => s + (m.medios[k] || 0), 0);
  const partes = [...principales, { nombre: 'Cable y OTT', valor: resto, pct: pct(resto), clase: 'q-p5' }].filter((p) => p.valor > 0);
  return (
    <div className="q-mezcla">
      <h4>{m.nombre}<span>{solesCompacto(m.inversion)} en ATL</span></h4>
      {partes.length ? <Franja etiqueta={`Reparto de la inversión ATL de ${m.nombre} por medio`} partes={partes} formato={parte} verTabla={false} /> : <p className="q-nota-bloque">Sin inversión ATL en el período.</p>}
    </div>
  );
}

function MezclaDigital({ m }) {
  const total = GRUPOS_DIGITALES.reduce((s, g) => s + (m.grupos?.[g] || 0), 0);
  const partes = GRUPOS_DIGITALES.map((g) => ({ nombre: nombreGrupoDigital(g), valor: m.grupos?.[g] || 0, pct: total ? ((m.grupos?.[g] || 0) / total) * 100 : 0, clase: CLASE_DIGITAL[g] })).filter((p) => p.valor > 0);
  return (
    <div className="q-mezcla">
      <h4>{m.nombre}<span>{numero(total)} avisos registrados</span></h4>
      {partes.length ? <Franja etiqueta={`Reparto de los avisos digitales de ${m.nombre} por plataforma`} partes={partes} formato={parte} verTabla={false} /> : <p className="q-nota-bloque">Sin avisos digitales en el período.</p>}
    </div>
  );
}

// Tipos de aviso de una marca: los tres que más pesan en color, los demás juntos en gris
const CLASE_TIPO = ['q-p-tinta', 'q-p0', 'q-p2'];
function MezclaTipos({ nombre, tipos }) {
  const total = tipos.reduce((s, t) => s + t.emisiones, 0);
  const principales = tipos.slice(0, 3), resto = tipos.slice(3).reduce((s, t) => s + t.emisiones, 0);
  const partes = [...principales.map((t, i) => ({ nombre: tipoAviso(t.tipo), valor: t.emisiones, pct: total ? (t.emisiones / total) * 100 : 0, clase: CLASE_TIPO[i] })),
    ...(resto ? [{ nombre: 'Otros tipos', valor: resto, pct: (resto / total) * 100, clase: 'q-p5' }] : [])];
  return (
    <div className="q-mezcla">
      <h4>{nombre}<span>{numero(total)} {total === 1 ? 'emisión' : 'emisiones'}</span></h4>
      {total ? <Franja etiqueta={`Emisiones de ${nombre} por tipo de aviso`} partes={partes} formato={parte} verTabla={false} /> : <p className="q-nota-bloque">Sin compra de medios ATL en el período.</p>}
    </div>
  );
}

export default function Inteligencia({ capa, vista: v }) {
  const [s21, s22, s23] = capa.secciones;
  const P = v.periodo, atl = v.lee.atl, dig = v.lee.digital, med = v.lee.medios, compra = v.lee.compra;
  const [elegida, setMarca] = useState(COMPETENCIA.marcaFuente);
  const ok = atl.estado === 'ok';
  const orden = ok ? [...atl.marcas].sort((a, b) => Number(a.propia) - Number(b.propia)) : [];
  const ordenDig = dig.estado === 'ok' ? [...dig.marcas].sort((a, b) => Number(a.propia) - Number(b.propia)) : [];
  const [r, p] = orden;
  const opcionesMarca = MARCAS.map((m) => ({ valor: m, texto: textosMarca.nombreMarca(m), desactivada: !med?.[m] }));
  const marca = vigente(elegida, opcionesMarca);
  const deMarca = med?.[marca];
  const compMed = med?.[COMPETENCIA.marcaFuente];
  const principal = (m) => Object.entries(m.medios).map(([k, x]) => [k, m.inversion ? (x / m.inversion) * 100 : 0]).sort((a, b) => b[1] - a[1])[0];
  const control = <div className="q-control q-control-tarjeta"><span>Marca</span><Grupo etiqueta="Marca" valor={marca} onCambiar={setMarca} opciones={opcionesMarca} /></div>;
  const [C, Pr] = [COMPETENCIA.marcaFuente, CLIENTE.marcaFuente];
  const mv = v.lee.mediosVentana;
  // los canales de las dos marcas en la misma escala: una barra más larga siempre es más emisiones
  const maxCanal = compra ? Math.max(1, ...[C, Pr].flatMap((m) => compra.porMarca[m].canales.map((c) => c.emisiones))) : 1;
  const nC = COMPETENCIA.nombre, nP = CLIENTE.nombre;
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={resumenTitulo(P)}
        pie={<span>Inversión estimada por Integrametrics a precio de tarifa. Emisiones de TV, cable, radio y OTT; la vía pública va en OOH.</span>}
        items={[
          { rotulo: `Medio principal de ${nC}`, universo: 'atl', ir: s21.id, irTexto: s21.titulo, valor: ok && r.inversion ? MEDIOS[principal(r)[0]] ?? null : null, nota: ok && r.inversion ? `${porcentaje(principal(r)[1])} de su inversión ATL` : null },
          { rotulo: `Emisiones de ${nC}${mv.ampliada ? ` ${ventanaPatron(mv)}` : ''}`, universo: 'atl', ir: s22.id, irTexto: s22.titulo, valor: compra ? numero(compra.totales[C].emisiones) : null, nota: compra ? `${numero(compra.totales[Pr].emisiones)} de ${nP}` : null },
          { rotulo: `Canales de ${nC}${mv.ampliada ? ` ${ventanaPatron(mv)}` : ''}`, universo: 'atl', ir: s22.id, irTexto: s22.titulo, valor: compra ? numero(compra.totales[C].canales) : null, nota: compra ? (compra.enComun ? `${compra.enComun === 1 ? 'uno' : enLetras(compra.enComun)} en común con ${nP}` : `ninguno en común con ${nP}`) : null },
          { rotulo: `Hora con más emisiones de ${nC}${mv.ampliada ? ` ${ventanaPatron(mv)}` : ''}`, universo: 'atl', ir: s23.id, irTexto: s23.titulo, valor: compMed?.horasAltas.length ? `${compMed.horasAltas[0]} h` : null, nota: compMed?.horasAltas.length > 1 ? `las ${enLetras(compMed.horasAltas.length, true)} más altas van ${horasTexto(compMed.horasAltas)}` : null },
        ]} />

      <SeccionDe def={s21} vista={v}>
        {dig.estado !== 'ok' ? <Bloque titulo="Dónde aparece cada marca en digital" universo="digital" estado={sinDato(dig.estado)} /> : (
          <Bloque universo="digital" {...digitalPlataformasLectura({ ...dig, periodo: P, nombreGrupo: nombreGrupoDigital })}
            ayuda={<p>Cada franja es el total de avisos digitales que Integrametrics registró de una marca, repartido por plataforma. Integrametrics no estima la inversión por plataforma: cuenta avisos.</p>}
            pie={<span>Avisos digitales registrados por Integrametrics.</span>}>
            <div className="q-mezclas">{ordenDig.map((m) => <MezclaDigital key={m.id} m={m} />)}</div>
          </Bloque>
        )}
        {!ok ? <Bloque titulo="Cómo reparte cada marca su inversión ATL" universo="atl" estado={sinDato(atl.estado)} /> : <>
          <Bloque universo="atl" {...mediosLectura(v, MEDIOS)} avisos={avisosDe(v, 'medios')}
            ayuda={<p>Cada franja es el total ATL de una marca repartido por medio.</p>}
            pie={<span>Inversión ATL estimada por Integrametrics. OTT llega sin inversión estimada.</span>}>
            <div className="q-mezclas">{orden.map((m) => <MezclaMedios key={m.id} m={m} />)}</div>
          </Bloque>
          <Detalle id={`detalle-${s21.id}`} titulo="Detalle de dónde está la inversión" bajada={`Integrametrics, ${periodoTexto(P)}.`} vistas={['la inversión por medio en soles', 'las franjas horarias', 'los canales de cada marca']}>
            <Bloque universo="atl" titulo="Inversión ATL por medio, en soles"
              pie={<span>Inversión ATL estimada por Integrametrics a precio de tarifa.</span>}>
              <Tabla etiqueta="Inversión ATL por medio y marca, en soles y en parte de cada marca" numericas={[1, 2, 3, 4]}
                columnas={['Medio', r.nombre, 'De su total', p?.nombre, 'De su total']}
                filas={ORDEN_MEDIOS.map((k) => [MEDIOS[k], soles(r.medios[k] || 0), r.inversion ? parte(((r.medios[k] || 0) / r.inversion) * 100) : 'sin inversión', p ? soles(p.medios[k] || 0) : 'sin dato', p ? (p.inversion ? parte(((p.medios[k] || 0) / p.inversion) * 100) : 'sin inversión') : 'sin dato'])} />
            </Bloque>
            <Bloque universo="atl" {...franjasLectura(v, FRANJAS)}
              pie={<span>Emisiones de TV y radio por franja horaria.</span>}>
              <Pesas etiqueta="Parte de las emisiones de cada marca por franja" formato={(n) => (n == null ? 'sin dato' : porcentaje(n))} max={100} rotuloA={p?.nombre} rotuloB={r.nombre} tonoA="propia"
                filas={v.analiza.franjas.map((k) => ({ nombre: FRANJAS[k], a: p?.mezclaFranjas[k] ?? 0, b: r.mezclaFranjas[k] ?? 0 }))} />
            </Bloque>
            <Bloque universo="atl" {...canalesLectura(deMarca, marca)}
              pie={<span>Los canales con más inversión estimada, hasta ocho.</span>}>
              {control}
              {deMarca?.canales.length ? <Barras etiqueta={`Inversión de ${textosMarca.nombreMarca(marca)} por canal`} tono={marca === Pr ? 'propia' : undefined} formato={solesCompacto} filas={deMarca.canales.map((c) => ({ nombre: c.nombre, valor: c.valor }))} />
                : <p className="q-nota-bloque">Sin emisiones en el período.</p>}
            </Bloque>
          </Detalle>
        </>}
      </SeccionDe>

      <SeccionDe def={s22} vista={v}>
        {!compra ? <Bloque titulo="Compra de medios" universo="atl" estado={sinDato(ok ? 'sin-datos' : atl.estado)} /> : <>
          <Bloque universo="atl" {...compraLectura(compra, mv, mv.ampliada ? ventanaPatron(mv) : null)} ventana={mv.ampliada ? ventanaTexto(mv.desde, mv.hasta) : undefined}
            ayuda={<p>Los canales y emisoras de TV abierta, cable, radio y OTT donde salió cada marca, de más a menos emisiones. Con un período de menos de cuatro semanas se leen las cuatro que terminan en su último día. La vía pública va en OOH.</p>}
            pie={<span>Integrametrics, emisión por emisión. Una emisión de cadena nacional repetida en sus señales regionales cuenta una sola vez.</span>}>
            <div className="q-mezclas">
              {[C, Pr].map((m) => {
                const x = compra.porMarca[m], t = compra.totales[m];
                return (
                  <div key={m} className="q-mezcla">
                    <h4>{textosMarca.nombreMarca(m)}<span>{numero(t.emisiones)} {t.emisiones === 1 ? 'emisión' : 'emisiones'} en {numero(t.canales)} {t.canales === 1 ? 'canal' : 'canales'}</span></h4>
                    {x.canales.length ? <Barras etiqueta={`Emisiones de ${textosMarca.nombreMarca(m)} por canal`} tono={m === Pr ? 'propia' : undefined} max={maxCanal} formato={(n) => numero(n)}
                      filas={x.canales.map((c) => ({ nombre: c.canal === 'DESCONOCIDO' ? 'Canal sin registrar' : version(c.canal), valor: c.emisiones }))} />
                      : <p className="q-nota-bloque">Sin compra de medios ATL en el período.</p>}
                    {x.canales.some((c) => c.enComun) && <p className="q-nota-bloque">También los compra {textosMarca.nombreMarca(m === Pr ? C : Pr)}: {lista(x.canales.filter((c) => c.enComun).map((c) => version(c.canal)))}.</p>}
                    {x.restoCanales > 0 && <p className="q-nota-bloque">Y {numero(x.restoCanales)} {x.restoCanales === 1 ? 'canal más' : 'canales más'} con menos emisiones.</p>}
                  </div>
                );
              })}
            </div>
          </Bloque>
          {[C, Pr].some((m) => compra.porMarca[m].tipos.length > 1) && <Bloque universo="atl" titulo="Qué tipo de aviso compra cada marca" ventana={mv.ampliada ? ventanaTexto(mv.desde, mv.hasta) : undefined}
            ayuda={<p>Cada franja reparte las emisiones de una marca por tipo de aviso: spot, mención, auspicio, presentación o despedida de un programa, sobreimposición. Los tipos que pesan menos van juntos en gris.</p>}
            pie={<span>Integrametrics, emisión por emisión.</span>}>
            <div className="q-mezclas">{[C, Pr].map((m) => <MezclaTipos key={m} nombre={textosMarca.nombreMarca(m)} tipos={compra.porMarca[m].tipos} />)}</div>
          </Bloque>}
          <Detalle id={`detalle-${s22.id}`} titulo="Detalle de la compra de medios" bajada={`Integrametrics, ${mv.ampliada ? `del ${ventanaTexto(mv.desde, mv.hasta)}` : periodoTexto(P)}.`} vistas={['los programas de cada marca, con su canal y su tipo de aviso']}>
            {(() => {
              // los canales de cada marca ya están en la tarjeta: el detalle suma lo que ella no tiene, los programas
              const quien = mv.ampliada ? `del ${ventanaTexto(mv.desde, mv.hasta)}` : `en ${periodoTexto(P)}`;
              const tipos = new Set((compra.programasTop[marca] || []).map((x) => x.tipo));
              const unTipo = tipos.size === 1 ? [...tipos][0] : null;
              const canal = (x) => ({ texto: x.canal === 'DESCONOCIDO' ? 'Canal sin registrar' : version(x.canal), sub: GRUPO_MEDIO[x.grupo] ?? version(x.grupo) });
              return <>
                {/* si todos los avisos son del mismo tipo, la columna repetiría lo mismo en cada fila: va una vez, en el pie */}
                <Bloque universo="atl" titulo={`Los programas de ${textosMarca.nombreMarca(marca)}`}
                  pie={compra.programasTop[marca]?.length ? <span>{recorteTexto(compra.programasTop[marca].length, compra.detalle[marca].length, 'programas')}{unTipo ? ` ${todosTipoTexto(unTipo)}` : ''}</span> : null}>
                  {control}
                  {compra.programasTop[marca]?.length ? <Tabla etiqueta={`Emisiones de ${textosMarca.nombreMarca(marca)} por programa`} numericas={unTipo ? [1] : [2]}
                    columnas={['Programa', ...(unTipo ? [] : ['Tipo de aviso']), 'Emisiones']}
                    filas={compra.programasTop[marca].map((x) => [{ texto: x.programa ? version(x.programa) : 'Sin programa', sub: canal(x).texto }, ...(unTipo ? [] : [tipoAviso(x.tipo)]), numero(x.emisiones)])} />
                    : <p className="q-nota-bloque">{sinCompraTexto(textosMarca.nombreMarca(marca), quien)}</p>}
                </Bloque>
              </>;
            })()}
          </Detalle>
        </>}
      </SeccionDe>

      <SeccionDe def={s23} vista={v}>
        {!med ? <Bloque titulo="Cuándo sale al aire" universo="atl" estado={sinDato(ok ? 'sin-datos' : atl.estado)} /> : <>
          <Bloque universo="atl" {...horarioLectura(deMarca, marca)} ventana={mv.ampliada ? ventanaTexto(mv.desde, mv.hasta) : undefined}
            ayuda={<p>Cada celda es el promedio de emisiones en esa hora y ese día de la semana. Un horario es un patrón: con un período de menos de cuatro semanas, se leen las cuatro que terminan en su último día.</p>}
            pie={<span>Emisiones de TV, radio, cable y OTT con hora registrada.</span>}>
            {control}
            {deMarca?.matriz?.length && deMarca.emisiones ? <MapaCalor etiqueta={`Emisiones de ${textosMarca.nombreMarca(marca)} por día de la semana y hora`} tono={marca === Pr ? 'propia' : 'foco'} matriz={deMarca.matriz} formato={(n) => (n == null ? 'sin dato' : numero(n, n > 0 && n < 10 ? 1 : 0))} />
              : <p className="q-nota-bloque">Sin emisiones con hora en el período.</p>}
          </Bloque>
          <Bloque universo="atl" {...programasLectura(deMarca, marca)} ventana={mv.ampliada ? ventanaTexto(mv.desde, mv.hasta) : undefined}
            pie={<span>Los programas con más emisiones, hasta ocho{mv.ampliada ? `, ${ventanaPatron(mv)} al ${fechaCorta(mv.hasta)}` : ''}.</span>}>
            {control}
            {deMarca?.programas.length > 0 && <Barras etiqueta={`Emisiones de ${textosMarca.nombreMarca(marca)} por programa`} tono={marca === Pr ? 'propia' : undefined} formato={(n) => numero(n)} filas={deMarca.programas.map((x) => ({ nombre: version(x.nombre), valor: x.valor }))} />}
          </Bloque>
        </>}
      </SeccionDe>
    </MarcoCapa>
  );
}
