// Capa 3 · Piezas y campañas: lo que reporta cada plataforma, por campaña, conjunto y pieza, con un estado por fila
// (src/calculo/piezas.js). Arriba, cuánto de la inversión está en cada estado; abajo, las filas según la opción de
// diseño en revisión: A tarjetas, B tabla por campaña, C mapa de inversión y costo. No calcula: pinta la vista.
import { useState } from 'react';
import { ChevronDown, ChevronRight, TriangleAlert, ArrowUp, BatteryLow, CircleCheck, Minus, Hourglass, CircleDashed, Play, Image as ImagenIcono, GalleryHorizontal, Type } from 'lucide-react';
import { Bloque, Tabla, Grupo, Detalle, Insignia, vigente } from '../sistema/Componentes.jsx';
import { Franja, Dispersion } from '../sistema/graficos/Graficos.jsx';
import { numero, porcentaje, dolares } from '../sistema/formato.js';
import { SeccionDe, sinDato } from './comun.jsx';
import { ESTADO_PIEZA, piezaDato, piezasLectura, piezasAyuda, monedaNota } from '../textos/lecturas.js';
import { ESTADOS, UMBRALES_PIEZAS } from '../calculo/piezas.js';
import { useOpcion } from '../opciones.jsx';

const INSIGNIA = {
  'sin-leads': ['grave', TriangleAlert], cara: ['alerta', ArrowUp], cansada: ['tinta', BatteryLow], rinde: ['bien', CircleCheck],
  'en-linea': ['neutro', Minus], aprendiendo: ['neutro', Hourglass], 'poca-data': ['neutro', CircleDashed],
};
const EstadoFila = ({ f }) => { const [tono, icono] = INSIGNIA[f.estado]; return <Insignia tono={tono} icono={icono}>{ESTADO_PIEZA[f.estado]}</Insignia>; };
const FORMATO = { Video: Play, Imagen: ImagenIcono, Carrusel: GalleryHorizontal, Texto: Type };
const costo = (n) => (n == null ? 'sin leads' : dolares(n));
const NIVELES = [{ valor: 'pieza', texto: 'Piezas' }, { valor: 'conjunto', texto: 'Conjuntos' }, { valor: 'campana', texto: 'Campañas' }];
const filasDe = (x, nivel) => (nivel === 'pieza' ? x.piezas : nivel === 'conjunto' ? x.conjuntos : x.campanas);
const donde = (f) => (f.nivel === 'pieza' ? `${f.plataformaNombre} · ${f.conjuntoNombre}` : f.nivel === 'conjunto' ? `${f.plataformaNombre} · ${f.campana}` : f.plataformaNombre);
const A_LA_VISTA = 9;

// A · Tarjetas: las que piden mirarse primero; cada una con su estado, su costo por lead frente al promedio y un dato
function Tarjetas({ filas }) {
  return (
    <ul className="q-piezas-tarjetas">
      {filas.slice(0, A_LA_VISTA).map((f) => {
        const Icono = FORMATO[f.formato];
        return (
          <li key={f.id} className={`q-pieza q-pieza-${f.estado}${f.alAire === false ? ' q-pieza-pausada' : ''}`}>
            <div className="q-pieza-cab"><EstadoFila f={f} />{f.nivel === 'pieza' && <span className="q-pieza-formato">{Icono && <Icono size={13} aria-hidden="true" />}{f.formato}</span>}</div>
            <h4>{f.nombre}{f.nivel === 'pieza' && !f.alAire && <span className="q-pieza-pausa"> · ya no está al aire</span>}</h4>
            <p className="q-pieza-donde">{donde(f)}</p>
            <p className="q-pieza-cifra"><b>{costo(f.cpl)}</b><span>por lead · promedio {dolares(f.base)}</span></p>
            <p className="q-pieza-dato">{piezaDato(f)}</p>
            <p className="q-pieza-pie">{dolares(f.inversion)} · {numero(f.leads)} leads{f.ctr != null ? ` · CTR ${porcentaje(f.ctr, 1)}` : ''}</p>
          </li>
        );
      })}
    </ul>
  );
}

