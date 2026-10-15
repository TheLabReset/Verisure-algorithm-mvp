// Capa 4 · Rendimiento y optimización: cómo viene el share de la competencia en el período frente al anterior.
// Share of investment en ATL y en digital (universos distintos: lado a lado, nunca sumados), el share semana a semana
// en el año y la inversión día por día. No calcula: pinta la vista.
import { useState } from 'react';
import { Bloque, Tabla, Resumen, Grupo } from '../sistema/Componentes.jsx';
import { Pesas, Lineas } from '../sistema/graficos/Graficos.jsx';
import { numero, porcentaje, soles, solesCompacto, compacto } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato } from './comun.jsx';
import { periodoTexto, comparacionTexto, puntosFrente, capital } from '../textos/comun.js';
import { fraseShare, atlLectura, digitalLectura, presionLectura, shareSemanalLectura } from '../textos/lecturas.js';

const pts = (n) => (n == null ? 'sin comparación' : n === 0 ? 'igual' : `${n > 0 ? '+' : '−'}${numero(Math.abs(n))} pts`);

function TablaShare({ u, etiqueta, conImpresiones }) {
  const orden = [...u.marcas].sort((a, b) => Number(a.propia) - Number(b.propia));
  return (
    <Tabla etiqueta={etiqueta} numericas={conImpresiones ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]} destacada={orden.findIndex((m) => m.foco)}
      columnas={['Marca', 'Inversión estimada', ...(conImpresiones ? ['Impresiones'] : []), 'Share', 'Share antes', 'Cambio']}
      filas={orden.map((m) => [m.nombre, soles(m.inversion), ...(conImpresiones ? [compacto(m.impresiones)] : []), porcentaje(m.share), m.sharePrevio == null ? 'sin dato' : porcentaje(m.sharePrevio),
        { texto: pts(m.cambioPts), tono: !m.foco || !m.cambioPts ? null : m.cambioPts > 0 ? 'empeora' : 'mejora' }])} />
  );
}

// Share antes y ahora, por marca: la competencia arriba; la comparación en gris, el período en el color de foco
function ShareMarcas({ u, etiqueta, rotuloA }) {
  const orden = [...u.marcas].sort((a, b) => Number(a.propia) - Number(b.propia));
  return <Pesas etiqueta={etiqueta} formato={(n) => (n == null ? 'sin dato' : porcentaje(n))} max={100} rotuloA={rotuloA} rotuloB="Este período"
    filas={orden.map((m) => ({ nombre: m.nombre, a: m.sharePrevio, b: m.share, resto: !m.foco }))} />;
}

