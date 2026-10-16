// Escenarios de data en movimiento: transformaciones puras de la data publicada para ver si cada vista, cada
// lectura y cada alerta siguen sirviendo cuando la data se mueve para un lado o para el otro. No inventan una marca
// ni una fuente: estiran, apagan o recortan la data real. Los usan las pruebas y la barra de demo.
import { CLIENTE } from '../cliente.js';

const PROPIA = CLIENTE.marcaFuente;
const RIVAL = CLIENTE.competencia[0].marcaFuente;
const copia = (x) => (x == null ? x : structuredClone(x));
const mesDe = (fecha) => fecha.slice(0, 7);
const ultimoMes = (d) => mesDe(d.contrato.meta.lastDay);

// multiplica la inversión (y las emisiones, si las hay) de una marca en los días que cumplen la condición
function escalar(diarios, marca, k, cuando = () => true) {
  for (const d of diarios) {
    const b = d.brands?.[marca];
    if (!b || !cuando(d.fecha)) continue;
    b.spend = Math.round(b.spend * k);
    if (b.spots != null) b.spots = Math.round(b.spots * k);
    if (b.impresiones != null) b.impresiones = Math.round(b.impresiones * k);
    for (const g of ['byMedium']) if (b[g]) for (const x of Object.keys(b[g])) b[g][x] = Math.round(b[g][x] * k);
  }
}
// saca a una marca de los días que cumplen la condición, como si no hubiera pautado
function apagar(d, marca, cuando) {
  for (const x of [...d.contrato.daily, ...(d.contrato.digital?.daily || [])]) if (cuando(x.fecha)) delete x.brands[marca];
  d.contrato.events = d.contrato.events.filter((e) => !(e.maname === marca && cuando(e.fecha.slice(0, 10))));
  d.contrato.ooh = d.contrato.ooh.filter((p) => !(p.maname === marca && cuando((p.firstFecha || '').slice(0, 10))));
  for (const lista of [d.contrato.pieces, d.contrato.digital?.pieces || []]) {
    for (let i = lista.length - 1; i >= 0; i--) {
      const p = lista[i];
      if (p.maname !== marca) continue;
      if (cuando((p.firstEmission || '').slice(0, 10))) { lista.splice(i, 1); continue; }
      // una pieza que venía de antes deja de salir: su última emisión queda en el último día antes del apagón
      if (p.lastEmission && cuando(p.lastEmission.slice(0, 10))) {
        const antes = d.contrato.daily.map((x) => x.fecha).filter((f) => f < p.lastEmission.slice(0, 10) && !cuando(f)).at(-1);
        if (antes) p.lastEmission = `${antes} 23:59:59`; else lista.splice(i, 1);
      }
    }
  }
  for (const [mes, m] of Object.entries(d.medios?.meses || {})) if (cuando(`${mes}-15`)) delete m[marca];
}
const largo = (t, n = 3) => `${t} ${'EDICIÓN ESPECIAL DE TEMPORADA CON PROMOCIÓN NACIONAL '.repeat(n)}`.trim();

