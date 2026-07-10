# Auditoría punta a punta — "The Algorithm by Reset" (instancia Verisure Perú)

> **Propósito.** Documentar al 100% cómo está construido el Algorithm hoy —arquitectura, datos y sobre todo cómo se ve y cómo se lee— como base para un rediseño total hacia un sistema de inteligencia competitiva de inversión publicitaria *outside-in* para Verisure Perú (módulos RADAR / DEMANDA / CONTEXTO / COPILOT).
>
> **Método.** Seis subagentes en paralelo (arquitectura, sistema visual, componentes, dataviz vs *Storytelling with Data*, UX/accesibilidad, deuda técnica), sintetizados aquí. Todo hallazgo lleva ruta `archivo:línea`. Colores en hex. Las afirmaciones se etiquetan **confirmé** (verificado contra el código), **se deduce** (inferido) o **asumo** (no comprobado). Este documento es autocontenido.
>
> **Fecha:** 2026-07-10 · **Repo:** raíz del Algorithm · **Rama:** `claude/algorithm-audit-redesign-ty4szr`

---

## 1. Resumen ejecutivo

**Veredicto: REBUILD del front-end de módulos con reutilización selectiva de infraestructura (~25-30% del código).** No es un refactor: las 2 capas que mueren (Execution, Optimization) y las 2 que se reinterpretan (Data, Decision) están cableadas al paradigma "dashboard social semanal" y a datos hardcodeados; rehacerlas cuesta menos que adaptarlas.

**Las 3 fortalezas reales:**
1. La paleta ya está re-coloreada a **rojo Verisure `#ED002F`** sobre tema oscuro, con contraste calibrado en los grises de texto (`#94A3B8` = 6,9-7,5:1). El *shell* (header + tabs sticky + footer) y el sistema de cards son sólidos y consistentes.
2. Infraestructura reutilizable transversal: helpers de formato es-PE (`src/utils/format.js`), patrón de fetch `Promise.all` con degradación, iconos SVG de plataforma, y el esqueleto de GitHub Actions (checkout→scrape→commit→push).
3. El *multi-armed bandit* (`ml/models/budget_optimizer.js`) es el único componente ML genuinamente implementado (Thompson Sampling real) — aunque muere en el rediseño.

**Los 3 problemas más graves:**
1. **El front-end no consume su propio pipeline de datos.** `DataLayer` descarga 6 JSON pero solo usa 1 (scores); las tablas de Trends/TikTok/Meta/GA4 son **arrays hardcodeados en el JSX** (`DataLayer.jsx:162-209, 401-410`). Las otras 3 capas importan `mockData.js` estático. Si un JSON falla, la UI no cambia y los indicadores de estado siguen en verde: **miente en silencio**.
2. **El pipeline automatizado no apunta a Verisure.** El workflow corre `--client=fitzone` (`scrape-data.yml:49,59,69`) sobre una cadena de gimnasios; no existe `scrapers/config/verisure.json`. La data Verisure está curada a mano solo en `public/data/`; la carpeta `data/` de raíz contiene datos obsoletos de **Powerpay** y **UCSP**. La "data en vivo" es una fachada.
3. **Deuda visual y de accesibilidad:** naming rot (`fitzone-*`, tokens "purple"/"orange" que valen rojo), fuente Inter declarada pero nunca cargada, favicon 404, breakpoint `xs:` muerto, 3 fallos WCAG-AA de contraste reales (blanco sobre cyan = 2,42:1), y gráficos que violan principios básicos de dataviz (funnel con escala logarítmica **oculta** que distorsiona la magnitud).

**Distancia a la identidad objetivo Verisure (rojo/blanco/gradiente):** el rojo ya está; **falta el blanco/base clara** (hoy es tema oscuro fijo, sin modo claro) y **falta el gradiente** (los 6 gradientes definidos están 100% muertos, todo es color plano). El sistema visual está a media distancia de la marca objetivo.

---

## 2. Arquitectura y data

### 2.1 Naturaleza del sistema
**confirmé** — SPA React 18 + Vite + Tailwind, desplegado en Netlify, alimentado por JSON estáticos servidos desde `public/data/`. **Sin backend, sin router, sin estado global** (ni Context ni Redux). La navegación entre las 4 "capas" es `useState` local en `Dashboard.jsx:10`.

### 2.2 Árbol de directorios comentado
```
Verisure-algorithm-mvp/
├── index.html                    # Entry HTML; <body class="bg-fitzone-charcoal">; favicon roto /vite.svg
├── package.json                  # App raíz (React/Vite). Script "scrape" apunta a orchestrator.js INEXISTENTE
├── vite.config.js                # Vite: puerto 3000, manualChunk separa recharts
├── tailwind.config.js            # Tema "fitzone" recoloreado a rojo Verisure #ED002F
├── postcss.config.js             # tailwind + autoprefixer
├── netlify.toml                  # Build dist/, redirect SPA, cache /data/* 1h. NODE 18
├── .env.example                  # Plantilla secrets; conserva CLIENT_NAME=fitzone (residuo)
├── "Adaptación para Nuevos Clientes"  # Archivo sin extensión; guía de reuso del template
├── src/
│   ├── main.jsx                  # ReactDOM.createRoot → <App/>
│   ├── App.jsx                   # Solo renderiza <Dashboard/>
│   ├── index.css                 # Tailwind directives + @keyframes fadeIn + defaults tema CLARO residuales
│   ├── components/
│   │   ├── Dashboard.jsx         # Shell: header, tabs (useState), footer, loading falso 800ms
│   │   ├── DataLayer.jsx         # Capa 1 "Captura de Señales" — ÚNICA que hace fetch
│   │   ├── DecisionLayer.jsx     # Capa 2 "Inteligencia de Mercado" — usa mockData
│   │   ├── ExecutionLayer.jsx    # Capa 3 "Activación Estratégica" — usa mockData
│   │   ├── OptimizationLayer.jsx # Capa 4 "Performance & Optimización" — usa mockData + charts
│   │   └── PlatformIcons.jsx     # 5 SVGs (YouTubeIcon muerto)
│   ├── data/
│   │   ├── config.js             # Marca, capas, canales, audiencias (mucho color/config muerto)
│   │   ├── mockData.js           # Toda la data simulada de capas 2/3/4
│   │   └── keywords.js           # CÓDIGO MUERTO (sin imports; exports KEYWORDS_FITZONE)
│   └── utils/format.js           # Formato es-PE (miles con punto, decimal con coma)
├── public/data/                  # ← SERVIDO en /data/* (lo que lee el frontend) — VERISURE curated
│   ├── trends/latest.json  ·  tiktok/latest.json  ·  meta/latest.json
│   ├── mock/ga4_data.json
│   └── ml/{predictions,insights,scores,recommendations}.json  # curados a mano, NO generados
├── data/                         # ← NO servido. Backups STALE de OTROS clientes (Powerpay, UCSP)
├── scrapers/                     # Jobs Node/Apify (Google Trends, TikTok, Meta) + validate_data.js
│   ├── config/{fitzone,ucsp,example-client}.json   # NO existe verisure.json
│   └── requirements.txt          # Python huérfano (pytrends/pandas) — ningún .py existe
├── ml/                           # Pipeline ML (Node ES modules)
│   ├── pipeline/weekly_pipeline.js   # Orquestador; cadencia SEMANAL; priors "education marketing"
│   ├── models/{sentiment_analyzer,budget_optimizer}.js
│   ├── insights/generator.js
│   └── config/model_config.json
├── apify-actors/social-listening-meta/   # Actor custom Puppeteer (deployable con apify push)
├── .github/workflows/scrape-data.yml     # Cron semanal lunes → scrapers --client=fitzone → ML → commit
└── docs/                         # 6 docs (API_SETUP, SCRAPERS, ML_ARCHITECTURE, PRODUCTION_AUDIT...)
```

