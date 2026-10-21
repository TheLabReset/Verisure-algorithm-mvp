// MAIA (Media Analyst IA): el reporte de la semana y la consulta sobre la data, en un panel lateral.
// Los hechos de la semana salen de la capa de cálculo con reglas; la lectura la escribe el modelo cada lunes en el
// pipeline. La consulta va a la función de Netlify. Si MAIA no está conectada, el panel lo dice: no simula respuestas.
import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { PanelLateral, Grupo } from '../sistema/Componentes.jsx';
import { fecha } from '../sistema/formato.js';
import { GRUPOS_MAIA, hechoTexto, semanaTexto, PREGUNTAS } from '../textos/maia.js';
import { preguntarMaia } from '../fuentes/maia-navegador.js';

const AVISOS = {
  // los detalles de cómo se activa van en docs/activacion.md, no en la pantalla del socio
  'sin-funcion': 'MAIA no está activa en esta vista.',
  'sin-clave': 'MAIA todavía no está activa en el panel.',
  'sin-red': 'No hay conexión con el sitio. Vuelve a intentar en unos minutos.',
  modelo: 'MAIA no pudo responder ahora. Vuelve a intentar en unos minutos.',
};

export function BotonMaia({ onClick }) {
  return (
    <button type="button" className="q-boton q-boton-quieto q-boton-maia" onClick={onClick} aria-haspopup="dialog">
      <span className="q-maia-marca" aria-hidden="true">M</span><span>MAIA</span>
    </button>
  );
}

function Reporte({ semana, reporte, corte, sinAtl }) {
  if (!semana) return <p className="q-nota-bloque">{sinAtl ? 'Integrametrics ATL no cargó: el reporte de la semana no se puede armar.' : 'Todavía no hay una semana completa con data.'}</p>;
  const vigente = reporte?.semana?.desde === semana.desde && reporte?.lectura;
  return (
    <div className="q-maia-reporte">
      <p className="q-maia-semana">{semanaTexto(semana)} · data de Integrametrics al {fecha(corte)}</p>
      <section aria-labelledby="maia-lectura">
        <h3 id="maia-lectura">La lectura de MAIA</h3>
        {vigente ? reporte.lectura.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)
          : <p className="q-maia-aviso">La lectura de MAIA llega cada lunes cuando esté activa. Por ahora, estos son los hechos de la semana.</p>}
        {vigente && <p className="q-maia-firma">Escrita por MAIA el {fecha(reporte.generado.slice(0, 10))} con la data al {fecha(reporte.corte?.integrametrics ?? corte)}.</p>}
      </section>
      {GRUPOS_MAIA.map((g) => {
        const hechos = semana.hechos.filter((h) => h.tema === g.tema).map((h) => ({ id: `${h.id}-${h.marca}-${h.universo}`, ...hechoTexto(h) })).filter((h) => h.titulo);
        return hechos.length ? (
          <section key={g.tema} aria-label={g.titulo}>
            <h3>{g.titulo}</h3>
            <ul className="q-maia-hechos">{hechos.map((h) => <li key={h.id}><b>{h.titulo}</b><span>{h.dato}</span></li>)}</ul>
          </section>
        ) : null;
      })}
    </div>
  );
}

function Consulta({ corte }) {
  const [log, setLog] = useState([{ rol: 'maia', texto: `Pregúntame por la data del panel: lo que hizo la competencia, sus paneles, el share de inversión o las búsquedas de cámaras. La data de Integrametrics llega al ${fecha(corte)}.` }]);
  const [texto, setTexto] = useState('');
  const [pensando, setPensando] = useState(false);
  const fin = useRef(null);
  useEffect(() => { fin.current?.scrollIntoView({ block: 'nearest' }); }, [log, pensando]);
  const enviar = async (pregunta) => {
    const q = pregunta.trim();
    if (!q || pensando) return;
    setTexto('');
    const historial = log.filter((t) => t.rol !== 'aviso');
    setLog((l) => [...l, { rol: 'usuario', texto: q }]);
    setPensando(true);
    const r = await preguntarMaia(q, historial);
    setPensando(false);
    setLog((l) => [...l, r.error ? { rol: 'aviso', texto: AVISOS[r.error] } : { rol: 'maia', texto: r.respuesta }]);
  };
  return (
    <div className="q-maia-consulta">
      <ol className="q-maia-log" aria-live="polite">
        {log.map((t, i) => <li key={i} className={t.rol === 'aviso' ? 'q-maia-nota' : `q-maia-${t.rol}`}>{t.rol === 'maia' && <span className="q-maia-marca" aria-hidden="true">M</span>}<p>{t.texto}</p></li>)}
        {pensando && <li className="q-maia-maia q-maia-pensando"><span className="q-maia-marca" aria-hidden="true">M</span><p>Leyendo la data…</p></li>}
        <li ref={fin} aria-hidden="true" />
      </ol>
      <div className="q-maia-sugeridas" role="group" aria-label="Preguntas sugeridas">
        {PREGUNTAS.map((p) => <button key={p} type="button" className="q-chip q-chip-boton" onClick={() => enviar(p)} disabled={pensando}>{p}</button>)}
      </div>
      <form className="q-maia-form" onSubmit={(e) => { e.preventDefault(); enviar(texto); }}>
        <label className="solo-lector" htmlFor="maia-pregunta">Tu pregunta para MAIA</label>
        <input id="maia-pregunta" type="text" value={texto} maxLength={1000} placeholder="Escribe tu pregunta" onChange={(e) => setTexto(e.target.value)} autoComplete="off" />
        <button type="submit" className="q-boton q-boton-maia-enviar" disabled={!texto.trim() || pensando} aria-label="Enviar pregunta"><ArrowUp size={16} aria-hidden="true" /></button>
      </form>
    </div>
  );
}

export default function Maia({ abierta, onCerrar, vista, reporte }) {
  const [pestana, setPestana] = useState('reporte');
  const corte = vista.fuentes[0].corte;
  return (
    <PanelLateral titulo="MAIA" bajada="Media Analyst IA · tu reporte de cada semana y consultas sobre la data" abierto={abierta} onCerrar={onCerrar} className="q-panel-maia">
      <Grupo etiqueta="Vista de MAIA" valor={pestana} onCambiar={setPestana} opciones={[{ valor: 'reporte', texto: 'Reporte de la semana' }, { valor: 'consulta', texto: 'Preguntar' }]} />
      {pestana === 'reporte' ? <Reporte semana={vista.sugiere.semana} reporte={reporte} corte={corte} sinAtl={vista.sugiere.semanaSinAtl} /> : <Consulta corte={corte} />}
    </PanelLateral>
  );
}
