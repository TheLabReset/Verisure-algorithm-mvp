// Lector de tokens.css, puro: lo usan el chequeo (npm run sistema) y la guía viva, así los dos leen lo mismo.
export const quitarComentarios = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// Bloques del archivo de tokens: el :root base y el otro tema, por preferencia del sistema y por botón.
// Sirve en las dos direcciones: base clara con oscuro alterno, o base oscura con claro alterno.
export function bloquesDeTokens(css) {
  const limpio = quitarComentarios(css);
  const definiciones = (texto) => Object.fromEntries([...texto.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const raiz = limpio.match(/^:root\s*\{([\s\S]*?)\n\}/m);
  const media = limpio.match(/@media \(prefers-color-scheme: (dark|light)\)\s*\{\s*:root:not\(\[data-theme="(?:light|dark)"\]\)\s*\{([\s\S]*?)\}\s*\}/);
  const alterno = media?.[1] === 'light' ? 'claro' : 'oscuro';
  const boton = limpio.match(new RegExp(`:root\\[data-theme="${media?.[1] || 'dark'}"\\]\\s*\\{([\\s\\S]*?)\\}`));
  return {
    base: definiciones(raiz?.[1] || ''), altMedia: definiciones(media?.[2] || ''), altBoton: definiciones(boton?.[1] || ''), todas: definiciones(limpio),
    temaBase: alterno === 'claro' ? 'oscuro' : 'claro', temaAlterno: alterno,
  };
}

function hexARgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}
const luminancia = (hex) => { const [r, g, b] = hexARgb(hex).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contraste = (a, b) => { const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// Distancia entre dos colores en OKLab (×100), con visión normal y la peor de las tres de daltonismo (protanopía,
// deuteranopía y tritanopía, matrices de Machado 2009 con severidad 1). La usa el chequeo de los colores de marca
const MACHADO = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};
const lineal = (hex) => hexARgb(hex).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
function haciaOklab([r, g, b]) {
  const [l, m, s] = [0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b, 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b, 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b].map(Math.cbrt);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
const simular = (rgb, M) => M.map((f) => Math.min(1, Math.max(0, f[0] * rgb[0] + f[1] * rgb[1] + f[2] * rgb[2])));
const lejos = (a, b) => 100 * Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export function distanciaColor(a, b) {
  const x = lineal(a), y = lineal(b);
  return { normal: lejos(haciaOklab(x), haciaOklab(y)), daltonismo: Math.min(...Object.values(MACHADO).map((M) => lejos(haciaOklab(simular(x, M)), haciaOklab(simular(y, M))))) };
}


// Valor final de un token en un tema: sigue las referencias var() hasta un color
export function resolver(base, tema, k) {
  let v = tema[k] ?? base[k];
  for (let i = 0; i < 4 && v && v.startsWith('var('); i++) { const r = v.match(/var\(--([\w-]+)\)/)[1]; v = tema[r] ?? base[r]; }
  return v;
}

// Comentario de una línea junto a la definición: es la documentación del token
export function comentarios(css) {
  return Object.fromEntries([...css.matchAll(/--([\w-]+)\s*:[^;]+;\s*\/\*\s*([^*]+?)\s*\*\//g)].map((m) => [m[1], m[2]]));
}
