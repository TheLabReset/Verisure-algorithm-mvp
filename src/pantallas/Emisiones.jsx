// TV y cable, o radio, de la competencia: la lista de emisiones del período y la ficha de la elegida, como la ficha de
// OOH: el digitalizado arriba (audio o video), el motivo y los datos de la emisión. Se filtra por tipo de aviso.
// No calcula: pinta lo que arma src/calculo/senales.js.
import { useMemo, useState } from 'react';
import { Grupo, Reproductor, vigente } from '../sistema/Componentes.jsx';
import { numero, soles, fechaCorta } from '../sistema/formato.js';
import { version, tipoAviso } from '../textos/comun.js';
import { FRANJAS } from '../calculo/vista.js';

function Ficha({ e }) {
  const [fallo, setFallo] = useState(false);
  const a = e.asset;
  return (
    <div className="q-ficha-panel" aria-live="polite">
      {a && !fallo ? <Reproductor key={e.id} tipo={a.kind === 'video' ? 'video' : 'audio'} src={a.url} etiqueta={`${a.kind === 'video' ? 'Video' : 'Audio'} de «${version(e.version)}»`} onError={() => setFallo(true)} />
        : <div className="q-ficha-arte q-ficha-arte-corta"><span className="q-ficha-sin-arte">{a ? 'El digitalizado de esta emisión no cargó' : 'Integrametrics no tiene el digitalizado de esta versión'}</span></div>}
      <div className="q-ficha-cuerpo">
        <span className="q-ficha-marca q-ficha-foco">{e.nombre}{e.nueva ? ' · versión nueva' : ''}</span>
        <h4>«{version(e.version)}»</h4>
        <dl className="q-ficha-datos">
          <div><dt>Programa</dt><dd>{e.programa ? version(e.programa) : 'Sin programa registrado'}</dd></div>
          <div><dt>Canal</dt><dd>{e.canal === 'DESCONOCIDO' ? 'Canal sin registrar' : version(e.canal)}</dd></div>
          <div><dt>Fecha</dt><dd>{fechaCorta(e.fecha)}{e.hora ? `, ${e.hora}` : ''}</dd></div>
          <div><dt>Tipo</dt><dd>{tipoAviso(e.tipo)}</dd></div>
          {e.franja && <div><dt>Franja</dt><dd>{FRANJAS[e.franja] ?? version(e.franja)}</dd></div>}
          <div><dt>Inversión estimada</dt><dd>{e.inversion ? soles(e.inversion) : 'sin estimación'}</dd></div>
        </dl>
      </div>
    </div>
  );
}

export default function Emisiones({ a, etiqueta }) {
  const [tipoElegido, setTipo] = useState('todos');
  const [elegida, setElegida] = useState(null);
  const opciones = [{ valor: 'todos', texto: `Todos · ${numero(a.emisiones.length)}` }, ...a.porTipo.map((t) => ({ valor: t.nombre, texto: `${tipoAviso(t.nombre)} · ${numero(t.emisiones)}` }))];
  const tipo = vigente(tipoElegido, opciones);
  const lista = useMemo(() => a.emisiones.filter((e) => tipo === 'todos' || e.tipo === tipo), [a.emisiones, tipo]);
  const e = lista.find((x) => x.id === elegida) ?? lista[0];
  return (
    <div className="q-emisiones">
      {a.porTipo.length > 1 && (
        <div className="q-control q-emisiones-tipos"><span>Tipo de aviso</span>
          <Grupo etiqueta="Tipo de aviso" valor={tipo} onCambiar={(x) => { setTipo(x); setElegida(null); }} opciones={opciones} />
        </div>
      )}
      <ol className="q-emisiones-lista" aria-label={etiqueta}>
        {lista.map((x) => (
          <li key={x.id}>
            <button type="button" aria-pressed={x.id === e?.id} onClick={() => setElegida(x.id)}>
              <span className="q-emision-cuando">{fechaCorta(x.fecha)}<small>{x.hora}</small></span>
              <span className="q-emision-que"><b>{x.programa ? version(x.programa) : version(x.canal)}</b><small>{x.programa ? `${version(x.canal)} · ` : ''}{tipoAviso(x.tipo)}{x.nueva ? ' · nueva' : ''}</small></span>
            </button>
          </li>
        ))}
      </ol>
      <aside className="q-emisiones-ficha" aria-label="Emisión elegida">{e && <Ficha key={e.id} e={e} />}</aside>
    </div>
  );
}
