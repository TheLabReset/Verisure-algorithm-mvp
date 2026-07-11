# Bitácora de construcción — The Algorithm by Reset (Verisure Perú)

Registro por fase del rediseño v2 (dashboard social → inteligencia competitiva outside-in).
Cada fase: construir → auto-verificar → gate con subagente verificador independiente →
resolver hallazgos → re-gate hasta APROBADO → merge a `main`. La bitácora es parte del
producto: permite reconstruir cada decisión.

Fuentes de autoridad (orden): `docs/DESIGN (Verisure).md` → mockup `design/reference/The Algorithm Verisure.html` → blueprint `docs/verisure-ecosistema-bi-y-blueprint-v2.md` → `docs/AUDITORIA-ALGORITHM.md` → criterio. API: `docs/Documentación API Integra Metrics.pdf` (única fuente de verdad de campos).

---

## Fase 0 — Cimientos · rama `fase-0-cimientos` · merge `b25b25c`

**Construido.** Demolición del dashboard social heredado (4 capas, ML/sentiment/MAB, mock GA4, scrapers de engagement, apify-actors, data/ de otros clientes, workflow fitzone) previa verificación por grep de imports entrantes. Tokens de color mapeados 1:1 a DESIGN §1 (CSS vars + Tailwind; muere el namespace `fitzone-*`). Fuentes auto-hospedadas (Space Grotesk, Instrument Sans, Anton; 8 woff2 en `public/fonts/`, 0 URLs externas). Shell nuevo: header con wordmark Anton, nav de 4 módulos (Radar/Demanda/Contexto/MAIA), franja "Hoy", footer, frescura por fuente. Estructura `src/modules/{radar,demanda,contexto,maia}` + `src/components/ui`. Favicon MAIA, nombre de producto único.

**Auto-verificación.** `npm run build` limpio · grep `fitzone`=0 en código · grep hex fuera de whitelist=0 · `document.fonts` → Anton/Instrument Sans/Space Grotesk cargadas · screenshots 1440/390 vs mockup sin desbordamiento.

**Desviaciones legisladas.** (1) Fuentes auto-hospedadas en vez del `<link>` a Google Fonts de DESIGN §3 → se editó DESIGN §3 y §11 para legislarlo (garantiza carga, elimina dependencia externa en runtime, suma a governance). (2) Wordmark móvil en una línea con `clamp()` (DESIGN §8). (3) Touch target del nav 44px vs ~36px del mockup (DESIGN §7 manda).

**Pendientes declarados.** README del template (→ F5), `netlify.toml` viejo (→ F4/F5), `--grad-brand` definido sin uso hasta MAIA (F4).

**Gate.** Aprobado por el usuario (fase previa al protocolo autónomo).

---

## Fase 1 — Capa de datos, fixtures y derivadores · rama `fase-1-datos` · merge `f16d9e2`

**Construido.**
- Cliente único dual `source=fixtures|live` (env `VITE_DATA_SOURCE`). Live = Integrametrics Bearer (token solo en Node, nunca en el bundle; governance), paginación por día para el límite de 90.000, intervalo semiabierto `[start,end)` en hora local, errores manejados → banner honesto (DESIGN §7), sin crash.
- Fixtures en `src/data/fixtures/` (generador determinista `generate.mjs`, PRNG mulberry32) replicando EXACTAMENTE los campos del PDF (`/registros` 90 llaves, `/registros-digital` 18; catálogos `{id,name}` con los post-`/categorias` marcados PENDIENTE). ~30 días es-PE calibrados al mockup: SOI jue 10 = Prosegur 46,1% (S/118.400) · Verisure 33,3% · Securitas 20,6% (total S/256.800); DIY 58; pieza NUEVA "Nada es seguro, salvo tu hogar" 9:41 América TV PRIME. Fixtures de Trends, SIDPOL, BCRP y noticias.
- Derivadores puros: `computeSOI`, `detectNewPieces`, `pressureSeries`, `diyIndex`, `computeIPC`/`computeIMC`/`opportunityScore`. Export CSV `registrosToCSV` en dimensiones §A.7 (fecha/hora/zona/canal).
- Nav de módulos con tabs píldora pixel-perfect al mockup (pedido del cliente): contenedor blanco redondo con sombra, tab activo píldora `--ink` con texto `--surface`, inactivos `--ink-2` con hover `--wash`. Ubicado BAJO el wordmark (decisión del cliente: dar aire). Estilos en `index.css` con tokens.

