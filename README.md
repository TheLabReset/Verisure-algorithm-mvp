# The Algorithm by The Lab · Verisure Perú

Panel de inteligencia competitiva de inversión publicitaria para Verisure Perú. Es *outside-in*: se arma solo con lo que Integrametrics registra al aire (TV, radio, cable, OTT, vía pública y digital) y no toca la data de ventas del cliente. El cruce con sus llamadas y ventas lo hace su Power BI, con el CSV que el panel le entrega.

Sigue el estándar de The Algorithm: cuatro capas, el sistema de diseño Quincha y las reglas de datos honestos de [`docs/guia-algoritmo.md`](docs/guia-algoritmo.md). La plantilla de referencia es el repo Reset-The-Algorithm.

## Las cuatro capas

1. **Captura de señales:** qué salió al aire. Las piezas que se estrenaron, las versiones ATL al aire de cada marca, las piezas digitales nuevas (en abanico, con su video, audio o imagen) y la vía pública por distrito.
2. **Inteligencia de mercado:** qué mirar en el período (alertas con umbral fijo y lo que va bien) y cómo viene el año, mes por mes, en ATL y en digital.
3. **Activación estratégica:** dónde está la inversión (medios, franjas, canales) y cuándo sale al aire (horas, días de la semana, programas) de cada marca.
4. **Rendimiento y optimización:** share of investment en ATL y en digital frente al período anterior, y la inversión ATL día por día.

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
```

`npm run prueba` y `npm run sistema` se corren antes de cada commit.

## Cómo está armado

Ninguna cifra se escribe en un componente. La data entra por un solo lado, se calcula en un solo lado y las pantallas solo pintan.

```
src/
├── cliente.js        Quién es el cliente y su competencia, con sus nombres en Integrametrics. Único archivo que nombra a la marca
├── fuentes/          Integrametrics: cliente de la API, contrato agregado, CSV para el BI y medios por mes (corren en Node)
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
```

**Dependencias:** React 18, Vite 5, los íconos de Lucide y Sofia Sans (`@fontsource-variable`), la tipografía por defecto del estándar mientras no tengamos la de la marca. Los gráficos son SVG propios.

## La data

| Archivo | Qué tiene | Quién lo escribe |
|---|---|---|
| `public/data/algorithm.json` | Inversión diaria por marca (ATL y digital), piezas con su arte, paneles de vía pública y estrenos | `npm run pipeline` |
| `public/data/export.csv` | Una fila por emisión, con las dimensiones que comparte con el Power BI del cliente (fecha, hora, zona, canal, programa) | `npm run pipeline` |
| `public/data/medios.json` | Canales, programas, horas y días por mes y marca, armado desde el CSV | `npm run medios`, y el pipeline al final |
| `public/data/meta.json` | Cuándo corrió, desde y hasta qué día hay data, cuántos registros | `npm run pipeline` |

El navegador solo lee estos archivos: no habla con Integrametrics ni ve el token. El botón «Export para su BI» descarga el CSV.

La data cubre del 1 de enero al 13 de julio de 2026. El panel dice cuántos días lleva sin datos nuevos; con el token en Secrets, el pipeline la pone al día.

## Producción

El pipeline corre en GitHub Actions ([`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml)): cada día un incremental de 7 días y cada domingo un backfill desde enero.

- **Falla en rojo sin `INTEGRAMETRICS_TOKEN`.** Antes quedaba verde sin hacer nada y la data se quedó en julio sin que nadie lo notara. El token va en Settings, Secrets and variables, Actions.
- **GitHub apaga los crones de un repo sin actividad por 60 días.** Si pasa, se vuelven a activar en la pestaña Actions.
- **Minutos:** el repo público no paga minutos. Si pasa a privado, el presupuesto se arma con [`docs/produccion-actions.md`](docs/produccion-actions.md). Estimación sin medir (asumo): unos 2 minutos el incremental diario y unos 10 el backfill del domingo, unos 100 minutos al mes. Se mide en la primera semana con token y se corrige acá.
- **Acceso:** con `BASIC_AUTH_USER` y `BASIC_AUTH_PASSWORD` en Netlify, la función `netlify/edge-functions/auth.js` pide clave para todo el sitio, incluida la data.

## Lo que falta conectar

Se muestra solo lo que tenemos. En «Qué se monitorea» quedan a la vista las fuentes por conectar: Google Trends, denuncias SIDPOL y el Power BI de Verisure, que sería lo último en activarse.

## Documentación

| Documento | Para qué |
|---|---|
| [`docs/guia-algoritmo.md`](docs/guia-algoritmo.md) | Cómo se diseña un algoritmo: capas, tarjeta, gráficos y datos honestos |
| [`docs/quincha.md`](docs/quincha.md) | El sistema de diseño y su chequeo |
| [`docs/abanico.md`](docs/abanico.md) | Cómo se muestran las piezas: el abanico y su ventana |
| [`docs/marca-verisure.md`](docs/marca-verisure.md) | La marca en el panel: colores, logo, tipografía, fuentes y supuestos |
| [`docs/INTEGRAMETRICS-HALLAZGOS.md`](docs/INTEGRAMETRICS-HALLAZGOS.md) | Lo que se aprendió de la API de Integrametrics |
| [`docs/produccion-actions.md`](docs/produccion-actions.md) | Minutos de GitHub Actions antes de pasar a producción |
| [`docs/nuevo-algoritmo.md`](docs/nuevo-algoritmo.md) | Cómo se arma un algoritmo para otra marca desde la plantilla |
| [`docs/BITACORA.md`](docs/BITACORA.md) | Historia del proyecto |
| [`CLAUDE.md`](CLAUDE.md) | Las reglas que sigue Claude Code en este repo |
