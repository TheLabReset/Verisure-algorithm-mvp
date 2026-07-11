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

## Fase 1 — Capa de datos, fixtures y derivadores · rama `fase-1-datos` · merge `<pendiente>`

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

## Fase 2 — RADAR · rama `fase-2-radar` · merge `<pendiente>`

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

## Fase 3 — DEMANDA + CONTEXTO · rama `fase-3-demanda-contexto` · merge `<pendiente>`

**Construido.**
- **DEMANDA:** slope Share of Search vs Investment (SVG propio, Verisure enfatizado, competencia en grises, leyenda de honestidad SoS/SoI, insight "Buscan a Verisure más de lo que Verisure invierte" + brecha derivada); tendencia de búsquedas «alarma para casa» (serie de categoría enfatizada, +18%/90d); card Amenaza DIY (gauge sobrio de un arco en `--caution`, 58/100, + 3 componentes con fuente y "marcas monitoreadas").
- **CONTEXTO:** cápsulas de denuncias por distrito (SIDPOL, top-3 en `--ink`, resto en gris, mes visible + nota de rezago ~45 días + "Ver los N distritos"); tira de estacionalidad de 12 meses con picos (Fiestas Patrias / navideño) en `--caution`; fila macro BCRP (4 celdas con deltas neutros, sin color bueno/malo); noticias tipográficas (titular fuerte + fuente·hora).
- Derivadores nuevos: `brandKey`, `investmentShare`, `searchVsInvestment` (cruce ESOV). CONTEXTO es lectura directa del fixture `contexto` vía `useData`.

**Auto-verificación.** 34 tests verdes (3 nuevos) · build ok · hex fuera de tabla 0 · cero data hardcodeada (módulos vía `useData`) · siglas glosadas (SoS/SoI/DIY) · grises de data ≥ `#C9CDD4` (barras en `--ink`/`--ink-3`, tracks en `--wash`) · paridad visual 1440 vs mockup sin overflow ni errores de consola.

**Pendientes/notas.** Deviaciones de calibración vs mockup (brecha 9 pts vs 13, 35 distritos vs 43) — fixtures son la fuente de verdad. SIDPOL/BCRP no glosados (nombres propios de fuente, como el mockup).