**Auto-verificación.** `npm test` 26/26 con casos borde (día sin registros, empate, mes incompleto, fuente caída, live sin token) · `npm run validate:fixtures` verde (0 campos fuera del PDF) · build OK en fixtures y live · banner live renderiza sin crash · test de oro SOI=46/33/21.

**Gate 1 (subagente independiente): APROBADO CON CORRECCIONES.** Núcleo de datos byte-idéntico y sólido. Hallazgos: #1 MAYOR playwright-core commiteado · #2 BLOQUEANTE hex `#F1EDE6`/`#FFFFFF` crudos en el nav (DESIGN §10) · #3–#6 MENOR (banner rojo en vez de `--caution`, copy de fase obsoleto, capa no cableada, path fixtures sin test) · #7–#10 SUGERENCIA (runner glob frágil, env name, cobertura detectNewPieces, vulns npm).

**Resoluciones (cada una verificada).**
- #2 BLOQUEANTE → legislé `#F1EDE6` como token `--wash` en DESIGN §1; nav hover `var(--wash)`, tab activo texto `var(--surface)`, skeleton a tokens. Grep hex fuera de tabla = 0.
- #1 MAYOR → quité `playwright-core` del manifiesto (devDep de verificación; uso transiente install/rm por gate).
- #3 → banner: fondo `--wash` + acento `--caution` (borde+texto+icono), DESIGN §7. Verificado en navegador: `color rgb(154,91,0)=--caution` sobre `rgb(241,237,230)=--wash`.
- #4 → copy "Fase 1"→"Fase 2" en `RadarModule` y comentario de `modules.js`.
- #6 → exporté `applyFilters` y añadí tests de intervalo semiabierto + OR; el import de JSON queda documentado como browser-only.
- #7 → `test: "node --test"` (autodescubre).
- #9 → tests de `detectNewPieces` para múltiples-mismo-día y no-último-día.
- #10 → diferí `recharts` (aún sin importar) → elimina la vuln high transitiva de lodash; se re-añade en F2 con los charts.
- #8 → aclarado en comentario (Node usa `DATA_SOURCE`, browser `VITE_DATA_SOURCE`; intencional).

**Gate 2 (subagente fresco): APROBADO CON CORRECCIONES (menores).** Sin hallazgos bloqueante/mayor. Cross-check independiente del PDF (18 páginas renderizadas) confirmó 0 campos inventados; determinismo byte-a-byte; banner honesto sin crash; token no filtra al bundle; nav píldora idéntico al mockup con tokens. Hallazgos menores: #1 chunk de fixtures viaja en build live · #2 sello de frescura contradice el banner en live · #3 ruta del mockup en DESIGN con guiones bajos · #4–#6 SUGERENCIA/observación.

**Resoluciones Gate 2.**
- #2 → oculto el sello de frescura cuando `sourceDown` (el banner ya explica el snapshot). Honestidad DESIGN §2.
- #3 → corregí la ruta del mockup en DESIGN §1 (nombre real con espacios).
- #1 (chunk de fixtures en build live) → **diferido a F2 con justificación**: el chunk está code-split (34 kB gzip, no en el bundle principal) y en modo live NUNCA se carga en runtime; el refactor a `fetch` desde `public/data/` se hace en F2 al cablear la UI y finalizar la ruta de servido de datos.
- #4 (DESIGN §11 cita Recharts) → **sin cambio**: la guía "SVG propio o Recharts" sigue válida; recharts vuelve en F2.
- #5 (npm audit) → **sin acción**: `npm audit --omit=dev` = 0 vulns (prod limpio); las 6 restantes son toolchain devDep de Vite, preexistentes, no introducidas por F1 (de hecho se redujeron al quitar recharts→d3). Requieren major de Vite (breaking); diferido.
- #6 (44px pill) → intencional, ya legislado.

**Criterio de gate.** Gate 2 sin bloqueante/mayor; menores resueltos o justificados por escrito (protocolo §1.4). Se procede al merge.

**Pendientes declarados.** Cablear módulos a la capa de datos (F2). Servir fixtures desde `public/data/` vía fetch (F2). Vulns de toolchain Vite (major, F5 o cuando aplique). Re-añadir recharts para charts (F2).

