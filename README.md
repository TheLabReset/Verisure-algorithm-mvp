# The Algorithm by Reset — Verisure Perú

**Inteligencia competitiva de inversión publicitaria, _outside-in_.**

The Algorithm responde tres preguntas cada mañana, sin tocar la data de ventas del cliente:

- **¿Qué emitió hoy la competencia?** — piezas nuevas detectadas el mismo día, con inversión estimada y tono.
- **¿Cuánto invierte la categoría y quién lidera?** — share of investment (SOI) diario por competidor.
- **¿Cómo viene la demanda y el contexto?** — búsquedas, amenaza DIY, criminalidad, macro y prensa.

Es _outside-in_: se construye solo con señales externas (inversión publicitaria observada, demanda, contexto). El cruce con ventas/L2B/CPS ocurre en casa de Verisure, con su propio BI; Reset entrega el insumo estandarizado.

---

## Los 4 módulos

| Módulo | Qué muestra | Fuente |
| --- | --- | --- |
| **RADAR** | La jugada del día (pieza nueva), SOI por competidor, presión 30 días, Ad Museum, mapa OOH | Integrametrics |
| **DEMANDA** | Share of search vs. share of investment (ESOV), tendencia de búsquedas, índice de amenaza DIY | Google Trends · marketplaces |
| **CONTEXTO** | Denuncias por distrito, estacionalidad, macro, barrido de prensa | SIDPOL · BCRP · prensa |
| **MAIA** | Daily Brief editorial, Opportunity Score (IPC/IMC), chat sobre la data del día | Síntesis de las anteriores |

**MAIA** — _Media Analyst IA de Reset_: redacta el brief y responde preguntas apoyándose **solo** en los datos derivados del día.

---

## Arquitectura

- **Frontend:** React 18 + Vite 5 + Tailwind 3. Sin dependencias de charting: los gráficos son SVG propio.
- **Ley visual:** `docs/DESIGN (Verisure).md` es la fuente de verdad. Tokens de color como CSS custom properties en `src/index.css`, mapeados 1:1 en `tailwind.config.js`. Ningún hex fuera de esa tabla. Fuentes auto-hospedadas (Space Grotesk, Instrument Sans, Anton) en `public/fonts/` — sin URLs externas.
- **Vocabulario de honestidad (DESIGN §2):** sólido = confirmado (pauta operada por Reset) · rayado = estimado (Integrametrics) · punteado = sin data fresca. Cada afirmación de dato lleva su frescura y su fuente.
- **Datos:** el navegador **solo** lee el snapshot publicado en `public/data/*.json`. No habla con Integrametrics ni ve ningún token (governance). El pipeline es el único que toca la API.
- **Determinismo:** los fixtures se generan con un PRNG sembrado (seed `20260710`); los derivadores son funciones puras sin `Date.now`/`Math.random`; el dinero se agrupa con regex (no `toLocaleString`, que varía entre navegadores).

### Flujo de datos

```
Integrametrics / Trends / SIDPOL / BCRP        (fuentes externas)
        │
        ▼
scripts/run-pipeline.mjs   ──►   public/data/*.json  +  export.csv  +  meta.json
  (derivadores puros)              (snapshot publicado, contrato único)
        │                                   │
   GitHub Actions (cron diario)        el navegador fetchea /data/*.json
```

En modo demostración (sin token) el pipeline corre un **dry-run determinista sobre los fixtures**: produce el mismo snapshot siempre.

---

## Puesta en marcha

Requiere Node 20+.

```bash
npm install
npm run dev              # servidor de desarrollo (Vite)
```

La app funciona sin credenciales: lee el snapshot de `public/data/` (versionado en el repo).

### Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción a `dist/` |
| `npm run preview` | Sirve el build |
| `npm test` | Tests (`node --test`) |
| `npm run gen:fixtures` | Regenera los fixtures deterministas |
| `npm run validate:fixtures` | Valida los fixtures contra el esquema del PDF de Integrametrics |
| `npm run pipeline` | Corre los derivadores y publica el snapshot en `public/data/` |

### Estados de demostración

Añade `?demo=` a la URL para previsualizar estados diseñados: `loading`, `empty`, `sourcedown` (RADAR/otros) y `nodata` (MAIA).

---

## Pipeline diario

`.github/workflows/pipeline.yml` corre a las **06:00 America/Lima** (`0 11 * * *` UTC) y con `workflow_dispatch` de respaldo. Valida fixtures y tests, corre `scripts/run-pipeline.mjs` y commitea `public/data/` si cambió.

El **export CSV** (`public/data/export.csv`) usa las dimensiones compartidas del BI de Verisure (§A.7 del blueprint): fecha, hora, zona, taxonomía de canal, marca, versión, inversión (S/ y USD) y tipo de cambio. Flujo en una sola dirección: hacia su Power BI.

---

## Variables de entorno

Copia `.env.example` a `.env` (nunca commitees `.env`). Todo es opcional para el modo demostración.

| Variable | Uso |
| --- | --- |
| `VITE_DATA_SOURCE` | `fixtures` (default) o `live` — resuelto por el pipeline, no por el navegador |
| `INTEGRAMETRICS_TOKEN` | Token de Integrametrics. **Solo en Node/pipeline**, jamás en el bundle |
| `ANTHROPIC_API_KEY` | Para MAIA (Daily Brief + chat) vía Netlify Function, nunca client-side |
| `VITE_MAIA_CHAT` | `demo` (default) o `live` (delega el chat en `/api/maia`) |
| `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` | Protección Basic Auth del sitio (Edge Function). Sin ellas, sitio abierto |

---

## Despliegue (Netlify)

`netlify.toml` define el build (`npm run build` → `dist/`), el redirect SPA, el cacheo de `/data/*` y una **Edge Function de Basic Auth** (`netlify/edge-functions/auth.js`) que protege todo el sitio cuando `BASIC_AUTH_USER`/`BASIC_AUTH_PASSWORD` están configuradas en el entorno de Netlify (scope Functions). Sin esas variables, el sitio queda abierto para demostración.

---

## Estructura

```
src/
  components/        AppShell, franja "Hoy", primitivas de UI, MaiaFace
  data/              client (fetch de /data) · derive (derivadores puros) ·
                     integrametrics (cliente live, solo pipeline) · csvExport · fixtures
  modules/           radar · demanda · contexto · maia
  utils/             format (dinero/porcentaje deterministas)
scripts/             run-pipeline.mjs · validate-fixtures.mjs
netlify/edge-functions/  auth.js (Basic Auth)
public/              fonts/ (auto-hospedadas) · data/ (snapshot publicado)
docs/                DESIGN (Verisure).md · blueprint · BITACORA · auditoría
```

---

## Documentación

- **`docs/DESIGN (Verisure).md`** — ley visual (tokens, honestidad, tipografía, estados, checklist).
- **`docs/verisure-ecosistema-bi-y-blueprint-v2.md`** — blueprint del ecosistema y arquitectura.
- **`docs/BITACORA.md`** — bitácora de construcción por fases, con gates de verificación.
- **`docs/AUDITORIA-ALGORITHM.md`** — auditoría de arranque del template heredado.

---

_The Algorithm by Reset · Verisure Perú · inteligencia externa outside-in._
