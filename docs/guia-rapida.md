# Guía rápida

Qué se usa para cada cosa. Antes de escribir un estilo, una pastilla o un formato nuevo, se busca aquí: si ya existe, se usa; si no existe, se agrega al sistema (no a la pantalla) y se anota en esta guía en el mismo cambio. El porqué de cada regla está en [quincha.md](quincha.md) (el sistema) y en [guia-algoritmo.md](guia-algoritmo.md) (el estándar del panel).

## 1. Etiquetas: una sola forma

Toda etiqueta chica (un estado, una fuente, un sello, el nivel de una alerta) es `<Etiqueta>`, de `src/sistema/Componentes.jsx`. La **variante** dice qué es; el **estado** (o el tono) dice de qué color va, desde el catálogo `src/sistema/estados.js`.

| Variante | Para qué | Ejemplo | Atajo |
|---|---|---|---|
| `borde` (por defecto) | Un dato del contexto, sin juicio | Universo de una cifra, una fuente con problema, la ventana de una tarjeta, palabras repetidas; la data de ejemplo, con borde punteado | `ChipUniverso`, `ChipFuente`, `Ventana`, `SelloEjemplo` |
| `llena` | Un estado con juicio | Rinde, Costosa, Sin leads, Saturada; el tono de un tema de la conversación | `Tono` |
| `tinta` | Una marca que se ve de lejos | Nuevo | `SelloNuevo` |
| `texto` | Un nivel o un sello sin caja | El nivel de un aviso, el semáforo frente al objetivo, «Datos al…» en la barra | `Semaforo`, `SelloDatos` |
| `rotulo` | El nombre de un grupo, en mayúsculas grises | «Los propios» en un mazo | |

```jsx
<Etiqueta variante="llena" estado="costosa">{ESTADO_PIEZA.costosa}</Etiqueta>
<Etiqueta estado="fuente-parcial">GA4 · 2 días sin dato</Etiqueta>
<SelloNuevo />
```

**Tonos** (`TONOS` en `estados.js`): `neutro` sin juicio, `fuerte` dato principal, `bien` favorable, `atencion` parcial o para revisar, `alerta` desfavorable sin urgencia, `grave` desfavorable y urgente, `barra` sobre la barra oscura, `ejemplo` data de ejemplo de una fuente por conectar. Cada tono sale de un token semántico (`--mejora`, `--empeora`, `--atencion` y sus fondos suaves); la marca de un cliente cambia los tokens, nunca el catálogo.

**El catálogo de estados** (`ESTADOS` en `estados.js`) le da a cada estado su tono y su icono:

| Grupo | Estados |
|---|---|
| Fuentes | `fuente-ok`, `fuente-parcial`, `fuente-no-cargo` |
| Fuente por conectar | `fuente-ejemplo` (el sello «Data de ejemplo») |
| Niveles de aviso | `nivel-atencion`, `nivel-revisar`, `nivel-oportunidad`, `nivel-bien` |
| Frente al objetivo | `objetivo-bien`, `objetivo-cerca`, `objetivo-lejos` |
| Conversación | `tono-muy-positivo`, `tono-positivo`, `tono-neutro`, `tono-negativo`, `tono-muy-negativo` |
| Piezas y campañas | `sin-leads`, `costosa`, `saturada`, `rinde`, `aprendizaje`, `poca-data` |

Reglas:

- **El color nunca va solo:** una etiqueta con juicio lleva `estado` (que pone el icono) y palabra. La palabra vive en `src/textos`, salvo la de los niveles de alerta, que está en `NIVELES` de `Componentes.jsx`; el icono, en el catálogo. `tono` suelto es para lo que no juzga (un universo, la barra); `barra` va solo en la variante `texto`.
- **Un estado nuevo se agrega al catálogo**, con su tono y su icono, y su palabra en `src/textos`. Un estado que no está en el catálogo rompe el render a propósito (`estadoDe` lo avisa con el nombre del archivo): las pruebas lo atrapan antes de publicar.
- **Dónde va no es cómo se ve.** Las clases de ubicación (`q-junto` junto a un nombre, `q-sobre-carta` sobre un mazo, `q-nivel` en un aviso, `q-sello-datos` en la barra) solo ubican; el aspecto es siempre el de la variante.
- **Un botón no es una etiqueta.** Un botón chico que elige (preguntas sugeridas de MAIA, caras de una ubicación OOH) es `BotonFiltro`, un control con su foco y su estado presionado.
- **Data de ejemplo:** la tarjeta con `ejemplo` lleva `SelloEjemplo`; nunca entra a los avisos ni a MAIA.
- **Ninguna pantalla arma su pastilla.** `npm run sistema` rechaza una regla de CSS con letra de 12 o 13 px, relleno, radio y fondo o borde fuera de `.q-etiqueta` (un botón, un campo, lo que flota o lo que tiene medida fija no cuenta), y una clase de `src` con un tramo llamado chip, badge, insignia, pastilla, pill o tag en cualquier texto entre comillas. Es una red, no un candado: una pastilla escrita en un `style` o con otro tamaño se le escapa, y por eso esta guía va primero.