---

## Fase 2 — RADAR · rama `fase-2-radar` · merge `d0b00c0`

**Construido.** DataProvider (context) que carga los datos del día una vez y los comparte (franja + módulos); **cero data hardcodeada en JSX**. Franja "Hoy" real (piezas nuevas + SOI → titular honesto). "La jugada del día" (card ancla oscura con captura rfile, NUEVA, inversión estimada rayada, tono EPPM). SOI cápsulas con vocabulario de honestidad (Verisure sólido, competencia rayada, leyenda, delta vs semana pasada). Timeline 30d en SVG propio (una serie enfatizada, competencia en grises, eventos anotados, etiquetas directas, sin grid pesado — SWD). Ad Museum (piezas agrupadas por versión con catálogo estable, EPPM, inversión acumulada). Mapa OOH (SVG esquemático de Lima, puntos ∝ inversión, toggle capa riesgo SIDPOL). Estados: skeleton, vacío (última detección), fuente caída (cápsulas+timeline+OOH punteados); forzables con `?demo=loading|empty|sourcedown`.

**Auto-verificación.** 31 tests verdes · build fixtures+live · §10 limpio (hex fuera de tabla 0, fitzone 0, focus-visible, tabular-nums) · cero data hardcodeada (módulos vía useData/derive) · 4 estados por screenshot 1440/390 sin overflow ni errores de consola.

**Gate 1 (subagente fresco): APROBADO CON CORRECCIONES** — 1 BLOQUEANTE + 2 MAYOR + menores.

**Resoluciones (cada una verificada en navegador):**
- **#1 BLOQUEANTE** (dinero con coma en Chromium por `toLocaleString('es-PE')`): `formatSoles`/`formatThousands` ahora agrupan miles con PUNTO de forma determinista (regex), independiente del ICU. Verificado: DOM muestra `S/ 84.300` (charcode 46).
- **#2 MAYOR** (estado vacío sin "última detección", por atarse al flag same-day `NUEVO`): el generador marca la PRIMERA emisión de cada versión como NUEVA (detección histórica), excluyendo hoy salvo el hero → `detectNewPieces(hoy)` sigue = 1; `lastDetectionLabel` deriva la última detección (tipo + duración + canal). Verificado: "mié 17 jun · Prosegur · spot 15 s en LATINA".
- **#3 MAYOR** (contraste AA: `--ink-3` a 12px sobre blanco = 3.21:1): todos los TEXTOS en `--ink-3` sobre superficies claras pasan a `--ink-2` (6.62:1); los elementos GRÁFICOS (colores de serie/puntos, tramas, líneas de avenida) mantienen `--ink-3` (marcas de dato sobre el piso `#C9CDD4`, no texto). Nota: DESIGN §5 dice "ejes en --ink-3" pero eso también falla AA; se priorizó §10 (AA) usando `--ink-2` en ejes. *Propuesta de clarificación de DESIGN §5 pendiente (no bloqueante).*
- **#5 MENOR** código muerto: eliminados `Pill.jsx` (F2) y `Card.jsx` (preexistente, sin uso).
- **#6 MENOR** honestidad incompleta: el estado fuente-caída ahora propaga `degraded` al timeline (líneas dashed) y al mapa OOH (puntos punteados), no solo a las cápsulas.
- **#7 MENOR** scroll-x sin indicador: `.scroll-x-fade` implementa fade de borde derecho (mask-image) y se aplica al timeline (DESIGN §8).
- **#8 SUGERENCIA** título OOH hardcodeado: ahora se deriva del dato (distrito con más inversión).
- **#9 SUGERENCIA** rojo en iconos del Ad Museum: iconos ▶ neutros (DESIGN §1, sin migajas de rojo).
- **#10 paridad**: hora "9:41 a. m." (no "09:41"), "spot" (no "spot tv"), signo menos tipográfico "−", 5 marcas en el eje X, y OOH con las 3 marcas (Securitas ahora tiene vía pública).
- **#4 MENOR** (chunk de fixtures en build live): **diferido a F4** con justificación — la ruta de servido de fixtures (`fetch` desde `public/data/`) debe diseñarse en concierto con el pipeline de F4, que fija el contrato de salida `public/data/`. Hacerlo en F2 y rehacerlo en F4 sería churn. Impacto actual bajo (code-split, nunca cargado en runtime live).

