# Integrametrics — hallazgos de la exploración en vivo

> Exploración de la API real (token de Reset) para modelar el ambiente del algoritmo.
> Complementa `docs/Documentación API Integra Metrics.pdf`. **Ningún secreto aquí** — el
> token vive solo en el entorno de Netlify/Actions. Cifras: muestra de 7 días (7–13 jul 2026).

## 1. El árbol de la categoría de seguridad

Verisure y Prosegur **no comparten rama** en la taxonomía Integrametrics:

| Marca | maid | Categoría | Sector | Subsector |
|---|---|---|---|---|
| **VERISURE** | 105 | CONSTRUCCIÓN Y DECORACIÓN | EMPRESAS Y SERVICIOS | **SEGURIDAD Y ALARMAS** (885) |
| **PROSEGUR** | 1883 | SERVICIOS AL CONSUMIDOR | SERVICIOS PRIVADOS | **SEGURIDAD PRIVADA** (719) |

→ El universo competitivo se monitorea por **`filters={"ssname":["SEGURIDAD Y ALARMAS","SEGURIDAD PRIVADA"]}`** (el `ssid` NO es filtrable; hay que usar el nombre). Esto acota el firehose (~40–70k registros/día de todas las marcas) al universo relevante y respeta el límite de 90.000/consulta.

## 2. La realidad competitiva (medios tradicionales / ATL)

**Backfill completo 2026 (1 ene → 13 jul, 45.624 registros ATL de Verisure+Prosegur):**

| Marca | Inversión bruta 2026 | SOI ATL | Piezas | OOH (paneles) | Medios |
|---|---|---|---|---|---|
| **VERISURE** | **S/ 53.672.556** | **~98.7%** | 29 | 49 | TV abierta, radio, cable, OOH |
| PROSEGUR | S/ 712.004 | ~1.3% | 9 | 52 | OOH + radio/TV puntual |

**Set competitivo del producto = VERISURE + PROSEGUR** (decisión de negocio):
- **HUNTER** = seguridad corporativa/B2B → excluido (no compite en residencial/consumo).
- **SECURITAS** = aseguradora ("seguros" ≠ "seguridad"), ni aparece en los subsectores → excluido.
- No hay "carrera de SOI" en ATL: **Verisure es prácticamente monopolio** (~98.7% del año). El fixture v1 (Prosegur liderando 46%) era ficticio → **reencuadrado**: RADAR cuenta dominancia ATL.
- La competencia real de Prosegur está en **digital** (§6). El algoritmo ahora eleva la capa digital a ciudadano de primera.
- ⚠️ **Corrección vs. muestra de 7 días:** con el año completo, **ambas marcas hacen OOH** (Verisure 49 paneles + Prosegur 52). La muestra de 7 días había concluido "solo Prosegur hace OOH" — el histórico lo refuta. El mapa es competitivo.

## 3. Tipos de inversión — cuál usar

| Campo | Qué es | Poblado | Decisión |
|---|---|---|---|
| `rinversion` | bruta, soles | 100% | ✅ **métrica primaria** |
| `rinversion_dolares` | bruta, USD | 100% | ✅ export/normalización EUR/USD |
| `rinversion_neta` / `_neta_dolares` | neta | vacío / 0 | ❌ inservible |

Es *estimada bruta* (rate-card) — estándar de inteligencia competitiva; etiquetar "estimado" (rayado, DESIGN §2).

## 4. Rango histórico y cadencia

- **Data disponible: 2026-01-01 → presente**, con **~1 día de rezago** (al 14 jul, el último día completo es el 13). Volumen de seguridad: ~40–290 registros/día.
- **Plan de carga:** backfill único `PIPELINE_START=2026-01-01` → último día completo; luego GitHub Actions diario incremental (hoy en adelante). `run-pipeline.mjs` acepta `PIPELINE_START`/`PIPELINE_DAY`/`PIPELINE_SUBSECTORS`.

## 5. Formas reales vs. lo modelado (mapeos aplicados)

Verificado contra la API (difiere de la doc en algunos puntos):

