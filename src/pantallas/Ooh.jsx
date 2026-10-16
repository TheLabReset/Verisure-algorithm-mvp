// OOH: el mapa de paneles (Leaflet, cargado aparte) y la ficha de la ubicación elegida, con su foto o video.
// Lo de la competencia se elige primero. La ficha abre la ventana con todos los paneles de esa marca.
import { lazy, Suspense, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Grupo, VentanaAnuncios } from '../sistema/Componentes.jsx';
import { numero, soles, fechaCorta } from '../sistema/formato.js';
import { segun, version } from '../textos/comun.js';
import { panelTitulo } from '../textos/lecturas.js';

const MapaPaneles = lazy(() => import('../sistema/graficos/MapaPaneles.jsx'));

function Ficha({ ubicacion, paneles, onVerTodos }) {
  const [i, setI] = useState(0);
  const [fallo, setFallo] = useState(null); // la cara cuya foto o video no cargó
  const p = paneles[Math.min(i, paneles.length - 1)];
  if (!p) return <p className="q-nota-bloque">Elige un punto del mapa para ver su panel.</p>;
  const a = p.asset;
  return (
    <div className="q-ficha-panel" aria-live="polite">
      <div className="q-ficha-arte">
        {fallo === p.id ? <span className="q-ficha-sin-arte">{a.kind === 'video' ? 'El video' : 'La foto'} de este panel no cargó</span>
          : a?.kind === 'image' ? <img src={a.url} alt={`Foto del panel de ${p.nombre}${p.version ? `, versión ${version(p.version)}` : ''}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFallo(p.id)} />
          : a?.kind === 'video' ? <video src={a.url} controls preload="metadata" aria-label={`Video del panel de ${p.nombre}`} onError={() => setFallo(p.id)} />
          : <span className="q-ficha-sin-arte">Integrametrics no captó la foto de este panel</span>}
      </div>
      <div className="q-ficha-cuerpo">
        <span className={`q-ficha-marca${ubicacion.foco ? ' q-ficha-foco' : ''}`}>{p.nombre}</span>
        <h4>{panelTitulo(p)}</h4>
        {p.version && <p className="q-ficha-version">«{version(p.version)}»</p>}
        <dl className="q-ficha-datos">
          <div><dt>Distrito</dt><dd>{p.distrito || p.localidad || ubicacion.zona}</dd></div>
          {p.tipo && <div><dt>Tipo</dt><dd>{version(p.tipo)}</dd></div>}
          <div><dt>Detectado</dt><dd>{p.desde === p.hasta ? `el ${fechaCorta(p.desde)}` : `del ${fechaCorta(p.desde)} al ${fechaCorta(p.hasta)}`}</dd></div>
          <div><dt>Inversión estimada</dt><dd>{soles(p.inversion)}</dd></div>
        </dl>
        {paneles.length > 1 && (
          <div className="q-ficha-caras" role="group" aria-label="Caras de esta ubicación">
            <span>{numero(paneles.length)} caras en esta ubicación</span>
            {paneles.map((x, k) => <button key={x.id} type="button" className="q-chip q-chip-boton" aria-pressed={k === i} onClick={() => setI(k)}>{k + 1}</button>)}
          </div>
        )}
        <button type="button" className="q-boton q-boton-quieto q-ficha-todos" onClick={onVerTodos} data-ver-paneles={p.nombre}>Ver todos los paneles de {p.nombre}</button>
      </div>
    </div>
  );
}

export default function Ooh({ o, t, nota }) {
  const [zona, setZona] = useState(o.zonas[0]?.nombre ?? 'Lima');
  const [elegida, setElegida] = useState(null);
  const [ventana, setVentana] = useState(null);
  const actual = o.zonas.find((z) => z.nombre === zona) ?? o.zonas[0];
  const ubicaciones = useMemo(() => o.ubicaciones.map((u) => ({
    ...u, pista: `${u.nombre} · ${u.distrito || u.zona}\n${numero(u.paneles.length)} ${segun(u.paneles.length, 'cara', 'caras')} · ${soles(u.inversion)}`,
  })), [o.ubicaciones]);
  // el encuadre solo cambia cuando cambia la zona: elegir un punto no mueve el mapa
  const encuadre = useMemo(() => actual?.encuadre ?? [], [actual?.nombre, o.ubicaciones]); // eslint-disable-line react-hooks/exhaustive-deps
  const delaZona = ubicaciones.filter((u) => u.zona === actual?.nombre);
  const id = elegida && ubicaciones.some((u) => u.id === elegida) ? elegida : (delaZona.find((u) => u.foco) ?? delaZona[0])?.id;
  const u = ubicaciones.find((x) => x.id === id);
  const paneles = o.paneles.filter((p) => p.ubicacion === id);
  const grupos = [...o.abanico.grupos, o.abanico.propio].filter(Boolean);
  const grupo = grupos.find((g) => g.nombre === ventana) ?? null;
  const elegirZona = (z) => { setZona(z); setElegida(null); };
  return (
    <div className="q-ooh">
      {/* la zona va en su propia fila, sobre las dos columnas: así el mapa y la foto del panel empiezan a la misma altura */}
      {o.zonas.length > 1 && (
        <div className="q-control q-ooh-zonas"><MapPin size={14} aria-hidden="true" /><span>Zona</span>
          <Grupo etiqueta="Zona del mapa" valor={actual.nombre} onCambiar={elegirZona} opciones={o.zonas.map((z) => ({ valor: z.nombre, texto: `${z.nombre} · ${numero(z.paneles)}` }))} />
        </div>
      )}
      <div className="q-ooh-mapa">
        <Suspense fallback={<div className="q-mapa q-mapa-cargando">Cargando el mapa…</div>}>
          <MapaPaneles key={o.zonas.map((z) => z.nombre).join()} ubicaciones={ubicaciones} elegida={id} onElegir={setElegida} encuadre={encuadre} contornos={o.contornos}
            etiqueta={`Mapa de paneles OOH en ${actual?.nombre ?? 'Lima'}`} />
        </Suspense>
        <ul className="q-leyenda" aria-hidden="true">
          {[...new Map(o.ubicaciones.map((x) => [x.nombre, x])).values()].sort((a, b) => Number(b.foco) - Number(a.foco)).map((x) => <li key={x.nombre}><span className={`q-muestra ${x.foco ? 'q-muestra-mapa-foco' : x.propia ? 'q-muestra-mapa-propia' : 'q-muestra-mapa-resto'}`} />{x.nombre}</li>)}
          <li className="q-nota">El tamaño de cada círculo sigue a su inversión estimada.</li>
        </ul>
      </div>
      <aside className="q-ooh-ficha" aria-label="Panel elegido">
        {u && <Ficha key={u.id} ubicacion={u} paneles={paneles} onVerTodos={() => setVentana(u.nombre)} />}
      </aside>
      <VentanaAnuncios grupo={grupo} onCerrar={() => setVentana(null)} t={{ ...t, titulo: (x) => x.titulo }} nota={nota}
        volver={() => document.querySelector(`[data-ver-paneles="${window.CSS.escape(ventana ?? '')}"]`)?.focus()} />
    </div>
  );
}