### 2.3 Stack y versiones exactas
**App raíz** (`package.json`, v1.0.0, `type:module`):

| Runtime | Versión | | devDependencies | Versión |
|---|---|---|---|---|
| react / react-dom | ^18.2.0 | | vite | ^5.0.8 |
| recharts | ^2.10.0 | | @vitejs/plugin-react | ^4.2.1 |
| @nivo/funnel | ^0.99.0 | | tailwindcss | ^3.3.6 |
| lucide-react | ^0.294.0 | | postcss / autoprefixer | ^8.4.32 / ^10.4.16 |
| date-fns | ^2.30.0 | | @types/react(-dom) | ^18.2.43 / ^18.2.17 |

- **confirmé** — `react-router` NO está (confirma navegación por estado).
- **confirmé** — `date-fns` declarada pero **nunca importada** en `src/` (0 imports); dependencia muerta.
- **Scrapers** (`scrapers/package.json` v1.1.0): `apify-client ^2.9.0`, `axios ^1.6.2`, `cheerio ^1.0.0-rc.12`, `dotenv ^17.2.3`, `p-retry ^6.2.0`, `winston ^3.11.0`.
- **Apify actor** (`apify-actors/social-listening-meta/package.json` v1.0.0): `apify ^3.1.0`, `crawlee ^3.5.0`, `puppeteer ^21.0.0`, node ≥18.
- **ML**: sin package.json propio; corre con el Node de la raíz.

### 2.4 Entry points y arranque
- `index.html` (`lang="es"`, `theme-color #ED002F`) monta `#root` y carga `/src/main.jsx`.
- `main.jsx:6` → `createRoot(...).render(<StrictMode><App/></StrictMode>)`.
- `App.jsx:3-5` → retorna `<Dashboard/>` sin lógica.
- Dev: `vite` puerto 3000. Build: `vite build`→`dist/`, `sourcemap:false`, `manualChunks:{recharts}` (`vite.config.js:11-20`).

### 2.5 Routing, navegación y estado
**confirmé** — No hay router. `Dashboard.jsx:10` `useState('data')`; array `layers` (`:33-62`) construye 4 botones desde `LAYER_CONFIG`; `onClick → setActiveLayer(id)` (`:128`); render condicional en `<main>` (`:154-157`). Redirect SPA en `netlify.toml:22-26`.

**confirmé** — Sin estado global. Todo `useState`/`useEffect` local:
- `Dashboard.jsx`: `activeLayer`, `lastUpdate` (timer 60s `:19-22`), `loading` (spinner falso 800ms `:15-16`).
- `DataLayer.jsx:33-47`: 8 estados de datos + `expandedSections`. `useEffect(loadData, [])`.
- Capas 2/3/4: sin fetch; imports estáticos de `mockData.js`. Cada capa se remonta al cambiar de tab (pierde su estado).

### 2.6 Flujo de datos — real vs mock (el hallazgo central)
`DataLayer.loadData()` (`DataLayer.jsx:53-78`) hace `Promise.all` de 6 fetch a `/data/*` con `.catch(()=>null)`:

| Fetch | Archivo físico | ¿Se renderiza? |
|---|---|---|
| `/data/trends/latest.json` | `public/data/trends/latest.json` | **No** — tabla hardcodeada `:401-410` |
| `/data/tiktok/latest.json` | `public/data/tiktok/latest.json` | **No** — hashtags/sounds `:175-193` |
| `/data/meta/latest.json` | `public/data/meta/latest.json` | **No** — topics `:195-202` |
| `/data/mock/ga4_data.json` | `public/data/mock/ga4_data.json` | **No** — KPIs/páginas `:162-173, 681-713` |
| `/data/ml/predictions.json` | `public/data/ml/predictions.json` | **Sí** → `calculateScores()` `:99-124` |
| `/data/ml/insights.json` | `public/data/ml/insights.json` | **No** — se guarda, no se muestra |

**confirmé** (por lectura línea a línea + grep directo): los estados `trendsData/tiktokData/metaData/ga4Data` se setean pero **no se referencian en el JSX**. Solo el Score Global y 4 sub-scores salen de `predictions.json`; el resto son literales. Vite/Netlify sirven `public/` en `/`, así que `fetch('/data/...')` **nunca** toca la carpeta `data/` de raíz.

**confirmé** — Duplicación `data/` vs `public/data/`: los `latest.json` difieren (`diff` = differ). `data/*/latest.json` = **Powerpay** (Finance); `data/{meta,trends}/*_2025/2026*` = **UCSP** (Education). `public/data/` = Verisure curated (`"source":"...Curated Fallback"`, `"note":"Datos curados"`). Los scrapers escriben a ambas carpetas, pero como corren `--client=fitzone`, nunca generarían data Verisure.

### 2.7 Inconsistencias de esquema (se deduce)
- **Meta `engagement_score`**: `public/data/meta/latest.json` usa escala **0-100** (86, 82...); pero `validate_data.js:108` exige 0-10 y `weekly_pipeline.js:209` lo trata como 0-10 → el validador rechazaría el archivo (y además lee `data/`, no `public/data/`).
- **Pesos ML divergentes**: `model_config.json` y `weekly_pipeline.js:161-166` usan `search .28/trend .15/social .22/intent .35`; pero `scores.json`/`predictions.json` servidos traen `.25/.20/.20/.35` → los JSON ML fueron curados a mano, no generados por el pipeline actual.
- **GA4 doble forma**: `public/data/mock/ga4_data.json` (`overview/topPages`) vs `mockData.js MOCK_GA4_DATA` (`sessions/top_pages`) conviven; el pipeline espera `overview.conversionRate`.