- **`hour`/`minute` en minúscula** (la doc dice `HOUR`/`MINUTE`). El export acepta ambos.
- **OOH = `latitud`/`longitud` no nulos** (no por `tname`; el tipo real es `TORRE UNIPOLAR`/`PANTALLA DIGITAL`, no "VÍA PÚBLICA"). `oohPoints` corregido.
- **`gname` real:** `TV ABIERTA`, `CABLE`, `RADIO`, `OTT STREAMING/LIVE`, `VIA PUBLICA` (la doc ejemplifica "TELEVISIÓN"). Distinguir TV abierta/cable con `mabierta_cable` (1/2).
- **`tname` real:** `SPOT`, `SPOT RADIO`, `TORRE UNIPOLAR`, `PANTALLA DIGITAL`.
- **`nuevas_versiones === "NUEVO"`** es correcto (doc + código), pero es raro: solo el día que un fingerprint debuta. En una semana de creativos establecidos sale vacío — la alerta "pieza nueva" es un evento de alta señal, no diario.
- **`franja`:** `DIA`, `PRIME`, `NOCHE`, `MADRUGADA` (confirmado).
- Campos ricos no modelados y con valor: `rating`, `audiencia`, `alcance`, `posicion_tanda`, `mabierta_cable`, `progname`/`genname` → análisis de calidad de compra / estrategia de medios (oportunidad futura).

## 6. Capa digital (`/registros-digital`) — la que sí mueve la competencia

Sin filtros server-side (los `filters` se ignoran; ~50–100k registros/día, todas las marcas → filtrar en cliente **por subsector** de seguridad + marca V/P). Backfill digital 2026 = **4.293 filas de seguridad** (2.825 Verisure + 1.468 Prosegur).

**Inversión digital 2026 (contrato):** Verisure **S/ 9.98M** · Prosegur **S/ 3.62M** → SOI digital ≈ **73/27**. En ventana de 30 días llega a **13% Prosegur** (vs. 1.3% en ATL). En algunos períodos la inversión digital total **supera a la ATL**.

- Set digital de seguridad = **Verisure + Prosegur**. Plataformas reales: **Facebook, Google Search, YouTube**.
- **`advertisement` = URL del asset creativo (imágenes S3 · videos · links de YouTube)** → el Ad Museum digital muestra la ARTE real (1.559 piezas digitales en el contrato).
- **La competencia SÍ existe — en digital.** Este es el reencuadre honesto del algoritmo: ATL = dominancia; digital = pelea.
- ⚠️ **Corrección:** un grep por nombre había colado a **XIAOMI como "DIY"**, pero validado por subsector es **CELULARES/TABLETS** (IT y Comunicaciones), no seguridad — **excluido**. **HUNTER** (seguridad corporativa B2B) también **excluido** por decisión de negocio.
- **El "DIY threat" (cámaras Ezviz/Imou/TP-Link/Hikvision) NO está sustentado en Integrametrics** (no pautan en la categoría de seguridad, ni ATL ni digital) → si se quiere, requiere marketplace/Meta Ad Library como fuente externa.

## 7. Campos ricos — qué SÍ y qué NO está poblado (validado sobre Verisure)

| Campo | Poblado | Uso |
|---|---|---|
| `progname` / `genname` | 1550/1790 | ✅ **dónde pauta** (Verisure concentra en NOTICIEROS) |
| `mabierta_cable` | 1485/1790 | ✅ split TV abierta vs cable |
| `posicion_tanda` | 1543/1790 | ✅ posición en tanda (placement) |
| `duracion_tv` | 1790/1790 | ✅ duraciones normalizadas |
| `rating` / `audiencia` / `alcance` | **0/1790** | ❌ **vacíos — descartar ángulo de audiencia** |

OOH (backfill completo): **101 paneles reales** con lat/long en Lima — **49 Verisure + 52 Prosegur** (San Borja, Miraflores, Surco, La Victoria…). Cada panel trae su ARTE (`rfile`: foto/video). El mapa Leaflet (Opción A · OSM) los pinta por marca con la arte en el popup. (La muestra de 7 días había dicho "solo Prosegur" — refutado por el histórico.)

## 8. Matriz de validación — ¿es posible en producción hoy?

