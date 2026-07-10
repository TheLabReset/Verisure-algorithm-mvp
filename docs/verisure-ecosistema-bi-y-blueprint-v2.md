# Verisure Perú — Ecosistema BI del cliente y Blueprint v2 de The Algorithm

**Documento interno Reset · Fuente: reunión con Verisure del 9/7/26 (capturas de su Power BI en vivo) + investigación previa**
**Autor: Alonso / Reset · Última actualización: 9/7/26**

Convención de proveniencia: **[C]** confirmado contra fuente (pantalla o documentación), **[D]** deducido/inferido, **[A]** asumido, pendiente de validar.

---

## PARTE A — Ecosistema de Business Intelligence de Verisure Perú

### A.0 Panorama general

- Power BI corporativo muy robusto, con múltiples apps/reportes plenamente cruzables: todo dato es clickeable y filtra el resto (canal × zona × semana × día × hora × resultado). **[C]**
- Herramientas complementarias que ya usan semanalmente: **Sprout Social** (gestión/analítica de redes) y **Lumen by Talkwalker** (escucha social / consumer intelligence). **[C]**
- Gap autodeclarado: **economics (inversión, CPL, CPS) vive en dashboards separados, no integrados** con el funnel de leads — solo Meta tiene la cadena completa conectada. **[C, verbalizado 9/7/26]**
- Reporting corporativo de inversión en **euros**; Integrametrics reporta en soles/USD → nuestro export debe incluir tipo de cambio (BCRP) para normalización. **[C/D]**

### A.1 Dashboard "Avance PACE" (wallboard de visitas agendadas)

- **PACE** = ritmo de agendamiento de visitas vs meta (día, corte de mes, total mes). Vistas: DC / Global / Mes / Hoy / Mañana, por territorio y zona. **[C]**
- **Colchón** = visitas agendadas para un día distinto de hoy; es el número con el que *inicia* el día siguiente. Ej. 9/7: hoy arrancó con colchón 18 sobre meta 40 (45% del día asegurado al despertar); el colchón generado hoy para mañana: 16 sobre meta 38 (42%). **[C]**
- **Regla operativa: la visita ocurre máximo 48 h después de la llamada.** Consecuencia: la demanda no se almacena — el colchón solo vive a 1–2 días vista; el sistema es sensible a caídas diarias de generación. **[C]**
- Zonificación comercial: Lima Alrededores / Lima Top / Lima Moderna / P. Norte / P. Sur (Arequipa, Cusco, Ica, Junín, Moquegua, Tacna...), Trujillo, Piura. Es un proxy razonable de NSE. **[C/D]**
- Split **Pull vs Push** en visitas y leads, visible por corte. Julio al corte: Pull 948 leads → 183 visitas (~19.3% L2B) vs Push 1,105 → 173 (~15.7%). **[C]**
- Segmento: Residencial vs Negocio. En agendas del día 9/7: 23 RES vs 7 NEG. **[C]**

### A.2 Dashboard "Leads v2" (gestión de leads y llamadas)

**Taxonomía de resultado de gestión** (lo que aceptan como "lead" real es lo gestionable): **[C]**
1. **Pendiente** (pendiente gestión)
2. **Gestionable**: devolverLlamada, noAceptaVisita, **visitaAceptada**, visitaReconfirmar (puede migrar a visitaAceptada si en la reconfirmación queda pactado otro día)
3. **No Contacto**
4. **No Gestionable**: atc, backoffice, clienteError, inviable, operacionesComerciales, prov, telefonoError, **televenta** (canal outbound; no confundir con TV inbound), zscc, otros

**Métrica norte: %L2B (lead → visita aceptada).** "Visita aceptada" es lo más cercano a booking; el negocio no valora el lead por ser lead. **[C, verbalizado]**

Números de referencia (julio 2026 al corte): gestionable 23.3%, no contacto 15.9%, **no gestionable 59.5%** (televenta 25.1% y prov 13.2% como mayores fugas). ~6 de cada 10 leads nacen muertos. **[C]**

