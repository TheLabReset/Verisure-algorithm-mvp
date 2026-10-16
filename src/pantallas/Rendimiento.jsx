// Capa 4 · Rendimiento y optimización: cómo viene el share de la competencia en el período frente al anterior.
// A la vista: el share of investment en digital y en ATL en una tarjeta (universos distintos: lado a lado, nunca
// sumados) y el share semana a semana en el año. En el detalle: las cifras en soles y la inversión día por día.
// No calcula: pinta la vista.
import { useState } from 'react';
import { Bloque, Tabla, Resumen, Grupo, Detalle, vigente } from '../sistema/Componentes.jsx';
import { Pesas, Lineas } from '../sistema/graficos/Graficos.jsx';
import { numero, porcentaje, soles, solesCompacto, compacto } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato } from './comun.jsx';
import { periodoTexto, comparacionTexto, puntosFrente, capital } from '../textos/comun.js';
import { atlLectura, digitalLectura, shareLectura, presionLectura, shareSemanalLectura } from '../textos/lecturas.js';

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

// Share antes y ahora, por marca: la competencia arriba; la comparación en gris, el período en el color de cada marca
function ShareMarcas({ u, etiqueta, rotuloA }) {
  const orden = [...u.marcas].sort((a, b) => Number(a.propia) - Number(b.propia));
  return <Pesas etiqueta={etiqueta} formato={(n) => (n == null ? 'sin dato' : porcentaje(n))} max={100} rotuloA={rotuloA} rotuloB="Este período"
    filas={orden.map((m) => ({ nombre: m.nombre, a: m.sharePrevio, b: m.share, tono: m.foco ? undefined : m.propia ? 'propia' : 'resto' }))} />;
}

