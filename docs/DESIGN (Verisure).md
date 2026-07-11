# DESIGN.md — Sistema de diseño de The Algorithm by Reset (instancia Verisure Perú)

> **Autoridad de este documento.** Este archivo gobierna TODA decisión visual del producto. Si el código contradice este documento, el código está mal. La referencia visual canónica es el mockup aprobado `design/reference/The_Algorithm_Verisure.html` (iteración 2 de Claude Design): ante ambigüedad, replicar el mockup.
> Principio rector: **tranquilidad vigilante** — central de monitoreo profesional en calma. El rojo aparece solo cuando algo pasó. Si todo grita, nada alerta.

---

## 1. Tokens de color (CSS custom properties)

```css
:root {
  --base:          #FAF8F5;  /* fondo de página — blanco cálido papel */
  --surface:       #FFFFFF;  /* cards */
  --ink:           #16181F;  /* texto principal, card oscura ancla, iconos */
  --ink-2:         #565D6B;  /* texto secundario/labels */
  --ink-3:         #8A909C;  /* metadatos, ejes (solo texto ≥14px o deshabilitado) */
  --line:          #E9E5DF;  /* divisores sutiles; usar poco */
  --verisure:      #ED002F;  /* SOLO: alertas, CTA primario, marca, serie enfatizada */
  --verisure-deep: #B30024;  /* hover/pressed del rojo */
  --verisure-tint: #FDEEF1;  /* fondo suave de bloques de alerta/énfasis */
  --positive:      #0E7A55;  /* único verde (deltas positivos) */
  --caution:       #9A5B00;  /* único ámbar (advertencias, gauge DIY) */
  --grad-brand: linear-gradient(135deg,#ED002F 0%,#7A0E24 100%); /* UN uso: Opportunity Score */
}
```

Reglas de uso:
- Proporción por vista: ~90% neutros · ~7% tintes · ~3% rojo. **Dosis concentrada**: el rojo puede ocupar UN bloque generoso por vista (franja de alerta en Radar, hero "jugada del día"); nunca migajas en badges/iconos/bordes regados. Si el rojo aparece >4 veces por pantalla, refactorizar.
- Gráficos comparativos: **Verisure en `--verisure`; TODOS los competidores en escala de grises de `--ink`** (Prosegur el más oscuro, luego descendiendo). Jamás un color por marca.
- Escala de grises para data: no bajar de `#C9CDD4` sobre blanco para elementos portadores de dato (aprendizaje de iteración 1: Callao/Surco invisibles).
- Colores prohibidos: cualquier hex fuera de esta tabla. Nada de cyan, morado, ni verdes/ámbares alternativos.

## 2. Vocabulario de honestidad de data (semántica visual obligatoria)

| Tratamiento | Significado | Implementación |
|---|---|---|
| **Sólido** | Dato confirmado (ej. pauta operada por Reset) | fill pleno |
| **Rayado 45°** | Dato ESTIMADO (ej. inversión Integrametrics) | repeating-linear-gradient 45°, tinta al 18% sobre el color base de la serie |
| **Punteado** | Sin dato fresco / proyección | contorno dashed, sin fill |

- Toda vista con datos estimados lleva la leyenda: "sólido = confirmado · rayado = estimado (Integrametrics)".
- **Timestamp de frescura por módulo SIEMPRE visible** en el header del módulo (ej. "SIDPOL mensual · BCRP diario · prensa 8:00 a.m."), y honesto: "actualizado hoy 6:00 a.m.", nunca "en tiempo real".
- Rezagos declarados en el punto de lectura (ej. "el dato llega con ~45 días de rezago oficial").

## 3. Tipografía

- **Display y números hero:** Space Grotesk 500/700.
- **Texto/UI:** Instrument Sans 400/500/600.
- **Wordmark THE ALGORITHM:** Brunson Regular como asset local si hay licencia; stand-in oficial: **Anton**. Uso EXCLUSIVO: wordmark del header (+ "by Reset" en Instrument Sans pequeño) y pantalla de carga. Jamás en títulos de sección o cuerpo.
- **Carga de fuentes:** auto-hospedadas en `public/fonts/` (woff2 + `fonts.css` local); prohibidas URLs externas de fuentes en runtime; verificar carga con `document.fonts`.
- **Cifras: `font-variant-numeric: tabular-nums` obligatorio** en todo número, tabla y eje.
- Escala única: 12 / 14 / 16 / 20 / 24 / 32 / 48 / 64px. Display fluido con `clamp()` (ej. hero: `clamp(32px, 5vw, 64px)`). Mínimo absoluto 12px. Prohibidos tamaños arbitrarios.
- Jerarquía por tamaño+peso, no por color. **Los títulos de card afirman el insight** ("Prosegur concentró 46% de la presión de hoy"), nunca nombran el eje ("Inversión por competidor").

## 4. Forma, espacio y elevación

- Radios: cards 20px · elementos internos 12px · pills 999px. Cápsulas (barras píldora) para comparaciones de magnitud.
- Sombra: ninguna o `0 1px 2px rgba(22,24,31,.06)`. Cards SIN borde (la separación es el aire sobre `--base`); borde `--line` solo en tablas internas.
- Grid 12 col, gutter 24px; márgenes 32px desktop / 16px móvil; espaciado en múltiplos de 8.
- **Una card oscura ancla (`--ink`) por vista máximo** — el único momento dramático (Radar: "La jugada del día"; MAIA: el Daily Brief).
- Iconos: lucide, un solo peso, 20/24px, color `--ink`/`--ink-2`. Nada multicolor, nada de emojis como iconos.

## 5. Gráficos (reglas SWD, por tipo)