export const ESCENARIOS = [
  {
    id: 'competencia-fuerte', titulo: 'La competencia invierte seis veces más',
    que: 'La inversión de la competencia, por seis en el último mes, en ATL y en digital; el mes anterior queda igual.',
    aplicar(d) {
      const m = ultimoMes(d);
      escalar(d.contrato.daily, RIVAL, 6, (f) => mesDe(f) === m);
      escalar(d.contrato.digital?.daily || [], RIVAL, 6, (f) => mesDe(f) === m);
    },
  },
  {
    id: 'competencia-apagada', titulo: 'La competencia se apaga',
    que: 'La competencia no tiene registros en el último mes: ni pauta, ni estrenos, ni paneles.',
    aplicar(d) { const m = ultimoMes(d); apagar(d, RIVAL, (f) => mesDe(f) === m); },
  },
  {
    id: 'propia-apagada', titulo: 'La marca propia se apaga',
    que: 'La marca propia no tiene registros en el último mes.',
    aplicar(d) { const m = ultimoMes(d); apagar(d, PROPIA, (f) => mesDe(f) === m); },
  },
  {
    id: 'montos-grandes', titulo: 'Montos mil veces mayores',
    que: 'Toda la inversión por mil: prueba que las cifras grandes caben y se leen.',
    aplicar(d) {
      for (const m of [PROPIA, RIVAL]) { escalar(d.contrato.daily, m, 1000); escalar(d.contrato.digital?.daily || [], m, 1000); }
      for (const p of [...d.contrato.ooh, ...d.contrato.pieces, ...(d.contrato.digital?.pieces || [])]) if (p.spend != null) p.spend *= 1000;
      for (const m of Object.values(d.medios?.meses || {})) for (const x of Object.values(m)) for (const g of ['canales', 'zonas', 'grupos']) if (x[g]) for (const k of Object.keys(x[g])) x[g][k] *= 1000;
    },
  },
  {
    id: 'un-dia', titulo: 'Un mes con un solo día de data',
    que: 'El pipeline corrió el primer día del mes: el mes en curso tiene un solo día.',
    aplicar(d) {
      const c = d.contrato, m = ultimoMes(d), dia = `${m}-01`;
      const hasta = (f) => (f || '').slice(0, 10) <= dia;
      c.meta.lastDay = dia; c.meta.days = c.meta.days.filter(hasta);
      c.daily = c.daily.filter((x) => hasta(x.fecha));
      if (c.digital) { c.digital.daily = c.digital.daily.filter((x) => hasta(x.fecha)); c.digital.pieces = c.digital.pieces.filter((p) => hasta(p.firstEmission)); }
      c.events = c.events.filter((e) => hasta(e.fecha)); c.ooh = c.ooh.filter((p) => hasta(p.firstFecha)); c.pieces = c.pieces.filter((p) => hasta(p.firstEmission));
      // medios.json del mes, como lo dejaría el pipeline con un día: lo de un día promedio
      const dias = Number(new Date(Date.UTC(+m.slice(0, 4), +m.slice(5, 7), 0)).getUTCDate());
      for (const x of Object.values(d.medios?.meses?.[m] || {})) {
        x.emisiones = Math.round(x.emisiones / dias);
        for (const g of ['canales', 'programas', 'zonas', 'grupos']) if (x[g]) for (const k of Object.keys(x[g])) x[g][k] = Math.round(x[g][k] / dias);
        if (x.horas) x.horas = x.horas.map((v) => Math.round(v / dias));
        if (x.dias) x.dias = x.dias.map((v, i) => (i === (new Date(dia).getUTCDay() + 6) % 7 ? Math.round(x.emisiones) : 0));
        if (x.horaDia) x.horaDia = x.horaDia.map((f, i) => f.map((v) => (i === (new Date(dia).getUTCDay() + 6) % 7 ? Math.round(v / 4) : 0)));
      }
    },
  },
  {
    id: 'sin-paneles', titulo: 'Sin paneles',
    que: 'Integrametrics no registra ningún panel en todo el año.',
    aplicar(d) { d.contrato.ooh = []; },
  },
  {
    id: 'muchos-paneles', titulo: 'Diez veces más paneles',
    que: 'Cada panel se repite diez veces alrededor de su sitio, y aparecen paneles en otras ciudades.',
    aplicar(d) {
      const base = d.contrato.ooh;
      const ciudades = [['Cusco', -13.5226, -71.9673], ['Piura', -5.1945, -80.6328], ['Chiclayo', -6.7714, -79.8409], ['Huancayo', -12.0651, -75.2049], ['Iquitos', -3.7437, -73.2516]];
      const mas = [];
      base.forEach((p, i) => {
        for (let k = 1; k < 10; k++) {
          const lejos = k === 9 && i % 3 === 0 ? ciudades[(i / 3) % ciudades.length | 0] : null;
          mas.push({ ...p, key: `${p.key}-${k}`, lat: lejos ? lejos[1] + k * 0.002 : p.lat + Math.sin(k * 2.1) * 0.004 * k, lng: lejos ? lejos[2] : p.lng + Math.cos(k * 2.1) * 0.004 * k, localidad: lejos ? lejos[0] : p.localidad });
        }
      });
      d.contrato.ooh = [...base, ...mas];
    },
  },
  {
    id: 'muchos-estrenos', titulo: 'Ocho veces más piezas nuevas',
    que: 'Cada estreno y cada pieza se repite como variante: muchas versiones al aire a la vez.',
    aplicar(d) {
      const c = d.contrato;
      c.events = c.events.flatMap((e) => Array.from({ length: 8 }, (_, k) => (k ? { ...e, key: `${e.key}-${k}`, vname: `${e.vname} ${k + 1}` } : e)));
      c.pieces = c.pieces.flatMap((p) => Array.from({ length: 4 }, (_, k) => (k ? { ...p, key: `${p.key}-${k}`, vname: `${p.vname} ${k + 1}` } : p)));
    },
  },
  {
    id: 'nombres-largos', titulo: 'Nombres largos',
    que: 'Versiones, canales y programas con nombres de más de cien letras.',
    aplicar(d) {
      const c = d.contrato;
      for (const x of [...c.events, ...c.pieces, ...c.ooh, ...(c.digital?.pieces || [])]) if (x.vname) x.vname = largo(x.vname);
      for (const e of c.events) if (e.mname) e.mname = largo(e.mname, 1);
      for (const m of Object.values(d.medios?.meses || {})) for (const x of Object.values(m)) for (const g of ['canales', 'programas']) if (x[g]) x[g] = Object.fromEntries(Object.entries(x[g]).map(([k, v]) => [largo(k, 1), v]));
    },
  },
  {
    id: 'pico-trends', titulo: 'Pico en las búsquedas',
    que: 'Las últimas cuatro semanas, las cámaras se buscan el doble y la primera marca de cámaras, cinco veces más.',
    aplicar(d) {
      if (!d.busquedas) return;
      const pico = (g, id, k) => {
        const s = g.series.find((x) => x.id === id) ?? g.series[0];
        const completas = g.semanas.map((_, i) => i).filter((i) => !g.parcial[i]).slice(-4);
        for (const i of completas) s.valores[i] = Math.min(100, Math.round(s.valores[i] * k)) || s.valores[i];
      };
      pico(d.busquedas.categoria, 'camaras', 2);
      if (d.busquedas.marcasDiy) pico(d.busquedas.marcasDiy, null, 5);
    },
  },
  {
    id: 'trends-corto', titulo: 'Búsquedas sin un año de historia',
    que: 'Google Trends devuelve solo las últimas veinte semanas: no hay con qué compararlas un año antes.',
    aplicar(d) {
      if (!d.busquedas) return;
      for (const g of [d.busquedas.categoria, d.busquedas.marcasDiy].filter(Boolean)) {
        const n = g.semanas.length - 20;
        g.semanas = g.semanas.slice(n); g.parcial = g.parcial.slice(n);
        for (const s of g.series) s.valores = s.valores.slice(n);
      }
    },
  },
];

// Devuelve una copia de la data con el escenario aplicado; la original no se toca
export function aplicarEscenario(id, datos) {
  const e = ESCENARIOS.find((x) => x.id === id);
  if (!e) return datos;
  const d = { ...datos, contrato: copia(datos.contrato), medios: copia(datos.medios), busquedas: copia(datos.busquedas) };
  e.aplicar(d);
  return d;
}