export default function Rendimiento({ capa, vista: v }) {
  const [s41] = capa.secciones;
  const P = v.periodo, atl = v.lee.atl, dig = v.lee.digital;
  const [diario, setDiario] = useState('digital');
  const ok = (x) => x.estado === 'ok';
  const rival = (u) => u.marcas.find((m) => m.foco);
  const comparacion = comparacionTexto(P);
  const rotuloA = comparacion ? capital(comparacion) : 'Sin comparación';
  const s = v.analiza.shareSemanal;
  const u = v.lee[diario];
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={`Resumen de ${periodoTexto(P)}`}
        frases={[...(ok(atl) ? [{ segmentos: fraseShare(atl, 'ATL', P) }] : []), ...(ok(dig) ? [{ segmentos: fraseShare(dig, 'digital', P) }] : [])]}
        pie={<span>Inversión estimada por Integrametrics a precio de tarifa. {comparacion ? `Cada cambio compara ${periodoTexto(P)} con ${comparacion}.` : 'No hay un mes anterior en la data para comparar.'} ATL y digital se miden distinto: se leen lado a lado, no se suman.</span>}
        items={[
          { rotulo: `Share digital de ${s.marca}`, universo: 'digital', ir: s41.id, irTexto: s41.titulo, valor: ok(dig) ? porcentaje(rival(dig).share) : null, nota: ok(dig) ? capital(puntosFrente(rival(dig).cambioPts, P) || `de ${solesCompacto(dig.total)} en total`) : null },
          { rotulo: `Inversión digital de ${s.marca}`, universo: 'digital', ir: s41.id, irTexto: s41.titulo, valor: ok(dig) ? solesCompacto(rival(dig).inversion) : null, nota: ok(dig) ? `${compacto(rival(dig).impresiones)} impresiones` : null },
          { rotulo: `Share ATL de ${s.marca}`, universo: 'atl', ir: s41.id, irTexto: s41.titulo, valor: ok(atl) ? porcentaje(rival(atl).share) : null, nota: ok(atl) ? capital(puntosFrente(rival(atl).cambioPts, P) || `de ${solesCompacto(atl.total)} en total`) : null },
          { rotulo: `Inversión ATL de ${s.marca}`, universo: 'atl', ir: s41.id, irTexto: s41.titulo, valor: ok(atl) ? solesCompacto(rival(atl).inversion) : null, nota: ok(atl) ? `${numero(rival(atl).spots)} emisiones` : null },
        ]} />

      <SeccionDe def={s41} vista={v}>
        {!ok(dig) ? <Bloque titulo="Share of investment digital" universo="digital" estado={sinDato(dig.estado)} /> : (
          <Bloque universo="digital" ancho="mitad" {...digitalLectura(v)}
            ayuda={<p>Inversión digital estimada por Integrametrics en Facebook, Instagram, Google Search y YouTube. Cada fila une el share de la comparación (gris) con el del período.</p>}
            pie={<span>Facebook, Instagram, Google Search y YouTube.</span>}>
            <ShareMarcas u={dig} etiqueta="Share de la inversión digital por marca, antes y ahora" rotuloA={rotuloA} />
            <TablaShare u={dig} etiqueta="Inversión, impresiones y share digital por marca" conImpresiones />
          </Bloque>
        )}
        {!ok(atl) ? <Bloque titulo="Share of investment ATL" universo="atl" estado={sinDato(atl.estado)} /> : (
          <Bloque universo="atl" ancho="mitad" {...atlLectura(v)}
            ayuda={<p>Share of investment: la parte de la inversión de la categoría que pone cada marca. Integrametrics estima la inversión con la tarifa de cada medio (inversión bruta), no con lo que se pagó.</p>}
            pie={<span>TV abierta, cable, radio, OTT y vía pública.</span>}>
            <ShareMarcas u={atl} etiqueta="Share de la inversión ATL por marca, antes y ahora" rotuloA={rotuloA} />
            <TablaShare u={atl} etiqueta="Inversión y share ATL por marca" />
          </Bloque>
        )}
        {(s.atl || s.digital) && (
          <Bloque universo={['atl', 'digital']} {...shareSemanalLectura(s)} alcance="semanas del año"
            ayuda={<p>La parte de la inversión de cada semana (lunes a domingo) que pone {s.marca}, en ATL y en digital, cada una sobre su propio universo. Las dos son porcentajes y van en la misma escala; no se suman. La última semana puede estar incompleta.</p>}
            pie={<span>Share semanal de {s.marca} en la inversión estimada por Integrametrics.</span>}>
            <Lineas etiqueta={`Share semanal de ${s.marca}, ATL y digital`} formato={(n) => porcentaje(n)} alto={240}
              series={[...(s.digital ? [{ nombre: 'Digital', resaltada: true, serie: s.digital }] : []), ...(s.atl ? [{ nombre: 'ATL', resaltada: false, serie: s.atl }] : [])]} />
          </Bloque>
        )}
        {ok(u) && (
          <Bloque universo={diario} {...presionLectura(v, diario)}
            pie={<span>Inversión estimada de cada día, en soles, en la misma escala para las dos marcas. Un día sin registros es un hueco, no un cero.</span>}>
            <div className="q-control q-control-tarjeta"><span>Universo</span><Grupo etiqueta="Universo" valor={diario} onCambiar={setDiario} opciones={[{ valor: 'digital', texto: 'Digital' }, { valor: 'atl', texto: 'ATL', desactivada: !ok(atl) }]} /></div>
            <Lineas etiqueta={`Inversión ${diario === 'atl' ? 'ATL' : 'digital'} por día y por marca`} formato={solesCompacto}
              series={[...u.marcas].sort((a, b) => Number(a.foco) - Number(b.foco)).map((m) => ({ nombre: m.nombre, resaltada: m.foco, serie: u.diaria.map((d) => ({ fecha: d.fecha, valor: d.valores[m.id] })) }))} />
          </Bloque>
        )}
      </SeccionDe>
    </MarcoCapa>
  );
}