**Call tracking con números telefónicos diferenciados por canal**: el cuadro %L2B Canales es SOLO universo de llamadas. En inbound, **TV = televisión** (atribución telefónica de pauta TV); SEO/SEM aparecen "bajos" ahí porque su conversión vía formulario web no entra a ese cuadro. Universos llamada vs internet se miran por separado (inbound 57 vs internet 530 en julio). **[C]**
→ Pregunta abierta: ¿existe vista consolidada llamada+form por canal de origen? **[A]**

**Canales**: Pull = Inbound (ATC, Camaras, Radio, RP, SEM Genérico, SEM Marca, SEO, TV...) + PMAX, SEM Genérico, SEM Marca, SEO. Push = Afiliados, Facebook, GDN, TikTok, YouTube, Banca, Influencer. **[C]**
- **Existe canal inbound "Camaras"**: gente que entra preguntando por cámaras → evidencia interna del shopper DIY tocando su puerta. Volumen y L2B: pendiente de preguntar. **[C canal existe / A magnitud]**
- SEM se subdivide en genérico-ALARMAS y genérico-CÁMARAS (visible en el Excel de mix) → ya pautan contra la demanda DIY. **[C]**
- **TikTok escaló en W2 de julio (74 → 140 leads)** — medir su L2B temprano. **[C]**

**Granularidad horaria**: leads y %L2B por hora × día × semana. Volumen pico 10–11 am, meseta 13–16 h; L2B horario ruidoso (celdas chicas). Entrada nocturna/madrugada ~20 leads/día. **[C]**

**Nocturno** (leads en horas off del contact center, retomados a primera hora):
- Hipótesis de Verisure: el lead nocturno tiene menor interés de contratar. **[C, verbalizado]**
- Datos junio: L2B Nocturno Madrugada 12.5% vs Nocturno Noche 18.6% vs general ~15–20%. Madrugada convierte peor pese a esperar menos horas → sugiere diferencia real de intención, no solo enfriamiento; muestras chicas. **[C números / D lectura]**
- Explicación rival a testear: **latencia** — en InHours responden <1 min al 85–95% de leads; el nocturno espera horas. **[C métricas / D hipótesis]**
- Ángulo Algorithm: el lead "nocturno noche" cae justo después del prime televisivo → puede ser respuesta directa a pauta TV que llega con el CC cerrado. Testeable superponiendo grilla de emisiones (Integrametrics, hora exacta) vs su curva horaria. **[D]**

**Cobertura**: 239 leads "Sin cobertura" con 0% L2B en julio (+ Cusco, Junín, Moquegua, Tacna en 0%) → pauta comprando gente a la que no pueden vender; quick win de geo-targeting. **[C]**

**L2B por zona ≈ mapa NSE**: Lima Top 40%, Arequipa 32.1%, Lima Moderna 27.9% vs P. Norte 12%, Alrededores 18.6%. El lead AB convierte 2–3x. **[C]**

### A.3 Dashboard "Seguimiento Visitas vMKT" (visitas → ventas)

- **Anulación de visitas**: solicitudes de anulación y visitas netas por zona/mes (4–9%). **[C]**
- **Conversión 590 = venta real: contrato firmado, cerrado y pagado.** **[C, verbalizado]**
- **Conversión Visitas = la vista recomendada por ellos para trabajar** (cohorte de visita, cortes Ayer/Hoy). **[C, verbalizado]** Razón probable: lag de cierre — 590 subestima periodos recientes. **[D, confirmar]**
- Regla práctica para Reset: **590 = verdad contable (leer con 30–45 días de madurez); Conversión Visitas = pulso operativo.** **[D]**
- **B2S (booking → sale)** ~20–25% global. **[C]**
- La regla de 48 h se cumple: cuadro "¿las visitas creadas ya se visitaron?" casi todo en Sí. **[C]**

**Funnel completo punta a punta (órdenes de magnitud, jul/jun 26):** de 100 leads → ~15–20 visitas aceptadas → ~3–5 ventas. **[C/D]**

