# Activación

Lo que falta para que el panel pase de la data de julio a la data al día, con MAIA respondiendo. Todo se configura fuera del código: ninguna clave va en el repositorio ni llega al navegador.

## 1. Integrametrics al día

1. En GitHub, **Settings → Secrets and variables → Actions**, crear `INTEGRAMETRICS_TOKEN`.
2. En **Actions → Pipeline**, correrlo a mano con «Run workflow». Sin fecha de inicio, baja desde el día siguiente al último que tiene la data, así que no queda un hueco aunque el pipeline haya estado apagado semanas. El backfill del domingo vuelve a bajar el año en curso y deja intacto lo de años anteriores.
3. Verificar el artefacto, no el check verde: el commit del pipeline tiene que tocar `public/data/algorithm.json`, `export.csv`, `medios.json` y `maia-contexto.json`, y el sello de la barra («Datos al …») tiene que pasar a ayer.

Sin token, el pipeline falla en rojo a propósito. Si fallan Google Trends o MAIA un lunes, la data de Integrametrics del día igual se publica y la corrida queda en rojo al final. El commit del bot no lleva `[skip ci]`, porque con eso Netlify no despliega: cada commit de data dispara un deploy. El panel dice cuántos días lleva sin datos nuevos.

## 2. MAIA

| Dónde | Variable | Para qué |
|---|---|---|
| GitHub, Secrets de Actions | `ANTHROPIC_API_KEY` | La lectura de la semana, que se escribe cada lunes (`npm run maia`) |
| Netlify, Site configuration → Environment variables | `ANTHROPIC_API_KEY` | La consulta desde el panel (`netlify/functions/maia.mjs`, ruta `/api/maia`) |
| Netlify (opcional) | `MAIA_MODELO` | Otro modelo; por omisión, `claude-opus-5-5` |

Sin la clave, el panel dice que MAIA no está activa y muestra solo los hechos de la semana, que salen de la data con reglas. Nunca simula una respuesta. La función está probada con el entorno y la red simulados (`pruebas/maia-funcion.test.mjs`); en Netlify se prueba con una pregunta desde el panel.

En `netlify.toml`, la regla de `/api/maia` va antes de la redirección de la SPA (`/* → /index.html`): Netlify lee las reglas de arriba abajo y gana la primera. No lo probé en un despliegue; se confirma con la primera pregunta desde el panel (si responde con el HTML del panel, la regla no se aplicó).

Dos cosas a mirar al activarla:

- **Tiempo:** Netlify corta una función sincrónica a los 30 segundos (según su documentación de funciones, consultada en octubre de 2026; versiones anteriores decían 10). Si MAIA dice seguido que no pudo responder, se prueba con un modelo más rápido en `MAIA_MODELO`.
- **Costo:** sin `BASIC_AUTH_*`, cualquiera con el enlace puede preguntarle a MAIA y cada pregunta usa la clave de Anthropic. Con el sitio abierto conviene un límite de gasto en la consola de Anthropic.

## 3. Google Trends

No pide clave. El paso corre los lunes y reintenta si Google responde 429. Asumo que responde desde los runners de GitHub; si el paso queda en rojo tres lunes seguidos, hay que bajar Trends desde otra máquina o con un proveedor de pago.

## 4. Acceso al sitio

Con `BASIC_AUTH_USER` y `BASIC_AUTH_PASSWORD` en las variables de Netlify, todo el sitio (incluida la data y MAIA) pide clave. Sin ellas queda abierto.

## 5. Lo que se activa a pedido

Ninguna de estas fuentes toca data de Verisure. Cada una entra primero a una tarjeta que ya existe, según la regla de la guía (vista general y detalle).

| Fuente | Qué sumaría | Qué pide |
|---|---|---|
| Precios de cámaras en marketplaces | Cuánto cuesta una cámara frente a la cuota mensual de una alarma, en el capítulo de cámaras DIY | Mercado Libre pide credenciales de aplicación; Falabella y Sodimac no tienen API pública |
| Anuncios de marcas de cámaras | Qué piezas tienen al aire Ezviz, Xiaomi o Tapo, como un mazo más del abanico | Meta Ad Library pide un token de acceso verificado |
| Retail que pauta cámaras | Las versiones de tiendas que nombran cámaras de seguridad | Bajar la categoría completa de Integrametrics, no solo seguridad |
| Google Ads, Meta y TikTok de Verisure | El costo por resultado frente al objetivo, en Rendimiento, y el cruce con lo que hace la competencia | Accesos de lectura a las cuentas, con permiso de Verisure |
| Un Google Sheets | Objetivos, calendario de campañas de Verisure y precios relevados a mano | Una hoja compartida con la cuenta de servicio del pipeline |
| Denuncias SIDPOL | Contexto de seguridad por distrito | Descarga manual; no tiene API |