| Elemento del algoritmo | Fuente real | ¿Prod hoy? |
|---|---|---|
| RADAR · jugada del día (pieza nueva + video) | `nuevas_versiones` + `rfile` | ✅ sí (evento raro, alta señal) |
| RADAR · SOI por competidor (ATL) | `rinversion` por subsector seguridad | ✅ sí — pero Verisure ~98.5% (dominancia, no carrera) |
| RADAR · timeline de presión 30d | `rinversion` diario | ✅ sí |
| RADAR · Ad Museum (piezas + video + tono) | `id_versiones_unica`+`rfile`+`vname` | ✅ sí · tono EPPM = heurística (aprox., no de la API) |
| RADAR · mapa OOH | `latitud`/`longitud` | ✅ sí — pero solo Prosegur tiene OOH |
| **DIGITAL · SOI + Ad Museum digital** (Verisure+Prosegur) | `/registros-digital` + `advertisement` | ✅ **sí — data rica, hoy** |
| DEMANDA · share of search / tendencia | Google Trends (EXTERNO) | ⚠️ requiere fuente externa; puede moverse poco |
| DEMANDA · amenaza DIY (cámaras) | NO está en Integrametrics | ⚠️ requiere marketplace/Meta; hoy no sustentado |
| CONTEXTO · macro | API BCRP (pública) | 🟡 factible (conector pendiente) |
| CONTEXTO · criminalidad SIDPOL | policía (EXTERNO) | ⚠️ requiere scraper |
| CONTEXTO · estacionalidad | derivable del histórico Integrametrics | ✅ sí (tenemos 6.5 meses) |
| CONTEXTO · noticias | prensa (EXTERNO) | ⚠️ requiere scraper |
| MAIA · Score/IPC/IMC/Brief/chat/deltas | derivado de lo anterior | ✅ sí (pesos ilustrativos; deltas requieren serie histórica) |

**Lectura:** RADAR + DIGITAL son producción-real HOY con solo Integrametrics. DEMANDA/CONTEXTO dependen de fuentes externas (Trends, SIDPOL, prensa) aún no construidas; BCRP y estacionalidad son factibles pronto.

## 9. Recomendación de reencuadre + backfill

1. **Elevar la capa DIGITAL a ciudadano de primera** (SOI digital Verisure/Xiaomi/Prosegur, Ad Museum con assets digitales, amenaza DIY real). Es lo más rico y ya está.
2. **SOI = unir subsectores de seguridad** (885+719), no marcas hardcodeadas; mostrar ATL y digital. En ATL, relato de dominancia; en digital, competencia real.
3. **Contrato de datos con FECHA** (serie histórica, no snapshot) → date-picker en el front + deltas semanales en MAIA. Backfill ene 2026→hoy chunkeado por día (una sola llamada de 6.5 meses excede tamaño/memoria).
4. Diferir/secundarizar lo externo (Google Trends, SIDPOL, prensa); BCRP vía API pública cuando se priorice.

## 10. Arquitectura de datos (Fase 7 · implementado)

- **Contrato** `public/data/algorithm.json` (~880 KB, gzip ~120 KB): `{ meta, daily, pieces, ooh, events, digital }`. El navegador fetchea SOLO esto (ya no 32 MB de registros crudos). `views.js` lo corta por rango de fecha y deriva SOI/presión/deltas/museo/OOH.
- **Agregación** (`src/data/aggregate.js`): colapsa spots repetitivos en entidades únicas con rollups **aditivos exactos** (probado bit-a-bit) + `asset={url,kind}` por pieza/panel/estreno. Cada entidad lleva **clave estable única** (id_versiones_unica · lat,lng,id · id_unico · marca:version:advertisement).
- **Pipeline** (`scripts/run-pipeline.mjs`):
  - **Incremental** (cron diario): jala los **últimos 7 días** (incl. hoy), `mergeAlgorithm` idempotente sobre el contrato commiteado. `daily` = upsert por fecha (exacto). Entidades = unión monotónica por clave (descubre nuevas, conserva el rollup más completo). Sin duplicar.
  - **Backfill** (cron dominical / `workflow_dispatch` con `start_date`): reconstruye todo el rango → re-cuadra los acumulados de entidades de forma exacta.
  - CSV (`export.csv`) spot-a-spot para el BI: incremental reemplaza la ventana por fecha; backfill lo reescribe.
- **Governance:** token SOLO en Node/Secrets de Actions, jamás en el bundle. Sin token, la Action omite la escritura (no sobrescribe el contrato real con fixtures).
- **Assets:** verificados HTTP 200 públicos (video/mp4, audio/mpeg, image/jpeg·png) + tiles OSM 200. `AssetView` degrada a ilustración si un asset caduca (nunca imagen rota).
