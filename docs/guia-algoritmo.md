# Guía para diseñar un algoritmo

Así se diseña un algoritmo de The Lab para cualquier cliente. Sale del algoritmo que ya está en producción y de lo que se aprendió armando la demo de Fit Lab. Cada regla está implementada en este repositorio; la ruta entre corchetes dice dónde.

El sistema de diseño con el que se construye (colores, componentes, gráficos y el chequeo) es [Quincha](quincha.md). Para llevar todo esto a otra marca, el paso a paso está en [nuevo-algoritmo.md](nuevo-algoritmo.md).

Antes de cualquier decisión, la pregunta es la misma: **¿esto lo vamos a poder entregar con la data real?** Una vista nueva sirve si sale de fuentes que de verdad tenemos. Si no, no entra, aunque se vea bien.

## 1. Cuatro capas, en el orden en que trabaja la agencia

| # | Capa | Pregunta | Qué va |
|---|---|---|---|
| 1 | **Captura de señales** | ¿Qué pasa afuera? | Búsquedas (Google Trends), lo que se publica en el rubro (TikTok, Facebook), quién entra al sitio (GA4: usuarios, canales, páginas) |
| 2 | **Inteligencia de mercado** | ¿Conviene invertir ahora y qué miro? | Índice de oportunidad con su historia, Qué mirar (alertas y lo que va bien), temporada y escenario si nada cambia |
| 3 | **Activación estratégica** | ¿Dónde está la inversión y a qué costo? | Reparto por plataforma y producto, sugerencia del modelo, una tarjeta por plataforma (inversión por día, campañas, palabras), horas del sitio |
| 4 | **Rendimiento y optimización** | ¿Qué dio resultado? | Leads y acumulado del mes, de la pauta al CRM, el CRM por dentro, cuándo y dónde entran los leads, la competencia |

- Cada capa tiene capítulos numerados (1.1, 1.2…). Las alertas apuntan a un capítulo por su número, y una prueba falla si apuntan a uno que no existe. [`src/capas/estructura.js`, `pruebas/calculo.test.mjs`]
- Para otro cliente se agrega o se quita un capítulo en la estructura; los componentes no cambian.
- No se ordena por profundidad de análisis (cada fuente sola, luego cruces, luego el modelo). Con tres capas así, una sola pregunta («¿cómo va mi pauta?») quedaba repartida en tres pestañas y la primera capa era casi tres veces más larga que las otras.

## 2. Tipografía

- **Por defecto**, la del algoritmo de referencia:
  - **Sofia Sans** para texto e interfaz;
  - **Sofia Sans Condensed** para el título de la capa y las cifras grandes;
  - **Sofia Sans Semi Condensed** para las tablas (`--f-tabla`).

  Son paquetes `@fontsource-variable/sofia-sans`, `-condensed` y `-semi-condensed`, con licencia OFL, y se cargan desde el propio build, no desde Google Fonts. No vienen instalados en este repo porque Fit Lab tiene tipografías propias.
- **Si el cliente tiene tipografías de marca que podemos usar, van esas.** Fit Lab usa Bricolage Grotesque en títulos y cifras, y Atkinson Hyperlegible Next en el texto. [`src/sistema/tokens.css`, `--f-titulo` y `--f-texto`]
- Las cifras van en números tabulares. Si la tipografía de texto tiene el cero cruzado, se reemplazan solo los dígitos con un `@font-face` de rango `U+0030-0039`. [`src/sistema/base.css`, «Cifras de la marca»]

## 3. Navegación

- **Pestaña de capa:** número y nombre. La capa activa tiene un fondo apenas teñido del color de acento de la marca (`--acento-suave`), texto y número en ese color (`--acento-texto`) y una marca redonda de 28 × 7 px pegada abajo. El radio es de 6 px arriba y 0 abajo. Al pasar el mouse, fondo de capítulo. [`.q-capas` en `src/sistema/componentes.css`]
- Las pestañas van en su propia fila, con una línea abajo. Los filtros (mes, comparar con) van en la fila siguiente. Las dos filas quedan fijas arriba en pantallas anchas.
- Índice «En esta capa» al costado, que marca el capítulo que se está leyendo: el último cuyo inicio ya pasó bajo la barra fija. Arriba de todo marca Resumen y al final de la página, el último capítulo. Un clic baja al capítulo sin cambiar de capa. [`IndiceCapa`]
- El alto de la barra fija se mide en pantalla (`--alto-capas`), no se escribe a mano: así un ancla nunca deja el título debajo de la barra, aunque la barra cambie de alto. En celular la barra no es fija y el alto es cero.
- **Qué se monitorea:** un botón junto a las fuentes de cada capa abre un panel lateral con lo que sigue cada fuente: palabras de Google Trends, hashtags, marcas, cuentas de pauta, palabras clave y páginas del sitio. Es configuración, no medición. [`PanelLateral`, `Monitoreo`; `monitoreo` en `src/calculo/vista.js`]
- **Presentar:** un botón en la barra superior agranda la letra para proyectar en una reunión, sin cambiar la página.
- Las anclas llevan de cualquier lado a cualquier lado: `#activacion` (una capa, desde su resumen), `#s-3-2` (un capítulo), `#a-…` (una alerta, que además se abre) y `#p-google` (una plataforma). Un ancla que no dice capa deja la capa donde está; nunca devuelve a la primera. [`src/App.jsx`]

