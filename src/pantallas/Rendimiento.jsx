// Capa 4 · Rendimiento y optimización: cómo viene la presión publicitaria del período frente al anterior.
// Share of investment en ATL y en digital (universos distintos: lado a lado, nunca sumados) e inversión diaria.
import { Bloque, Tabla, Resumen } from '../sistema/Componentes.jsx';
import { Barras, Lineas } from '../sistema/graficos/Graficos.jsx';
import { numero, porcentaje, soles, solesCompacto, compacto } from '../sistema/formato.js';
import { MarcoCapa, SeccionDe, sinDato } from './comun.jsx';
import { periodoTexto, comparacionTexto, puntosFrente, capital } from '../textos/comun.js';
import { fraseShare, atlLectura, digitalLectura, presionLectura } from '../textos/lecturas.js';

const pts = (n) => (n == null ? 'sin comparación' : n === 0 ? 'igual' : `${n > 0 ? '+' : '−'}${numero(Math.abs(n))} pts`);

function TablaShare({ u, etiqueta, conImpresiones }) {
  return (
    <Tabla etiqueta={etiqueta} numericas={conImpresiones ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]} destacada={u.marcas.findIndex((m) => m.propia)}
      columnas={['Marca', 'Inversión estimada', ...(conImpresiones ? ['Impresiones'] : []), 'Share', 'Share antes', 'Cambio']}
      filas={u.marcas.map((m) => [m.nombre, soles(m.inversion), ...(conImpresiones ? [compacto(m.impresiones)] : []), porcentaje(m.share), m.sharePrevio == null ? 'sin dato' : porcentaje(m.sharePrevio),
        { texto: pts(m.cambioPts), tono: !m.propia || !m.cambioPts ? null : m.cambioPts > 0 ? 'mejora' : 'empeora' }])} />
  );
}

export default function Rendimiento({ capa, vista: v }) {
  const [s41] = capa.secciones;
  const P = v.periodo, atl = v.lee.atl, dig = v.lee.digital;
  const ok = (x) => x.estado === 'ok';
  const propia = (u) => u.marcas.find((m) => m.propia);
  const comparacion = comparacionTexto(P);
  return (
    <MarcoCapa capa={capa} vista={v}>
      <Resumen titulo={`Resumen de ${periodoTexto(P)}`}
        frases={[...(ok(atl) ? [{ segmentos: fraseShare(atl, 'ATL', P) }] : []), ...(ok(dig) ? [{ segmentos: fraseShare(dig, 'digital', P) }] : [])]}
        pie={<span>Inversión estimada por Integrametrics a precio de tarifa. {comparacion ? `Cada cambio compara ${periodoTexto(P)} con ${comparacion}.` : 'No hay un mes anterior en la data para comparar.'} ATL y digital se miden distinto: se leen lado a lado, no se suman.</span>}
        items={[
          { rotulo: 'Share ATL', universo: 'atl', ir: s41.id, irTexto: s41.titulo, valor: ok(atl) ? porcentaje(propia(atl).share) : null, nota: ok(atl) ? capital(puntosFrente(propia(atl).cambioPts, P) || `de ${solesCompacto(atl.total)} en total`) : null },
          { rotulo: 'Inversión ATL', universo: 'atl', ir: s41.id, irTexto: s41.titulo, valor: ok(atl) ? solesCompacto(propia(atl).inversion) : null, nota: ok(atl) ? `${numero(propia(atl).spots)} emisiones` : null },
          { rotulo: 'Share digital', universo: 'digital', ir: s41.id, irTexto: s41.titulo, valor: ok(dig) ? porcentaje(propia(dig).share) : null, nota: ok(dig) ? capital(puntosFrente(propia(dig).cambioPts, P) || `de ${solesCompacto(dig.total)} en total`) : null },
          { rotulo: 'Inversión digital', universo: 'digital', ir: s41.id, irTexto: s41.titulo, valor: ok(dig) ? solesCompacto(propia(dig).inversion) : null, nota: ok(dig) ? `${compacto(propia(dig).impresiones)} impresiones` : null },
        ]} />

      <SeccionDe def={s41} vista={v}>
        {!ok(atl) ? <Bloque titulo="Share of investment ATL" universo="atl" estado={sinDato(atl.estado)} /> : (
          <Bloque universo="atl" ancho="mitad" {...atlLectura(v)}
            ayuda={<p>Share of investment: la parte de la inversión de la categoría que pone cada marca. Integrametrics estima la inversión con la tarifa de cada medio (inversión bruta), no con lo que se pagó.</p>}
            pie={<span>TV abierta, cable, radio, OTT y vía pública. Raya gris: el share en {comparacion || 'la comparación'}.</span>}>
            <Barras etiqueta="Share de la inversión ATL por marca" formato={(n) => porcentaje(n)} max={100} resaltar={propia(atl).nombre} rotuloPrevio={comparacion ? `${capital(comparacion)}` : undefined}
              filas={atl.marcas.map((m) => ({ nombre: m.nombre, valor: m.share, previo: m.sharePrevio }))} />
            <TablaShare u={atl} etiqueta="Inversión y share ATL por marca" />
          </Bloque>
        )}
        {!ok(dig) ? <Bloque titulo="Share of investment digital" universo="digital" estado={sinDato(dig.estado)} /> : (
          <Bloque universo="digital" ancho="mitad" {...digitalLectura(v)}
            ayuda={<p>Inversión digital estimada por Integrametrics en Facebook, Instagram, Google Search y YouTube. Se mide distinto que la ATL, por eso no se suman.</p>}
            pie={<span>Raya gris: el share en {comparacion || 'la comparación'}.</span>}>
            <Barras etiqueta="Share de la inversión digital por marca" formato={(n) => porcentaje(n)} max={100} resaltar={propia(dig).nombre} rotuloPrevio={comparacion ? `${capital(comparacion)}` : undefined}
              filas={dig.marcas.map((m) => ({ nombre: m.nombre, valor: m.share, previo: m.sharePrevio }))} />
            <TablaShare u={dig} etiqueta="Inversión, impresiones y share digital por marca" conImpresiones />
          </Bloque>
        )}
        {ok(atl) && (
          <Bloque universo="atl" {...presionLectura(v)}
            pie={<span>Inversión ATL estimada de cada día, en soles, en la misma escala para las dos marcas. Un día sin registros es un hueco, no un cero.</span>}>
            <Lineas etiqueta="Inversión ATL por día y por marca" formato={solesCompacto}
              series={atl.marcas.map((m) => ({ nombre: m.nombre, resaltada: m.propia, serie: atl.diaria.map((d) => ({ fecha: d.fecha, valor: d.valores[m.id] })) }))} />
          </Bloque>
        )}
      </SeccionDe>
    </MarcoCapa>
  );
}
