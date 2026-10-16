// Gráficos de Quincha. SVG propio: cada marca lleva data-valor para que la prueba de humo cruce
// lo dibujado contra la capa de cálculo. Todo color sale de los tokens (clases en graficos.css).
// Ninguno calcula datos: reciben valores ya armados por src/calculo.
import { useId, useState } from 'react';
import { lineal, marcas, camino, area, ultimoConValor, margenRotulos, recortar, separar, useAncho, escalon } from './util.js';
import { numero, fecha, fechaSinAnio, fechaCorta, mesCorto, mesAnio, porcentaje } from '../formato.js';

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

// Envoltura: mide el ancho, pone una tabla para lectores de pantalla y la pista flotante.
// Toda marca o zona con data-pista muestra su texto al pasar el puntero o al enfocarla.
// verTabla={false} cuando la tarjeta ya muestra una tabla con lo mismo, justo debajo
export function Grafico({ etiqueta, tabla, children, className = '', verTabla = true }) {
  const [ref, ancho] = useAncho();
  const [pista, setPista] = useState(null);
  const mover = (e) => {
    const z = e.target.closest?.('[data-pista]');
    if (!z || !ref.current) return setPista(null);
    const caja = ref.current.getBoundingClientRect();
    setPista({ texto: z.getAttribute('data-pista'), x: e.clientX - caja.left, y: e.clientY - caja.top, ancho: caja.width });
  };
  return (
    <figure className={`q-grafico ${className}`} ref={ref} onPointerMove={mover} onPointerLeave={() => setPista(null)}>
      {children(ancho)}
      {pista && (
        <div className="q-pista" role="presentation" style={{ left: Math.min(Math.max(pista.x, 90), pista.ancho - 90), top: pista.y }}>
          {pista.texto.split('\n').map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
      {tabla && verTabla && (
        <details className="q-ver-tabla">
          <summary>Ver como tabla</summary>
          <div className="q-tabla-marco" aria-hidden="true">
            <table className="q-tabla">
              <thead><tr>{tabla.columnas.map((c, j) => <th key={c + j} scope="col" className={j ? 'q-num' : undefined}>{c}</th>)}</tr></thead>
              <tbody>{tabla.filas.map((f, i) => <tr key={i}>{f.map((v, j) => (j ? <td key={j} className="q-num">{v}</td> : <th key={j} scope="row">{v}</th>))}</tr>)}</tbody>
            </table>
          </div>
        </details>
      )}
      {tabla && (
        <div className="solo-lector">{/* una tabla no recorta su contenido: el contenedor sí */}
          <table>
            <caption>{etiqueta}</caption>
            <thead><tr>{tabla.columnas.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
            <tbody>{tabla.filas.map((f, i) => <tr key={i}>{f.map((v, j) => (j ? <td key={j}>{v}</td> : <th key={j} scope="row">{v}</th>))}</tr>)}</tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

// El rayado (pocos casos) usa un id único por gráfico: nunca dos patrones con el mismo id en la página
function Svg({ ancho, alto, etiqueta, children }) {
  const id = 'q-rayado-' + useId().replace(/:/g, '');
  return (
    <svg className="q-svg" viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} role="img" aria-label={etiqueta} style={{ '--rayado': `url(#${id})` }}>
      <defs>
        <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
          <rect className="q-rayado-fondo" width="5" height="5" />
          <line x1="0" y1="0" x2="0" y2="5" className="q-rayado-linea" />
        </pattern>
      </defs>
      {children}
    </svg>
  );
}

// Zonas de lectura: franjas invisibles más grandes que la marca, una por punto o por fila
const Zona = ({ x, y, w, h, pista }) => <rect className="q-zona" x={x} y={y} width={Math.max(1, w)} height={Math.max(1, h)} data-pista={pista} />;

// ─────────────── Línea con período de comparación en gris y eventos al pie ───────────────
export function Linea({ serie, previa, eventos = [], formato = numero, alto: altoPedido, etiqueta, rotuloX = 'dia' }) {
  const tabla = { columnas: ['Fecha', 'Valor', ...(previa ? ['Comparación'] : [])], filas: serie.map((p, i) => [fechaCorta(p.fecha), formato(p.valor), ...(previa ? [formato(previa[i]?.valor)] : [])]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const alto = altoPedido || Math.round(Math.min(280, Math.max(200, ancho * 0.42)));
        const m = { t: 18, r: 56, b: 26, l: 44 };
        const vals = [...serie, ...(previa || [])].map((p) => p.valor).filter((v) => v != null);
        const ys = marcas(Math.max(...vals, 1));
        const x = lineal(0, serie.length - 1, m.l, ancho - m.r), y = lineal(0, ys.at(-1), alto - m.b, m.t);
        const iu = ultimoConValor(serie);
        const ip = previa ? ultimoConValor(previa) : -1;
        // sin serie previa, el rótulo final va a la altura de su punto
        const [ya, yb] = iu >= 0 && ip >= 0 ? separar([y(serie[iu].valor) + 4, y(previa[ip].valor) + 4], 14) : [iu >= 0 ? y(serie[iu].valor) + 4 : 0];
        const paso = Math.max(1, Math.ceil(56 / ((ancho - m.l - m.r) / Math.max(1, serie.length - 1))));
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {ys.map((v) => <g key={v}><line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={y(v)} y2={y(v)} /><text className="q-eje" x={m.l - 8} y={y(v) + 4} textAnchor="end">{formato(v)}</text></g>)}
            <path className="q-area" d={area(serie, x, y, y(0))} />
            {serie.map((p, i) => {
              const mostrar = rotuloX === 'mes' ? i % paso === 0 : rotuloX === 'semana' ? i % Math.max(paso, 4) === 0 : (serie.length <= 45 ? i % Math.max(7, paso) === 0 : p.fecha.endsWith('-01'));
              return mostrar ? <text key={p.fecha} className="q-eje" x={x(i)} y={alto - 8} textAnchor="middle">{rotuloX === 'mes' ? mesCorto(+p.fecha.slice(5, 7)) : fechaCorta(p.fecha)}</text> : null;
            })}
            {serie.map((p, i) => <Zona key={'z' + p.fecha} x={x(i) - (x(1) - x(0)) / 2} y={m.t} w={x(1) - x(0)} h={alto - m.b - m.t} pista={`${fecha(p.fecha)}\n${formato(p.valor)}${previa ? `\ncomparación: ${formato(previa[i]?.valor)}` : ''}`} />)}
            {eventos.map((e) => { const i = serie.findIndex((p) => p.fecha === e.fecha); return i < 0 ? null : <g key={e.fecha} className="q-evento"><line x1={x(i)} x2={x(i)} y1={m.t} y2={alto - m.b} /><text x={x(i) + 4} y={m.t + 10}>{e.texto}</text></g>; })}
            {serie.map((p, i) => (p.valor == null && serie.slice(0, i).some((q) => q.valor != null) && serie.slice(i + 1).some((q) => q.valor != null) ? <rect key={'h' + p.fecha} className="q-hueco" x={x(i) - 3} y={m.t} width={6} height={alto - m.b - m.t} /> : null))}
            {previa && <path className="q-linea-previa" d={camino(previa, x, y)} />}
            <path className="q-linea" d={camino(serie, x, y)} />
            {serie.map((p, i) => (p.valor != null ? <circle key={p.fecha} className="q-punto-oculto" cx={x(i)} cy={y(p.valor)} r="3" data-fecha={p.fecha} data-valor={p.valor} /> : null))}
            {iu >= 0 && <><circle className="q-punto-final" cx={x(iu)} cy={y(serie[iu].valor)} r="4" /><text className="q-rotulo-final" x={x(iu) + 8} y={ya}>{formato(serie[iu].valor)}</text></>}
            {ip >= 0 && <text className="q-rotulo-previo" x={x(ip) + 8} y={yb}>{formato(previa[ip].valor)}</text>}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Pequeños múltiplos con eje común ───────────────
// tono 'tinta': series que no son de ninguna marca del panel (las marcas de cámaras), en tinta y no en el color del foco
export function Multiplos({ paneles, formato = numero, etiqueta, tono }) {
  const max = Math.max(1, ...paneles.flatMap((p) => p.serie.map((s) => s.valor ?? 0)));
  return (
    <div className="q-multiplos" role="group" aria-label={etiqueta}>
      {paneles.map((p) => (
        <Grafico key={p.nombre} etiqueta={p.nombre} className="q-multiplo">
          {(ancho) => {
            const alto = 96, m = { t: 6, r: 40, b: 4, l: 2 };
            const ys = marcas(max, 2);
            const x = lineal(0, p.serie.length - 1, m.l, ancho - m.r), y = lineal(0, ys.at(-1), alto - m.b, m.t);
            const iu = ultimoConValor(p.serie);
            return (
              <>
                <figcaption className="q-multiplo-cab"><span>{p.nombre}</span><span className="q-nota">{p.nota}</span></figcaption>
                <Svg ancho={ancho} alto={alto} etiqueta={p.nombre}>
                  <line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={y(0)} y2={y(0)} />
                  <path className={tono === 'tinta' ? 'q-linea-tinta' : 'q-linea'} d={camino(p.serie, x, y)} />
                  {iu >= 0 && <><circle className={tono === 'tinta' ? 'q-punto-final-tinta' : 'q-punto-final'} cx={x(iu)} cy={y(p.serie[iu].valor)} r="3" data-valor={p.serie[iu].valor} /><text className="q-rotulo-final" x={x(iu) + 6} y={y(p.serie[iu].valor) + 4}>{formato(p.serie[iu].valor)}</text></>}
                </Svg>
              </>
            );
          }}
        </Grafico>
      ))}
    </div>
  );
}

// ─────────────── Pesas: dos valores de la misma escala por fila ───────────────
// tonoA='propia': el punto A es la marca propia (en su rojo, lleno) y no una comparación. Cada fila puede llevar
// tono 'propia' o 'resto' para su punto B; sin tono, B va en el color de foco.
export function Pesas({ filas, formato = numero, max, min = 0, rotuloA, rotuloB, centro = min < 0 ? 0 : null, etiqueta, tonoA }) {
  const tabla = { columnas: ['', rotuloA, rotuloB], filas: filas.map((f) => [f.nombre, formato(f.a), formato(f.b)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const fila = 32, m = { t: 6, r: 64, b: 6, l: margenRotulos(filas.map((f) => f.nombre), ancho) };
        const alto = m.t + filas.length * fila + m.b + (centro != null ? 18 : 0);
        const tope = max ?? marcas(Math.max(1, ...filas.flatMap((f) => [f.a ?? 0, f.b ?? 0])), 4).at(-1);
        const x = lineal(min, tope, m.l, ancho - m.r);
        return (
          <>
          <ul className="q-leyenda q-leyenda-pesas" aria-hidden="true">
            <li><span className={`q-muestra ${tonoA === 'propia' ? 'q-muestra-propia' : 'q-muestra-previa'}`} />{rotuloA}</li>
            <li><span className="q-muestra q-muestra-actual" /><b>{rotuloB}</b></li>
          </ul>
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {filas.map((f, i) => {
              const cy = m.t + i * fila + fila / 2;
              return (
                <g key={f.nombre}>
                  <text className="q-rotulo-fila" x={m.l - 10} y={cy + 4} textAnchor="end">{recortar(f.nombre, m.l)}</text>
                  <Zona x={0} y={cy - fila / 2} w={ancho} h={fila} pista={`${f.nombre}\n${rotuloA}: ${formato(f.a)}\n${rotuloB}: ${formato(f.b)}`} />
                  <line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={cy} y2={cy} />
                  {centro != null && <line className="q-separador" x1={x(centro)} x2={x(centro)} y1={cy - 10} y2={cy + 10} />}
                  {f.a != null && f.b != null && <line className="q-pesa" x1={x(f.a)} x2={x(f.b)} y1={cy} y2={cy} />}
                  {f.a != null && <circle className={tonoA === 'propia' ? 'q-punto-propia' : 'q-punto-previo'} cx={x(f.a)} cy={cy} r={tonoA === 'propia' ? 6 : 5} data-valor={f.a} />}
                  {f.b != null && <circle className={f.tono === 'propia' ? 'q-punto-propia' : f.tono === 'resto' ? 'q-punto-actual-resto' : 'q-punto-actual'} cx={x(f.b)} cy={cy} r="6" data-valor={f.b} />}
                  {/* la cifra va junto a su punto (el del período): a la derecha si queda adelante de la comparación, si no a la izquierda */}
                  {/* a la izquierda solo si cabe sin pisar el nombre de la fila; si no, a la derecha del punto más alejado */}
                  {/* B a la izquierda de su punto si va detrás de A y cabe; si no, encima de su punto: entre los dos puntos
                      quedaría sobre la línea, y al lado del punto A se leería como la cifra de A */}
                  {f.b != null && !(tonoA === 'propia' && f.a != null && f.a > f.b && x(f.b) - m.l < 44 && x(f.a) - x(f.b) >= 12) && (() => {
                    const t = formato(f.b), ancho = t.length * 7.8;
                    if (f.a == null || f.b >= f.a) return <text className="q-rotulo-valor" x={x(Math.max(f.b, f.a ?? f.b)) + 12} y={cy + 4}>{t}</text>;
                    if (x(f.b) - m.l >= ancho + 16) return <text className="q-rotulo-valor" x={x(f.b) - 12} y={cy + 4} textAnchor="end">{t}</text>;
                    return <text className="q-rotulo-valor" x={x(f.b)} y={cy - 9} textAnchor="middle">{t}</text>;
                  })()}
                  {/* si A es la marca propia también lleva su cifra, del lado contrario a B; la que no cabe sin pisar algo queda en la tabla; si los puntos se tapan, solo va la de B */}
                  {tonoA === 'propia' && f.a != null && f.b != null && Math.abs(x(f.a) - x(f.b)) >= 12 && (f.a > f.b
                    ? <text className="q-rotulo-valor" x={x(f.a) + 12} y={cy + 4}>{formato(f.a)}</text>
                    : x(f.a) - m.l >= 44 && x(f.b) - x(f.a) > 16 && <text className="q-rotulo-valor" x={x(f.a) - 12} y={cy + 4} textAnchor="end">{formato(f.a)}</text>)}
                </g>
              );
            })}
            {centro != null && [min, centro, tope].map((t) => <text key={t} className="q-eje" x={x(t)} y={alto - 2} textAnchor="middle">{formato(t)}</text>)}
          </Svg>
          </>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Pendiente: dos momentos, una escala ───────────────
export function Pendiente({ filas, formato = numero, rotuloA, rotuloB, resaltar = [], etiqueta }) {
  const tabla = { columnas: ['', rotuloA, rotuloB], filas: filas.map((f) => [f.nombre, formato(f.a), formato(f.b)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const alto = 280, ml = Math.min(150, ancho * 0.36), mr = Math.min(150, ancho * 0.36), m = { t: 30, b: 14 };
        const tope = Math.max(1, ...filas.flatMap((f) => [f.a, f.b]));
        const y = lineal(0, tope, alto - m.b, m.t), xa = ml, xb = ancho - mr;
        const la = separar(filas.map((f) => y(f.a) + 4)), lb = separar(filas.map((f) => y(f.b) + 4));
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            <text className="q-eje" x={xa} y={14} textAnchor="middle">{rotuloA}</text><text className="q-eje" x={xb} y={14} textAnchor="middle">{rotuloB}</text>
            {filas.map((f, i) => {
              const r = resaltar.includes(f.nombre);
              return (
                <g key={f.nombre}>
                  <line className={r ? 'q-pendiente-tinta' : 'q-pendiente'} x1={xa} y1={y(f.a)} x2={xb} y2={y(f.b)} />
                  <circle className={r ? 'q-punto-tinta' : 'q-punto-previo'} cx={xa} cy={y(f.a)} r="4" data-valor={f.a} />
                  <circle className={r ? 'q-punto-tinta' : 'q-punto-previo'} cx={xb} cy={y(f.b)} r="4" data-valor={f.b} />
                  <text className={`q-rotulo-fila${r ? ' q-fuerte' : ''}`} x={xa - 8} y={la[i]} textAnchor="end">{recortar(f.nombre, ml - 40)} {formato(f.a)}</text>
                  <text className={`q-rotulo-fila${r ? ' q-fuerte' : ''}`} x={xb + 8} y={lb[i]}>{formato(f.b)} {recortar(f.nombre, mr - 40)}</text>
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Bala (Few 2013): valor, marca y bandas de un tono; el estado va escrito ───────────────
export function Bala({ filas, max, formato = numero, formatoEje, etiqueta }) {
  const tabla = { columnas: ['', 'Valor', 'Referencia'], filas: filas.map((f) => [f.nombre, formato(f.valor), formato(f.marca)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const angosto = ancho < 520;
        const fila = 44, m = { t: 6, r: angosto ? 76 : 132, b: 24, l: margenRotulos(filas.map((f) => f.nombre), ancho) };
        const alto = m.t + filas.length * fila + m.b;
        const x = lineal(0, max, m.l, ancho - m.r);
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {marcas(max, angosto ? 2 : 4).filter((v) => v <= max).map((v) => <text key={v} className="q-eje" x={x(v)} y={alto - 6} textAnchor="middle">{(formatoEje ?? formato)(v)}</text>)}
            {filas.map((f, i) => {
              const cy = m.t + i * fila;
              let desde = 0;
              return (
                <g key={f.nombre}>
                  <Zona x={0} y={cy} w={ancho} h={fila - 8} pista={`${f.nombre}\n${formato(f.valor)}${f.marca != null ? `\nreferencia: ${formato(f.marca)}` : ''}${f.estado ? `\n${f.estado}` : ''}`} />
                  {f.bandas.map((b, k) => { const r = <rect key={k} className={`q-banda q-banda-${f.bandas.length - 1 - k}`} x={x(desde)} y={cy + 4} width={Math.max(0, x(Math.min(b.hasta, max)) - x(desde))} height={fila - 16} />; desde = Math.min(b.hasta, max); return r; })}
                  {f.valor != null && <rect className="q-barra-valor" x={x(0)} y={cy + 12} width={Math.max(1, x(Math.min(f.valor, max)) - x(0))} height={fila - 32} data-valor={f.valor} />}
                  {f.marca != null && <line className="q-marca" x1={x(f.marca)} x2={x(f.marca)} y1={cy + 6} y2={cy + fila - 14} data-valor={f.marca} />}
                  <text className="q-rotulo-fila" x={m.l - 10} y={cy + fila / 2 + 1} textAnchor="end">{recortar(f.nombre, m.l)}</text>
                  <text className={`q-rotulo-valor${f.tono ? ' q-' + f.tono : ''}`} x={x(Math.min(max, Math.max(f.valor ?? 0, f.marca ?? 0))) + 8} y={cy + fila / 2 + 1}>{formato(f.valor)}{f.estado && !angosto ? ` ${f.estado}` : ''}</text>
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Barras ordenadas, con el valor de comparación como raya ───────────────
export function Barras({ filas, formato = numero, max: maxComun, margen, margenDer, resaltar, rotuloPrevio, etiqueta, tono }) {
  const hayPrevio = filas.some((f) => f.previo != null);
  const tabla = { columnas: ['', 'Valor', ...(hayPrevio ? ['Comparación'] : [])], filas: filas.map((f) => [f.nombre, formato(f.valor), ...(hayPrevio ? [f.previo == null ? 'sin dato' : formato(f.previo)] : [])]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const conPrevio = rotuloPrevio && filas.some((f) => f.previo != null);
        // en pantallas angostas la nota de cada fila se queda en la pista y en la tabla: la barra necesita el espacio
        const angosto = ancho < 480, conNota = !angosto && filas.some((f) => f.nota);
        const fila = 30, m = { t: conPrevio ? 26 : 4, r: margenDer ?? (conNota ? 156 : 72), b: 4, l: margen ?? Math.min(margenRotulos(filas.map((f) => f.nombre), ancho), Math.round(ancho * (angosto ? 0.38 : 0.5))) };
        const alto = m.t + filas.length * fila + m.b;
        const max = maxComun ?? Math.max(1, ...filas.flatMap((f) => [f.valor ?? 0, f.previo ?? 0]));
        const x = lineal(0, max, m.l, ancho - m.r);
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {conPrevio && <g><line className="q-raya-previa" x1={m.l + 1} x2={m.l + 1} y1={4} y2={18} /><text className="q-eje" x={m.l + 10} y={15}>{rotuloPrevio}</text></g>}
            {filas.map((f, i) => {
              const cy = m.t + i * fila;
              const r = resaltar && resaltar === f.nombre;
              return (
                <g key={f.nombre}>
                  <Zona x={0} y={cy} w={ancho} h={fila} pista={`${f.nombre}\n${f.valor == null ? f.nota || 'sin dato' : formato(f.valor) + (f.nota ? ` · ${f.nota}` : '')}${f.previo != null ? `\ncomparación: ${formato(f.previo)}` : ''}`} />
                  <text className={`q-rotulo-fila${r ? ' q-fuerte' : ''}`} x={m.l - 10} y={cy + fila / 2 + 4} textAnchor="end">{recortar(f.nombre, m.l)}</text>
                  {f.valor == null ? <text className="q-nota" x={m.l} y={cy + fila / 2 + 4}>{f.nota || 'sin dato'}</text> : <>
                    {f.valor > 0 && <rect className={tono === 'propia' ? 'q-barra-propia' : tono === 'resto' ? 'q-barra-resto-fuerte' : r ? 'q-barra-acento' : resaltar ? 'q-barra-resto' : 'q-barra'} x={x(0)} y={cy + 7} width={Math.max(1, x(f.valor) - x(0))} height={fila - 14} rx="2" data-valor={f.valor} />}
                    {f.previo != null && <line className="q-raya-previa" x1={x(f.previo)} x2={x(f.previo)} y1={cy + 3} y2={cy + fila - 3} data-valor={f.previo} />}
                    <text className="q-rotulo-valor" x={x(Math.max(f.valor, f.previo ?? 0)) + 8} y={cy + fila / 2 + 4}>{formato(f.valor)}{conNota && f.nota && <tspan className="q-nota"> · {f.nota}</tspan>}</text>
                  </>}
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Franja: partes de un todo, rótulo y leyenda con el mismo reparto ───────────────
// ─────────────── Reparto entre dos marcas: una barra de 100 % y, debajo, la misma barra de la comparación ───────────────
// Con dos marcas el share de una es el resto de la otra: una barra dice todo. La de antes va más fina y en el tono claro
// de cada marca, para que el cambio se lea comparando largos. Cada barra lleva su mes al inicio, en la misma línea.
// partes: [{ nombre, valor (0 a 100), clase, claseAntes }]
export function Reparto({ ahora, antes, rotuloAhora, rotuloAntes, etiqueta, formato = (p) => porcentaje(p) }) {
  const tabla = { columnas: ['Marca', rotuloAhora, ...(antes ? [rotuloAntes] : [])], filas: ahora.map((p, i) => [p.nombre, formato(p.valor), ...(antes ? [formato(antes[i]?.valor)] : [])]) };
  const barra = (partes, x, y, alto, ancho, clave) => {
    const total = partes.reduce((s, p) => s + (p.valor || 0), 0) || 1;
    let x0 = x;
    return partes.map((p, i) => {
      const w = ((p.valor || 0) / total) * ancho, gap = i && w > 0 ? 2 : 0;
      const r = w > 0 ? <rect key={clave + p.nombre} className={`q-parte ${clave === 'antes' ? p.claseAntes : p.clase}`} x={x0 + gap} y={y} width={Math.max(0, w - gap)} height={alto} rx="2" data-valor={p.valor} /> : null;
      x0 += w;
      return r;
    });
  };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const [a, b] = ahora, alto = antes ? 100 : 56;
        // la columna de los meses a la medida del nombre más largo; la barra arranca después
        const l = 12 + Math.ceil(Math.max(rotuloAhora.length, antes ? rotuloAntes.length : 0) * 8.4), w = ancho - l;
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            <text className="q-rotulo-valor" x={0} y={19}>{rotuloAhora}</text>
            {barra(ahora, l, 0, 28, w, 'ahora')}
            <text className="q-rotulo-valor" x={l} y={46}>{a.nombre} {formato(a.valor)}</text>
            <text className="q-rotulo-valor" x={ancho} y={46} textAnchor="end">{formato(b.valor)} {b.nombre}</text>
            {antes && <>
              <text className="q-eje" x={0} y={73}>{rotuloAntes}</text>
              {barra(antes, l, 62, 14, w, 'antes')}
              <text className="q-eje" x={l} y={94}>{formato(antes[0].valor)}</text>
              <text className="q-eje" x={ancho} y={94} textAnchor="end">{formato(antes[1].valor)}</text>
            </>}
          </Svg>
        );
      }}
    </Grafico>
  );
}

export function Franja({ partes, leyenda = true, etiqueta, formato = (p) => porcentaje(p), verTabla = true }) {
  const tabla = { columnas: ['Parte', 'Valor', '%'], filas: partes.map((p) => [p.nombre, numero(p.valor), p.pct == null ? '' : formato(p.pct)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla} verTabla={verTabla}>
      {(ancho) => {
        const total = partes.reduce((s, p) => s + p.valor, 0) || 1;
        let x0 = 0;
        return (
          <>
            <Svg ancho={ancho} alto={30} etiqueta={etiqueta}>
              {partes.map((p, i) => { const w = (p.valor / total) * ancho; const r = <rect key={p.nombre} className={`q-parte ${p.clase || 'q-p' + i}`} x={x0 + (i ? 2 : 0)} y={4} width={Math.max(0, w - (i ? 2 : 0))} height={22} data-valor={p.valor} />; x0 += w; return r; })}
            </Svg>
            {leyenda && <ul className="q-leyenda">{partes.map((p, i) => <li key={p.nombre}><span className={`q-muestra ${p.clase || 'q-p' + i}`} />{p.nombre} <b data-valor={p.pct ?? p.valor}>{p.pct == null ? numero(p.valor) : formato(p.pct)}</b>{p.nota && <span className="q-nota"> · {p.nota}</span>}</li>)}</ul>}
          </>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Etapas de una cohorte, desde una base común ───────────────
export function Etapas({ filas, etiqueta }) {
  const tabla = { columnas: ['Etapa', 'Personas', '% de la anterior'], filas: filas.map((f, i) => [f.nombre, numero(f.valor), i ? porcentaje((f.valor / filas[i - 1].valor) * 100) : '']) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const fila = 40, m = { t: 4, r: Math.min(170, Math.round(ancho * 0.4)), b: 4, l: margenRotulos(filas.map((f) => f.nombre), ancho) };
        const alto = m.t + filas.length * fila + m.b;
        const x = lineal(0, filas[0].valor || 1, m.l, ancho - m.r);
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {filas.map((f, i) => {
              const cy = m.t + i * fila;
              const tasa = i && filas[i - 1].valor ? f.valor / filas[i - 1].valor : null;
              return (
                <g key={f.nombre}>
                  <Zona x={0} y={cy} w={ancho} h={fila} pista={`${f.nombre}\n${numero(f.valor)}${tasa != null ? `\n${porcentaje(tasa * 100, 1)} de la anterior` : ''}`} />
                  <text className="q-rotulo-fila" x={m.l - 10} y={cy + fila / 2 + 4} textAnchor="end">{recortar(f.nombre, m.l)}</text>
                  <rect className={i === filas.length - 1 ? 'q-barra-acento' : 'q-barra-resto'} x={x(0)} y={cy + 9} width={Math.max(1, x(f.valor) - x(0))} height={fila - 18} rx="2" data-valor={f.valor} />
                  <text className="q-rotulo-valor" x={x(f.valor) + 8} y={cy + fila / 2 + 4}>{numero(f.valor)}{tasa != null && <tspan className="q-nota"> · {porcentaje(tasa * 100, tasa < 0.1 ? 1 : 0)} de la anterior</tspan>}</text>
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Retícula de 100: solo la parte que importa en color ───────────────
export function Reticula({ partes, cuadros, etiqueta }) {
  const tabla = { columnas: ['Parte', 'De cada 100'], filas: partes.map((p, i) => [p.nombre, cuadros[i]]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla} className="q-reticula">
      {(ancho) => {
        const lado = Math.max(14, Math.min(22, Math.floor(Math.min(ancho, 260) / 10)));
        let k = 0;
        return (
          <div className="q-reticula-cuerpo">
            <Svg ancho={lado * 10} alto={lado * 10} etiqueta={etiqueta}>
              {cuadros.flatMap((n, i) => Array.from({ length: n }, () => { const kk = k++; return <rect key={kk} className={`q-parte q-g${Math.min(i, 4)}`} x={(kk % 10) * lado} y={Math.floor(kk / 10) * lado} width={lado - 3} height={lado - 3} rx="2" />; }))}
            </Svg>
            <ul className="q-leyenda">{partes.map((p, i) => <li key={p.nombre}><span className={`q-muestra q-g${Math.min(i, 4)}`} />{p.nombre} <b data-valor={cuadros[i]}>{cuadros[i]}</b> de cada 100</li>)}</ul>
          </div>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Mapa de calor hora × día, con escala visible ───────────────
// tono: 'foco' o 'propia' pinta la rampa en el color de la marca; sin tono, en tinta
export function MapaCalor({ matriz, formato = numero, etiqueta, tono }) {
  const max = Math.max(...matriz.flat().filter((v) => v != null));
  const tabla = { columnas: ['Día', ...Array.from({ length: 24 }, (_, h) => `${h} h`)], filas: matriz.map((f, i) => [DIAS[i], ...f.map((v) => formato(v))]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla} className={tono ? `q-calor-${tono}` : ''}>
      {(ancho) => {
        const m = { t: 22, r: 4, b: 4, l: 78 }, ch = 26;
        const cw = (ancho - m.l - m.r) / 24, alto = m.t + 7 * ch + m.b;
        return (
          <>
            <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
              {Array.from({ length: 24 }, (_, h) => (h % (cw < 18 ? 6 : 3) === 0 ? <text key={h} className="q-eje" x={m.l + h * cw + cw / 2} y={14} textAnchor="middle">{h} h</text> : null))}
              {matriz.map((fila, i) => (
                <g key={i}>
                  <text className="q-rotulo-fila" x={m.l - 8} y={m.t + i * ch + ch / 2 + 4} textAnchor="end">{DIAS[i]}</text>
                  {fila.map((v, j) => { const e = escalon(v, max); return <rect key={j} className={e == null ? 'q-celda q-sin-dato' : `q-celda q-q${e}`} x={m.l + j * cw + 1} y={m.t + i * ch + 1} width={Math.max(1, cw - 2)} height={ch - 2} rx="2" data-valor={v ?? ''} data-pista={`${DIAS[i]}, ${j} h\n${formato(v)}`} />; })}
                </g>
              ))}
            </Svg>
            <div className="q-escala" aria-hidden="true"><span>{formato(0)}</span>{[0, 1, 2, 3, 4, 5, 6].map((k) => <i key={k} className={`q-q${k}`} />)}<span>{formato(max)}</span></div>
          </>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Dos columnas alineadas, cada una con su escala (nunca doble eje) ───────────────
export function Columnas({ filas, tituloA, tituloB, formatoA = numero, formatoB = numero, etiqueta }) {
  const tabla = { columnas: ['', tituloA, tituloB], filas: filas.map((f) => [f.nombre, formatoA(f.a), f.b == null ? 'sin dato' : formatoB(f.b)]) };
  const hayA = filas.some((f) => f.resaltarA), hayB = filas.some((f) => f.resaltarB);
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const fila = 34, l = margenRotulos(filas.map((f) => f.nombre), ancho), hueco = 24, m = { t: 30, b: 6 };
        const col = (ancho - l - hueco) / 2, alto = m.t + filas.length * fila + m.b;
        const maxA = Math.max(1, ...filas.flatMap((f) => [f.a ?? 0, f.metaA ?? 0])), maxB = Math.max(1, ...filas.map((f) => f.b ?? 0));
        const xa = lineal(0, maxA, l, l + col - 70), xb = lineal(0, maxB, l + col + hueco, ancho - 70);
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            <text className="q-eje q-fuerte" x={l} y={14}>{tituloA}</text><text className="q-eje q-fuerte" x={l + col + hueco} y={14}>{tituloB}</text>
            <line className="q-separador" x1={l + col + hueco / 2} x2={l + col + hueco / 2} y1={m.t - 6} y2={alto - m.b} />
            {filas.map((f, i) => {
              const cy = m.t + i * fila;
              return (
                <g key={f.nombre}>
                  <Zona x={0} y={cy} w={ancho} h={fila} pista={`${f.nombre}\n${tituloA}: ${formatoA(f.a)}${f.metaA != null ? ` (meta ${formatoA(f.metaA)})` : ''}\n${tituloB}: ${f.b == null ? 'sin dato' : formatoB(f.b)}${f.notaB ? ` ${f.notaB}` : ''}`} />
                  <text className={`q-rotulo-fila${f.resaltar ? ' q-fuerte' : ''}`} x={l - 10} y={cy + fila / 2 + 4} textAnchor="end">{recortar(f.nombre, l)}</text>
                  {f.a != null && <rect className={f.resaltarA ? 'q-barra-acento' : hayA ? 'q-barra-resto' : 'q-barra'} x={xa(0)} y={cy + 8} width={Math.max(1, xa(f.a) - xa(0))} height={fila - 16} rx="2" data-valor={f.a} />}
                  {f.metaA != null && <line className="q-marca" x1={xa(f.metaA)} x2={xa(f.metaA)} y1={cy + 4} y2={cy + fila - 4} data-valor={f.metaA} />}
                  <text className={`q-rotulo-valor${f.tonoA ? ' q-' + f.tonoA : ''}`} x={xa(Math.max(f.a ?? 0, f.metaA ?? 0)) + 6} y={cy + fila / 2 + 4}>{formatoA(f.a)}{f.notaA ? ` ${f.notaA}` : ''}</text>
                  {f.b != null && <rect className={f.pocosB ? 'q-barra-rayada' : f.resaltarB ? 'q-barra-acento' : hayB ? 'q-barra-resto' : 'q-barra'} x={xb(0)} y={cy + 8} width={Math.max(1, xb(f.b) - xb(0))} height={fila - 16} rx="2" data-valor={f.b} />}
                  <text className="q-rotulo-valor" x={(f.b != null ? xb(f.b) : xb(0)) + 6} y={cy + fila / 2 + 4}>{f.b == null ? 'sin dato' : formatoB(f.b)}{f.notaB && <tspan className="q-nota"> {f.notaB}</tspan>}</text>
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Acumulado del período contra una referencia (el mismo tramo de la comparación) ───────────────
export function Acumulado({ serie, formato = numero, etiqueta, rotuloReal = 'este período', rotuloRef = 'comparación' }) {
  const tabla = { columnas: ['Fecha', rotuloReal, rotuloRef], filas: serie.map((p) => [fechaCorta(p.fecha), formato(p.real), formato(p.plan)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const alto = Math.round(Math.min(240, Math.max(180, ancho * 0.36))), m = { t: 16, r: 92, b: 26, l: 64 };
        const ys = marcas(Math.max(1, ...serie.map((p) => Math.max(p.real ?? 0, p.plan ?? 0))));
        const x = lineal(0, serie.length - 1, m.l, ancho - m.r), y = lineal(0, ys.at(-1), alto - m.b, m.t);
        const plan = serie.map((p) => ({ valor: p.plan })), real = serie.map((p) => ({ valor: p.real }));
        const iu = ultimoConValor(real);
        const ip = ultimoConValor(plan);
        const [yr, yp] = separar([y(serie[iu]?.real ?? 0) + 4, y(serie[ip]?.plan ?? 0) + 4]);
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {ys.map((v) => <g key={v}><line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={y(v)} y2={y(v)} /><text className="q-eje" x={m.l - 8} y={y(v) + 4} textAnchor="end">{formato(v)}</text></g>)}
            <path className="q-area" d={area(real, x, y, y(0))} />
            {serie.map((p, i) => (i % 7 === 0 ? <text key={p.fecha} className="q-eje" x={x(i)} y={alto - 8} textAnchor="middle">{fechaCorta(p.fecha)}</text> : null))}
            {serie.map((p, i) => <Zona key={'z' + i} x={x(i) - (x(1) - x(0)) / 2} y={m.t} w={x(1) - x(0)} h={alto - m.b - m.t} pista={`${fecha(p.fecha)}\n${rotuloReal}: ${formato(p.real)}\n${rotuloRef}: ${formato(p.plan)}`} />)}
            <path className="q-linea-previa" d={camino(plan, x, y)} />
            <path className="q-linea" d={camino(real, x, y)} />
            {real.map((p, i) => (p.valor != null ? <circle key={i} className="q-punto-oculto" cx={x(i)} cy={y(p.valor)} r="3" data-valor={p.valor} /> : null))}
            {iu >= 0 && <><circle className="q-punto-final" cx={x(iu)} cy={y(serie[iu].real)} r="4" /><text className="q-rotulo-final" x={x(iu) + 8} y={yr}>{formato(serie[iu].real)}</text></>}
            {ip >= 0 && <text className="q-rotulo-previo" x={x(ip) + 8} y={yp}>{formato(serie[ip].plan)}</text>}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Dos líneas alineadas en el tiempo, cada una con su escala ───────────────
export function DosLineas({ a, b, etiqueta }) {
  return (
    <div className="q-dos-lineas" role="group" aria-label={etiqueta}>
      {[a, b].map((s, k) => (
        <Grafico key={s.nombre} etiqueta={s.nombre} className="q-linea-alineada">
          {(ancho) => {
            const alto = 120, m = { t: 22, r: 48, b: k ? 22 : 6, l: 44 };
            const ys = marcas(Math.max(1, ...s.serie.map((p) => p.valor ?? 0)), 2);
            const x = lineal(0, s.serie.length - 1, m.l, ancho - m.r), y = lineal(0, ys.at(-1), alto - m.b, m.t);
            const iu = ultimoConValor(s.serie);
            return (
              <Svg ancho={ancho} alto={alto} etiqueta={s.nombre}>
                <text className="q-eje q-fuerte" x={m.l} y={12}>{s.nombre}</text>
                {ys.map((v) => <g key={v}><line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={y(v)} y2={y(v)} /><text className="q-eje" x={m.l - 8} y={y(v) + 4} textAnchor="end">{s.formato(v)}</text></g>)}
                {k === 1 && s.serie.map((p, i) => (i % 8 === 0 ? <text key={p.fecha} className="q-eje" x={x(i)} y={alto - 6} textAnchor="middle">{mesAnio(p.fecha.slice(0, 7))}</text> : null))}
                {s.serie.map((p, i) => <Zona key={'z' + i} x={x(i) - (x(1) - x(0)) / 2} y={m.t} w={x(1) - x(0)} h={alto - m.b - m.t} pista={`semana del ${fechaSinAnio(p.fecha)}\n${s.formato(p.valor)}`} />)}
                <path className={k ? 'q-linea-2' : 'q-linea'} d={camino(s.serie, x, y)} />
                {s.serie.map((p, i) => (p.valor != null ? <circle key={i} className="q-punto-oculto" cx={x(i)} cy={y(p.valor)} r="3" data-valor={p.valor} /> : null))}
                {iu >= 0 && <text className="q-rotulo-final" x={x(iu) + 6} y={y(s.serie[iu].valor) + 4}>{s.formato(s.serie[iu].valor)}</text>}
              </Svg>
            );
          }}
        </Grafico>
      ))}
    </div>
  );
}

// ─────────────── Proyección: meses reales y meses proyectados con su banda ───────────────
export function Proyeccion({ historia, meses, formato = numero, etiqueta }) {
  const puntos = [...historia.map((h) => ({ mes: h.mes, real: h.real?.valor ?? null })), ...meses.map((m) => ({ mes: m.mes, real: m.real?.valor ?? null, central: m.central, baja: m.baja, alta: m.alta }))];
  const tabla = { columnas: ['Mes', 'Real', 'Proyección', 'Rango'], filas: puntos.map((p) => [mesAnio(p.mes), formato(p.real), p.central == null ? '' : formato(p.central), p.baja == null ? '' : `${formato(p.baja)} a ${formato(p.alta)}`]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const alto = 230, m = { t: 16, r: 24, b: 28, l: 56 };
        const ys = marcas(Math.max(1, ...puntos.flatMap((p) => [p.real ?? 0, p.alta ?? 0])));
        const paso = (ancho - m.l - m.r) / puntos.length, x = (i) => m.l + paso * i + paso / 2, y = lineal(0, ys.at(-1), alto - m.b, m.t);
        const ini = historia.length;
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {ys.map((v) => <g key={v}><line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={y(v)} y2={y(v)} /><text className="q-eje" x={m.l - 8} y={y(v) + 4} textAnchor="end">{formato(v)}</text></g>)}
            <rect className="q-zona-proyeccion" x={m.l + paso * ini} y={m.t} width={paso * meses.length} height={alto - m.b - m.t} />
            {puntos.map((p, i) => (
              <g key={p.mes}>
                <Zona x={x(i) - paso / 2} y={m.t} w={paso} h={alto - m.b - m.t} pista={`${mesAnio(p.mes)}${p.real != null ? `\nreal: ${formato(p.real)}` : ''}${p.central != null ? `\nproyección: ${formato(p.central)}\nrango: ${formato(p.baja)} a ${formato(p.alta)}` : ''}`} />
                <text className="q-eje" x={x(i)} y={alto - 8} textAnchor="middle">{mesAnio(p.mes)}</text>
                {p.alta != null && <><line className="q-banda-proy" x1={x(i)} x2={x(i)} y1={y(p.baja)} y2={y(p.alta)} data-baja={p.baja} data-alta={p.alta} /><circle className="q-punto-proy" cx={x(i)} cy={y(p.central)} r="5" data-valor={p.central} /></>}
                {p.real != null && <rect className="q-barra-real" x={x(i) - Math.min(14, paso * 0.3)} y={y(p.real)} width={Math.min(28, paso * 0.6)} height={alto - m.b - y(p.real)} rx="2" data-valor={p.real} />}
              </g>
            ))}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Columnas verticales: una medida por categoría ordenada (horas, días, tramos) ───────────────
// rotulo: si se pasa, cada barra lleva su cifra encima (pocas barras); si no, solo la más alta de las resaltadas
// Una cifra centrada sobre su marca, que se corre hacia adentro si en el borde no cabe
function Rotulo({ texto, cx, y, ancho }) {
  const medio = (String(texto).length * 7.8) / 2;
  const [x, ancla] = cx + medio > ancho - 2 ? [ancho - 2, 'end'] : cx - medio < 2 ? [2, 'start'] : [cx, 'middle'];
  return <text className="q-rotulo-valor" x={x} y={y} textAnchor={ancla}>{texto}</text>;
}

// max: un tope común cuando varios histogramas se comparan uno debajo de otro (la misma escala para todas las marcas)
// escala 'raiz': la altura sigue a la raíz cuadrada del valor. Sirve cuando dos marcas comparten escala y una invierte
// treinta veces menos: sus barras se ven y la que invierte más sigue siendo la más alta. La ayuda de la tarjeta lo dice.
export function Histograma({ barras, formato = numero, rotulo, resaltar = [], etiqueta, alto: altoPedido = 180, tono, max: maxComun, escala = 'lineal' }) {
  const tabla = { columnas: ['', 'Valor'], filas: barras.map((b) => [b.nombre, formato(b.valor)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const alto = altoPedido, m = { t: 22, r: 4, b: 24, l: 4 };
        const max = Math.max(1, maxComun ?? 0, ...barras.map((b) => b.valor ?? 0));
        const paso = (ancho - m.l - m.r) / barras.length, w = Math.max(2, paso - Math.min(8, paso * 0.28));
        const lin = lineal(0, escala === 'raiz' ? Math.sqrt(max) : max, alto - m.b, m.t);
        // una barra con valor nunca queda más baja que 2 px: lo que existe se ve
        const y = (v) => (v > 0 ? Math.min(lin(escala === 'raiz' ? Math.sqrt(v) : v), alto - m.b - 2) : lin(0));
        const cada = Math.ceil(30 / paso);
        // la cifra va sobre la barra más alta: de las resaltadas si las hay, si no de todas
        const candidatas = resaltar.length ? resaltar : barras.map((_, i) => i).filter((i) => barras[i].valor > 0);
        const tope = candidatas.length ? candidatas.reduce((a, i) => ((barras[i].valor ?? 0) > (barras[a].valor ?? 0) ? i : a), candidatas[0]) : -1;
        // la cifra va por encima de todas las barras que quedan debajo de su ancho, no solo de la suya: así no se les encima
        const sobre = (i, texto) => {
          const cx = m.l + i * paso + paso / 2, medio = (String(texto).length * 7.8) / 2;
          const debajo = barras.filter((_, j) => Math.abs(m.l + j * paso + paso / 2 - cx) < medio + paso / 2);
          return Math.max(12, Math.min(...debajo.map((d) => y(d.valor ?? 0))) - 6);
        };
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            <line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={y(0)} y2={y(0)} />
            {barras.map((b, i) => {
              const x = m.l + i * paso + (paso - w) / 2, r = resaltar.includes(i);
              return (
                <g key={b.nombre}>
                  <Zona x={m.l + i * paso} y={m.t} w={paso} h={alto - m.b - m.t} pista={`${b.nombre}\n${formato(b.valor)}`} />
                  {b.valor > 0 && <rect className={r ? (tono === 'propia' ? 'q-barra-propia' : tono === 'resto' ? 'q-barra-resto-fuerte' : 'q-barra-acento') : resaltar.length || tono === 'resto' ? 'q-barra-resto' : tono === 'propia' ? 'q-barra-propia' : 'q-barra'} x={x} y={y(b.valor)} width={w} height={y(0) - y(b.valor)} rx="2" data-valor={b.valor} />}
                  {/* rótulos a intervalo fijo; una barra resaltada fuera del intervalo se rotula solo si cabe */}
                  {(i % cada === 0 || (r && cada === 1)) && <text className={`q-eje${r ? ' q-fuerte' : ''}`} x={Math.max(x + w / 2, 12)} y={alto - 8} textAnchor="middle">{b.corto ?? b.nombre}</text>}
                  {(rotulo || i === tope) && <Rotulo texto={rotulo ? rotulo(b) : formato(b.valor)} cx={x + w / 2} y={rotulo ? y(b.valor ?? 0) - 6 : sobre(i, formato(b.valor))} ancho={ancho} />}
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Dispersión: dos medidas por marca, una escala por eje ───────────────
// x en escala logarítmica (cada marca del eje vale 10 veces la anterior): las cifras de interacción van de miles a
// decenas de miles. y de 0 a 100 con la raya de 50 (neutro). Cada punto se elige con clic o con el teclado; el
// elegido lleva anillo. La marca propia va en su color, más grande y con su nombre en negrita.
export function Dispersion({ puntos, elegido, onElegir, rotuloX, rotuloY, formatoX = numero, formatoY = numero, notas = {}, etiqueta }) {
  const tabla = { columnas: ['Marca', rotuloX, rotuloY], filas: puntos.map((p) => [p.nombre, formatoX(p.x), formatoY(p.y)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla} className="q-dispersion">
      {(ancho) => {
        const alto = Math.round(Math.max(260, Math.min(360, ancho * 0.56)));
        const m = { t: 28, r: 20, b: 46, l: 34 };
        const lo = Math.floor(Math.log10(Math.min(...puntos.map((p) => p.x))));
        const hi = Math.max(lo + 1, Math.ceil(Math.log10(Math.max(...puntos.map((p) => p.x)))));
        const x = (v) => m.l + ((Math.log10(v) - lo) / (hi - lo)) * (ancho - m.l - m.r);
        const y = lineal(0, 100, alto - m.b, m.t);
        // Rótulos: a la derecha del punto; si chocan con uno ya puesto, a la izquierda, luego abajo, luego arriba
        const puestos = [];
        const cajaDe = (p, lado) => {
          // el rótulo arranca fuera del anillo de elección, para que nunca lo pise
          const w = p.nombre.length * 7.8 + 4, cx = x(p.x), cy = y(p.y), d = (p.propia ? 12 : 10) + 6;
          if (lado === 'der') return { x0: cx + d, x1: cx + d + w, y0: cy - 8, y1: cy + 6, tx: cx + d, ty: cy + 4, ancla: 'start' };
          if (lado === 'izq') return { x0: cx - d - w, x1: cx - d, y0: cy - 8, y1: cy + 6, tx: cx - d, ty: cy + 4, ancla: 'end' };
          if (lado === 'aba') return { x0: cx - w / 2, x1: cx + w / 2, y0: cy + d, y1: cy + d + 14, tx: cx, ty: cy + d + 11, ancla: 'middle' };
          return { x0: cx - w / 2, x1: cx + w / 2, y0: cy - d - 14, y1: cy - d, tx: cx, ty: cy - d - 3, ancla: 'middle' };
        };
        const choca = (c) => c.x1 > ancho - 2 || c.x0 < m.l || puestos.some((o) => c.x0 < o.x1 && c.x1 > o.x0 && c.y0 < o.y1 && c.y1 > o.y0)
          || puntos.some((q) => { const qx = x(q.x), qy = y(q.y); return qx > c.x0 - 5 && qx < c.x1 + 5 && qy > c.y0 - 5 && qy < c.y1 + 5; });
        const rotulos = new Map();
        [...puntos].sort((a, b) => (b.propia ? 1 : 0) - (a.propia ? 1 : 0) || a.x - b.x).forEach((p) => {
          const c = ['der', 'izq', 'aba', 'arr'].map((l) => cajaDe(p, l)).find((k) => !choca(k)) || cajaDe(p, 'der');
          puestos.push(c); rotulos.set(p.id, c);
        });
        const elegir = (id) => onElegir && onElegir(id);
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={'y' + v}>
                <line className={v === 50 ? 'q-neutro' : 'q-rejilla'} x1={m.l} x2={ancho - m.r} y1={y(v)} y2={y(v)} />
                <text className="q-eje" x={m.l - 8} y={y(v) + 4} textAnchor="end">{v}</text>
              </g>
            ))}
            {Array.from({ length: hi - lo + 1 }, (_, k) => 10 ** (lo + k)).map((v) => (
              <text key={'x' + v} className="q-eje" x={x(v)} y={alto - m.b + 18} textAnchor={v === 10 ** lo ? 'start' : v === 10 ** hi ? 'end' : 'middle'}>{numero(v)}</text>
            ))}
            <text className="q-eje" x={m.l} y={m.t - 12}>↑ {rotuloY}</text>
            <text className="q-eje" x={ancho - m.r} y={alto - 6} textAnchor="end">{rotuloX} →</text>
            {notas.neutro && <text className="q-nota" x={ancho - m.r} y={y(50) - 6} textAnchor="end">{notas.neutro}</text>}
            {notas.arriba && <text className="q-nota" x={ancho - m.r} y={m.t + 12} textAnchor="end">{notas.arriba}</text>}
            {notas.abajo && <text className="q-nota" x={m.l + 6} y={alto - m.b - 8}>{notas.abajo}</text>}
            {puntos.map((p) => {
              const r = rotulos.get(p.id), sel = p.id === elegido;
              return (
                <g key={p.id} className={`q-elegible${sel ? ' q-elegido' : ''}`} role="button" tabIndex={0} aria-pressed={sel}
                  aria-label={`${p.nombre}: ${formatoX(p.x)} de ${rotuloX.toLowerCase()}, ${formatoY(p.y)} de ${rotuloY.toLowerCase()}`}
                  onClick={() => elegir(p.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(p.id); } }}>
                  <circle className="q-blanco" cx={x(p.x)} cy={y(p.y)} r={16} data-pista={`${p.nombre}\n${rotuloX}: ${formatoX(p.x)}\n${rotuloY}: ${formatoY(p.y)}`} />
                  <circle className="q-anillo" cx={x(p.x)} cy={y(p.y)} r={p.propia ? 12 : 10} />
                  <circle className={p.propia ? 'q-punto q-punto-propio' : 'q-punto'} cx={x(p.x)} cy={y(p.y)} r={p.propia ? 7 : 5} data-valor={p.x} />
                  <text className={`q-rotulo-fila${p.propia || sel ? ' q-fuerte' : ''}`} x={r.tx} y={r.ty} textAnchor={r.ancla}>{p.nombre}</text>
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// Rótulos del eje de tiempo: hasta 45 puntos, uno por semana; con más, el primer punto de cada mes (semanas que
// empiezan cualquier día incluidas), sin pisarse: cada rótulo deja al menos 48 px con el anterior
function rotulosX(base, x) {
  if (base.length <= 45) {
    // un tramo corto lleva cada día; uno de tres semanas, cada tres; uno más largo, cada siete. Nunca más cerca de lo
    // que ocupa un rótulo («31 may»): en un celular se saltan
    const paso = base.length <= 10 ? 1 : base.length <= 21 ? 3 : 7;
    const out = [];
    base.forEach((p, i) => { if (i % paso === 0 && (!out.length || x(i) - x(out.at(-1).i) >= 56)) out.push({ i, texto: fechaCorta(p.fecha) }); });
    return out;
  }
  const out = [];
  base.forEach((p, i) => {
    if (i > 0 && p.fecha.slice(0, 7) === base[i - 1].fecha.slice(0, 7)) return;
    if (out.length && x(i) - x(out.at(-1).i) < 48) return;
    const m = +p.fecha.slice(5, 7);
    out.push({ i, texto: m === 1 || !out.length ? `${mesCorto(m)} ${p.fecha.slice(2, 4)}` : mesCorto(m) });
  });
  return out;
}

// El color de cada línea: la de foco en el color de la competencia, la propia en el suyo; las que no son de ninguna
// marca (las marcas de cámaras), en tinta, azul y menta (pares validados para daltonismo), y el resto en gris
const TONOS_LINEA = ['propia', 'tinta', 'azul', 'menta'];
const claseLinea = (s) => (s.resaltada ? 'q-linea' : TONOS_LINEA.includes(s.tono) ? `q-linea-${s.tono}` : 'q-linea-resto');
const clasePunto = (s) => (s.resaltada ? 'q-punto-final' : TONOS_LINEA.includes(s.tono) ? `q-punto-final-${s.tono}` : 'q-punto-final-resto');

// ─────────────── Varias series en la misma escala: la de foco resaltada, la propia en su color, el resto en gris ───────────────
// tono 'tinta': la serie principal cuando no es de ninguna marca (búsquedas de un rubro). discontinua: la misma marca en otro universo.
// Un día sin dato es un hueco en todas las series. Los nombres van en una leyenda arriba, a cualquier ancho, y el trazo
// usa todo el ancho: un rótulo al final de cada línea deja un margen muerto a la derecha y se apiña cuando las líneas terminan juntas.
// elegible: una sola línea resaltada (en tonoElegida) y las demás en gris; se elige otra tocando su línea o su nombre
// en la leyenda. Para muchas series que no son de ninguna marca: un solo color se lee mejor que cinco.
// leyenda: el texto de cada serie en la leyenda, si no es su nombre («Ezviz +22 %»)
export function Lineas({ series: dadas, formato = numero, alto: altoPedido, etiqueta, elegible = false, elegidaInicial = 0, tonoElegida = 'tinta' }) {
  const [elegida, setElegida] = useState(elegidaInicial);
  const activa = Math.min(elegida, dadas.length - 1);
  const series = elegible ? dadas.map((s, k) => ({ ...s, resaltada: false, discontinua: false, tono: k === activa ? tonoElegida : 'resto' })) : dadas;
  const base = series[0]?.serie || [];
  const tabla = { columnas: ['Fecha', ...series.map((s) => s.nombre)], filas: base.map((p, i) => [fechaCorta(p.fecha), ...series.map((s) => formato(s.serie[i]?.valor))]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const alto = altoPedido || Math.round(Math.min(280, Math.max(200, ancho * 0.36)));
        const vals = series.flatMap((s) => s.serie.map((p) => p.valor)).filter((v) => v != null);
        const ys = marcas(Math.max(...vals, 1));
        // el margen izquierdo a la medida del rótulo del eje (S/ 1,0 M es más largo que S/ 50 mil)
        // la leyenda se acomoda por el largo de cada nombre: una fila nueva cuando el siguiente no cabe
        const leyenda = [];
        let x0 = 0, fila = 0;
        for (const s of series) {
          const largo = 30 + Math.ceil((s.leyenda ?? s.nombre).length * 7.8) + 20;
          if (x0 > 0 && x0 + largo > ancho - 4) { fila += 1; x0 = 0; }
          leyenda.push({ ...s, x: x0, fila });
          x0 += largo;
        }
        const filasLeyenda = leyenda.length ? leyenda.at(-1).fila + 1 : 0;
        // la leyenda elegible es un botón: cada fila mide 28 px de alto para que se pueda tocar con el dedo
        const pasoLeyenda = elegible ? 28 : 20, baseLeyenda = elegible ? 20 : 12;
        const m = { t: elegible ? 10 + 28 * filasLeyenda : 18 + 20 * filasLeyenda, r: 12, b: 26, l: Math.max(52, 14 + Math.ceil(Math.max(...ys.map((v) => formato(v).length)) * 7.8)) };
        const x = lineal(0, base.length - 1, m.l, ancho - m.r), y = lineal(0, ys.at(-1), alto - m.b, m.t);
        // la resaltada (o la elegida) se dibuja encima
        const orden = [...series].sort((a, b) => (elegible ? Number(a === series[activa]) - Number(b === series[activa]) : Number(a.resaltada) - Number(b.resaltada)));
        const elegir = (k) => (e) => { if (!e.key || e.key === 'Enter' || e.key === ' ') { e.preventDefault?.(); setElegida(k); } };
        // un toque sobre las líneas elige la más cercana al dedo en ese punto, no la que quedó dibujada encima
        const elegirCerca = (e) => {
          const svg = e.currentTarget.ownerSVGElement, ctm = svg?.getScreenCTM();
          if (!ctm) return;
          const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
          const i = Math.max(0, Math.min(base.length - 1, Math.round((p.x - m.l) / ((ancho - m.r - m.l) / Math.max(1, base.length - 1)))));
          let mejor = -1, dist = Infinity;
          series.forEach((s, k) => { const v = s.serie[i]?.valor; if (v != null && Math.abs(y(v) - p.y) < dist) { dist = Math.abs(y(v) - p.y); mejor = k; } });
          if (mejor >= 0) setElegida(mejor);
        };
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {ys.map((v) => <g key={v}><line className="q-rejilla" x1={m.l} x2={ancho - m.r} y1={y(v)} y2={y(v)} /><text className="q-eje" x={m.l - 8} y={y(v) + 4} textAnchor="end">{formato(v)}</text></g>)}
            {/* un rótulo de fecha en el borde se alinea hacia adentro para no salirse del gráfico */}
            {rotulosX(base, x).map(({ i, texto }) => { const medio = (texto.length * 7.8) / 2, cx = x(i); const anc = cx + medio > ancho - 2 ? 'end' : cx - medio < 2 ? 'start' : 'middle'; return <text key={base[i].fecha} className="q-eje" x={anc === 'end' ? ancho - 2 : anc === 'start' ? 2 : cx} y={alto - 8} textAnchor={anc}>{texto}</text>; })}
            {base.map((p, i) => (series.every((s) => s.serie[i]?.valor == null) && i > 0 && i < base.length - 1 ? <rect key={'h' + p.fecha} className="q-hueco" x={x(i) - 3} y={m.t} width={6} height={alto - m.b - m.t} /> : null))}
            {base.map((p, i) => <Zona key={'z' + p.fecha} x={x(i) - (x(1) - x(0)) / 2} y={m.t} w={x(1) - x(0)} h={alto - m.b - m.t} pista={`${fecha(p.fecha)}\n${series.map((s) => `${s.nombre}: ${formato(s.serie[i]?.valor)}`).join('\n')}`} />)}
            {orden.map((s) => <path key={s.nombre} className={`${claseLinea(s)}${s.discontinua ? ' q-discontinua' : ''}`} d={camino(s.serie, x, y)} />)}
            {/* un área de toque ancha sobre cada línea, para elegirla */}
            {elegible && series.map((s) => <path key={'t' + s.nombre} className="q-linea-toque" d={camino(s.serie, x, y)} onClick={elegirCerca} aria-hidden="true" />)}
            {leyenda.map((s, k) => (
              <g key={'l' + s.nombre} transform={`translate(${4 + s.x}, ${baseLeyenda + s.fila * pasoLeyenda})`} {...(elegible ? { role: 'button', tabIndex: 0, 'aria-pressed': k === activa, 'aria-label': `Resaltar ${s.nombre}`, className: 'q-leyenda-elegible', onClick: elegir(k), onKeyDown: elegir(k) } : {})}>
                {elegible && <rect className="q-leyenda-toque" x={-4} y={-18} width={34 + Math.ceil((s.leyenda ?? s.nombre).length * 7.8)} height={26} rx="4" />}
                <line className={`${claseLinea(s)}${s.discontinua ? ' q-discontinua' : ''}`} x1={0} x2={24} y1={-4} y2={-4} />
                <text className={`q-rotulo-final${s.resaltada || (s.tono && s.tono !== 'resto') ? '' : ' q-rotulo-resto'}`} x={30} y={0}>{s.leyenda ?? s.nombre}</text>
              </g>
            ))}
            {series.map((s) => {
              const i = ultimoConValor(s.serie);
              return i < 0 ? null : <circle key={'f' + s.nombre} className={clasePunto(s)} cx={x(i)} cy={y(s.serie[i].valor)} r="4" data-valor={s.serie[i].valor} />;
            })}
            {series.flatMap((s) => s.serie.map((p, i) => (p.valor != null ? <circle key={s.nombre + p.fecha} className="q-punto-oculto" cx={x(i)} cy={y(p.valor)} r="3" data-serie={s.nombre} data-fecha={p.fecha} data-valor={p.valor} /> : null)))}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Tiras: un día por celda, una fila por serie, cada fila con su escala ───────────────
// Para leer encendidos y apagados de una pauta en el año: cuándo se prende cada marca, no cuánto frente a la otra.
// Un día sin registros de la fuente va punteado (hueco), un día sin inversión va vacío. El período elegido se
// marca arriba con una llave.
export function Tiras({ filas, formato = numero, periodo, etiqueta }) {
  const dias = filas[0]?.serie.map((p) => p.fecha) || [];
  const tabla = { columnas: ['Serie', 'Días con inversión', 'Días con data', 'Total'], filas: filas.map((f) => [f.nombre, numero(f.diasConInversion), numero(f.diasConData), formato(f.total)]) };
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const angosto = ancho < 560;
        const m = { t: 34, r: 4, b: 4, l: angosto ? 96 : 150 }, alto1 = 22, hueco = 8;
        const grupos = filas.map((f, i) => (i > 0 && f.marca !== filas[i - 1].marca ? 12 : 0));
        const ys = filas.map((_, i) => m.t + i * (alto1 + hueco) + grupos.slice(0, i + 1).reduce((s, g) => s + g, 0));
        const alto = (ys.at(-1) ?? m.t) + alto1 + m.b;
        const cw = (ancho - m.l - m.r) / Math.max(1, dias.length);
        const xi = (i) => m.l + i * cw;
        const meses = dias.map((d, i) => [d, i]).filter(([d]) => d.endsWith('-01'));
        const pi = periodo ? [dias.findIndex((d) => d >= periodo.desde), dias.findLastIndex((d) => d <= periodo.hasta)] : null;
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {meses.map(([d, i]) => <g key={d}><line className="q-rejilla" x1={xi(i)} x2={xi(i)} y1={m.t - 6} y2={alto - m.b} /><text className="q-eje" x={xi(i) + 3} y={m.t - 10}>{mesCorto(+d.slice(5, 7))}</text></g>)}
            {pi && pi[0] >= 0 && <g className="q-llave"><path d={`M${xi(pi[0])} ${m.t - 24}v-4h${xi(pi[1] + 1) - xi(pi[0])}v4`} /><text x={(xi(pi[0]) + xi(pi[1] + 1)) / 2} y={m.t - 30} textAnchor="middle">{periodo.nombre}</text></g>}
            {filas.map((f, k) => {
              const max = Math.max(1, ...f.serie.map((p) => p.valor ?? 0));
              return (
                <g key={f.id}>
                  <text className={`q-rotulo-fila${f.foco ? ' q-fuerte' : ''}`} x={m.l - 10} y={ys[k] + alto1 / 2 + 4} textAnchor="end">{recortar(f.nombre, m.l)}</text>
                  {f.serie.map((p, i) => {
                    const e = p.valor > 0 ? escalon(p.valor, max) : null;
                    const clase = p.valor == null ? 'q-celda q-sin-dato' : p.valor === 0 ? 'q-celda q-celda-cero' : `q-celda q-q${Math.max(1, e)}`;
                    return <rect key={p.fecha} className={clase} x={xi(i)} y={ys[k]} width={Math.max(1, cw - (cw > 3 ? 1 : 0))} height={alto1} data-valor={p.valor ?? ''} data-pista={`${f.nombre}\n${fecha(p.fecha)}\n${p.valor == null ? 'sin registros de la fuente' : formato(p.valor)}`} />;
                  })}
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}

// ─────────────── Cronograma: cada versión como un tramo en el tiempo ───────────────
// Lleno: ATL (primera a última emisión). Contorno: digital (primera a última variante vista). El período elegido
// va con la superficie de capítulo detrás. Cada fila se abre con clic o con el teclado.
export function Cronograma({ filas, inicio, fin, periodo, formato = numero, onElegir, etiqueta }) {
  const tabla = { columnas: ['Versión', 'Universo', 'Desde', 'Hasta', 'Inversión'], filas: filas.map((f) => [f.nombre, f.universo === 'atl' ? 'ATL' : 'Digital', fechaCorta(f.desde), fechaCorta(f.hasta), formato(f.valor)]) };
  const t = (d) => new Date(`${d}T00:00:00Z`).getTime();
  return (
    <Grafico etiqueta={etiqueta} tabla={tabla}>
      {(ancho) => {
        const angosto = ancho < 560;
        const fila = 30, m = { t: 26, r: angosto ? 8 : 84, b: 6, l: angosto ? Math.round(ancho * 0.42) : Math.min(300, Math.round(ancho * 0.36)) };
        const alto = m.t + filas.length * fila + m.b;
        const x = lineal(t(inicio), t(fin), m.l, ancho - m.r);
        const meses = [];
        for (let d = new Date(`${inicio.slice(0, 7)}-01T00:00:00Z`); d.getTime() <= t(fin); d.setUTCMonth(d.getUTCMonth() + 1)) if (d.getTime() >= t(inicio)) meses.push(d.toISOString().slice(0, 10));
        return (
          <Svg ancho={ancho} alto={alto} etiqueta={etiqueta}>
            {periodo && <rect className="q-zona-periodo" x={x(t(periodo.desde))} y={m.t - 6} width={Math.max(2, x(t(periodo.hasta)) - x(t(periodo.desde)))} height={alto - m.t - m.b + 6} />}
            {meses.map((d) => <g key={d}><line className="q-rejilla" x1={x(t(d))} x2={x(t(d))} y1={m.t - 6} y2={alto - m.b} />{/* el mes que empieza pegado al borde (el mes en curso con pocos días) no lleva rótulo: no cabe */}{x(t(d)) + 30 <= ancho && <text className="q-eje" x={x(t(d)) + 3} y={14}>{mesCorto(+d.slice(5, 7))}</text>}</g>)}
            {filas.map((f, i) => {
              const cy = m.t + i * fila, x0 = x(t(f.desde)), x1 = Math.max(x0 + 4, x(t(f.hasta)) + 2);
              const pista = `${f.nombre}\n${f.universo === 'atl' ? 'ATL' : 'Digital'}${f.nota ? ` · ${f.nota}` : ''}\n${fechaCorta(f.desde)} a ${fechaCorta(f.hasta)}\n${formato(f.valor)}`;
              const elegir = () => onElegir && onElegir(f.id);
              return (
                <g key={f.id} className={onElegir ? 'q-elegible' : undefined} role={onElegir ? 'button' : undefined} tabIndex={onElegir ? 0 : undefined}
                  aria-label={onElegir ? `${f.nombre}, ${f.universo === 'atl' ? 'ATL' : 'digital'}, del ${fechaCorta(f.desde)} al ${fechaCorta(f.hasta)}. Ver la pieza` : undefined}
                  onClick={elegir} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(); } }}>
                  <rect className="q-zona" x={0} y={cy} width={ancho} height={fila} data-pista={pista} />
                  <text className="q-rotulo-fila" x={m.l - 10} y={cy + fila / 2 + 4} textAnchor="end">{recortar(f.nombre, m.l)}</text>
                  <rect className={f.universo === 'atl' ? 'q-tramo' : 'q-tramo q-tramo-contorno'} x={x0} y={cy + 8} width={x1 - x0} height={fila - 16} rx="3" data-valor={f.valor} />
                  {!angosto && <text className="q-rotulo-valor" x={ancho - m.r + 8} y={cy + fila / 2 + 4}>{formato(f.valor)}</text>}
                </g>
              );
            })}
          </Svg>
        );
      }}
    </Grafico>
  );
}
