# The Algorithm · Verisure Perú

Panel de inteligencia competitiva de The Lab para Verisure Perú, con la data de Integrametrics. Sigue el estándar de la plantilla Reset-The-Algorithm.

- **Cómo se diseña:** sigue `docs/guia-algoritmo.md` (cuatro capas, tarjeta, gráficos, datos honestos). Si algo nuevo la contradice, se actualiza la guía en el mismo cambio.
- **Con qué se construye:** Quincha, en `docs/quincha.md`. La paleta de Verisure vive solo en `src/sistema/tokens.css`. En los gráficos, Verisure va en tinta y Prosegur en gris; el rojo es identidad, nunca dato. Ninguna franja de resalte: el chequeo rechaza bordes de más de 2 px.
- **La marca:** el nombre de Verisure, de Prosegur y del rubro viven solo en `src/cliente.js`; una prueba falla si aparecen escritos en `src/` o `scripts/`. Logo y colores: `docs/marca-verisure.md`.
- **Ninguna cifra se escribe en un componente.** La data sale de `public/data` (la publica el pipeline), se calcula en `src/calculo` y los textos se arman en `src/textos`. Las pantallas (`src/pantallas`) solo pintan.
- **Datos honestos:** se muestra solo lo que tenemos. ATL y digital nunca se suman. Un mes cerrado se compara con el mes anterior entero; el mes en curso, con los mismos días. Un día sin registros es un hueco, no un cero. Las alertas usan umbrales fijos y a la vista.
- **Data del cliente:** Verisure cuida su data. Nada de su Power BI ni de sus plataformas entra al repositorio sin que lo pida The Lab. Ninguna cifra, nombre o captura de otros clientes.
- **Antes de cada commit:** `npm run prueba` y `npm run sistema`. Si cambia `export.csv`, también `npm run medios`.
- **Ramas:** no se pushea a `main`, no se mergea y no se despliega sin permiso explícito.
- **Textos:** en español peruano, observan y no ordenan, dos frases como máximo por lectura, sin rayas largas. Pasan por vickyfy.