## 4. Anatomía de una capa

1. **Cabecera:** título, una bajada de una línea y las fuentes con su fecha de corte. Un punto verde, ámbar o rojo dice el estado, y el texto también lo dice.
2. **Resumen:** de cuatro a cinco cifras. Cada una lleva su variación o su nota y un enlace al capítulo que la explica. Las cifras de una plataforma llevan el punto de su color en el rótulo («● CPL Google Ads»).
   - **El objetivo se dice en una frase, no en una barra.** Va en una caja gris debajo de las cifras, con una línea por plataforma: «Google Ads pagó **$7,14** por lead: $0,37 por debajo de su objetivo de **$7,51**». Solo la distancia lleva color (rojo si pasa el objetivo, verde si queda debajo) y las cifras van en negrita. Se eligió así porque no hay nada que aprender a leer, ocupa pocas líneas y no compite con las cifras de arriba. [`Resumen`, `frases`; `objetivoFrase` en `src/textos/capas.js`]
3. **Capítulos:** un panel gris con número, título y pregunta. Arriba van los avisos de las alertas que ese capítulo sostiene, en una línea cada uno, y debajo las tarjetas blancas.
4. **Vista general y detalle.** Cada capítulo muestra a la vista solo lo que cambia la decisión de la semana; lo minucioso va en su **detalle**, un panel que se abre a la derecha con el botón «Ver el detalle» al pie del capítulo. [`Detalle`]
   - **Tope:** tres tarjetas a la vista por capítulo y diez en todo el panel. Si una tarjeta nueva no entra, otra pasa al detalle o se fusiona.
   - **El botón nombra lo que hay adentro** («Ver el detalle: paneles por distrito y la pieza de cada panel»). Nada se esconde sin aviso.
   - **Las alertas siguen leyendo todo.** Una alerta cuyo dato vive en el detalle lleva a ese panel (`#detalle-<capítulo>`), no a la vista general.
   - **Va al detalle:** las tablas en soles de lo que ya muestra un gráfico, el día por día, las listas largas (programas, canales, distritos, todos los estrenos) y lo que solo usa quien planifica medios.
   - **Fusionar antes que sumar.** Dos tarjetas que responden la misma pregunta van en una, con un selector (ATL o digital) o con una segunda lectura separada por una línea (los estrenos bajo el cronograma).
   - **Una fuente nueva** (Google Ads, Meta, TikTok, un Google Sheets) entra primero a una tarjeta que ya existe: una fila, un mazo del abanico, una marca en un gráfico, una frase de objetivo. Abre tarjeta propia solo si responde una pregunta que ninguna otra responde, y entonces respeta el tope.

## 5. La tarjeta

- La estructura siempre es la misma: cabecera (título, ventana, ayuda y lectura), cuerpo y pie con la fuente. Las tarjetas vecinas se alinean fila por fila con CSS subgrid. [`Bloque`]
- **Ventana arriba a la derecha.** Con calendario si sigue el período elegido («1 al 30 de setiembre»). Con alfiler si no lo sigue: una cohorte, «últimas 52 semanas», «lectura de setiembre», «anuncios activos al 30 de setiembre».
- **Lectura:** dos frases como máximo. Dice lo que el gráfico no dice solo, y cada comparación dice frente a qué.
- La ayuda (?) explica cómo se calcula. Los supuestos van ahí, no en el cuerpo.
- **Sin texto de relleno.** Ninguna lectura, pie, leyenda ni ayuda explica cómo usar la pantalla («un clic abre…»), lo que la leyenda ya muestra («las dos marcas en la misma escala») o el gráfico ya dice. Nada de jerga interna (pipeline, componente, variables de entorno) en lo que ve el socio: eso va en `docs/activacion.md`. Si para entender una cifra hace falta un párrafo, el problema es la cifra. Lo revisa `npm run prueba` con una lista de frases prohibidas; todo texto nuevo pasa por vickyfy. [`RELLENO` en `pruebas/vista.test.mjs`]
- **Sin franjas de resalte.** Ninguna tarjeta lleva una barra de color al costado para llamar la atención. Lo importante se resalta con el orden, el tamaño o el peso del texto. Vale también para cualquier página que acompañe al algoritmo (auditorías, propuestas). [`npm run sistema`]