**Números de oro tras las correcciones:** SOI 46,1/33,3/20,6 (S/256.800) · NUEVA=1 · Ad Museum 22 piezas · OOH 3 marcas · última detección poblada. 31 tests verdes.

**Pendientes declarados.** Servir fixtures desde `public/data/` vía fetch (F4, junto al pipeline). Re-añadir recharts si algún chart lo amerita (hoy todo es SVG propio). Clarificar DESIGN §5 (ejes `--ink-3` vs AA). Vulns de toolchain Vite (major, F5).

---

## Fase 3 — DEMANDA + CONTEXTO · rama `fase-3-demanda-contexto` · merge `b24fabf`

**Construido.**
- **DEMANDA:** slope Share of Search vs Investment (SVG propio, Verisure enfatizado, competencia en grises, leyenda de honestidad SoS/SoI, insight "Buscan a Verisure más de lo que Verisure invierte" + brecha derivada); tendencia de búsquedas «alarma para casa» (serie de categoría enfatizada, +18%/90d); card Amenaza DIY (gauge sobrio de un arco en `--caution`, 58/100, + 3 componentes con fuente y "marcas monitoreadas").
- **CONTEXTO:** cápsulas de denuncias por distrito (SIDPOL, top-3 en `--ink`, resto en gris, mes visible + nota de rezago ~45 días + "Ver los N distritos"); tira de estacionalidad de 12 meses con picos (Fiestas Patrias / navideño) en `--caution`; fila macro BCRP (4 celdas con deltas neutros, sin color bueno/malo); noticias tipográficas (titular fuerte + fuente·hora).
- Derivadores nuevos: `brandKey`, `investmentShare`, `searchVsInvestment` (cruce ESOV). CONTEXTO es lectura directa del fixture `contexto` vía `useData`.

**Auto-verificación.** 34 tests verdes (3 nuevos) · build ok · hex fuera de tabla 0 · cero data hardcodeada (módulos vía `useData`) · siglas glosadas (SoS/SoI/DIY) · grises de data ≥ `#C9CDD4` (barras en `--ink`/`--ink-3`, tracks en `--wash`) · paridad visual 1440 vs mockup sin overflow ni errores de consola.

**Pendientes/notas.** Deviaciones de calibración vs mockup (brecha 9 pts vs 13, 35 distritos vs 43) — fixtures son la fuente de verdad.

**Gate 1 (subagente fresco): APROBADO CON CORRECCIONES** — 0 BLOQUEANTE, 1 MAYOR + menores/sugerencias.

**Hallazgos.** #1 MAYOR el slope recorta la columna "SHARE OF INVESTMENT" en 390px sin indicador de scroll (DESIGN §8). #2 MENOR el slope no distingue visualmente pauta confirmada (Reset) de estimada (Integrametrics) pese a que DESIGN §2 lo exige. #3 MENOR titulares de noticias y "Ver los N distritos" no son navegables/interactivos (afordancia). #4 MENOR barras no-pico de estacionalidad en `--ink-3` (#8A909C) por debajo del piso de dato legible en fondo blanco. #5 MENOR siglas SIDPOL/BCRP sin glosa (accesibilidad de lectura). #6 SUGERENCIA título DIY hardcodeado, debería afirmar sobre el índice. #7 SUGERENCIA el badge de tendencia semanal del gauge y la tercera línea de insight (Securitas) enriquecen la lectura.

