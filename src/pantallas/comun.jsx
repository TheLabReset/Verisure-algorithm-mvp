// Piezas comunes de las pantallas: marco de capa (índice al costado), cabecera con fuentes y capítulos.
import { useState } from 'react';
import { IndiceCapa, Seccion, FuentesCapa, AvisosCapitulo, VentanaContexto, PanelLateral, Monitoreo, BotonMonitoreo } from '../sistema/Componentes.jsx';
import { Histograma, Barras } from '../sistema/graficos/Graficos.jsx';
import { diaSemanaLargo, fechaCorta, numero } from '../sistema/formato.js';
import { tramoFechas } from '../textos/comun.js';
import { alerta } from '../textos/lecturas.js';
import { seccionPorNumero } from '../capas/estructura.js';
import { CLIENTE } from '../cliente.js';

// Chips de fuentes: estado y fecha de corte; si la fuente está atrasada, cuántos días lleva sin datos nuevos
export function fuentesDe(ids, vista) {
  return ids.map((id) => vista.fuentes.find((f) => f.id === id)).filter(Boolean).map((f) => ({
    nombre: f.nombre,
    estado: f.estado,
    detalle: f.estado === 'no-cargo' ? 'no cargó'
      : f.estado === 'parcial' ? `al ${fechaCorta(f.corte)}, hace ${numero(f.atraso)} días`
      : f.sinDato.length ? `${numero(f.sinDato.length)} ${f.sinDato.length === 1 ? 'día' : 'días'} sin dato` : `al ${fechaCorta(f.corte)}`,
  }));
}

// Alertas ya escritas, con su ancla («a-…» o «b-…») y el capítulo que las sostiene
const slug = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const destino = (numero) => { const s = seccionPorNumero(numero); return s ? { ir: s.id, irTexto: s.titulo } : {}; };
const escrita = (pref) => (a) => { const t = alerta(a); return t && { ...t, id: `${pref}-${a.id}-${slug(a.marca || a.fuente)}`, ...destino(a.sostiene) }; };
export const alertasDe = (vista) => (vista.sugiere.queMirar || []).map(escrita('a')).filter(Boolean);
export const buenasDe = (vista) => (vista.sugiere.queVaBien || []).map(escrita('b')).filter(Boolean);

// Estado de una tarjeta cuando su fuente no trae el dato
export const sinDato = (estado) => ({ tipo: estado === 'no-cargo' ? 'no-cargo' : 'sin-datos', reemplaza: true });

// Marco de una capa: índice fijo al costado y, al centro, cabecera, resumen y capítulos.
// Da a cada tarjeta la ventana del período («1 al 30 de junio»), que la tarjeta muestra arriba a la derecha.
export function MarcoCapa({ capa, vista, bajada, conResumen = true, children }) {
  const ids = [...new Set(capa.secciones.flatMap((s) => s.fuentes))];
  const ventana = tramoFechas(vista.periodo.desde, vista.periodo.hasta).replace(/^del /, '');
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
          <PanelLateral titulo="Qué se monitorea" bajada={`Lo que sigue cada fuente. Es configuración, no medición: se cambia a pedido de ${CLIENTE.nombre}.`} abierto={monitoreo} onCerrar={() => setMonitoreo(false)}>
            <Monitoreo grupos={vista.monitoreo} />
          </PanelLateral>
        </header>
        {children}
      </div>
    </div>
    </VentanaContexto.Provider>
  );
}

// Capítulo con sus avisos ya resueltos desde la estructura de capas
export function SeccionDe({ def, vista, conAvisos = true, children }) {
  return (
    <Seccion id={def.id} numero={def.numero} titulo={def.titulo} pregunta={def.pregunta} fuentes={fuentesDe(def.fuentes, vista)}
      avisos={conAvisos ? <AvisosCapitulo avisos={[...alertasDe(vista), ...buenasDe(vista)].filter((a) => a.ir === def.id)} /> : null}>
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