### 2.8 Scrapers y jobs
- **Workflow** `.github/workflows/scrape-data.yml`: cron `'0 13 * * 1'` (lunes 8AM Perú) + `workflow_dispatch`. Node 20 (⚠️ Netlify usa Node 18). Corre 3 scrapers `--client=fitzone` (`:49,59,69`, `continue-on-error:true`, secret `APIFY_TOKEN`) → `weekly_pipeline.js` → commit/push. **No invoca** `validate_data.js`.
- **google_trends_apify.js**: actor `apify/google-trends-scraper` (default client `ucsp` `:34`). ⚠️ discrepancia con docs que citan `trudax/google-trends-scraper`.
- **tiktok_apify.js**: actor `clockworks/tiktok-trends-scraper`; **Perú no soportado** → usa BR (proxy LATAM) para hashtags y US para sounds (`:75-81`); industria default `Education`.
- **meta_apify.js**: actor por env `APIFY_ACTOR_META` (default `globular_cinema/my-actor`). ⚠️ `getDefaultTopics()` (`:171-200`) trae topics **de universidad** (Admisión, Becas), no de seguridad.
- **ml/pipeline/weekly_pipeline.js**: sentiment → scores → MAB (priors "education marketing", budget $23,000 `:262-277`) → insights → 4 JSON.
- **ml/models/sentiment_analyzer.js**: rule-based español con vocabulario **de educación** (acreditada, licenciada, beca, PRONABEC), no de seguridad. Comentario `// Future: Replace with BERT`.
- **ml/models/budget_optimizer.js**: MAB Thompson Sampling real (Beta/Gamma, Monte Carlo). Componente más "real" del stack.
- **apify-actors/social-listening-meta/src/main.js**: PuppeteerCrawler sobre `m.facebook.com`; selectores frágiles; `growth` **simulado con `Math.random()`** (`:256`).

### 2.9 Variables de entorno / deploy
- `.env.example`: solo `APIFY_TOKEN` (+ `APIFY_ACTOR_META`) se usa realmente. `META_ACCESS_TOKEN` vacío ("el anterior estaba expuesto"), `HUBSPOT_*` (Fase 2), `CLIENT_NAME=fitzone` (residuo), `REGION=PE`, `TIMEZONE=America/Lima`.
- `docs/API_SETUP_GUIDE.md` / `API_REQUIREMENTS.md`: GA4, Google Ads, Meta Marketing API, HubSpot = **pendientes de integrar**; sesgo residual educación.
- `netlify.toml`: build `npm run build`→`dist`, NODE 18, redirect SPA, cache `/data/*` 1h, assets inmutables 1a.

---

## 3. Sistema visual actual

**Resumen:** tema **oscuro único** (sin modo claro/oscuro conmutable) sobre un namespace Tailwind heredado de plantilla ("FitZone") cuyos tokens se llaman `purple`/`orange` pero **valen rojo `#ED002F`**. El sistema está sobre-definido: gran parte de tokens, gradientes, sombras y animaciones **están muertos** (nunca se renderizan).

### 3.1 Tokens de color — `tailwind.config.js` theme.extend.colors

| Hex | Token | Def. | Uso | Propósito |
|---|---|---|---|---|
| `#ED002F` | `fitzone-purple` | :13 | **Muy alto** (21× text, 19× bg) | **Rojo Verisure principal / accent** (mal nombrado) |
| `#B30024` | `fitzone-darkPurple` | :14 | Bajo (2×) | Rojo hover / badge |
| `#FF5C7A` | `fitzone-lightPurple` | :15 | 14× text | Rojo claro / tint; serie de gráfico |
| `#0B0E16` | `fitzone-charcoal` | :19 | 18× bg; `<body>` | Fondo de página |
| `#141826` | `fitzone-slate` | :20 | **58× bg** (todas las cards); tooltips | Fondo de cards |
| `#050810` | `fitzone-darkSlate` | :21 | 2× bg (nav, footer) | Contraste extra |
| `#06B6D4` | `fitzone-cyan` | :24 | 13× text, 9× bg | Cyan datos/tech |
| `#22D3EE` | `fitzone-electric` | :25 | Casi muerto (solo config) | Cyan brillante |
| `#10B981` | `fitzone-emerald` | :28 | 36× text, 15× bg | Éxito/positivo |
| `#22C55E` | `fitzone-green` | :29 | **Muerto** (solo string) | Verde positivo |
| `#84CC16` | `fitzone-lime` | :29 | 4× text | Verde lima |
| `#DC2626` | `fitzone-red` | :32 | 9× text, 4× bg | Rojo alerta semántico |
| `#F59E0B` | `fitzone-amber` | :33 | 16× text, 4× bg | Warning / "ontrack" |
| `#ED002F` | `fitzone-orange` | :36 | Solo config muerta | **Alias exacto de purple** — DUP |
| `#B30024` | `fitzone-darkOrange` | :37 | Solo config muerta | **Alias exacto de darkPurple** — DUP |
| `#FFFFFF` | `fitzone-white` | :40 | Se usa `text-white` (95×), no el token | Blanco redundante |
| `#E2E8F0` | `fitzone-lightGray` | :41 | 7× text | Texto claro |
| `#94A3B8` | `fitzone-textGray` | :42 | **128× text** (el más usado) | Texto muted |
| `#475569` | `fitzone-mediumGray` | :43 | 0 en JSX | **Muerto** |

**Colores de plataforma** (`platform.*`, `tailwind.config.js:46-53`): `google #1A73E8`, `tiktok #010101`, `meta #1877F2`, `ga4 #E37400` (usados en `DataLayer.jsx:297-300`); `youtube #FF0000` e `instagram #E4405F` **definidos y nunca aplicados**.

**Semánticos** (`:55-58`): `success #10B981`, `warning #F59E0B`, `error #DC2626`, `info #06B6D4` — **100% muertos como clases**; siempre se usa la variante `fitzone-*` equivalente.

**Paleta de gráficos** (hex hardcodeados, todos en `OptimizationLayer.jsx`): `funnelColors=['#FF5C7A','#ED002F','#B30024','#06B6D4','#10B981']` (`:79`); series pie `#ED002F/#06B6D4/#FF5C7A/#10B981/#F59E0B` (`:62-66`); grid `#374151` (`:234`), ejes `#9CA3AF` (`:235-237`) — dos grises que **no** corresponden a ningún token del sistema.

### 3.2 Tipografía
- Familias (`tailwind.config.js:60-63`): `sans/display: ['Inter','Helvetica Neue','Arial']`; `index.css:8` fija Inter en `body`.
- **confirmé** — **Inter se declara pero NUNCA se carga** (0 `<link>`/`@import`/`@font-face`/`preconnect`). La UI cae a Helvetica/Arial del sistema. Las clases `font-sans`/`font-display` no se usan (0×).

| Clase | Tamaño | Usos | Nota |
|---|---|---|---|
| `text-xs` | 12px | 282 | Base de facto |
| `text-sm` | 14px | 193 | |
| `text-base` | 16px | 50 | |
| `text-xl` / `text-lg` | 20 / 18px | 28 / 25 | |
| `text-2xl` | 24px | 13 | |
| `text-3xl / 4xl / 5xl` | 30 / 36 / 48px | 3 / 2 / 1 | |
| **`text-[10px]`** | 10px | **72** | **Arbitrario, fuera de escala** |

Pesos: `font-bold` (126), `font-semibold` (77), `font-medium` (28).

