# The Algorithm by The Lab · Verisure Perú

Panel de inteligencia competitiva de inversión publicitaria para Verisure Perú. Lo principal es la competencia: qué hace Prosegur; Verisure va para comparar. Es *outside-in*: se arma con lo que Integrametrics registra al aire (TV, radio, cable, OTT, vía pública y digital) y con Google Trends, y no toca la data de ventas del cliente. El cruce con sus llamadas y ventas lo hace su Power BI, con el CSV que el panel le entrega.

Sigue el estándar de The Algorithm: cuatro capas, el sistema de diseño Quincha y las reglas de datos honestos de [`docs/guia-algoritmo.md`](docs/guia-algoritmo.md). La plantilla de referencia es el repo Reset-The-Algorithm.

## Las cuatro capas

Cada capítulo tiene una vista general y un detalle que se abre a la derecha («Ver el detalle»), para que el panel no crezca hacia abajo cuando llegue más data.

1. **Captura de señales:** lo nuevo de Prosegur en el período: digital primero (sus piezas por mensaje), TV y cable, radio (emisión por emisión, con su digitalizado), OOH en un mapa y las tendencias. Las versiones del año, en un cronograma sin montos, van en Históricos.
2. **Inteligencia de mercado:** qué mirar (alertas con umbral fijo, la competencia primero), las cámaras DIY frente a la marca (Google Trends) y la pauta del año semana a semana, con las dos marcas en la misma escala. En el detalle: las marcas de cámaras que más se buscan y la inversión de cada mes.
3. **Activación estratégica:** cómo reparte cada marca su inversión por medio y cuándo emite (día × hora, en el color de la marca). En el detalle: la inversión por medio en soles, las franjas, los canales y los programas.
4. **Rendimiento y optimización:** el share of investment en digital y en ATL frente al período anterior, y el share de Prosegur semana a semana. En el detalle: las cifras en soles y la inversión día por día.

**MAIA** (Media Analyst IA), en el botón de la barra: el reporte de cada semana (los hechos, calculados con reglas, y su lectura, escrita por el modelo cada lunes) y consultas sobre la data del panel.

Se compara siempre un mes cerrado con el mes anterior entero, y el mes en curso con los mismos días del mes anterior. ATL y digital se estiman distinto: van lado a lado y nunca se suman.

## Correr el panel

Necesita Node 18 o más nuevo.

```bash
npm ci
npm run dev                          # panel en local
npm run prueba                       # cálculo, textos, marca y chequeo del sistema
npm run sistema                      # tokens, contraste y bordes de Quincha
npm run build                        # build de producción en dist/
npm run medios                       # rearma public/data/medios.json desde export.csv
npm run pipeline                     # baja lo nuevo de Integrametrics (necesita INTEGRAMETRICS_TOKEN)
npm run busquedas                    # baja Google Trends a public/data/busquedas.json
npm run contexto                     # arma public/data/maia-contexto.json, lo que MAIA sabe de la data
npm run maia                         # MAIA escribe la lectura de la semana (necesita ANTHROPIC_API_KEY)
npm run mapa -- osm-lima.geojson     # rearma los límites de distrito de Lima (casi nunca hace falta)
```

`npm run prueba` y `npm run sistema` se corren antes de cada commit.

## Cómo está armado

Ninguna cifra se escribe en un componente. La data entra por un solo lado, se calcula en un solo lado y las pantallas solo pintan.

```
src/
├── cliente.js        Quién es el cliente y su competencia, con sus nombres en Integrametrics. Único archivo que nombra a la marca
├── fuentes/          Integrametrics, Google Trends y MAIA (corren en Node; la clave de cada una nunca llega al navegador)
├── calculo/          Reglas puras: vista.js es la única puerta entre la data y la pantalla; periodo.js arma los meses
├── textos/           Las lecturas, en español peruano: observan, no ordenan
├── capas/            Las cuatro capas y sus capítulos
├── pantallas/        Una pantalla por capa; solo pintan
└── sistema/          Quincha: tokens con la paleta de Verisure, componentes, gráficos SVG propios y formato de cifras
scripts/              El pipeline y el armado de medios.json
pruebas/              node --test: fuentes, vista con la data real, textos, marca y sistema
herramientas/         El chequeo del sistema y el armado del artefacto
public/data/          Lo que lee el panel: algorithm.json, medios.json, export.csv y meta.json
public/marca/         Logo oficial en negativo para la barra
netlify/functions/    maia.mjs: la consulta a MAIA, con la clave de Anthropic en el entorno de Netlify
```

**Dependencias:** React 18, Vite 5, los íconos de Lucide, Sofia Sans (`@fontsource-variable`, la tipografía por defecto del estándar mientras no tengamos la de la marca) y Leaflet para el mapa, que se carga aparte solo cuando se abre el OOH (44 KB comprimido). Los demás gráficos son SVG propios.

## La data

| Archivo | Qué tiene | Quién lo escribe |
|---|---|---|
| `public/data/algorithm.json` | Inversión diaria por marca (ATL y digital), piezas con su arte, paneles de vía pública y estrenos | `npm run pipeline` |
| `public/data/export.csv` | Una fila por emisión, con las dimensiones que comparte con el Power BI del cliente (fecha, hora, zona, canal, programa) | `npm run pipeline` |
| `public/data/medios.json` | Canales, programas, horas y días por mes y marca, armado desde el CSV | `npm run medios`, y el pipeline al final |
| `public/data/meta.json` | Cuándo corrió, desde y hasta qué día hay data, cuántos registros | `npm run pipeline` |
| `public/data/busquedas.json` | Google Trends Perú por semana: cámaras DIY frente a la marca, y marcas de cámaras | `npm run busquedas`, los lunes |
| `public/data/mapa-lima.json` | Límites de los 50 distritos de Lima y el Callao (OpenStreetMap, ODbL) para asignar cada panel a su distrito | `npm run mapa`, una vez |
| `public/data/maia-contexto.json` | Lo que MAIA sabe: la misma data del panel, ya calculada | `npm run contexto`, cada día |
| `public/data/maia.json` | La lectura de MAIA de la última semana | `npm run maia`, los lunes |