**Resoluciones.**
- **#1 (MAYOR).** `.scroll-x-fade` (máscara de degradado, DESIGN §8) aplicado al contenedor del slope y de la tendencia de búsqueda; `minWidth: 460` en el SVG para que el fade señale el corte en móvil.
- **#2 (MENOR).** Vocabulario de honestidad DESIGN §2 en el slope: Verisure sólido (pauta operada por Reset = confirmado), competidores rayados (`strokeDasharray='5 3'` = estimado Integrametrics); leyenda al pie "sólido = confirmado · rayado = estimado".
- **#3 (MENOR).** Titulares de noticias como `<a href={noticia.url}>` (campo `url` añadido al fixture `contexto.noticias`, 4/4) con `hover:text-verisure-deep`; "Ver los N distritos" como `<button>` con `:focus-visible`.
- **#4 (MENOR).** Barras no-pico de estacionalidad en `--data-grey-floor` (#C9CDD4, piso de dato DESIGN §5) — visibles en fondo blanco sin competir con los picos en `--caution`.
- **#5 (MENOR).** Glosas al vuelo: "SIDPOL (denuncias de la PNP)" y "BCRP (Banco Central de Reserva)". Revierte la nota previa de "no glosar" — la legibilidad accesible pesa más que el mimetismo con el mockup.
- **#6 (SUGERENCIA, adoptada).** `diyTitle(idx, delta)` afirma sobre el índice ("Amenaza DIY contenida, pero subiendo" a 58 con delta +4).
- **#7 (SUGERENCIA, adoptada).** Badge "+4 pts esta semana" (`--wash`/`--caution`) en el gauge desde `trends.diy.delta_semana`; tercera línea de insight sobre Securitas (presencia baja, foco B2B).

**Auto-verificación de resoluciones.** 34 tests verdes · fixtures regenerados (registros 321) + `validate:fixtures` ok · build ok · hex fuera de tabla 0 · `--data-grey-floor` definido en `:root` · sin overflow horizontal a 1440/390 · sin errores de consola · capturas 390px de DEMANDA (slope sólido/rayado + leyenda + badge DIY) y CONTEXTO (glosas + barras visibles) revisadas.

**Gate 2 (subagente fresco): APROBADO CON CORRECCIONES** — 0 BLOQUEANTE, 0 MAYOR, 3 MENOR + 2 SUGERENCIA. Cross-check independiente: rederivó los números dorados ejecutando los derivadores contra el fixture crudo (SOI 46,1/33,3/20,6 % total S/ 256.800 · DIY 58 · componentes +24%/S/ 129/S/ 41.673) — todos coinciden; determinismo de dinero confirmado en Node y Chromium (punto); AA de texto respetado (ink-3 solo en marcas gráficas); honestidad sólido/rayado visible; 0 prohibiciones; fuentes auto-hospedadas; sin overflow ni errores de consola a 1440/390.

**Hallazgos Gate 2.** #1 MENOR título de estacionalidad fijo ("Julio abre la ventana de Fiestas Patrias") — date-agnóstico, no deriva del mes/pico. #2 MENOR etiquetas de período macro ("en la semana", "vs. junio", "vs. mayo") hardcodeadas, pueden desalinearse del período real del dato. #3 MENOR botón "Ver los N distritos" es afordancia muerta (sin `onClick`). #4 SUGERENCIA glosar DIY literalmente ("hazlo-tú-mismo"). #5 SUGERENCIA índices de mes de los picos hardcodeados en el componente en vez de parsearse del fixture.

**Resoluciones Gate 2.**
- **#1 + #5 (MENOR + SUGERENCIA).** `estacionalidad.picos` pasa a objetos `{ meses:[6,7], etiqueta }` (meses 0-indexados) — única fuente de: coloreo de la tira, leyenda (rango `jul–ago` derivado de los índices) y título. `seasonTitle(monthIdx, picos)` deriva del mes vigente (`day` de `useData`): "Julio abre el pico vacacional…" en jul, "Diciembre sostiene el pico navideño…" en dic, "Abril: faltan 3 meses para el pico vacacional" fuera de pico. La tira marca el mes vigente con contorno `--ink` + label en negrita.
- **#2 (MENOR).** El período de comparación viaja en el fixture (`macro.*.periodo`: "la semana"/"junio"/"mayo") y las etiquetas se derivan de ahí — un snapshot de otro mes traería su propio período.
- **#3 (MENOR).** El botón muerto se degrada a nota no-interactiva honesta: "+28 distritos suman 6.410" (`--ink-2`, tabular) — informa el agregado sin fingir una acción inexistente (no hay data por-distrito del resto).
- **#4 (SUGERENCIA, adoptada).** Glosa literal "Índice de Amenaza DIY (hazlo-tú-mismo)".

**Auto-verificación Gate 2.** 34 tests verdes · fixtures regenerados + `validate:fixtures` ok (321 registros) · build ok · títulos/etiquetas rederivados ejecutando la lógica contra el fixture (jul/dic/abr correctos) · `package.json`/`lock` intactos (playwright con `--no-save`) · capturas 1440/390 de CONTEXTO revisadas (título derivado, mes vigente marcado, nota de distritos, etiquetas macro) sin overflow ni errores de consola.