## 2. Piezas de pantalla

| Necesito | Uso |
|---|---|
| Un capítulo con número, pregunta y fuentes con problema | `Seccion`; los avisos van en cada tarjeta (`AvisosTarjeta`) |
| Una tarjeta | `Bloque` (título, lectura, ventana, avisos, ayuda, cuerpo, pie con universo; `ejemplo` pone el sello). Tres a la vista por capítulo y diez en todo el panel |
| Lo minucioso del capítulo | `Detalle`, al pie del capítulo, con ancla `#detalle-s-x-y` |
| Falta el dato, cargando, fuente caída | `Bloque` con `estado` (usa `Estado`): nunca un cero en su lugar |
| Una tabla | `Tabla` (números a la derecha, `barra`, `destacada`, `apagadas`) |
| Elegir entre pocas opciones | `Grupo` (botones segmentados); una lista de opciones sueltas, `BotonFiltro` |
| El período | `SelectorPeriodo`, con los atajos de `src/calculo/periodo.js` |
| Un panel a la derecha | `PanelLateral` |
| Una ventana modal | `Dialogo` |
| Audio y video | `Reproductor` |
| Un gráfico o el mapa | `src/sistema/graficos/` (ver [quincha.md](quincha.md), §5) |

## 3. Formatos de cifras y fechas

De `src/sistema/formato.js`. Ninguna pantalla formatea a mano. Los espacios de los ejemplos son duros (U+00A0) y el menos es tipográfico (U+2212): en una prueba se compara con la salida de la función, no con el texto copiado de aquí.

| Qué | Función | Sale |
|---|---|---|
| Número | `numero(n, dec)` | 47 600 · 4800 (espacio duro desde cinco cifras, coma decimal) |
| Número grande | `compacto(n)` | 47,6 mil |
| Dinero | `soles(n, dec)`, `solesCompacto`, `dolares`, `euros` | S/ 4800 · $8,90 · 1200 € |
| Porcentaje | `porcentaje(p, dec)`, con `p` en puntos (34, no 0,34); `parte(p)` para un share | 34 % · menos de 1 % |
| Variación | `variacion(p, dec)`, en puntos | +12 % · −3 % (menos tipográfico; el cero sin signo) |
| Fechas | `fecha`, `fechaCorta`, `fechaSinAnio`, `rangoFechas`, `mesAnio` | 3 de octubre de 2026 · 3 oct |
| Sin medición | `NO_MEDIDO` | sin dato (lo devuelven los formatos de cifras con un valor que no es número; los de fecha esperan una fecha válida) |

## 4. Textos que se repiten

De `src/textos/comun.js`. Una frase sobre el período, la comparación o un medio se arma con estas funciones, para que diga lo mismo en todo el panel.

| Qué | Función |
|---|---|
| El período en palabras | `periodoTexto`, `resumenTitulo`, `mesPeriodo`, `tramoFechas`, `ventanaTexto`, `tramoMeses` |
| Contra qué se compara | `comparacionTexto`, `frenteATexto`, `mesComparacion`, `puntosFrente` |
| Share y marcas | `shareTexto`, `shareDeMarca` |
| Medios y plataformas | `medioEnFrase`, `plataformaEnFrase`, `plataformasTexto`, `tipoAviso`, `version` |
| Listas y números chicos | `lista`, `enLetras`, `segun`, `capital` |

Las lecturas de cada capa viven en `src/textos/lecturas.js` y lo de MAIA en `src/textos/maia.js`. Los textos observan y no ordenan, dos frases como máximo por lectura, sin rayas largas, y pasan por vickyfy.

## 5. Tokens, en una línea cada uno

- **Color:** solo semánticos (`--texto-1/2/3`, `--superficie`, `--mejora`, `--empeora`, `--atencion`, `--serie-1`, `--previa`…). Los primitivos `--p-*` son de `tokens.css` y de nadie más.
- **Letra:** `--t-13` a `--t-36`; cifras `--c-24`, `--c-32`. Pesos `--peso-lectura`, `--peso-rotulo`.
- **Aire:** `--e-1` a `--e-16`. Radios `--r-*`. Duraciones `--d-*`. Ningún borde de más de 2 px.

## 6. Qué revisa cada chequeo

| Comando | Atrapa |
|---|---|
| `npm run sistema` | Colores, tamaños y espacios escritos a mano; tokens huérfanos; contraste en los dos temas; franjas de resalte; colores de las marcas vigiladas; pastillas armadas fuera de `Etiqueta` |
| `npm run prueba` | Pipeline, cálculo, período, piezas, vigiladas, MAIA, el catálogo de estados completo, y el render de cada capa por escenario |
