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