**Hallazgos de conversión clave:**
- **NEG convierte visita→venta al 29.8–33.7% vs RES 17–21%: el problema B2B es de generación, no de cierre.** Cada lead NEG vale ~2x un lead RES en probabilidad de venta. **[C]**
- **Perfil A cierra hasta 50%** en su mejor mes → tercera validación del foco NSE AB (junto a L2B Lima Top 40% y B2S premium). **[C]**
- **Pull > Push en las tres etapas**: L2B (14.2→12.1% vs 11.3→7.4%, ambos cayendo W1→W2 julio), B2S (31–32% vs 14–18%), cierre (SEM Marca 36–41% y SEO 28.6% vs Facebook 13–19%). Facebook = volumen barato en lead, caro en venta. **[C]**

### A.4 Dashboard "Performance LG v2" (economics — solo Meta)

- **Meta es el único canal con la cadena económica completa conectada**: Spend → CPL → CPB (costo por booking) → **CPS (costo por venta)**, por campaña y semana. **[C, verbalizado]**
- Referencias junio: CPL €25–36 estable; **CPS volátil $766–$2,418/semana (3x de varianza sin explicación interna)**. **[C]**
- Ironía estratégica: ven economics completos solo en su peor canal de conversión; optimizan con lupa Facebook y a ciegas los canales que venden (SEM Marca, SEO). **[D]**
- Inversión digital visible ~€31–38K/mes. Dato registrado solo como contexto; no se usa ni se toca. **[C]**

### A.5 Excel "Mix de Medios 2026" (el que quieren matar)

- Excel con pestañas mensuales: plan/ejecución diaria por sub-canal (Facebook por plaza, SEM marca/genérico-alarmas/genérico-cámaras/PMAX/competencia, SEO, GDN, TikTok, YouTube, afiliados, alianzas banco), mix push/pull, inbound por origen de llamada (SEM, TV, radio, placas, OOH, vallas deportivas), KO, televenta, proyecciones y avance. **[C]**
- **Pedido verbalizado: que muera este Excel** → entorno automatizado con vista pre-lead (impresiones, frecuencia, saturación, upper funnel). **[C, verbalizado]**

### A.6 Pain points verbalizados por el cliente (9/7/26)

1. **No saben llegar a clientes de negocios** — a casas sí, a negocios no lo han logrado. (Sus datos precisan: es problema de generación; el cierre NEG es ~2x el residencial.)
2. **Segmentar por intereses no les funciona; los creativos por zona funcionan pero se desgastan muy rápido** (fatiga creativa).
3. **Testimoniales: no los han probado por miedo a fastidiar al portafolio** de clientes.
4. **Economics no integrados**: quieren cruzar CPL, Leads, %L2B, CPS de TODOS los canales dentro de su Power BI, como hoy solo pueden con Meta.
5. **Matar el Excel de mix de medios**: automatización con vista pre-lead, frecuencia y saturación.

### A.7 Dimensiones compartibles (llaves de interoperabilidad)

- Fecha (diaria) y hora
- Zonificación comercial (Lima Top / Moderna / Alrededores / P. Norte / P. Sur / departamento / distrito)
- Taxonomía de canal (TV, radio, digital; sub-canales SEM/social)
- Nomenclatura UTM interna observada: `FB_LIMA_INSTAGRAM_m_cotizaciones`, `google_generico_hogar_lima_m_cotizaciones` → nuestro export puede hablar ese idioma. **[C]**

---

## PARTE B — Blueprint v2 de The Algorithm (y arquitectura de tres piezas)

### B.0 Decisión de arquitectura: tres productos, un solo esquema de dimensiones

La reunión separó tres necesidades que en la cabeza del cliente suenan a una. Mezclarlas mataría el argumento de governance; separarlas crea dos oportunidades comerciales nuevas:

| Pieza | Qué es | Data que toca | Estado |
|---|---|---|---|
| **1. The Algorithm** (ya vendido) | Inteligencia externa outside-in: competencia, categoría, demanda, DIY, contexto | Solo Integrametrics + fuentes públicas. **Cero data de Verisure** | Rediseño — este blueprint |
| **2. Media Cockpit** (nuevo, cotizable) | Mata el Excel de mix: spend, leads de pauta, push/pull, upper funnel, **frecuencia y saturación** diarios por sub-canal | Cuentas publicitarias **que Reset ya opera** bajo el mandato de medios (data operativa de agencia, no APIs sensibles del cliente) | Oportunidad detectada 9/7/26 |
| **3. Data Pipeline / Media Feed** (nuevo, cotizable) | Feed estandarizado de spend/leads por canal-campaña-semana para que SU equipo de BI lo una a SUS ventas (CPL→L2B→CPB→CPS todos los canales) en SU Power BI | Reset entrega insumo; el cruce con ventas ocurre en casa de Verisure, hecho por ellos | Oportunidad detectada 9/7/26 |