// B · Tabla por campaña: cada campaña con sus conjuntos y sus piezas debajo, las que piden mirarse arriba
function TablaArbol({ x, plataforma }) {
  const campanas = x.campanas.filter((c) => !plataforma || c.plataforma === plataforma);
  // una campaña con algo que mirar empieza abierta; las demás, cerradas
  const conAlgo = (c) => x.piezas.some((p) => p.campana === c.id && ['sin-leads', 'cara', 'cansada'].includes(p.estado));
  const [abiertas, setAbiertas] = useState(() => new Set(campanas.filter(conAlgo).map((c) => c.id)));
  const alternar = (id) => setAbiertas((a) => { const n = new Set(a); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const fila = (f, nivel) => (
    <tr key={f.id} className={`q-arbol-${nivel}`}>
      <th scope="row">{nivel === 'campana' ? <button type="button" className="q-arbol-abrir" aria-expanded={abiertas.has(f.id)} onClick={() => alternar(f.id)}>{abiertas.has(f.id) ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />}<span className="q-arbol-nombre">{f.nombre}</span></button> : <span className="q-arbol-nombre">{f.nombre}</span>}{nivel === 'campana' && <span className="q-arbol-sub">{f.plataformaNombre}</span>}{nivel === 'conjunto' && f.limitado && <span className="q-arbol-sub">aprendizaje limitado</span>}</th>
      <td><EstadoFila f={f} /></td>
      <td className="q-num">{dolares(f.inversion)}</td>
      <td className="q-num">{numero(f.leads)}</td>
      <td className="q-num">{costo(f.cpl)}</td>
      <td className="q-num">{f.ctr == null ? 'sin dato' : porcentaje(f.ctr, 1)}</td>
      <td className="q-arbol-dato">{piezaDato(f)}</td>
    </tr>
  );
  return (
    <div className="q-tabla-marco" role="region" aria-label="Campañas, conjuntos y piezas" tabIndex={0}>
      <table className="q-tabla q-tabla-arbol">
        <thead><tr><th scope="col">Campaña, conjunto y pieza</th><th scope="col">Estado</th><th scope="col" className="q-num">Inversión</th><th scope="col" className="q-num">Leads</th><th scope="col" className="q-num">Costo por lead</th><th scope="col" className="q-num">CTR</th><th scope="col">Por qué</th></tr></thead>
        {campanas.map((c) => (
          <tbody key={c.id}>
            {fila(c, 'campana')}
            {abiertas.has(c.id) && x.conjuntos.filter((k) => k.campana === c.id).flatMap((k) => [fila(k, 'conjunto'), ...x.piezas.filter((p) => p.conjunto === k.id).map((p) => fila(p, 'pieza'))])}
          </tbody>
        ))}
      </table>
    </div>
  );
}

// C · Mapa: cada fila por su inversión y su costo por lead frente al promedio de su plataforma (100 = el promedio)
function Mapa({ filas, elegida, onElegir }) {
  const conPunto = filas.filter((f) => f.inversion > 0);
  // solo llevan nombre las que piden mirarse y las que rinden: el resto es el fondo contra el que se leen
  const puntos = conPunto.map((f) => ({ id: f.id, nombre: f.nombre, x: f.inversion, y: f.cpl == null ? 300 : (f.cpl / f.base) * 100, clase: `q-punto-${f.estado}`, sinRotulo: !['sin-leads', 'cara', 'cansada', 'rinde'].includes(f.estado), rotuloOpcional: true }));
  const f = conPunto.find((p) => p.id === elegida) ?? conPunto[0];
  return (
    <div className="q-piezas-mapa">
      <Dispersion puntos={puntos} elegido={f?.id} onElegir={onElegir} rotuloX="Inversión" rotuloY="Costo por lead (100 = promedio)" formatoX={dolares}
        formatoY={(v) => (v >= 300 ? 'sin leads' : numero(v))} etiqueta="Inversión y costo por lead de cada fila"
        ejeY={{ min: 0, max: 300, neutro: 100, marcas: [0, 50, 100, 150, 200, 300], formato: (v) => (v === 300 ? 'sin leads' : numero(v)) }}
        notas={{ neutro: 'el promedio', arriba: 'más caro', abajo: 'más barato' }} />
      {f && (
        <aside className="q-piezas-ficha" aria-live="polite">
          <EstadoFila f={f} />
          <h4>{f.nombre}</h4>
          <p className="q-pieza-donde">{donde(f)}</p>
          <p className="q-pieza-cifra"><b>{costo(f.cpl)}</b><span>por lead · promedio {dolares(f.base)}</span></p>
          <p className="q-pieza-dato">{piezaDato(f)}</p>
          <p className="q-pieza-pie">{dolares(f.inversion)} · {numero(f.leads)} leads{f.ctr != null ? ` · CTR ${porcentaje(f.ctr, 1)}` : ''}{f.frecuencia != null && f.plataforma !== 'google' ? ` · frecuencia ${numero(f.frecuencia, 1)}` : ''}</p>
        </aside>
      )}
    </div>
  );
}

export default function Piezas({ def, vista: v, cambios }) {
  const x = v.ejemplo.piezas;
  const opcion = useOpcion('piezas');
  const [plat, setPlat] = useState('todas');
  const [nivelElegido, setNivel] = useState('pieza');
  const [elegida, setElegida] = useState(null);
  if (!x) return <SeccionDe def={def} vista={v}><Bloque titulo="Piezas y campañas" universo="plataformas" estado={sinDato('sin-datos')} /></SeccionDe>;
  const opcionesPlat = [{ valor: 'todas', texto: 'Todas' }, ...x.bases.map((b) => ({ valor: b.id, texto: b.nombre }))];
  const plataforma = vigente(plat, opcionesPlat) === 'todas' ? null : plat;
  const nivel = opcion === 'b' ? 'campana' : vigente(nivelElegido, NIVELES);
  const de = (lista) => lista.filter((f) => !plataforma || f.plataforma === plataforma);
  const sub = { ...x, piezas: de(x.piezas), conjuntos: de(x.conjuntos), campanas: de(x.campanas) };
  sub.total = sub.piezas.reduce((s, p) => s + p.inversion, 0);
  // en la tabla por campaña, la franja y el título cuentan piezas, como las otras opciones
  const filas = filasDe(sub, opcion === 'b' ? 'pieza' : nivel);
  // cuánto de la inversión está en cada estado
  const partes = ESTADOS.map((e) => { const en = filas.filter((f) => f.estado === e); return { e, n: en.length, valor: en.reduce((s, f) => s + f.inversion, 0) }; })
    .filter((p) => p.n).map((p) => ({ nombre: `${ESTADO_PIEZA[p.e]} · ${numero(p.n)}`, valor: p.valor, pct: sub.total ? (p.valor / sub.total) * 100 : null, clase: `q-pe-${p.e}` }));
  const textos = piezasLectura(sub, opcion === 'b' ? 'pieza' : nivel);
  const pie = `${x.fuente}: sus leads no son los del CRM. ${monedaNota(cambios)}`;
  return (
    <SeccionDe def={def} vista={v}>
      <Bloque universo="plataformas" titulo={textos.titulo} lectura={textos.lectura} ejemplo
        ayuda={<p>{piezasAyuda(UMBRALES_PIEZAS)}</p>} pie={<span>{pie}</span>}>
        <div className="q-control q-control-tarjeta"><span>Plataforma</span><Grupo etiqueta="Plataforma" valor={plataforma ?? 'todas'} onCambiar={setPlat} opciones={opcionesPlat} /></div>
        {opcion !== 'b' && <div className="q-control q-control-tarjeta"><span>Ver</span><Grupo etiqueta="Ver" valor={nivel} onCambiar={setNivel} opciones={NIVELES} /></div>}
        <Franja partes={partes} etiqueta="La inversión según el estado de cada fila" verTabla={false} />
        {opcion === 'a' && <Tarjetas filas={filas} />}
        {opcion === 'b' && <TablaArbol x={sub} plataforma={plataforma} />}
        {opcion === 'c' && <Mapa filas={filas} elegida={elegida} onElegir={setElegida} />}
      </Bloque>
      <Detalle id={`detalle-${def.id}`} titulo="Detalle de piezas y campañas" bajada="Data de ejemplo, por conectar." vistas={['cada fila con su estado y sus cifras']}>
        <Bloque universo="plataformas" titulo={`Todas las ${nivel === 'pieza' ? 'piezas' : nivel === 'conjunto' ? 'conjuntos' : 'campañas'} del período`} ejemplo pie={<span>{pie}</span>}>
          <Tabla etiqueta="Cada fila con su estado" numericas={[2, 3, 4, 5]}
            columnas={['Nombre', 'Estado', 'Inversión', 'Leads', 'Costo por lead', 'CTR', 'Por qué']}
            filas={filas.map((f) => [{ texto: f.nombre, sub: donde(f) }, ESTADO_PIEZA[f.estado], dolares(f.inversion), numero(f.leads), costo(f.cpl), f.ctr == null ? 'sin dato' : porcentaje(f.ctr, 1), piezaDato(f)])} />
        </Bloque>
      </Detalle>
    </SeccionDe>
  );
}