El navegador solo lee estos archivos: no habla con Integrametrics ni ve el token. El CSV spot a spot (`export.csv`) lo publica el pipeline para el BI; el panel no lo ofrece como descarga.

La data cubre del 1 de enero al 13 de julio de 2026. El panel dice cuántos días lleva sin datos nuevos; con el token en Secrets, el pipeline la pone al día.

## Producción

El pipeline corre en GitHub Actions ([`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml)): cada día un incremental de 7 días y el contexto de MAIA; cada domingo un backfill desde enero; cada lunes, Google Trends y la lectura de MAIA.

- **Falla en rojo sin `INTEGRAMETRICS_TOKEN`**, y los lunes sin `ANTHROPIC_API_KEY`. Antes quedaba verde sin hacer nada y la data se quedó en julio sin que nadie lo notara. Las dos van en Settings, Secrets and variables, Actions.
- **MAIA en el sitio:** la consulta usa `ANTHROPIC_API_KEY` en las variables de entorno de Netlify (y `MAIA_MODELO` si se quiere otro modelo; por omisión, `claude-opus-5-5`). Sin la clave, el panel dice que MAIA no está conectada: no simula respuestas.
- **Google Trends** no tiene API pública: se usa la de su página, que a veces responde 429. El script reintenta con espera; si igual falla, el paso queda en rojo (asumo que responde desde los runners de GitHub; no está probado).
- **GitHub apaga los crones de un repo público sin actividad por 60 días.** Pasó: el último commit fue el 14 de julio y el cron dejó de correr el 12 de septiembre. Con el commit diario del pipeline el repo tiene actividad todos los días; si igual se apaga, se vuelve a activar en la pestaña Actions. Si después de reactivarlo el cron sigue sin correr (pasó el 17 de octubre), se cambia algo en `.github/workflows/pipeline.yml`, por ejemplo el minuto, para que GitHub registre el horario de nuevo; mientras tanto, la data se actualiza a mano con «Run workflow».
- **Reintentos:** un corte de red o un error 5xx o 429 de Integrametrics se reintenta dos veces (a los 3 y a los 10 segundos); un 4xx no. Antes una sola falla cortaba la corrida entera, que hace su commit al final.
- **Minutos (medido el 16 de octubre de 2026):** cada corrida tiene unos 35 segundos fijos (preparar, instalar, pruebas y commit) y bajar la data toma entre 1,3 y 1,5 segundos por día de la ventana: 108 días tardaron 2 min 38 s y 111 días, 2 min 27 s. Se deduce: el incremental diario (7 días) dura menos de 1 minuto y GitHub cobra 1; el backfill del domingo (de enero a la fecha, unos 290 días hoy) dura unos 7 minutos y cobra 8, y crece hasta unos 9 en diciembre. Unos 65 minutos al mes, más uno o dos los lunes por Trends y MAIA. Hoy el repo es público y no paga minutos; si pasa a privado, ese es el presupuesto (ver [`docs/produccion-actions.md`](docs/produccion-actions.md)).
- **Caché:** la data (`/data/*`) va con `max-age=0, must-revalidate`: el navegador pregunta cada vez si hay una versión nueva y, si no la hay, Netlify responde 304 sin mandar el archivo. Con una hora de caché, el panel seguía mostrando la data vieja después de una actualización.
- **Acceso:** con `BASIC_AUTH_USER` y `BASIC_AUTH_PASSWORD` en Netlify, la función `netlify/edge-functions/auth.js` pide clave para todo el sitio, incluida la data.

## Lo que falta conectar

Se muestra solo lo que tenemos. En «Qué se monitorea» quedan a la vista las fuentes por conectar: precios de cámaras en marketplaces (Mercado Libre pide credenciales), anuncios de marcas de cámaras (Meta Ad Library pide un token), denuncias SIDPOL y el Power BI de Verisure, que sería lo último en activarse.

## Documentación

| Documento | Para qué |
|---|---|
| [`docs/activacion.md`](docs/activacion.md) | Qué configurar para tener la data al día y MAIA respondiendo, y las fuentes que se activan a pedido |
| [`docs/guia-algoritmo.md`](docs/guia-algoritmo.md) | Cómo se diseña un algoritmo: capas, tarjeta, gráficos y datos honestos |
| [`docs/quincha.md`](docs/quincha.md) | El sistema de diseño y su chequeo |
| [`docs/abanico.md`](docs/abanico.md) | Cómo se muestran las piezas: el abanico y su ventana |
| [`docs/marca-verisure.md`](docs/marca-verisure.md) | La marca en el panel: colores, logo, tipografía, fuentes y supuestos |
| [`docs/INTEGRAMETRICS-HALLAZGOS.md`](docs/INTEGRAMETRICS-HALLAZGOS.md) | Lo que se aprendió de la API de Integrametrics |
| [`docs/produccion-actions.md`](docs/produccion-actions.md) | Minutos de GitHub Actions antes de pasar a producción |
| [`docs/nuevo-algoritmo.md`](docs/nuevo-algoritmo.md) | Cómo se arma un algoritmo para otra marca desde la plantilla |
| [`docs/BITACORA.md`](docs/BITACORA.md) | Historia del proyecto |
| [`CLAUDE.md`](CLAUDE.md) | Las reglas que sigue Claude Code en este repo |