**Regla de oro:** el Algorithm jamás toca CPS, ventas, CRM ni data de clientes. Frase de posicionamiento: *"nunca tocamos tu data de negocio ni de clientes; tu pauta ya la operamos nosotros; y el mundo exterior te lo traemos en tu mismo idioma de fecha, hora y zona."*

### B.1 Tesis de valor (post-discovery, más fuerte que antes)

- Su BI tiene resolución perfecta **hacia adentro** (hora × canal × zona × resultado × venta) y **cero columnas del mundo exterior**. Nadie en su stack responde: ¿qué emitió Prosegur hoy y a qué hora? ¿cuánto invierte la categoría? ¿crece el interés DIY? ¿por qué cayó mi Pull esta semana si no cambié nada? ¿por qué mi CPS varió 3x?
- Sprout/Lumen ven conversación y redes; no ven **inversión publicitaria ATL+digital** ni pauta OOH. Ese es el espacio en blanco, y es exactamente Integrametrics.
- Cuanto mejor es su BI interno, **más valioso es un feed externo bien estructurado**: tienen dónde enchufarlo.
- Pitch en una frase: *"tu wallboard te dice cómo va el día; el Algorithm te dice cómo va a venir el día — y por qué — sin tocar tu data."*

### B.2 Estructura modular (reemplaza las 4 capas secuenciales)

Se abandona la metáfora Data→Decision→Execution→Optimization (diseñada para optimizar campañas propias con data del cliente; ya no aplica). Se eliminan del repo: Execution Layer, Optimization Layer (budget allocation, MAB/Thompson Sampling, CPL), sentiment analyzer rule-based, mock GA4, scrapers de engagement redundantes con Sprout/Lumen.

Cada módulo existe solo si pasa el test: *¿qué pregunta responde que ninguna herramienta de Verisure responde?*

