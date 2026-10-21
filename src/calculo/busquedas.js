// Cámaras DIY: cuánto se buscan en Google las cámaras que uno instala solo, frente a la marca, y qué marcas de
// cámaras crecen. Google Trends da un índice de 0 a 100 por grupo de términos (no volúmenes): se compara dentro de
// cada grupo, nunca entre grupos. Puro.

const media = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
const VENTANA = 12; // semanas: un trimestre, para que una semana rara no mueva la lectura

// Las últimas semanas completas (la parcial de Trends no cuenta) y las mismas semanas de un año antes
// hasta: el último día del período elegido; las semanas que empiezan después no cuentan
const finDe = (iso) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 6); return d.toISOString().slice(0, 10); };
function ventanas(grupo, n, hasta) {
  // una semana cuenta si termina dentro del período (domingo, seis días después de su inicio)
  const completas = grupo.semanas.map((s, i) => i).filter((i) => !grupo.parcial[i] && (!hasta || finDe(grupo.semanas[i]) <= hasta));
  const ahora = completas.slice(-n);
  const antes = ahora.map((i) => i - 52).filter((i) => i >= 0);
  return { ahora, antes: antes.length === ahora.length ? antes : null };
}
const crecimiento = (a, b) => (a && b != null ? Math.round(((b - a) / a) * 100) : null);

export function leerBusquedas(datos, { semanas = VENTANA, hasta = null } = {}) {
  if (!datos?.categoria?.semanas?.length) return null;
  const cat = datos.categoria, diy = datos.marcasDiy;
  const v = ventanas(cat, semanas, hasta);
  if (!v.ahora.length) return null;
  const promedio = (s, idx) => media(idx.map((i) => s.valores[i]));
  const series = cat.series.map((s) => ({
    id: s.id, nombre: s.nombre, propia: Boolean(s.propia),
    serie: cat.semanas.map((fecha, i) => ({ fecha, valor: cat.parcial[i] ? null : s.valores[i] })),
    ahora: promedio(s, v.ahora), antes: v.antes ? promedio(s, v.antes) : null,
  })).map((s) => ({ ...s, crecimiento: crecimiento(s.antes, s.ahora) }));
  const camaras = series.find((s) => s.id === 'camaras'), marca = series.find((s) => s.propia);
  // un grupo de marcas (otra consulta de Trends, en su propia escala): el promedio de cada una y su serie semanal
  const deMarcas = (g) => {
    const vg = g?.semanas?.length ? ventanas(g, semanas, hasta) : null;
    if (!vg || !vg.ahora.length) return { marcas: [], series: [] };
    const marcas = g.series.map((s) => ({ id: s.id, nombre: s.nombre, ahora: promedio(s, vg.ahora), antes: vg.antes ? promedio(s, vg.antes) : null }))
      // el crecimiento sale de los promedios redondeados, los mismos que muestra el gráfico
      .map((s) => ({ ...s, crecimiento: crecimiento(s.antes == null ? null : Math.round(s.antes), Math.round(s.ahora)) })).sort((a, b) => b.ahora - a.ahora);
    return { marcas, series: g.series.map((s) => ({ id: s.id, nombre: s.nombre, serie: g.semanas.map((fecha, i) => ({ fecha, valor: g.parcial[i] ? null : s.valores[i] })) })) };
  };
  const diyLeido = deMarcas(diy), marcas = diyLeido.marcas, serieMarcas = diyLeido.series;
  // las empresas del rubro por su nombre (la propia y la competencia), si el archivo las trae
  const comp = deMarcas(datos.competencia);
  const semanaDe = (i) => cat.semanas[i];
  return {
    consultado: datos.consultado,
    // del primer día de la primera semana al último día de la última (Trends fecha cada semana por su domingo de inicio)
    desde: semanaDe(v.ahora[0]), hasta: finDe(semanaDe(v.ahora.at(-1))), semanas: v.ahora.length,
    antesDesde: v.antes ? semanaDe(v.antes[0]) : null, antesHasta: v.antes ? finDe(semanaDe(v.antes.at(-1))) : null,
    series,
    // por cada búsqueda de la marca, cuántas de cámaras de seguridad (mismo grupo, misma escala)
    razon: camaras && marca && marca.ahora ? camaras.ahora / marca.ahora : null,
    razonAntes: camaras && marca && marca.antes ? camaras.antes / marca.antes : null,
    camaras, marca, marcas, serieMarcas,
    competencia: comp.marcas.length ? comp : null,
  };
}