## 6. Gráficos y tablas

- **Forma.** Un solo eje (nunca doble) y líneas sin suavizar. Un día sin dato es un hueco, no un cero. El período de comparación va en gris.
- **Color.**
  - Las barras y líneas de dato van en el color de datos de la marca (`--serie-1`).
  - Si un gráfico resalta algo (la página nueva, las cuatro horas más altas, el día que más tiene), lo resaltado va en ese color y el resto en gris claro (`--serie-resto`).
  - Una sola marca resaltada por gráfico.
  - **Quién va resaltado lo decide el foco del algoritmo.** Si lo principal es la competencia (un algoritmo de inteligencia competitiva), la competencia va en el color de datos y la marca propia en su color de marca (`--propia`), liso y sin el borde del foco; el gris queda para la comparación y el resto. Las lecturas empiezan por la competencia. La vista lo marca con `foco` en cada marca y las pantallas no deciden. El color sigue a la marca en todo el panel.
  - **El color de datos puede ser el de la marca en foco** si pasa contraste: directo, o con la regla de relleno con borde de Quincha cuando es un color claro (un amarillo). Un rojo de marca puede convivir con un «empeora» rojo solo si ningún texto lleva el color de la marca y toda variación lleva signo. Los pares de colores que conviven en un gráfico se validan contra daltonismo, no a ojo: una línea no tiene borde y puede necesitar un tono más oscuro que el relleno (`--propia-linea`). Si el color de foco choca con un color de estado o de categoría (un amarillo contra el ámbar de «atención»), se mueve el otro.
  - Las partes de un todo van en azul, naranja y menta, en ese orden, más un gris para «el resto». Si se comparan varias franjas, cada categoría lleva siempre el mismo color (el color sigue a la categoría, no al orden).
- **Área clara** bajo la serie propia en las líneas.
- **Leyenda arriba en las líneas.** Los nombres de las series van en una leyenda sobre el gráfico, con la muestra de su trazo, a cualquier ancho. Un rótulo al final de cada línea deja un margen muerto a la derecha y se encima cuando las líneas terminan juntas. [`Lineas`]
- **«Ver como tabla»** visible debajo de cada gráfico. Se apaga solo si la tarjeta ya muestra esa tabla justo debajo.
- **Tablas.**
  - La columna principal lleva una barra delgada junto a la cifra.
  - El nombre puede llevar un subtítulo gris («Search · Membresías»).
  - El costo por lead va en rojo si pasa su objetivo y en verde si no.
  - Se resalta la fila propia (la marca, el hashtag propio). [`Tabla`]
- **Artes (anuncios, piezas, paneles):** el abanico, un mazo por dueño con sus tres piezas más recientes que se abre en abanico, y una ventana con todas. La marca propia va aparte: primero, o al final si el foco es la competencia. [`Abanico`, [abanico.md](abanico.md)]
- **Horas:** si la fuente trae la hora y el día de cada evento (las emisiones de Integrametrics), mapa de calor día × hora. Si los trae por separado (GA4), barras por hora con las cuatro más altas resaltadas y barras por día al lado. [`MapaCalor`, `HorasYDias`]
- **Elegir la forma por la pregunta, no por costumbre.** Un panel lleno de barras se lee plano. Antes de poner barras, ver si la pregunta es otra:
  - antes y después, o dos marcas en la misma escala: mancuernas [`Pesas`];
  - cómo cambia un ranking entre dos momentos: pendiente [`Pendiente`];
  - cómo se reparte un total: franja de partes [`Franja`];
  - cuándo se prende y se apaga algo en el año: columnas semanales, un panel por marca con su escala y el período resaltado [`Histograma`]. Las tiras de un día por celda [`Tiras`] marean con más de un par de filas: quedan para series cortas;
  - cuánto dura cada versión o campaña: cronograma [`Cronograma`];
  - dónde está: mapa con puntos clicables y una ficha al lado [`MapaPaneles`].
  Las barras quedan para rankings (canales, programas).
