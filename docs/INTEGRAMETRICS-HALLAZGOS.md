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

- Volumen enorme: **~104.829 registros/día** (todas las marcas). Campos: `impresiones`, `inversion_dolares`, `inversion_moneda_local`, `medio_digital` (FACEBOOK, etc.), `advertisement` (**URL del asset creativo**), marca/sector/categoría.
- Aquí es donde Prosegur y las marcas DIY realmente compiten. Complementar con **Meta Ad Library** (público) para nutrir el Ad Museum con piezas digitales de la competencia → alinea con la tesis outside-in.

## 7. Qué queda por decidir/hacer

1. **Reencuadrar el relato:** de "duelo de SOI con Prosegur" a "huella propia de Verisure + alerta de estreno + capa digital/competitiva". Decisión de producto.
2. **Backfill real** (2026-01-01→hoy) y publicar snapshot real (queda tras Basic Auth, F5).
3. **Capa digital + Meta Ad Library** para el Ad Museum competitivo (Prosegur/DIY).
4. Verificar nombres exactos de marcas/subsectores al primer uso live (hecho: Verisure 105 / Prosegur 1883; subsectores 885/719).
