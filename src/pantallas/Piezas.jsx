// Capa 3 · Piezas y campañas: lo que reporta cada plataforma, por campaña, conjunto y pieza, con un estado por fila
// (src/calculo/piezas.js). Una tabla por campaña que se abre en sus conjuntos y sus piezas, como el administrador de
// anuncios: las campañas con algo que mirar empiezan abiertas. No calcula: pinta la vista.
import { useState } from 'react';
import { ChevronDown, ChevronRight, TriangleAlert, ArrowUp, BatteryLow, CircleCheck, Hourglass, CircleDashed } from 'lucide-react';
import { Bloque, Tabla, Grupo, Detalle, Insignia, vigente } from '../sistema/Componentes.jsx';
import { numero, dolares } from '../sistema/formato.js';
import { SeccionDe, sinDato } from './comun.jsx';
import { ESTADO_PIEZA, piezaDato, piezaPausa, piezasLectura, piezasAyuda, monedaNota } from '../textos/lecturas.js';
import { PARA_REVISAR, UMBRALES_PIEZAS } from '../calculo/piezas.js';

// cada estado en su pastilla: icono y palabra sobre su fondo, el color nunca va solo
const INSIGNIA = {
  'sin-leads': ['grave', TriangleAlert], costosa: ['alerta', ArrowUp], saturada: ['tinta', BatteryLow], rinde: ['bien', CircleCheck],
  aprendizaje: ['neutro', Hourglass], 'poca-data': ['neutro', CircleDashed],
};
const EstadoFila = ({ f }) => { const [tono, icono] = INSIGNIA[f.estado]; return <Insignia tono={tono} icono={icono}>{ESTADO_PIEZA[f.estado]}</Insignia>; };
const costo = (n) => (n == null ? 'sin leads' : dolares(n));

function TablaArbol({ x }) {
  // una campaña con algo que mirar empieza abierta; las demás, cerradas
  const conAlgo = (c) => x.piezas.some((p) => p.campana === c.id && PARA_REVISAR.includes(p.estado));
  const [abiertas, setAbiertas] = useState(() => new Set(x.campanas.filter(conAlgo).map((c) => c.id)));
  const alternar = (id) => setAbiertas((a) => { const n = new Set(a); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const fila = (f, nivel) => {
    const sub = nivel === 'campana' ? f.plataformaNombre : nivel === 'conjunto' && f.limitado ? 'Aprendizaje limitado' : piezaPausa(f);
    return (
      <tr key={f.id} className={`q-arbol-${nivel}${nivel === 'pieza' && !f.alAire ? ' q-arbol-pausada' : ''}`}>
        <th scope="row">
          {nivel === 'campana'
            ? <button type="button" className="q-arbol-abrir" aria-expanded={abiertas.has(f.id)} onClick={() => alternar(f.id)}>{abiertas.has(f.id) ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />}<span className="q-arbol-nombre">{f.nombre}</span></button>
            : <span className="q-arbol-nombre">{f.nombre}</span>}
          {sub && <span className="q-arbol-sub">{sub}</span>}
        </th>
        <td><EstadoFila f={f} /></td>
        <td className="q-num">{dolares(f.inversion)}</td>
        <td className="q-num">{numero(f.leads)}</td>
        <td className="q-num">{costo(f.cpl)}</td>
        <td className="q-arbol-dato">{piezaDato(f)}</td>
      </tr>
    );
  };
  return (
    <div className="q-tabla-marco" role="region" aria-label="Campañas, conjuntos y piezas" tabIndex={0}>
      <table className="q-tabla q-tabla-arbol">
        <thead><tr><th scope="col">Campaña, conjunto y pieza</th><th scope="col">Estado</th><th scope="col" className="q-num">Inversión</th><th scope="col" className="q-num">Leads</th><th scope="col" className="q-num">Costo por lead</th><th scope="col">Por qué</th></tr></thead>
        {x.campanas.map((c) => (
          <tbody key={c.id}>
            {fila(c, 'campana')}
            {abiertas.has(c.id) && x.conjuntos.filter((k) => k.campana === c.id).flatMap((k) => [fila(k, 'conjunto'), ...x.piezas.filter((p) => p.conjunto === k.id).map((p) => fila(p, 'pieza'))])}
          </tbody>
        ))}
      </table>
    </div>
  );
}

export default function Piezas({ def, vista: v, cambios }) {
  const x = v.ejemplo.piezas;
  const [plat, setPlat] = useState('todas');
  if (!x) return <SeccionDe def={def} vista={v}><Bloque titulo="Piezas y campañas" universo="plataformas" estado={sinDato('sin-datos')} /></SeccionDe>;
  const opciones = [{ valor: 'todas', texto: 'Todas' }, ...x.bases.map((b) => ({ valor: b.id, texto: b.nombre }))];
  const plataforma = vigente(plat, opciones) === 'todas' ? null : plat;
  const de = (lista) => lista.filter((f) => !plataforma || f.plataforma === plataforma);
  const sub = { ...x, piezas: de(x.piezas), conjuntos: de(x.conjuntos), campanas: de(x.campanas) };
  sub.total = sub.piezas.reduce((s, p) => s + p.inversion, 0);
  const textos = piezasLectura(sub);
  const pie = `${x.fuente}: sus leads no son los del CRM. ${monedaNota(cambios)}`;
  return (
    <SeccionDe def={def} vista={v}>
      <Bloque universo="plataformas" titulo={textos.titulo} lectura={textos.lectura} ejemplo
        ayuda={<p>{piezasAyuda(UMBRALES_PIEZAS)}</p>} pie={<span>{pie}</span>}>
        <div className="q-control q-control-tarjeta"><span>Plataforma</span><Grupo etiqueta="Plataforma" valor={plataforma ?? 'todas'} onCambiar={setPlat} opciones={opciones} /></div>
        <TablaArbol key={plataforma ?? 'todas'} x={sub} />
      </Bloque>
      <Detalle id={`detalle-${def.id}`} titulo="Detalle de las piezas" bajada="Data de ejemplo, por conectar." vistas={['cada pieza con su estado y sus cifras']}>
        <Bloque universo="plataformas" titulo="Todas las piezas del período" ejemplo pie={<span>{pie}</span>}>
          <Tabla etiqueta="Cada pieza con su estado" numericas={[2, 3, 4]}
            columnas={['Pieza', 'Estado', 'Inversión', 'Leads', 'Costo por lead', 'Por qué']}
            filas={sub.piezas.map((f) => [{ texto: f.nombre, sub: `${f.plataformaNombre} · ${f.conjuntoNombre}` }, ESTADO_PIEZA[f.estado], dolares(f.inversion), numero(f.leads), costo(f.cpl), piezaDato(f)])} />
        </Bloque>
      </Detalle>
    </SeccionDe>
  );
}