**Criterio de gate.** Gate 2 sin bloqueante/mayor; los 3 menores resueltos y las 2 sugerencias adoptadas (protocolo §1.4, precedente F1/F2). Se procede al merge.

---

## Fase 4 — MAIA + pipeline diario · rama `fase-4-maia-pipeline` · merge `8a0454e`

**Construido.**
- **MAIA (módulo 4):** carita `MaiaFace` (squircle `--ink`, ojos, aura `--verisure-tint`; 3 estados CSS reposo/pensando/alerta con `prefers-reduced-motion`, DESIGN §6.1). **Daily Brief** — única card oscura ancla (`--ink`), redactada por `composeBrief` a partir de SOI/piezas/DIY/Score (cero prosa hardcodeada; la carita entra en `alerta` cuando mueve la competencia). **Opportunity Score** — ÚNICO uso de `--grad-brand` (arco de progreso enmascarado por intersección conic∩radial) + IPC/IMC como barras con lectura de una frase y siglas glosadas (DESIGN §6.3). **Chat** — respuestas derivadas del día (motor puro `maiaAnswer`, sin latencia artificial); ruta LLM tras `VITE_MAIA_CHAT='live'` (Netlify Function que proxea Anthropic, key server-side).
- **Pipeline diario:** `scripts/run-pipeline.mjs` corre los derivadores y publica el snapshot en `public/data/` (datasets crudos + `algorithm.json` agregado + `export.csv` en dimensiones §A.7 + `meta.json`). Dry-run **determinista** sobre fixtures; live con token (Integrametrics SOLO en Node). `.github/workflows/pipeline.yml`: cron `0 11 * * *` (06:00 Lima) + `workflow_dispatch`, valida+testea antes de publicar, commitea el snapshot si cambió.
- **Contrato único de datos (deferred F3 #4):** el navegador ahora fetchea `/data/*.json` (`client.js` reescrito como fetcher puro; elimina Integrametrics y el token del bundle — governance). Efecto colateral: el bundle baja de ~590 KB a **202 KB** (los fixtures ya no se empacan) — desaparece el warning de chunk >500 KB.
- `.env.example`: `VITE_MAIA_CHAT`. `client.test.js` reescrito (fetch + governance). 9 tests nuevos (brief golden, intents del chat, cliente por fetch).

**Auto-verificación.** 43 tests verdes · build ok · `validate:fixtures` ok (321) · pipeline **determinista** (re-corrida → sin diff) · hex fuera de tabla 0 (el único uso de rojo con alfa es `color-mix(var(--verisure)…)`, sin hex crudo) · sin `Date.now`/`Math.random`/`toLocaleString` en código (solo comentario) · `new Date()` solo en el pipeline (I/O, no derivador) · texto en `--ink-2` (único `--ink-3` = placeholder del input, hint no-contenido) · sin `console.log` · sin overflow a 1440/390 en RADAR/DEMANDA/CONTEXTO/MAIA · cero errores de consola / requests fallidos · carita respeta `prefers-reduced-motion` · dinero determinista (S/ 118.400 con punto en el chat) · `package.json`/`lock` intactos (playwright `--no-save`).

**Notas de diseño.** El arco del Score usa máscara `conic ∩ radial` (colores de máscara `black`/`transparent`, alfa estructural). Texto claro sobre la card oscura vía `color-mix(var(--base)…)` (~8:1 sobre `--ink`, AA holgado). Placeholder del chat en `--ink-3`: convención de hint, no texto de contenido; el input lleva `aria-label` y `:focus-visible` global.

**Gate 1 (subagente fresco): APROBADO CON CORRECCIONES** — 0 BLOQUEANTE, 1 MAYOR, 0 MENOR de peso, 2 SUGERENCIA. Cross-check independiente: rederivó los dorados desde el fixture crudo (SOI 46,1/33,3/20,6 % · S/ 256.800 · DIY 58 · Score 71/IPC 64/IMC 78) — coinciden con `algorithm.json`, el Daily Brief y el chat; confirmó en el bundle real (`dist/assets/*.js`) que NO viaja token/`process.env`/`integra-metrics.com`/`Bearer` (governance); arco del Score pintado con `--grad-brand` (no sólido); una sola card oscura; `prefers-reduced-motion: reduce` apaga toda animación de la carita; AA holgado (BODY 16,7:1, "Enviar" 7,1:1); CSV §A.7 completo y escapado; determinismo del pipeline (doble corrida sin diff); RADAR/DEMANDA/CONTEXTO cargan del snapshot `/data` sin errores.

**Hallazgos Gate 1.** #1 MAYOR chips de preguntas del chat a 36px < 44px (DESIGN §7 exige touch targets ≥44px). #2 SUGERENCIA concordancia de plural ("1 pts" → "1 pt") en brief/chat. #3 SUGERENCIA `?demo=empty` muestra "día tranquilo", no el EmptyState real de datos ausentes.

**Resoluciones Gate 1.**
- **#1 (MAYOR).** Chips con `min-h-[44px]` (medido: los 5 a 44px en 1440 y 390); sin overflow.
- **#2 (SUGERENCIA, adoptada).** Helper `ptsLabel(n)` en `format.js` (1 → "pt", resto → "pts"); aplicado en `deltaFrase`/DIY del brief y en el motor del chat. Brief golden: "…Verisure queda en 33%, **1 pt menos**…". Test que fija el singular y prohíbe "1 pts".
- **#3 (SUGERENCIA, adoptada).** `?demo=nodata` fuerza el EmptyState real de MAIA (verificado en runtime: "Sin datos del día para sintetizar…").

**Auto-verificación Gate 1.** 43 tests verdes (nuevo: singular del delta) · build ok · chips medidos a 44px · `?demo=nodata` → EmptyState · sin overflow ni errores de consola a 390 · `package.json`/`lock` intactos.

**Criterio de gate.** Gate 1 sin bloqueante; el mayor resuelto y las 2 sugerencias adoptadas (protocolo §1.4, precedente F1–F3). Se procede al merge.

---

## Fase 5 — Hardening · rama `fase-5-hardening` · merge `<pendiente>`

**Construido.**
- **Code-split por módulo:** `React.lazy` + `Suspense` en `AppShell` — cada vista (RADAR/DEMANDA/CONTEXTO/MAIA) es su propio chunk; solo se descarga el del módulo activo. Fallback = skeletons con la forma del contenido (DESIGN §7). Bundle inicial **202 KB → 160 KB**; módulos 7–17 KB bajo demanda.
- **Basic Auth de todo el sitio:** Edge Function de Netlify (`netlify/edge-functions/auth.js`, registrada en `netlify.toml` con `path="/*"`). Se activa solo si `BASIC_AUTH_USER`/`BASIC_AUTH_PASSWORD` están en el entorno de Netlify (fail-open en demo; comparación de tiempo constante). Credenciales solo por env, nunca en el repo. Protege también `/data`.
- **README v2:** reescrito para el producto outside-in (4 módulos, arquitectura de datos `/data`, pipeline, governance, deploy, estructura). El anterior describía el template v1 retirado.
- **Metadata:** `index.html` ya traía title/description/OG/theme-color/favicon; el favicon **es la carita de MAIA** (squircle `--ink` + ojos + punto `--verisure`), on-brand. `netlify.toml`: Node 20 / npm 10.
- **Cleanup:** `@types/react`/`@types/react-dom` eliminados (JS puro, sin TS; muertos por depcheck). 4 labels SVG `11px → 12px` (piso tipográfico §10).
- `.env.example`: `BASIC_AUTH_USER`/`PASSWORD`.

**Auto-verificación (checklist §10 completo).** 43 tests verdes · build ok · `validate:fixtures` ok · pipeline determinista · **fuentes auto-hospedadas cargan** (Anton/Instrument Sans/Space Grotesk vía `document.fonts`) con **0 requests externos** (§11) · **sin overflow en las 8 vistas** (4 módulos × 1440/390) · `prefers-reduced-motion: reduce` apaga la animación de la carita (`animationName: none`) · **0 errores de consola / requests fallidos** · sin dark-mode default · una sola card oscura (MAIA) · `--grad-brand` un solo uso · sin arcoíris ni gradiente decorativo · sin texto <12px (SVG subidos a 12) · AA en texto (`--ink-2`) · estados diseñados (loading/empty/sourcedown/nodata) · hex fuera de tabla 0 · tabular-nums global + explícito · `:focus-visible` global · `package.json`/`lock` sin playwright.