### 3.3 Radios, sombras, gradientes, espaciado
- **Radios:** `rounded-xl` (62), `rounded-lg` (61), `rounded-full` (44), `rounded-2xl` (26).
- **Sombras:** `shadow-lg` default (29, dominante). Custom `shadow-fitzone-lg` (`0 30px 60px rgba(237,0,47,.25)`) 2×; `shadow-fitzone`, `shadow-fitzone-glow`, `shadow-card`, `shadow-card-hover` **muertas** (0×).
- **Gradientes:** 6 definidos (`tailwind.config.js:64-72`) — **confirmé todos MUERTOS** (0 usos de `bg-gradient-fitzone*` y **ni un `bg-gradient-to-*`** en `src/`). Todo el fondo es color plano. Valores exactos:
  - `fitzone`: `linear-gradient(135deg,#ED002F,#B30024)`
  - `fitzone-energy`: `linear-gradient(135deg,#ED002F,#F59E0B)`
  - `fitzone-tech`: `linear-gradient(135deg,#06B6D4,#22D3EE)`
  - `fitzone-premium`: `linear-gradient(135deg,#0B0E16,#141826 50%,#ED002F)`
  - `fitzone-dark`: `linear-gradient(135deg,#141826,#0B0E16)` · `hero`: `linear-gradient(180deg,#0B0E16,#141826)`
- **Espaciado:** contenedor `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`; cards `p-3 sm:p-5`; gaps `gap-2/3/4`.

### 3.4 Iconografía
- `lucide-react ^0.294.0`, ~49 iconos únicos (Shield, Target, Zap, TrendingUp, Search, BarChart3, DollarSign, Users, Bell, Flame, Lightbulb, MapPin, Camera, Music, PlayCircle, RefreshCw...).
- Iconos de marca custom `PlatformIcons.jsx` (`fill="currentColor"`): `MetaIcon`, `TikTokIcon`, `GoogleAnalyticsIcon`, `GoogleIcon` usados; **`YouTubeIcon` muerto**. No hay `InstagramIcon`. Como usan `currentColor`, el color oficial de plataforma casi nunca se aplica al glifo.

### 3.5 Modo claro/oscuro y assets
- **confirmé** — **NO existe modo claro/oscuro** (sin `darkMode` en config, 0 variantes `dark:`). Tema oscuro fijo.
- **confirmé** — Contradicción latente: `index.css:7` fija `@apply bg-gray-50 text-gray-900` (tema **claro**, residuo de plantilla), tapado por `bg-fitzone-charcoal`.
- **confirmé** — **No hay logos ni imágenes** (0 archivos `.svg/.png/.jpg/...`). El "logo" es un icono `Shield` en cuadro rojo (`Dashboard.jsx:82-84`).
- **confirmé** — **Favicon 404**: `index.html:5` referencia `/vite.svg` que **no existe** en `public/`.

### 3.6 Inconsistencias visuales (críticas)
- **A. Naming rot** (el más caro de mantener): todo bajo `fitzone-*`; primarios "purple"/"orange" = rojo `#ED002F`. Editar "fitzone-purple" creyendo tocar un morado rompe el rojo de marca.
- **B. Duplicados exactos:** `#ED002F` = purple+orange; `#B30024` = darkPurple+darkOrange; emerald=success, amber=warning, red=error, cyan=info.
- **C. Dos rojos que compiten:** brand `#ED002F` vs alerta `#DC2626` (difíciles de distinguir en badges).
- **D. Tres verdes / dos cyanes** solapados sin regla de uso.
- **E. Config extensa pero muerta:** `METRIC_CARDS_CONFIG`, `LAYER_CONFIG.*.color`, `DATA_SOURCES_CONFIG.color`, `CHANNELS_CONFIG.color` (config.js) **nunca se importan/renderizan**; los colores de tab se hardcodean en `Dashboard.jsx:39-60`.
- **F. `text-[10px]` 72 veces** + anchos arbitrarios (`min-w-[400px..550px]`, `h-[200px] sm:h-[250px]`, `max-w-[280px]`).
- **G. Hex crudos que duplican tokens:** `#94A3B8` (OptimizationLayer.jsx:346) = `fitzone-textGray`; `#141826` (`:239,273,333`) = `fitzone-slate`.
- **H. Series de gráfico contradicen los colores oficiales de plataforma:** Meta=`#ED002F` (debería `#1877F2`), YouTube=`#FF5C7A` (debería `#FF0000`), TikTok=`#10B981` (debería negro).
- **I. Estilos inline no data-driven:** barras `style={{width:'80%'}}` (DataLayer.jsx:728-746), `width:'100%'` (ExecutionLayer.jsx:97), `height:540` (OptimizationLayer.jsx:314).

---

## 4. Inventario de pantallas y componentes

### 4.1 Árbol de componentes
```
App (App.jsx) → Dashboard (shell) → { DataLayer | DecisionLayer | ExecutionLayer | OptimizationLayer }
Auxiliares: PlatformIcons (5 SVG) · FunnelValueLabels (interno en OptimizationLayer.jsx:9)
```
Solo se monta **una capa a la vez** (render condicional, no lazy). 6 componentes React totales.

### 4.2 Mapa de navegación
```
┌───────────────────────────────────────────────────────────┐
│ HEADER (fijo, fitzone-slate): [Shield rojo] "The Algorithm  │
│   by Reset" + tagline · | fecha es-PE + botón Zap           │
├───────────────────────────────────────────────────────────┤
│ TABS (sticky top-0, scroll-x en móvil):                     │
│  [Captura de Señales][Inteligencia de Mercado]              │
│  [Activación Estratégica][Performance & Optimización]       │
├───────────────────────────────────────────────────────────┤
│ MAIN: renderiza SOLO la capa del tab activo (fadeIn)        │
├───────────────────────────────────────────────────────────┤
│ FOOTER (fitzone-darkSlate): copyright · ● "Sistema activo"  │
│   v1.0.0                                                     │
└───────────────────────────────────────────────────────────┘
```
- **Único mecanismo:** clic en tab → `setActiveLayer(id)` (`Dashboard.jsx:128`). Sin router, URLs, deep-linking, sidebar ni breadcrumbs.
- **Vista por defecto:** `data` → Captura de Señales (`Dashboard.jsx:10`).
- Orden e IDs: `data`→`decision`→`execution`→`optimization`; color de tab activo morado(rojo)/cyan/emerald/amber.
- **Loading:** spinner de pantalla completa 800ms al inicio (`Dashboard.jsx:64-73`).

**Discrepancia de nomenclatura (confirmé):** el nombre del tab difiere del título del header interno de cada capa. `DataLayer` es la única que **no** lee de `LAYER_CONFIG`: hardcodea "Capa de Data. Captura de Señales" (`DataLayer.jsx:223`).

### 4.3 Componente por componente

**App** (`App.jsx:3-5`) — sin estado, retorna `<Dashboard/>`.

**Dashboard** (`Dashboard.jsx:9-180`) — shell. Estado `activeLayer`, `lastUpdate` (60s), `loading` (800ms). Consume `BRAND_CONFIG`, `LAYER_CONFIG`, `UI_TEXT`. *Layout:* fondo charcoal, `max-w-7xl` centrado; header (logo izq. + fecha/botón der.) → tabs sticky (4 botones icono+2 líneas) → main → footer (copyright + punto verde pulsante + versión).

