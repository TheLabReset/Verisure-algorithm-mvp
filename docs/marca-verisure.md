# Verisure en The Algorithm

Cómo entra la marca al panel y de dónde sale cada decisión. Etiquetas: **confirmé** es leído en la fuente; **se deduce** es inferido; **asumo** es lo que no se pudo comprobar.

## Lo que tenemos

| Elemento | Valor | Fuente |
|---|---|---|
| Rojo | `#ED002F` | El logo oficial que entregó The Lab (confirmé). Brandfetch lo da igual, #ED002F «Torch Red» (confirmé, captura de octubre de 2026). En sus piezas publicadas se midió #EC0030, la misma tinta |
| Verde azulado | `#00B49C` | Medido en los botones de sus piezas en Integrametrics (confirmé). No está en Brandfetch |
| Vino | `#70181D` | Brandfetch, «Persian Plum» (confirmé que lo lista). No se usa en el panel: no hizo falta |
| Logo | Símbolo (la flor con el círculo) sobre la palabra «verisure» | Archivos oficiales entregados por The Lab: `VSURE.ST_BIG.D` (completo, en negativo), `VSURE.ST.D` (símbolo en negativo) y `VSURE.ST` (símbolo en rojo) |
| Tipografía | Sofia Sans, la del estándar | La de la marca no está pública (asumo que es propia). Se cambia en `--f-titulo`, `--f-texto` y `--f-tabla` cuando llegue |

No hay guía de marca pública: el sitio de Verisure y Brandfetch bloquean la descarga desde el servidor (403), y la ficha de Brandfetch es la de Verisure Suecia, sin reclamar.

## Cómo se usa

- **Barra:** el logo completo en negativo (`public/marca/logo-barra.svg`), en blanco sobre la barra oscura en los dos temas. Se pinta con `currentColor`, así que toma `--sobre-barra`. No se recompone ni se recorta: va tal como vino.
- **Favicon:** el símbolo en rojo (`public/favicon.svg`).
- **Rojo:** identidad. Marca la capa activa, el número del capítulo y el acento. Nunca es una serie en un gráfico.
- **Gráficos y mapa, con foco en la competencia:** Prosegur va en tinta (casi negro en claro, casi blanco en oscuro) y Verisure en gris, para comparar. Lo principal es saber qué hace Prosegur. Así se lee quién es quién sin depender del color de marca, y el rojo no se confunde con una alerta.
- **Tema oscuro:** el rojo baja a `#FF8A9B` para pasar contraste sobre las superficies oscuras (lo exige el chequeo de Quincha).

## Mapa

- **Mapa base:** los mosaicos estándar de OpenStreetMap, sin clave. Su política permite un uso liviano como este (un panel interno, pocas personas) con atribución. Si el uso crece o el panel se abre a más gente, se cambia a un proveedor con clave (Stadia, MapTiler) en una sola línea de `MapaPaneles.jsx`.
- **CARTO no sirve sin clave:** sus mosaicos salen con la marca de agua «API KEY REQUIRED» (confirmé, octubre de 2026).
- **Límites de distrito:** de OpenStreetMap, bajados con Nominatim en octubre de 2026, simplificados en `public/data/mapa-lima.json` (licencia ODbL, con la atribución en el archivo). Sirven para asignar cada panel a su distrito; no se dibujan.

## Supuestos que cambiarían el diseño

- **Si Verisure tiene una tipografía propia y nos la da:** reemplaza a Sofia Sans en los tres tokens; nada más cambia.
- **Si su guía pide el logo en rojo sobre blanco:** la barra pasa a fondo claro, que es un cambio de tokens (`--barra`, `--sobre-barra`), no de componentes.
- **Si el verde azulado no es de marca sino de campaña:** se reemplaza `--p-verde` en `tokens.css`. Hoy solo marca lo que va bien.