- **Rampas de magnitud:** un solo tono, de claro a oscuro. Si el gráfico es de una sola marca (el mapa de calor de cuándo emite), la rampa va en el color de esa marca, para que se sepa de quién es el dato sin leer el título; si no, en tinta. Nunca un color que no es de ninguna marca del panel. [`--q0` a `--q6`, `--qf0` a `--qf6` del foco, `--qp0` a `--qp6` de la propia]
- **Un gráfico de ventana fija puede resaltar el período elegido.** El gráfico del año (con alfiler) pinta en el color de cada marca solo las semanas con días del período elegido arriba, y el resto en gris; la leyenda dice cuáles son. Si todo va resaltado, nada lo está. Una parte que sigue el período dentro de una tarjeta de ventana fija (los estrenos bajo el cronograma) lleva su propio calendario.
- **El color es de las marcas.** Una serie que no es de ninguna marca (las búsquedas del rubro) va en tinta, no en el amarillo de la competencia. La misma marca en dos universos va en su color, con el segundo en trazo discontinuo. [`Lineas` con `tono: 'tinta'` y `discontinua`]
- **Una escala para todas las marcas.** Si dos marcas van una debajo de otra, comparten la escala: una barra más alta siempre es más inversión. Escalas distintas se leen como la misma aunque la ayuda diga que no. Si una marca invierte decenas de veces menos y sus barras desaparecen, la escala común pasa a raíz cuadrada (su ayuda lo dice): las barras chicas se ven y la más alta sigue siendo la de más inversión. [`Histograma` con `max` y `escala="raiz"`]
- **Controles dentro de una tarjeta** (marca, universo): van en `q-control-tarjeta`, que no abre columnas en el cuerpo de la tarjeta. Un control que abre columnas deja el gráfico angosto con un hueco a la derecha. Antes de entregar, cada gráfico mide lo mismo que su tarjeta.
- **Mapas:** Leaflet con un mapa base de verdad (calles y nombres), calmado con el filtro `--mapa-filtro` para que se lean los puntos. Cada punto se puede elegir y abre una ficha con la pieza; un punto que no se puede abrir no sirve. Fuera de la ciudad principal, botones de zona que encuadran el mapa. El distrito sale de las coordenadas, nunca del texto que trae la fuente.
- El contraste se mide con `npm run sistema`. Los pares de colores que conviven en un gráfico tienen mínimos propios.

## 7. Datos honestos

- **Plataformas como las ve el cliente.** Google Ads es una sola plataforma; Search y Display son tipos de campaña dentro de ella. [`plataformas` en `src/muestra/configuracion.js`]
- **Solo lo que tenemos.** No hay plan de inversión por día, así que no se muestra ritmo contra plan, y el escenario supone que la inversión diaria de las últimas cuatro semanas se mantiene. De la competencia solo se lee lo publicado: sin comparar contra el año anterior.
- **Universos.** Pauta, CRM y sitio cuentan cosas distintas: se leen lado a lado y nunca se suman. Las inscripciones se miden por cohorte cerrada, porque un lead tarda en inscribirse.
  - Una excepción, a pedido: dos estimaciones de inversión hechas con métodos distintos (ATL y digital de Integrametrics) se pueden sumar en un selector «Todo» para ver cuándo se prende una pauta. Esa vista lleva escrita la nota de que no sirve para comparar montos, y ningún share ni ninguna alerta usa la suma. [`pautaPorSemana`]
- **Sin ganadores falsos.** Si los valores están a menos de 10 % entre sí, se dice que «se parecen» y no se resalta ninguno. El empate se mide contra el mejor: si Google cuesta $51 por inscripción y Meta $52, se parecen aunque TikTok cueste $67. [`margenParecido`, `cpaParecido`]
- **Alertas.** Cada una sale de una regla con un umbral fijo y trae su dato. Incluye el calendario: una campaña del CRM que cierra dentro del mes siguiente avisa, para que la pauta que la empuja llegue hasta el cierre. La acción queda dentro de lo que maneja la agencia (pujas, palabras, páginas, reparto) o se plantea como conversación con el cliente. Nunca se presiona al personal del cliente.
- **Textos.** En español peruano, sin rayas largas ni «gente». Las cifras chicas al inicio de una frase van en letras. Observan, no ordenan. Antes de entregar, todo texto pasa por vickyfy.