**DataLayer** (Tab 1, `DataLayer.jsx:6-869`) — única con fetch. Estado: 8 datos + `expandedSections` (acordeones **colapsados** al inicio). *Layout, de arriba abajo:*
1. Cabecera + **Score Global 7.6/10** (chip semana, botón Actualizar, 4 chips de estado de fuente verdes).
2. "Insights Clave del Mercado" — grid 2 col con 4 cards de fuente (Trends/TikTok/Meta/GA4) + card ancha "Análisis Multi-Fuente".
3-6. Acordeones **Google Trends** (tabla keywords), **TikTok** (tabla hashtags + grid sonidos), **Meta** (tabla temas + tabla campañas), **GA4** (4 KPI cards + dispositivos/fuentes + tabla páginas).
7. Card roja "Keywords Monitoreadas" (grid 3 col: Marca / Categoría / Competencia).

**DecisionLayer** (Tab 2, `DecisionLayer.jsx:6-358`) — sin estado. *Layout:*
1. Header "Inteligencia de Mercado" + chip mensual + badge "IA Activa".
2. Card roja **"Score de Oportunidad /100"** (grid 4 col de componentes: Interés Búsqueda, Engagement, Gap Competitivo, Índice Estacional, Eficiencia CPL + recomendación automática).
3. "Recomendaciones Estratégicas" (5 cards con badge de prioridad).
4. "Audiencias Objetivo" (2, con Tamaño/Engagement/CPL).
5. "Pilares de Contenido" (grid 2 col, 5 pilares desde `KEY_MESSAGES`).

**ExecutionLayer** (Tab 3, `ExecutionLayer.jsx:7-397`) — estado `showAllServicios`. *Layout:*
1. Header "Activación Estratégica" + badge "Live".
2. Card roja "Presupuesto Mensual" (barra al 100% hardcodeada).
3. "Distribución por Canal Digital" (5 canales con badge de estado + barra proporcional).
4. "Recomendaciones de Optimización".
5. "Performance por Servicio" (grid 2 col con toggle 4/todos; hasta 7 métricas por card).
6. Card cyan "Timing Óptimo" (horarios + días + estacionalidad). Nota: `SEDES_PERFORMANCE` se importa pero **no se renderiza**.

**OptimizationLayer** (Tab 4, `OptimizationLayer.jsx:37-579`) — sin estado; sub-componente `FunnelValueLabels`. *Layout:*
1. Header "Performance & Optimización".
2. Fila de **4 KPI cards de color pleno** (Alcance/Interacciones/CPL/Presupuesto).
3. "Performance Últimos 7 Días" (line chart dual-axis recharts).
4. "Distribución por Canal" (pie recharts + leyenda-tabla).
5. "Funnel de Captación" (embudo Nivo escala log + 4 mini-cards).
6. Card roja "CRM. Monitoreo CPL" (umbrales + alertas).
7. "Alertas del Mercado" (grid 3 col).
8. "Análisis de Competencia" (grid 3 col competidores + card Verisure).

**PlatformIcons** (`PlatformIcons.jsx`) — 5 SVG inline; `YouTubeIcon` muerto.

### 4.4 Las 4 capas → módulos
| Capa (tab) | Componente | Módulos internos |
|---|---|---|
| **Data** / Captura de Señales | `DataLayer.jsx` | Score global · Insights multifuente · Trends · TikTok · Meta · GA4 · Keywords |
| **Decision** / Inteligencia de Mercado | `DecisionLayer.jsx` | Score de Oportunidad · Recomendaciones · Audiencias · Pilares de contenido |
| **Execution** / Activación Estratégica | `ExecutionLayer.jsx` | Presupuesto · Distribución por canal · Recomendaciones optim. · Performance por servicio · Timing |
| **Optimization** / Performance & Optimización | `OptimizationLayer.jsx` | 4 KPIs · Line chart 7d · Pie canal · Funnel · CRM/CPL · Alertas · Competencia |

### 4.5 Patrones reutilizables (duplicados inline, no extraídos)
- **Card estándar:** `bg-fitzone-slate rounded-xl/2xl shadow-lg p-… border border-fitzone-purple/10`.
- **Header de sección:** cuadro con icono lucide + `<h3>` + `<p>` — repetido decenas de veces.
- **Chip de periodo:** `getMonthlyPeriod` **triplicada idéntica** (DecisionLayer:7, ExecutionLayer:9, OptimizationLayer:38).
- **Badge de estado/severidad:** lógica de color reimplementada por capa (`getStatusColor` en Execution:19-24; ternarios inline en las demás).
- **Barra de progreso, tabla responsive, bloque métrica (label gris + valor color):** patrones repetidos sin componente común.

---

## 5. Auditoría SWD gráfico por gráfico

**Alcance (confirmé):** solo `OptimizationLayer.jsx` usa librerías de gráficos (recharts + @nivo/funnel). `DataLayer`/`ExecutionLayer` tienen visualizaciones CSS a mano. `DecisionLayer`/`Dashboard` no tienen gráficos. **Nota de ejes:** ningún chart define `domain`; el default de recharts `[0,'auto']` fuerza baseline en cero (**se deduce** del default documentado, no ejecutado).

| # | Gráfico | Archivo:línea | Tipo | Problemas SWD | Veredicto |
|---|---|---|---|---|---|
| 1 | Performance 7 días | `OptimizationLayer.jsx:233` | LineChart **dual-axis** (recharts) | Doble eje Y engañoso (correlación arbitraria); grid XY punteado pesado (`#374151`); leyenda separada del trazo; título nombra el eje, no el insight; series `reach`/`spent` cargadas sin usar | **REDISEÑAR** |
| 2 | Distribución por Canal | `OptimizationLayer.jsx:258` | PieChart (recharts) | Torta con 5 categorías (2 empatadas 10/10, ilegibles por ángulo); arcoíris sin énfasis; sin labels → depende de tabla lejana (torta casi redundante); **%/leads inconsistentes** (Meta dice 40% pero 870/1500=58%) | **REDISEÑAR** (→eliminar) |
| 3 | Funnel Captación | `OptimizationLayer.jsx:315` | ResponsiveFunnel (@nivo) | **Escala log OCULTA** (`:82-91`) distorsiona la magnitud: 2,8M→120 se dibuja como caída suave cuando la real es ~23.000×. Defecto de integridad. Arcoíris 5 colores; sin énfasis en la mayor caída (96,6%); título ≠ insight | **REDISEÑAR** |
| 4 | Dispositivos | `DataLayer.jsx:727-748` | Barras CSS part-to-whole | 3 colores sin significado (arcoíris) para la misma variable; datos hardcodeados. Etiqueta directa ✓, baseline cero ✓ | **REDISEÑAR (menor)** |
| 5 | Presupuesto por Canal | `ExecutionLayer.jsx:164-172` | Barra progreso CSS | Color = estado (uso **intencional** ✓); etiqueta directa ✓; baseline cero ✓. Leve mezcla de dos variables (longitud=$, color=performance) | **MANTENER** |
| 6 | Ejecución del mes | `ExecutionLayer.jsx:96-99` | Barra progreso CSS | Fill hardcodeado `100%`; barra siempre-llena = tinta no-data pura | **ELIMINAR** |

