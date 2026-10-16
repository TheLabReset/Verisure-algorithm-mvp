// Piezas comunes de las pantallas: marco de capa (índice al costado), cabecera con fuentes y capítulos.
import { useState } from 'react';
import { IndiceCapa, Seccion, FuentesCapa, VentanaContexto, PanelLateral, Monitoreo, BotonMonitoreo } from '../sistema/Componentes.jsx';
import { Histograma, Barras } from '../sistema/graficos/Graficos.jsx';
import { diaSemanaLargo, fechaCorta, numero } from '../sistema/formato.js';
import { ventanaTexto } from '../textos/comun.js';
import { alerta } from '../textos/lecturas.js';
import { CLIENTE } from '../cliente.js';

// Chips de fuentes: estado y fecha de corte; si la fuente está atrasada, cuántos días lleva sin datos nuevos
export function fuentesDe(ids, vista) {
  return ids.map((id) => vista.fuentes.find((f) => f.id === id)).filter(Boolean).map((f) => ({
    nombre: f.nombre,
    estado: f.estado,
    detalle: f.estado === 'ejemplo' ? 'data de ejemplo, por conectar'
      : f.estado === 'no-cargo' ? 'no cargó'
      : f.estado === 'parcial' ? `al ${fechaCorta(f.corte)}, hace ${numero(f.atraso)} días`
      : f.sinDato.length ? `${numero(f.sinDato.length)} ${f.sinDato.length === 1 ? 'día' : 'días'} sin dato` : `al ${fechaCorta(f.corte)}`,
  }));
}

// Los avisos de una tarjeta, ya escritos: cada regla dice en qué tarjeta está su dato
const escrita = (a) => { const t = alerta(a); return t && { ...t, id: `aviso-${a.id}-${a.tarjeta}` }; };
export const avisosDe = (vista, tarjeta) => [...(vista.sugiere.queMirar || []), ...(vista.sugiere.queVaBien || [])].filter((a) => a.tarjeta === tarjeta).map(escrita).filter(Boolean);

// Estado de una tarjeta cuando su fuente no trae el dato
export const sinDato = (estado) => ({ tipo: estado === 'no-cargo' ? 'no-cargo' : 'sin-datos', reemplaza: true });

// Marco de una capa: índice fijo al costado y, al centro, cabecera, resumen y capítulos.
// Da a cada tarjeta la ventana del período («1 al 30 de junio»), que la tarjeta muestra arriba a la derecha.
export function MarcoCapa({ capa, vista, bajada, conResumen = true, children }) {
  const ids = [...new Set(capa.secciones.flatMap((s) => s.fuentes))];
  const ventana = ventanaTexto(vista.periodo.desde, vista.periodo.hasta);
  const [monitoreo, setMonitoreo] = useState(false);
  return (
    <VentanaContexto.Provider value={ventana}>
    <div className="q-envoltura q-capa-marco">
      <IndiceCapa secciones={capa.secciones} etiqueta={`Capítulos de ${capa.nombre}`} conResumen={conResumen} capaId={capa.id} />
      <div className="q-capa">
        <header className="q-capa-cab">
          <h1>{capa.titulo}</h1>
          <p>{bajada || capa.bajada}</p>
          <div className="q-capa-fuentes">
            {ids.length > 0 && <FuentesCapa fuentes={fuentesDe(ids, vista)} />}
            <BotonMonitoreo onClick={() => setMonitoreo(true)} />
          </div>
          <PanelLateral titulo="Qué se monitorea" bajada={`Lo que sigue cada fuente. Se cambia a pedido de ${CLIENTE.nombre}.`} abierto={monitoreo} onCerrar={() => setMonitoreo(false)}>
            <Monitoreo grupos={vista.monitoreo} />
          </PanelLateral>
        </header>
        {children}
      </div>
    </div>
    </VentanaContexto.Provider>
  );
}

// Capítulo con sus fuentes ya resueltas desde la estructura de capas
export function SeccionDe({ def, vista, children }) {
  return (
    <Seccion id={def.id} numero={def.numero} titulo={def.titulo} pregunta={def.pregunta} fuentes={fuentesDe(def.fuentes, vista)}>
      {children}
    </Seccion>
  );
}

// Cuándo: promedio por hora del día (las cuatro más altas resaltadas) y por día de la semana, lado a lado
export function HorasYDias({ porHora, horasAltas, porDiaSemana, diaMayor, formato, que }) {
  const dias = porDiaSemana.map((valor, i) => ({ nombre: diaSemanaLargo(i), valor: valor == null ? null : Math.round(valor * 10) / 10 }));
  return (
    <div className="q-horas">
      <div>
        <h4>Por hora del día</h4>
        <Histograma etiqueta={`${que} en promedio en cada hora del día`} formato={formato} resaltar={horasAltas}
          barras={porHora.map((valor, h) => ({ nombre: `${h}:00`, corto: `${h} h`, valor }))} alto={200} />
      </div>
      <div>
        <h4>Por día de la semana</h4>
        <Barras etiqueta={`${que} en promedio cada día de la semana`} formato={formato} resaltar={diaMayor == null ? undefined : dias[diaMayor].nombre}
          filas={dias} />
      </div>
    </div>
  );
}