### Data en movimiento

Cada vista se diseña para la data que va a llegar, no solo para la de hoy. La data se estira, se apaga, se acorta y trae nombres que nadie previó; la vista tiene que seguir leyéndose.

- **Escenarios.** `src/calculo/escenarios.js` mueve la data real para un lado y para el otro: la competencia fuerte o apagada, la marca propia apagada, montos mil veces mayores, un mes con un solo día, sin paneles o con diez veces más, ocho veces más estrenos, nombres largos, un pico en las búsquedas y búsquedas sin un año de historia. `pruebas/escenarios.test.mjs` arma cada escenario en cada mes y revisa números y textos. En la demo están en la barra, y también con `?escenario=<id>` en la dirección.
- **Pocos días no comparan.** Con menos de siete días con data en el período (`DIAS_MINIMOS`), ninguna lectura ni alerta habla de subidas, bajadas o puntos de share: un solo día raro mandaría. Una alerta lo dice y los estrenos y paneles nuevos siguen saliendo.
- **Apagarse también es señal.** Si la competencia tenía inversión en la comparación y en el período no tiene, avisa; si baja a la mitad o menos, también.
- **Los extremos se escriben.** 0 % y 100 % no se dicen como «tiene 0 %» o «pone el resto (0 %)»: se dice quién no tiene inversión. «0 de 13 días» se dice «en ninguno».
- **Lo que no cabe se adapta.** Los márgenes de los gráficos se miden con sus rótulos; una cifra en el borde se corre hacia adentro; un grupo de más de cuatro opciones pasa a ser una lista; un nombre de más de sesenta letras se corta en las lecturas y queda entero en la tarjeta.
- **Nada deja la pantalla en blanco.** Cada gráfico y cada capa van dentro de un `Resguardo`: si una forma nueva de la data no se puede pintar, esa parte lo dice y el resto sigue.
- **Antes de entregar,** el barrido: cada escenario en cada capa, a 1440 y a 390, sin desbordes, sin rótulos encimados, sin `NaN` y sin errores.

## 8. Lo que dice el modelo

- **Qué mirar:** una sola tarjeta con una lista numerada por nivel (piden atención, para revisar, oportunidades, lo que va bien). Cada fila tiene el dato en el título y la acción debajo; al abrirla, el detalle y el enlace a la tarjeta que lo sostiene. [`ListaAlertas`]
- **Sugerencia del modelo:** tarjeta con robot y rótulo, apenas teñida. Lleva una frase grande que se puede decidir y su detalle, y al costado una columna por plataforma. Si no propone mover nada, la frase dice por qué. Propone mover inversión solo si una plataforma pasa su objetivo de costo por lead y el CRM confirma que es la que más cuesta por inscripción (sin pocos casos). Si dos destinos cuestan parecido por inscripción, gana el de lead más barato. [`SugerenciaModelo`, `reasignacion`]
- **Índice de oportunidad:** la cifra con su banda, cómo vino al cierre de cada mes y cada componente de 0 a 100 con su peso.
- **Escenario:** un rango, no una cifra. Dice cuántas veces acertó con meses ya cerrados y si le gana a la estimación ingenua. Un mes que acierta poco no se muestra.

## 9. La demo

- **Barra de la demo**, abajo a la izquierda: datos, cargando, el CRM no cargó y GA4 no cargó. Sirve para mostrar en vivo que el panel dice lo que falta en vez de dibujar ceros. [`BarraDemo` en `src/App.jsx`]
- **Escenario forzado**, solo en la data de muestra: desde setiembre TikTok se encarece y sus leads se inscriben menos. Así el modelo llega a una recomendación con sus reglas de siempre. Se hace en la configuración del generador (`cambiosCosto` y la calidad de cada canal), nunca tocando el modelo. [`src/muestra/configuracion.js`]

## 10. Antes de entregar

- `npm run prueba`: las reglas de cálculo y las anclas de las alertas.
- `npm run sistema`: tokens, contraste y espacios.
- Captura de cada capa a 1440 y a 390 de ancho, en claro y en oscuro, revisada a ojo.
- El barrido de escenarios (ver «Data en movimiento»).
- Ninguna cifra ni nombre de clientes reales en el repositorio.
- El nombre de la marca solo en `src/cliente.js` (lo revisa `npm run prueba`).
- `npm run artefacto -- <salida.html>` para publicar la página autocontenida.
