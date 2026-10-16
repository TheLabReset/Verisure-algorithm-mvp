# Verisure en The Algorithm

Cómo entra la marca al panel y de dónde sale cada decisión. Etiquetas: **confirmé** es leído en la fuente; **se deduce** es inferido; **asumo** es lo que no se pudo comprobar.

## Lo que tenemos

| Elemento | Valor | Fuente |
|---|---|---|
| Rojo | `#ED002F` | El logo oficial que entregó The Lab (confirmé). Brandfetch lo da igual, #ED002F «Torch Red» (confirmé, captura de octubre de 2026). En sus piezas publicadas se midió #EC0030, la misma tinta |
| Verde azulado | `#00B49C` | Medido en los botones de sus piezas en Integrametrics (confirmé). No está en Brandfetch |
| Amarillo de Prosegur | `#FFC800` | Medido en 8 piezas digitales de Prosegur en Integrametrics (confirmé, octubre de 2026): el amarillo dominante cae entre #F8C000 y #F8D000. No es la guía oficial de Prosegur (asumo) |
| Vino | `#70181D` | Brandfetch, «Persian Plum» (confirmé que lo lista). No se usa en el panel: no hizo falta |
| Logo | Símbolo (la flor con el círculo) sobre la palabra «verisure» | Archivos oficiales entregados por The Lab: `VSURE.ST_BIG.D` (completo, en negativo), `VSURE.ST.D` (símbolo en negativo) y `VSURE.ST` (símbolo en rojo) |
| Tipografía | Sofia Sans, la del estándar | La de la marca no está pública (asumo que es propia). Se cambia en `--f-titulo`, `--f-texto` y `--f-tabla` cuando llegue |

No hay guía de marca pública: el sitio de Verisure y Brandfetch bloquean la descarga desde el servidor (403), y la ficha de Brandfetch es la de Verisure Suecia, sin reclamar.

## Cómo se usa

- **Barra:** el logo completo en negativo (`public/marca/logo-barra.svg`), en blanco sobre la barra oscura en los dos temas. Se pinta con `currentColor`, así que toma `--sobre-barra`. No se recompone ni se recorta: va tal como vino.
- **Favicon:** el símbolo en rojo (`public/favicon.svg`).
- **Rojo:** identidad. Marca la capa activa, el número del capítulo, el acento y a Verisure en los gráficos. Nunca va en un texto de dato. El mapa de calor de Verisure va en una rampa de su rojo; el de Prosegur, en una de su amarillo.
- **Gráficos y mapa, con foco en la competencia:** Prosegur va en su amarillo y Verisure en su rojo (`--propia`). El gris queda para la comparación (el mes anterior, las semanas fuera del período, los términos de búsqueda que no son de nadie). Lo principal sigue siendo saber qué hace Prosegur: va primero, en el color de foco, con borde y anillo; Verisure va liso, sin borde.
  - En claro, el amarillo sobre blanco no se ve (1,55 : 1), así que los rellenos (barras, tramos, puntos, círculos del mapa) llevan un borde de tinta: es la regla de relleno con borde de Quincha. Las líneas finas van en ocre (#A67C00), porque una línea no lleva borde.
  - En oscuro, el amarillo puro, sin borde (9,3 : 1 sobre el fondo).
  - «Atención» va en tinta con su triángulo, para que ningún aviso se confunda con algo de Prosegur. En las franjas de medios, Radio va en tinta y no en el naranja de categoría.
  - Verisure en rojo convive con «empeora», que también es rojo, porque el color de una marca nunca pinta un texto y toda variación lleva signo (y flecha en las cifras grandes). Se evaluó con hojas de comparación en octubre de 2026.
  - Las líneas de Verisure en claro van en el rojo de texto (#B8002A), no en el del logo: el rojo puro y el ocre de Prosegur se confunden con deuteranopía (ΔE 1,1 medido con el validador de paletas; con #B8002A pasa el piso de 8 con holgura). En oscuro, el rojo vivo #FF5C75 para todo (19,3 frente al amarillo).
- **Tema oscuro:** el rojo de texto y de la capa activa baja a `#FF8A9B` para pasar contraste sobre las superficies oscuras (lo exige el chequeo de Quincha). Las marcas de Verisure en los gráficos van en `#FF5C75`, más rojo y con 4,9 : 1 sobre la tarjeta.

## Mapa

- **Mapa base:** los mosaicos estándar de OpenStreetMap, sin clave. Su política permite un uso liviano como este (un panel interno, pocas personas) con atribución. Si el uso crece o el panel se abre a más gente, se cambia a un proveedor con clave (Stadia, MapTiler) en una sola línea de `MapaPaneles.jsx`.
- **CARTO no sirve sin clave:** sus mosaicos salen con la marca de agua «API KEY REQUIRED» (confirmé, octubre de 2026).
- **Límites de distrito:** de OpenStreetMap, bajados con Nominatim en octubre de 2026, simplificados en `public/data/mapa-lima.json` (licencia ODbL, con la atribución en el archivo). Sirven para asignar cada panel a su distrito; no se dibujan.

## Supuestos que cambiarían el diseño

- **Si Verisure tiene una tipografía propia y nos la da:** reemplaza a Sofia Sans en los tres tokens; nada más cambia.
- **Si su guía pide el logo en rojo sobre blanco:** la barra pasa a fondo claro, que es un cambio de tokens (`--barra`, `--sobre-barra`), no de componentes.
- **Si el verde azulado no es de marca sino de campaña:** se reemplaza `--p-verde` en `tokens.css`. Hoy solo marca lo que va bien.
