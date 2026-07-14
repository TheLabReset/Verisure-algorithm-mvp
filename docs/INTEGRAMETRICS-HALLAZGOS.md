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

7 días, subsectores de seguridad:

| Marca | Spots | Inversión bruta | Piezas | Medios |
|---|---|---|---|---|
| **VERISURE** | 1.790 | **S/ 2.054.502** (~98.5%) | 6 | TV abierta, OTT, radio, cable |
| PROSEGUR | 4 | S/ 29.076 | 3 | solo vía pública (OOH) |
| HUNTER | 5 | S/ 2.080 | 1 | TV abierta |

**Implicaciones:**
- No hay "carrera de SOI": en ATL **Verisure es prácticamente monopolio**. Prosegur (OOH) y Hunter son marginales. El fixture v1 (Prosegur liderando 46%) es ficticio y debe reencuadrarse.
- **SECURITAS no está** en estos subsectores (es aseguradora, "seguros" ≠ "seguridad") → se descarta.
- La inteligencia competitiva real (Prosegur digital, marcas DIY: Xiaomi/Hikvision/Ezviz/Imou/TP-Link) **vive en digital**, no en ATL → ver §5.

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

Sin filtros server-side (~64.667 registros/día, todas las marcas → filtrar en cliente). 1 día real, seguridad/DIY:

| Marca | Inversión local/día | Impresiones | Plataforma |
|---|---|---|---|
| VERISURE | S/ 114.941 | 34,2M | Facebook |
| **XIAOMI** (DIY) | S/ 18.052 | 3,2M | Facebook + Falabella |
| PROSEGUR | S/ 611 | 182k | Facebook |

- **128/128 piezas traen `advertisement` = URL del asset creativo (S3)** → el Ad Museum puede mostrar piezas DIGITALES reales de la competencia.
- El **DIY (Xiaomi) es real y medible aquí** (no requiere scraping de marketplace). Prosegur compite en digital, no en ATL.
- Plataformas: Instagram, Facebook, YouTube, TikTok, Google Search + decenas de webs peruanas.
- Complemento opcional futuro: **Meta Ad Library** (público) para piezas activas de competencia.

## 7. Campos ricos — qué SÍ y qué NO está poblado (validado sobre Verisure)

| Campo | Poblado | Uso |
|---|---|---|
| `progname` / `genname` | 1550/1790 | ✅ **dónde pauta** (Verisure concentra en NOTICIEROS) |
| `mabierta_cable` | 1485/1790 | ✅ split TV abierta vs cable |
| `posicion_tanda` | 1543/1790 | ✅ posición en tanda (placement) |
| `duracion_tv` | 1790/1790 | ✅ duraciones normalizadas |
| `rating` / `audiencia` / `alcance` | **0/1790** | ❌ **vacíos — descartar ángulo de audiencia** |

OOH: **4 puntos reales, todos PROSEGUR** (lat/long Lima: Miraflores/La Victoria/Surco). **Verisure no hace OOH** → el mapa es de competencia.

## 8. Matriz de validación — ¿es posible en producción hoy?

| Elemento del algoritmo | Fuente real | ¿Prod hoy? |
|---|---|---|
| RADAR · jugada del día (pieza nueva + video) | `nuevas_versiones` + `rfile` | ✅ sí (evento raro, alta señal) |
| RADAR · SOI por competidor (ATL) | `rinversion` por subsector seguridad | ✅ sí — pero Verisure ~98.5% (dominancia, no carrera) |
| RADAR · timeline de presión 30d | `rinversion` diario | ✅ sí |
| RADAR · Ad Museum (piezas + video + tono) | `id_versiones_unica`+`rfile`+`vname` | ✅ sí · tono EPPM = heurística (aprox., no de la API) |
| RADAR · mapa OOH | `latitud`/`longitud` | ✅ sí — pero solo Prosegur tiene OOH |
| **DIGITAL · SOI + Ad Museum digital + DIY** | `/registros-digital` + `advertisement` | ✅ **sí — la data más rica, hoy** |
| DEMANDA · share of search / tendencia | Google Trends (EXTERNO) | ⚠️ requiere fuente externa; puede moverse poco |
| DEMANDA · amenaza DIY | digital (Xiaomi) ✅ + precio marketplace (EXTERNO) | 🟡 parcial: el spend DIY es real; precio/búsqueda son externos |
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