- Permitidos: barras/cápsulas horizontales con callout pill del valor; líneas/áreas con UNA serie enfatizada y eventos anotados como puntos con etiqueta; slope charts para comparaciones de dos momentos/medidas; gauge sobrio de un solo arco (DIY, Score); tira de puntos para estacionalidad; matriz/coropleta en tintes para mapa.
- Prohibidos: pie/donut de 4+ categorías, dual-axis sin justificación escrita, escalas ocultas o truncadas, 3D, grids pesados (grid horizontal tenue `--line` como máximo), leyendas lejos del dato (etiquetar directo), arcoíris.
- Ejes: baseline en 0 para barras; ejes en `--ink-3`, 12-14px, tabular.
- Tooltips/callouts: pill `--ink` con texto blanco, radio 999px.

## 6. Componentes con identidad

### 6.1 MAIA (Media Analyst IA) — módulo 4
- Nombre en nav y headers: **MAIA**; primera mención con glosa "MAIA — Media Analyst IA de Reset".
- **Carita**: squircle `--ink` con dos ojos ovalados blancos; aura MUY sutil en `--verisure-tint` (único halo del sistema; jamás gradientes multicolor).
- Estados expresivos (CSS): reposo (parpadeo ~6s) · pensando (ojos oscilan) · alerta (aura roja suave un instante).
- Vive SOLO en: avatar del chat, título del módulo, miniatura en franja "Hoy" cuando el brief origina el mensaje.
- Voz: analista sobrio en español; sin emojis, sin "✨", sin sobrepromesas.

### 6.2 Franja "Hoy" (bajo el header)
- Radar: versión completa — tinte `--verisure-tint` + borde izquierdo rojo + texto de la alerta.
- Demás módulos: versión neutra compacta "N alertas hoy →" (link al Radar).
- Sin alertas: neutra y serena ("Sin movimientos relevantes de competencia. SOI estable.").

### 6.3 Opportunity Score
- ÚNICO uso de `--grad-brand` (anillo/arco conic). Número central en tabular. Debajo: IPC e IMC como barras simples con lectura en una frase cada una.

## 7. Estados (diseñados, no improvisados)

- **Cargando:** skeleton shimmer con la forma real del contenido (`linear-gradient(90deg, #F1EDE6 25%, #FAF8F5 37%, #F1EDE6 63%)` animado). Nunca spinner de página.
- **Vacío:** mensaje útil + última detección + próxima corrida ("Sin piezas nuevas hoy · última: martes 8 jul, Prosegur · el monitoreo corre 6:00 a.m.").
- **Fuente caída:** banner honesto por fuente en `--caution` ("Integrametrics sin respuesta desde las 6:00 · mostrando snapshot de ayer · reintento cada 30 min") + las series afectadas pasan a punteado.
- **Foco:** `:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }` en TODO elemento interactivo (tabs, links, inputs, botones). Touch targets ≥44px.
- Prohibidos: indicadores de estado hardcodeados, barras siempre-llenas, latencias artificiales.

## 8. Responsive

- Estrategia primaria: layout intrínseco — `grid-template-columns: repeat(auto-fit, minmax(min(100%, Xpx), 1fr))`; media queries solo donde lo intrínseco no alcanza (nav, tipografía si clamp no basta).
- Verificación obligatoria en 390px y 1440px: cero desbordamiento, cero clipping, wordmark compacto en móvil ("THE ALGORITHM" reducido o monograma "TA_"), tablas → apiladas o scroll-x CON indicador (fade en el borde), jerarquía intacta (alerta → jugada del día → SOI).

## 9. Microcopy

- Español es-PE en todo (miles con punto, decimal con coma: S/ 1.240.500 · 46,0%). Siglas glosadas la primera vez por vista (SOI, EPPM, IPC, IMC, L2B).
- Honestidad de cadencia y de fuente en cada afirmación de dato. Nada de "IA activa", "tiempo real", "optimización automática" si no es literalmente cierto.
- Links: solo los titulares son link (hover consistente); fuente+hora en `--ink-3`.

## 10. Anti-patrones bloqueados (checklist de PR)

Antes de mergear cualquier cambio visual, verificar que NO exista:
[ ] Dark mode por defecto · [ ] fila de KPI cards de colores plenos distintos · [ ] gradientes decorativos fuera de `--grad-brand` · [ ] arcoíris en series · [ ] badges decorativos u honoríficos · [ ] pie 4+ categorías / escala oculta / dual-axis injustificado / 3D · [ ] borde 1px universal + sombra + glow · [ ] tamaños tipográficos fuera de escala o <12px · [ ] copy inflado o spanglish gratuito · [ ] >7 elementos de primer nivel por vista · [ ] pares de contraste <4.5:1 (AA) · [ ] estados falsos o ausentes · [ ] hex fuera de la tabla de tokens · [ ] cifras sin tabular-nums · [ ] elemento interactivo sin :focus-visible.

## 11. Notas de implementación para Claude Code

- Tokens como CSS custom properties en `:root` (o theme de Tailwind mapeado 1:1 a esta tabla con estos NOMBRES — muere el namespace `fitzone-*`).
- Fuentes: auto-hospedadas en `public/fonts/` (woff2 + `fonts.css` local), sin URLs externas en runtime; verificar en el navegador que Space Grotesk/Instrument Sans/Anton cargan con `document.fonts` (bug histórico: Inter declarada y nunca cargada).
- El mockup de referencia es HTML plano; la implementación real es React — replicar fielmente el resultado visual, no el código del mockup.
- Charts: preferir SVG propio o Recharts configurado a estas reglas (sin defaults: grid off/tenue, sin leyenda automática, colores por token).
- Este documento se actualiza por PR; cualquier excepción visual requiere editarlo primero.