export default function Rendimiento({ capa, vista: v }) {
  const [s41] = capa.secciones;
  const P = v.periodo, atl = v.lee.atl, dig = v.lee.digital;
  // ATL primero: las alertas que llevan al día por día (un pico, un día sin registros) son de ATL
  const [elegidoDiario, setDiario] = useState('atl');
  const opcionesDiario = [{ valor: 'atl', texto: 'ATL', desactivada: atl.estado !== 'ok' }, { valor: 'digital', texto: 'Digital', desactivada: dig.estado !== 'ok' }];
  const diario = vigente(elegidoDiario, opcionesDiario);
  const ok = (x) => x.estado === 'ok';
  const rival = (u) => u.marcas.find((m) => m.foco);
  const comparacion = comparacionTexto(P);
  const rotuloA = comparacion ? capital(comparacion) : 'Sin comparación';
  const s = v.analiza.shareSemanal;
  const u = v.lee[diario];
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={`Resumen de ${periodoTexto(P)}`}
        pie={<span>Inversión estimada por Integrametrics a precio de tarifa.</span>}
        items={[
          { rotulo: `Share digital de ${s.marca}`, universo: 'digital', ir: s41.id, irTexto: s41.titulo, valor: ok(dig) ? porcentaje(rival(dig).share) : null, nota: ok(dig) ? capital(puntosFrente(rival(dig).cambioPts, P) || `de ${solesCompacto(dig.total)} en total`) : null },
          { rotulo: `Inversión digital de ${s.marca}`, universo: 'digital', ir: s41.id, irTexto: s41.titulo, valor: ok(dig) ? solesCompacto(rival(dig).inversion) : null, nota: ok(dig) ? `${compacto(rival(dig).impresiones)} impresiones` : null },
          { rotulo: `Share ATL de ${s.marca}`, universo: 'atl', ir: s41.id, irTexto: s41.titulo, valor: ok(atl) ? porcentaje(rival(atl).share) : null, nota: ok(atl) ? capital(puntosFrente(rival(atl).cambioPts, P) || `de ${solesCompacto(atl.total)} en total`) : null },
          { rotulo: `Inversión ATL de ${s.marca}`, universo: 'atl', ir: s41.id, irTexto: s41.titulo, valor: ok(atl) ? solesCompacto(rival(atl).inversion) : null, nota: ok(atl) ? `${numero(rival(atl).spots)} emisiones` : null },
        ]} />

      <SeccionDe def={s41} vista={v}>
        {!ok(dig) && !ok(atl) ? <Bloque titulo="Share of investment" universo={['digital', 'atl']} estado={sinDato(dig.estado)} /> : (
          <Bloque universo={[...(ok(dig) ? ['digital'] : []), ...(ok(atl) ? ['atl'] : [])]} {...shareLectura(v)}
            ayuda={<p>Share of investment: la parte de la inversión de la categoría que pone cada marca. Digital es Facebook, Instagram, Google Search y YouTube; ATL es TV abierta, cable, radio, OTT y vía pública. Integrametrics estima cada uno con un método distinto, por eso no se suman.</p>}
            pie={<span>Inversión estimada por Integrametrics a precio de tarifa.</span>}>
            <div className="q-share-universos">
              {[['Digital', dig], ['ATL', atl]].map(([n, x]) => (
                <div key={n} className="q-pauta-marca">
                  <h4>{n}<span>{ok(x) ? `${solesCompacto(x.total)} entre las dos marcas` : 'no cargó'}</span></h4>
                  {ok(x) ? <ShareMarcas u={x} etiqueta={`Share de la inversión ${n === 'ATL' ? 'ATL' : 'digital'} por marca, antes y ahora`} rotuloA={rotuloA} />
                    : <p className="q-nota-bloque">Integrametrics {n === 'ATL' ? 'ATL' : 'digital'} no cargó: este universo no se muestra.</p>}
                </div>
              ))}
            </div>
          </Bloque>
        )}
        {(s.atl || s.digital) && (
          <Bloque universo={['atl', 'digital']} {...shareSemanalLectura(s)} alcance="semanas del año"
            ayuda={<p>La parte de la inversión de cada semana (lunes a domingo) que pone {s.marca}, en ATL y en digital, cada una sobre su propio universo. La primera y la última semana pueden estar incompletas.</p>}
            pie={<span>Inversión estimada por Integrametrics.</span>}>
            <Lineas etiqueta={`Share semanal de ${s.marca}, ATL y digital`} formato={(n) => porcentaje(n)} alto={240}
              series={[...(s.digital ? [{ nombre: 'Digital', resaltada: true, serie: s.digital }] : []), ...(s.atl ? [{ nombre: 'ATL', resaltada: false, serie: s.atl }] : [])]} />
          </Bloque>
        )}
        {(ok(dig) || ok(atl)) && (
          <Detalle id={`detalle-${s41.id}`} titulo="Detalle de cómo viene el período" bajada={`Integrametrics, ${periodoTexto(P)}.`} vistas={['la inversión y el share en soles', 'la inversión día por día']}>
            {ok(dig) && (
              <Bloque universo="digital" {...digitalLectura(v)} pie={<span>Facebook, Instagram, Google Search y YouTube.</span>}>
                <TablaShare u={dig} etiqueta="Inversión, impresiones y share digital por marca" conImpresiones />
              </Bloque>
            )}
            {ok(atl) && (
              <Bloque universo="atl" {...atlLectura(v)} pie={<span>TV abierta, cable, radio, OTT y vía pública.</span>}>
                <TablaShare u={atl} etiqueta="Inversión y share ATL por marca" />
              </Bloque>
            )}
          {ok(u) && (
            <Bloque universo={diario} {...presionLectura(v, diario)}
              pie={<span>Inversión estimada por Integrametrics. Un día sin registros queda como hueco, no como cero.</span>}>
              <div className="q-control q-control-tarjeta"><span>Universo</span><Grupo etiqueta="Universo" valor={diario} onCambiar={setDiario} opciones={opcionesDiario} /></div>
              <Lineas etiqueta={`Inversión ${diario === 'atl' ? 'ATL' : 'digital'} por día y por marca`} formato={solesCompacto}
                series={[...u.marcas].sort((a, b) => Number(a.foco) - Number(b.foco)).map((m) => ({ nombre: m.nombre, resaltada: m.foco, tono: m.propia ? 'propia' : undefined, serie: u.diaria.map((d) => ({ fecha: d.fecha, valor: d.valores[m.id] })) }))} />
            </Bloque>
          )}
          </Detalle>
        )}
      </SeccionDe>
    </MarcoCapa>
  );
}