**Los 2 hallazgos que más importan:**
1. **Integridad del funnel (#3):** una escala logarítmica remapeada a mano hace que el embudo comunique proporciones falsas. Un gráfico que distorsiona la cantidad codificada es peor que no tener gráfico. Es el defecto más grave del producto.
2. **Ausencia de jerarquía visual e insight en todos los charts (#1-3):** arcoíris sin serie enfatizada y títulos que nombran el eje en vez de afirmar la conclusión. SWD exige un color de énfasis sobre base neutra + título que diga el hallazgo. Ningún chart cumple (excepción parcial: #5, donde el color codifica estado).

*Nota:* "Fuentes de Tráfico" (`DataLayer.jsx:759-780`) es una lista texto label+%, no un gráfico; SWD sugeriría barras horizontales ordenadas.

---

## 6. UX y accesibilidad

### 6.1 Flujo de lectura y densidad
- **Ancla visual** en cada capa: el bloque rojo `#ED002F` (único color saturado sobre fondo casi negro). Correcto en Data/Decision/Execution.
- **Data:** jerarquía **guía** — el peso informativo (tablas) está oculto en acordeones colapsados. Bien gestionada.
- **Decision/Execution/Optimization: saturadas** — todo expandido, jerarquía plana. Execution muestra hasta **7 métricas por card de servicio** en `text-[10px]` (`ExecutionLayer.jsx:285-333`). Optimization es la más densa: 4 KPI cards de igual peso sin dominante (el ojo no sabe dónde empezar) + 2 sistemas de gráficos (recharts + nivo) en una pantalla.

### 6.2 Estados (empty / loading / error)
- **Loading — parcial:** spinner global **falso** de 800ms (`Dashboard.jsx:16`, no espera datos); `isRefreshing` anima el icono. **AUSENCIA de skeletons** (0 ocurrencias).
- **Empty — AUSENCIA TOTAL:** `UI_TEXT.noData` definido (`config.js:433`) pero **nunca usado** (0 refs). Única guarda defensiva: `CRM_MOCKUP.alerts` (`OptimizationLayer.jsx:443`).
- **Error — AUSENCIA TOTAL (crítico):** `UI_TEXT.error`/`retry` (`config.js:434-435`) **jamás usados**. `loadData()` (`:53-78`) tiene `.catch(()=>null)` + `try/catch` que solo hace `console.error`. Sin UI de error.
- **Qué pasa si un JSON falla (confirmé):** `mlData` degrada con fallback elegante (scores 7.6/8.5...). Pero `trendsData/tiktokData/metaData/ga4Data/mlInsights` **no se leen en el render** → si fallan, **no cambia nada en pantalla** y los 4 chips de estado siguen **hardcodeados en verde** (`:255-270`). El dashboard muestra datos falsos como si fueran en vivo: **engaño silencioso** + fetch inútil (coste de red sin efecto).

### 6.3 Responsive
- Mobile-first; breakpoints `sm:`(640) `md:`(768) `lg:`(1024). Sin `xl:`/`2xl:`. Contenedor `max-w-7xl` (1280).
- **1440px (laptop de reunión):** contenido a 1280px centrado con márgenes; grids al máximo (KPIs 4 col, insights 2, funnel 3). No hay layout roto.
- **Móvil:** tabs con **scroll horizontal sin indicador** (`scrollbar-hide`, `Dashboard.jsx:120`) → descubribilidad baja del 4º tab. Tablas con `overflow-x-auto` + columnas ocultas (`hidden sm:table-cell`). Correcto.
- **BUG confirmé — breakpoint `xs:` inexistente:** `DataLayer.jsx:235` usa `hidden xs:inline` sobre el rango de fechas, pero Tailwind no define `xs` (no hay `screens` en config) → **el elemento queda `hidden` permanente en toda resolución**; el rango de fechas de la semana **nunca se muestra**.

### 6.4 Contraste de color (WCAG AA — cálculos confirmé numéricamente sobre los hex)
| # | Par texto/fondo | Ratio | file:línea | Severidad |
|---|---|---|---|---|
| 1 | blanco / cyan `#06B6D4` | **2,42:1** | `ExecutionLayer.jsx:342`; `OptimizationLayer.jsx:146` | **Grave** (falla incluso texto grande) |
| 2 | blanco/90 / GA4 `#E37400` | **3,11:1** | `DataLayer.jsx:672` (`text-[10px]`) | Falla texto normal |
| 3 | blanco/90 / Meta `#1877F2` | **~4,23:1** | `DataLayer.jsx:547` | Falla por poco |
| 4 | blanco/70 / rojo `#ED002F` | **2,64:1** | `DataLayer.jsx:845,852,859` | Falla texto normal |
| 5 | blanco / rojo `#ED002F` | **4,52:1** (límite) | `Dashboard.jsx:86`, headers de capas | Pasa justo; **con `/80` `/90` cae** |

**Pasan (verificado):** `textGray #94A3B8` sobre slate=6,9:1 / charcoal=7,5:1; `charcoal` sobre emerald=7,6:1; amber/cyan/lightPurple sobre slate=8,3/7,3/5,9:1. El comentario `tailwind.config.js:42` ("≥4,5:1") es correcto.
**Legibilidad transversal:** `text-[10px]` (72×) por debajo del mínimo recomendado (12px), agravando #2/#4.

### 6.5 Microcopy e idioma
- **Mezcla español/inglés sistemática:** tagline "Verisure Security Intelligence Platform" (inglés, `config.js:9`); términos crudos "Live", "Score", "Engagement Rate", "Share of Voice", "Lead Ads", "Reels", "MQL"; siglas sin glosar (CPL/CPM/CPC/CPI/CTR/VTR/NSE).
- **Triple nombre de producto (confirmé):** header "The Algorithm by Reset" (`config.js:8`) vs loading "Cargando Verisure Algorithm..." (`:430`) vs `<title>` "Verisure Algorithm. The Algorithm by Reset" (`index.html:14`) vs footer "Verisure Algorithm" (`:438`).
- **Formato numérico inconsistente:** todo es-PE excepto `DataLayer.jsx:637` que usa `'en-US'` ("19,800" junto a "1,47%" en filas contiguas).
- **Microcopy sobrepromesa:** "IA Activa", "Optimización automática activa", "alertas... en tiempo real" — todo estático/hardcodeado; no hay IA ni tiempo real.

### 6.6 Performance percibida
- **Sin code splitting/lazy (confirmé):** 0 `React.lazy`/`Suspense`. Las 4 capas + recharts + nivo se descargan al inicio aunque se entre por Data (que no usa charts). `vite.config` solo separa recharts; nivo queda en el bundle principal.
- **Dependencias pesadas:** recharts (~400KB+), @nivo/funnel (arrastra d3 + react-spring), ambas solo en OptimizationLayer. `date-fns` **muerta** (0 imports).
- **Latencia artificial:** loading falso de 800ms **retrasa** contenido que ya está listo (todos los datos son objetos JS estáticos). 6 fetch de los que 5 son inútiles.
- **Re-renders:** `setInterval` 60s re-renderiza Dashboard completo; arrays de datos (`performanceData`, `channelData`, `tiktokHashtags`...) se **recrean en cada render sin `useMemo`** → recharts/nivo recalculan.
- **Imágenes:** ninguna rasterizada; iconos SVG (ligeros). Favicon 404.

---

## 7. Deuda técnica y mapa de demolición

**Contexto:** el rediseño pivota a inteligencia competitiva outside-in (RADAR/DEMANDA/CONTEXTO/COPILOT), cadencia **diaria**. Mueren: capas Execution y Optimization, sentiment, MAB, mock GA4, cadencia semanal.

### 7.1 Acoplamiento (imports rastreados)
```
Dashboard.jsx → 4 capas + {BRAND_CONFIG, LAYER_CONFIG, UI_TEXT}
OptimizationLayer [MUERE] → mockData:{PERFORMANCE_KPIS,ALERTS,COMPETITOR_INSIGHTS,CRM_MOCKUP} + config:{LAYER_CONFIG,CRM_CONFIG}
DecisionLayer   [reinterpreta] → mockData:{OPPORTUNITY_SCORE} + config:{LAYER_CONFIG,KEY_MESSAGES,TARGET_AUDIENCES}
ExecutionLayer  [MUERE] → mockData:{BUDGET_ALLOCATION,SERVICIOS_PERFORMANCE,SEDES_PERFORMANCE} + config:{LAYER_CONFIG}
DataLayer       [reinterpreta] → PlatformIcons + utils/format (NO importa mockData/config; usa fetch + arrays inline)
ML (server-side, NO importado por src/): weekly_pipeline → {sentiment_analyzer, budget_optimizer, generator}
```
- **`LAYER_CONFIG` es el nudo central** (importado por 5 archivos). Redefinir sus claves (RADAR/DEMANDA/CONTEXTO/COPILOT), no borrar el archivo.
- **Los modelos ML NO tienen dependencia entrante desde `src/`** → borrarlos no rompe el render (el fetch de `ml/*.json` degrada con fallback).
- **`src/data/keywords.js` es código muerto** (0 imports; exporta `KEYWORDS_FITZONE`).

### 7.2 Hardcodes del cliente demo
**(A) Residuos FitZone / UCSP:**
| Archivo:línea | Contenido |
|---|---|
| `scrapers/config/fitzone.json`, `ucsp.json` | Clientes demo (gimnasio, universidad) |
| `scrape-data.yml:49,59,69` | `--client=fitzone` |
| `google_trends_apify.js:34` | default `client:'ucsp'` |
| `meta_apify.js:171-200` | topics de universidad (Admisión, Becas) |
| `src/data/keywords.js:6,120` | `KEYWORDS_FITZONE`/`HASHTAGS_FITZONE` |
| `data/**` | datos scrapeados de UCSP/Powerpay |
| `.env.example` | `CLIENT_NAME=fitzone` |

> **Crítico (confirmé):** no existe `scrapers/config/verisure.json`. El pipeline scrapea gimnasios mientras el dashboard muestra Verisure. Desconexión total pipeline↔contenido.

**(B) Naming `fitzone-*`:** 577 ocurrencias en 26 archivos. Valores ya son rojo Verisure; el nombre es mentira semántica → 577 reemplazos mecánicos.

**(C) Datos Verisure hardcodeados inline** (deberían venir de API): `DataLayer.jsx:162-209` (ga4Pages, tiktokHashtags, metaTopics...), `:401-410` (keywords Trends), `DecisionLayer.jsx:15-51` (recommendations), `OptimizationLayer.jsx:49-91` (performanceData, channelData, funnelSteps), casi todo `mockData.js` (778 líneas).

### 7.3 Mapa de demolición

**🟢 BORRAR SEGURO** (sin dependencias entrantes)
- `ml/models/sentiment_analyzer.js`, `ml/models/budget_optimizer.js`, `ml/insights/generator.js`, `ml/pipeline/weekly_pipeline.js`
- `public/data/mock/ga4_data.json`, `public/data/ml/{predictions,insights,scores,recommendations}.json`
- `src/data/keywords.js`
- `scrapers/config/fitzone.json`, `scrapers/config/ucsp.json`
- `data/meta/*`, `data/trends/*`, `data/tiktok/*`, `data/mock/*` (datos UCSP/Powerpay)
- `MOCK_GA4_DATA` en `mockData.js:7-86` (export sin importar)
- `scrapers/requirements.txt` (Python huérfano); `YouTubeIcon`/`InstagramIcon` (muertos)

**🟡 BORRAR CON CUIDADO** (deps cruzadas)
- `ExecutionLayer.jsx` → quitar import+tab+render de `Dashboard.jsx:5,156`; libera `BUDGET_ALLOCATION`, `SERVICIOS/SEDES_PERFORMANCE`.
- `OptimizationLayer.jsx` → quitar de `Dashboard.jsx:6,157`; libera `PERFORMANCE_KPIS,ALERTS,COMPETITOR_INSIGHTS,CRM_MOCKUP,CRM_CONFIG`. **Antes:** rescatar la sección "Análisis de Competencia" (`:498-576`) como referencia para RADAR.
- `DecisionLayer.jsx` / `DataLayer.jsx` → reinterpretar. Antes de reescribir DataLayer, **extraer el patrón de fetch** (`:53-78`).
- `src/data/config.js` → redefinir `LAYER_CONFIG` (nudo de 5 imports); borrar `CRM_CONFIG`.
- `src/data/mockData.js` → reescribir; verificar que cada export dejó de importarse.
- `.github/workflows/scrape-data.yml` → cron diario (`'0 13 * * *'`), quitar `--client=fitzone`, quitar paso ML, añadir fuentes nuevas.

**🔵 CONSERVAR** (reutilizable)
- `src/utils/format.js` (intacto), `src/components/PlatformIcons.jsx` (iconos), `tailwind.config.js` (paleta; renombrar namespace), `src/App.jsx`/`main.jsx`/`index.css` (boilerplate).
- `Dashboard.jsx` como **esqueleto** (~40%): header/nav/footer/loading; reescribir tabs y render.
- Patrón fetch `Promise.all` (extraído de DataLayer), esqueleto de GitHub Actions, `recharts` (para series de inversión RADAR). `@nivo/funnel` probablemente muere.

### 7.4 Veredicto: REBUILD (no refactor)
El costo real del rediseño no es el JSX, es **conectar datos reales** (Integrametrics, criminalidad, macro) con cadencia diaria — y para eso la base actual no aporta plomería reutilizable más allá del patrón `Promise.all`. El JSX bonito sobre datos hardcodeados es precisamente la deuda que el rediseño debe pagar, no heredar. RADAR necesita mapa geográfico (ninguna lib de mapas en el repo) y galería de creativos (ningún componente de galería existe), que no tienen correspondencia con las capas actuales.

**Bajo qué condición este veredicto estaría equivocado / señal temprana:** si los 4 módulos nuevos resultaran ser los mismos dashboards de cards con datos distintos (RADAR = tabla de competidores, DEMANDA = tabla de keywords), un refactor de contenido sobre el shell sería más barato. **Señal:** si al diseñar RADAR el equipo reusa >60% del JSX de OptimizationLayer sin reescribir estructura. Se considera improbable por la necesidad de mapa + galería.

---

## 8. Anexo — esquemas JSON completos de la data actual

> Los archivos **servidos al frontend** son los de `public/data/` (Verisure curated). La carpeta `data/` de raíz contiene backups STALE de otros clientes (§2.6) y no se sirve.

### 8.1 `public/data/trends/latest.json` (Google Trends — Verisure)
Raíz: `timestamp` (ISO), `region` ("PE"), `category` ("Home & Garden > Home Security"), `source` ("Google Trends (Curated Fallback)"), `client`, `keywords[]`, `metadata{}`.
`keywords[]` (6): `keyword` (str), `average_interest` (int 0-100), `trend` (rising/stable), `peak_score` (int), `growth_3m` (str "+34%"), `top_regions` (obj ciudad→int), `rising_queries` (str[]), `related_topics[]` `{title,type,value:int}`, `source` ("curated").
Ejemplo: `{"keyword":"camaras de seguridad","average_interest":92,"trend":"rising","peak_score":100,"growth_3m":"+28%","top_regions":{"Lima":100,"Callao":80},"rising_queries":["camara wifi exterior"],"related_topics":[{"title":"Videovigilancia","type":"Topic","value":90}],"source":"curated"}`

### 8.2 `public/data/tiktok/latest.json` (TikTok — Verisure)
Raíz: `timestamp`, `source`, `region` ("PE"), `category`, `client`, `trends{}`, `metadata{}`.
`trends.hashtags[]` (5): `hashtag`, `videos` (int), `views` (int), `growth` (str), `category`. ⚠️ **falta `relevanceScore`/`posts`** que el frontend/validador esperan.
`trends.sounds[]` (5): `soundName`, `author`, `usage` (str), `growth`, `duration` (int), `category`.
`trends.creators[]` (3): `username`, `followers` (int), `category`, `engagement_rate` (float).
Ejemplo: `{"hashtag":"#SeguridadEnElHogar","videos":28400,"views":6400000,"growth":"+36%","category":"Seguridad"}`

### 8.3 `public/data/meta/latest.json` (Meta — Verisure)
Raíz: `timestamp`, `source`, `region` ("LATAM"), `category`, `client`, `pages[]`, `aggregatedTopics[]`, `metadata{}`.
`aggregatedTopics[]` (5): `topic`, `mentions` (int), `engagement_score` (int **0-100** ⚠️ inconsistente con validador 0-10), `growth` (str), `sentiment` (neutral/positive/negative), `top_brands` (str[]), `avg_reactions`/`avg_comments`/`avg_shares` (int).
Ejemplo: `{"topic":"Extorsión y protección de negocios","mentions":8540,"engagement_score":78,"growth":"+62%","sentiment":"negative","top_brands":["Verisure"],"avg_reactions":215,"avg_comments":96,"avg_shares":48}`

### 8.4 `public/data/mock/ga4_data.json` (GA4 mock — Verisure)
Raíz: `timestamp`, `source` ("Google Analytics 4 (Mock)"), `property`, `client`, `dateRange{start,end}`, `overview{}`, `topPages[]`, `searchTerms[]`, `demographics{}`, `deviceCategory{}`, `leadGeneration{}`, `interestAreas{}`, `metadata{}`.
- `overview`: `totalUsers` 56800, `activeUsers`, `newUsers`, `sessions` 70000, `averageSessionDuration` (str), `bounceRate` (float 0-1), `conversions` 1500, `conversionRate` 0.0214.
- `topPages[]` (5): `page`, `views`, `uniquePageviews`, `avgTimeOnPage`, `exitRate`, `conversionRate`.
- `searchTerms[]` (5): `term`, `searches`, `resultClicks`, `conversionRate`, `trend`.
- `demographics`: `age{}`, `gender{}`, `locations{}` (fracciones). `deviceCategory`: mobile/desktop/tablet.
- `leadGeneration`: `totalLeads` 1500, `qualifiedLeads` 1050, `qualificationRate`, `solicitudesCotizacion`, `cotizacionesCalificadas`, `instalacionesCompletadas` 120, `leadsBySource[]`.
- `metadata.note`: "Mock data para MVP. Verisure Perú (cliente demo)".

### 8.5 `public/data/ml/scores.json` (ÚNICO consumido por la UI, vía predictions.json)
`timestamp`, `client`, `individual{search{base,momentum,final}, trend{base,final}, social{sentiment,engagement,final}, intent{conversion_rate,final}}`, `overall` (7.9), `weights{search .25, trend .20, social .20, intent .35}`, `verisure_awareness_score{current:76, components{search_interest,social_engagement,competitor_gap,seasonal_index,conversion_efficiency}, trend:"+5.2%", recommendation}`.
Consumo: `DataLayer.calculateScores()` lee `mlData.scores.individual.*.final` y `.overall`. Fallbacks 7.6/8.5/7.6/7.7/6.8.

### 8.6 `public/data/ml/predictions.json`
`generated_at`, `client`, `model_versions{sentiment_analyzer,budget_optimizer,insight_generator}`, `sentiment_analysis{overall{score,category,topics_analyzed}, by_topic{...}, timestamp}`, `scores{...}` (=8.5 sin bloque awareness), `budget_optimization{current{}, recommended{<canal>:{percentage,amount,expected_uplift,confidence}}, expected_uplift}`.

### 8.7 `public/data/ml/insights.json` (descargado, NO renderizado)
`generated_at`, `client`, `insights[]` (7): `{id, type, priority, title, description, action, [keywords[]|metric|change|recommendations[]], confidence (float), impact_score (float), source}`.

### 8.8 `public/data/ml/recommendations.json` (NO consumido)
`generated_at`, `client`, `budget[]` `{channel, type(increase/maintain/decrease), from, to, change, impact, confidence, reason}` (3), `actions[]` `{priority, action, source}` (8).

### 8.9 Carpeta `data/` (raíz) — duplicados divergentes NO servidos
`data/*/latest.json` = **Powerpay** (Finance); `data/{trends,meta}/*_20260105.json` = **UCSP** (Education); `data/mock/ga4_data.json` = Powerpay (`property:"Powerpay - Cuentas y Cuotas (Demo)"`, totalUsers 142500). Tamaños 3-7KB.

---

*Fin de la auditoría. Documento generado por síntesis de 6 subagentes en paralelo, con verificación directa contra el código de las afirmaciones de mayor impacto (tokens de color, favicon, breakpoint `xs`, y consumo de datos en `DataLayer`).*