**MÓDULO RADAR (el corazón — Integrametrics + ad libraries)**
- **Competitive Ad Radar**: job diario contra `/registros` (filtros por marca: Prosegur, Securitas, Liderman, categoría) detectando `nuevas_versiones="NUEVO"` + `primera_emision_comercial` → alerta same-day con link al video/audio (`rfile`).
- **Share of Investment diario** por competidor (nunca solo categoría: Verisure ES la categoría; el desglose por competidor es la vista default, la categoría solo como denominador).
- **Estrategia de medios de la competencia**: franjas, canales, programas, géneros, duración, posición en tanda, ciudad. Incluye **calidad de compra**: GRPs estimados y costo-por-rating implícito de la pauta de Prosegur (rating, audiencia, posición en tanda).
- **Galería creativa viva ("Ad Museum")**: timeline visual por competidor con cada versión, primera emisión, canales/franjas e inversión acumulada; piezas ATL (`rfile`) + digitales (`advertisement`) reproducibles en el dashboard.
- **Clasificador tonal EPPM automático**: al detectar pieza nueva, extraer keyframes (ffmpeg en Actions) + copy → Claude clasifica en miedo → eficacia → alivio / innovación. Tracker longitudinal del territorio anti-miedo de Prosegur. **[D viabilidad: validar calidad de rfile en Fase 1]**
- **Índice de frescura creativa**: días en aire por pieza (propia y competencia, vía Meta Ad Library) vs benchmark de categoría → ataca el pain #2 (desgaste creativo) avisando antes de que la fatiga coma performance.
- **Bot de monitoreo digital de competencia**: Meta Ad Library vía Apify (VIABLE para anuncios comerciales con creatividades, ~$0.4–1.5/1000 ads — corrige la evaluación anterior), Google Ads Transparency Center (actors disponibles), RSS de YouTube por canal (gratis), diff diario de la web de Prosegur (planes/promos).
- **Mapa OOH**: vía pública con lat/long, cruzado con denuncias por distrito y zonas NSE.
- **Playbook de medios B2B de la categoría** (pain #1): cómo pauta quien sí vende a negocios (Prosegur B2B, Securitas, Liderman, Hikvision comercial) — medios, franjas, programas, prensa económica.

**MÓDULO DEMANDA**
- Google Trends Perú: keywords de seguridad, robos, alarmas, marcas. Share of Search vs Share of Investment (análisis tipo ESOV automatizado): ¿los bursts de Prosegur mueven búsqueda? ¿quién convierte inversión en demanda más eficiente?
- **Índice de Amenaza DIY** (competidor indirecto: cámaras solas monitoreadas desde el celular; ticket de entrada S/91–300 vs cuota mensual del servicio): (a) share of search "cámara de seguridad wifi" vs "alarma para casa"/marcas — índice de sustitución; (b) marketplaces (Mercado Libre, Falabella, Sodimac) vía Apify: SKUs, precios, velocidad de reviews como proxy de ventas — **[A: fragilidad anti-bot, validar]**; (c) `/marcas` y `/subsectores` de Integrametrics: ¿están Ezviz, Imou, TP-Link, Hikvision o retailers pautando? **[A: verificar con una llamada al endpoint, semana 1]**.
  - Refuerzos internos del cliente (sin tocar su data): canal inbound "Camaras" existe; SEM genérico-cámaras existe. El shopper DIY ya toca su puerta.
  - Ángulo estratégico EPPM: la cámara sola da autoeficacia percibida sin capacidad de respuesta — te deja *ver* el robo, no *responder*. Munición de messaging.
- Referencia regional de velocidad: México — penetración de cámaras en hogares 9.2% → 31.8% proyectado a 2028; Ezviz +77% en Mercado Libre. **[C fuente Ezviz/regional; A extrapolación a Perú — validar cifra local con Ipsos/CCR]**

**MÓDULO CONTEXTO**
- Criminalidad pública: datosabiertos.gob.pe (DKAN, dataset Denuncias Policiales SIDPOL, granularidad distrito × tipo de hecho, refresco MENSUAL, re-emisión completa cada mes → re-ingestar, no append; bot-protection → User-Agent realista). Distinguir **robo a comercios** (alimenta playbook B2B) de robo a viviendas.
- Densidad de negocios por distrito (censos económicos INEI / licencias, datasets estáticos) × robo a comercios → **mapa de targeting B2B outside-in** (pain #1).
- Macro BCRP (API pública sin token, máx 10 series/consulta): tipo de cambio diario (normalización EUR/USD/PEN del reporting y precio del hardware DIY importado) + confianza/expectativas mensuales como contexto del Daily Brief. **Rol: ingrediente, no capa. Primer candidato a recorte.**
- Noticias de seguridad ciudadana (RSS Gestión, El Comercio, RPP) + estacionalidad (Fiestas Patrias, Navidad, eventos tipo Mundial).

**MÓDULO COPILOT (síntesis + conversación)**
- **Nuevo Opportunity Score** = Índice de Presión Competitiva (SOI competencia, ritmo de piezas nuevas, expansión de canales/franjas) + Índice de Momento de Categoría (Trends + criminalidad + estacionalidad). Lectura EPPM: IMC alto = threat activo; IPC alto sin respuesta = riesgo de perder SOV con demanda caliente → cuándo pisar eficacia/alivio (territorio Verisure vs anti-miedo Prosegur).
- **Daily Brief con LLM** (Claude Haiku, ~<$1/mes con prompt caching): resumen diario en español de alertas, movimientos y lectura estratégica.
- **Chat conversacional sobre la data** ("¿cuánto invirtió Prosegur en prime este mes?", "muéstrame sus piezas nuevas de junio"). Requisito técnico: **Netlify Function como proxy** de la API de Anthropic (el sitio estático no puede exponer la key client-side); opera sobre los JSON agregados de `public/data/`.
- **Alertas**: pieza nueva de competencia (con video), pico de inversión/SOI, pico de búsqueda, nuevo canal/franja, salto del índice DIY.

### B.3 Interoperabilidad: "comparto tus dimensiones"

- Además del dashboard, **export diario CSV/JSON descargable** con las llaves que su BI ya filtra: fecha/hora, zonificación comercial, taxonomía de canal (y compatible con su nomenclatura UTM).
- Contenido del export: presión competitiva por zona, grilla de spots emitidos (fecha-hora-canal-programa-marca-versión), IPC/IMC/Opportunity Score, índice DIY, tipo de cambio.
- Flujo de data **en una sola dirección: hacia adentro de ellos**. Su equipo de BI cruza contra L2B, PACE, llamadas, CPS. La validación de nuestras hipótesis ocurre en su casa, con sus números — indiscutible.
- Casos de cruce diseñados (los ejecutan ellos): (1) **spot-to-call/lead**: grilla de emisiones vs curva horaria de llamadas TV y leads nocturnos — ¿cuánto lead generado por TV se enfría hasta la mañana?; (2) presión Prosegur por zona vs su PACE/L2B zonal (ej. brechas en Lima Moderna/Arequipa); (3) IPC/IMC vs varianza de su CPS de Meta (3x semanal sin explicación interna); (4) momento de categoría vs mix Pull/Push del día.

### B.4 Governance como feature (afinado post-reunión)

- **Zero first-party data del negocio**: sin GA4, Meta Ads del cliente, CRM, ventas, PII, imágenes/cámaras de clientes. Fuentes: Integrametrics (servicio de mercado pagado por Reset) + públicas.
- Precisión post-Cockpit: la data de pauta que Reset opera como agencia es data operativa del mandato de medios existente — vive en el Cockpit (producto 2), **nunca dentro del Algorithm**.
- Arquitectura: repo privado; tokens (Integrametrics, Anthropic) en GitHub Secrets; dashboard estático en Netlify con autenticación (Basic Auth por usuario en Fase 1 → Password Protection Pro si se quiere UX pulida); Netlify Function como único backend, sin data sensible.
- One-pager de aislamiento para venta interna: *"The Algorithm no puede filtrar tu data porque nunca la toca — y tú puedes cruzar todo lo nuestro."*

### B.5 Datos e histórico

- **Integrametrics Perú: data desde enero 2026 en adelante.** Hoy ~6 meses: suficiente para tendencias diarias/semanales y radar; insuficiente para YoY.
- **Acción inmediata: congelar snapshots diarios desde ya** (caché incremental en `public/data/`; límite 90.000 registros/consulta → paginación + diffs).
- Backfill IBOPE (si llega): **dataset separado, flag de fuente, línea punteada pre-2026; jamás mezclado en la misma serie** (metodologías de valorización distintas). Si existe mes de solape, medir ahí la discrepancia antes de mostrar histórico. **[A: verificar en su momento]**

### B.6 Pipeline diario

- GitHub Actions cron diario (+ `workflow_dispatch` de respaldo; el cron puede retrasarse y no dispara en repos sin actividad en planes free). Free tier: 2.000 min/mes, suficiente.
- Secuencia: pull Integrametrics (paginado, diff, detección NUEVO) → Trends → BCRP → chequeo mensual criminalidad (solo si hay mes nuevo) → ad libraries/bot → recálculo IPC/IMC/Score/índice DIY → clasificación EPPM de piezas nuevas → Daily Brief LLM → commit JSON + export CSV → deploy Netlify.
- Costos incrementales estimados: Apify ~$5–10/mes (ad libraries + marketplaces + noticias), LLM <$1/mes, Actions $0, Integrametrics $0 (ya pagado). **Objetivo total <$25/mes.** **[A]**

### B.7 Roadmap por fases (ejecutable con Claude Code sobre el repo)

- **Fase 0 — Limpieza (0.5–1 sprint):** eliminar Execution/Optimization/sentiment/MAB/mock GA4; nuevo esquema de `public/data/`.
- **Fase 1 — RADAR core (1–2 sprints, QUICK WIN):** cliente API Integrametrics (Secrets, paginación, caché incremental, snapshots); detección NUEVO + alerta con video; SOI diario por competidor; verificación temprana: ¿marcas DIY en `/marcas`? ¿lag real de detección same-day? ¿calidad de `rfile`? **Umbral de éxito: detectar y notificar una pieza nueva de Prosegur el mismo día de su primera emisión, con link al video.**
- **Fase 2 — DEMANDA + CONTEXTO (1–2 sprints):** Trends + share of search, índice DIY (Trends + marketplaces), criminalidad DKAN, BCRP, mapa OOH×riesgo×NSE, playbook B2B.
- **Fase 3 — COPILOT (1–1.5 sprints):** IPC/IMC/Score, Daily Brief, clasificador EPPM, chat conversacional (Netlify Function proxy), export CSV en dimensiones compartidas.
- **Fase 4 — Hardening (0.5–1 sprint):** auth Netlify, one-pager governance, monitoreo de costos y fallos de fuentes frágiles, fallback de cron.
- Paleta del dashboard alineada a marca: rojo (acción/alertas), blanco (tranquilidad/base), gradiente (innovación/score).

### B.8 Oportunidades comerciales nuevas (para propuesta aparte, NO Algorithm)

1. **Media Cockpit** — mata el Excel de mix; vista pre-lead (impresiones, frecuencia, saturación, alcance) diaria por sub-canal desde las cuentas que Reset opera. Granularidad igual o mayor a la del Excel actual. **[Pedido verbalizado 9/7/26]**
2. **Data Pipeline / Media Feed** — feed estandarizado de spend/leads (esquema idéntico a su tabla de Meta) para que su BI una CPL→L2B→CPB→CPS de todos los canales en su Power BI. Reset nunca ve ventas ni CPS. **[Pedido verbalizado 9/7/26]**
3. Ángulos creativos detectados para estrategia (no producto): testimoniales sin fastidiar al portafolio (Barómetro/institucional, casos anonimizados recreados, audit de si la competencia regional los usa vía galería creativa); hipótesis "8 horas"; segmentación NSE AB triplemente validada por su propio funnel (L2B Lima Top 40%, cierre Perfil A 50%, B2S premium).

### B.9 Bajo qué condiciones este plan estaría equivocado — y señales tempranas

1. **Integrametrics no detecta same-day o su cobertura digital Perú es débil** → la apuesta central pierde fuerza. Señal: medir lag real primera-emisión→detección en las 2 primeras semanas de Fase 1.
2. **Verisure ya recibe reportes de inversión competitiva** (Kantar IBOPE u otra central) → el diferencial ATL se reduce (quedarían same-day, galería, EPPM, DIY). Señal: preguntarlo directamente en el próximo contacto — no salió en la reu del 9/7.
3. **Marcas DIY/retailers no registrados en Integrametrics** → índice DIY queda con dos patas (Trends + marketplaces). Señal: una llamada a `/marcas` en semana 1.
4. **`rfile` con calidad/latencia pobre** → clasificador EPPM y galería degradados a metadata. Señal: muestreo de capturas en Fase 1.
5. **Anti-bots de marketplaces (Mercado Libre ya devuelve login-wall) rompen la pata de oferta DIY** → sostener índice solo con Trends. Señal: tasa de fallos de jobs en el primer mes.
6. **El cliente presiona por meter CPS/ventas dentro del Algorithm** → riesgo de muerte del posicionamiento. Mitigación: arquitectura de tres piezas ya separada y verbalizada; derivar siempre a productos 2 y 3.

---

## Anexo — Preguntas abiertas para el próximo contacto

1. ¿Volumen y L2B del canal inbound "Camaras"? ¿Trae dueños de negocio?
2. ¿Vista consolidada llamada + formulario por canal de origen, o universos separados?
3. ¿Reciben ya algún reporte de inversión competitiva (Kantar IBOPE, central de medios)?
4. Confirmar razón de "usar Conversión Visitas, no 590" (¿lag de cierre?) y la madurez típica visita→contrato pagado.
5. ¿L2B de TikTok tras el escalamiento de W2 julio?
6. Mes de solape IBOPE vs Integrametrics para calibrar discrepancia, si el backfill avanza.
