// Opciones de diseño para revisar con el equipo antes de elegir. Vive solo en la rama de exploración: cuando se elige
// una opción por punto, este archivo y las que no quedaron se borran. La elección se guarda en el navegador para que
// sobreviva a una recarga; si no se puede guardar, la página funciona igual con la primera opción.
import { createContext, useContext, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

export const PUNTOS = [
  { id: 'nuevo', nombre: 'Motivo nuevo', opciones: [['a', 'A · Sello en la carta'], ['b', 'B · Junto al nombre'], ['c', 'C · Nuevos primero']] },
  { id: 'piezas', nombre: 'Piezas y campañas', opciones: [['a', 'A · Tarjetas'], ['b', 'B · Tabla'], ['c', 'C · Mapa']] },
];
const CLAVE = 'algoritmo:opciones';
const inicial = () => {
  const base = Object.fromEntries(PUNTOS.map((p) => [p.id, p.opciones[0][0]]));
  try { return { ...base, ...JSON.parse(localStorage.getItem(CLAVE) || '{}') }; } catch { return base; }
};

const Contexto = createContext(Object.fromEntries(PUNTOS.map((p) => [p.id, p.opciones[0][0]])));
export const useOpcion = (id) => useContext(Contexto)[id];

export function ConOpciones({ children }) {
  const [elegidas, setElegidas] = useState(inicial);
  const [abierto, setAbierto] = useState(false);
  const elegir = (id, valor) => setElegidas((e) => {
    const nuevas = { ...e, [id]: valor };
    try { localStorage.setItem(CLAVE, JSON.stringify(nuevas)); } catch { /* sin almacenamiento */ }
    return nuevas;
  });
  return (
    <Contexto.Provider value={elegidas}>
      {children}
      <div className="q-opciones" role="group" aria-label="Opciones de diseño">
        <button type="button" className="q-opciones-boton" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
          <SlidersHorizontal size={14} aria-hidden="true" />Opciones
        </button>
        {abierto && PUNTOS.map((p) => (
          <div key={p.id} className="q-opciones-punto">
            <span>{p.nombre}</span>
            {p.opciones.map(([v, texto]) => <button key={v} type="button" aria-pressed={elegidas[p.id] === v} onClick={() => elegir(p.id, v)}>{texto}</button>)}
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}
