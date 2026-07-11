/** @type {import('tailwindcss').Config} */
// Tokens mapeados 1:1 a docs/DESIGN (Verisure).md §1.
// Fuente de verdad de los valores: las CSS custom properties en src/index.css :root.
// El namespace de tokens del template anterior fue eliminado (Fase 0).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--base)',
        surface: 'var(--surface)',
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
        },
        line: 'var(--line)',
        wash: 'var(--wash)',
        verisure: {
          DEFAULT: 'var(--verisure)',
          deep: 'var(--verisure-deep)',
          tint: 'var(--verisure-tint)',
        },
        positive: 'var(--positive)',
        caution: 'var(--caution)',
      },
      fontFamily: {
        // Display y números hero
        display: ["'Space Grotesk'", 'system-ui', 'sans-serif'],
        // Texto / UI
        sans: ["'Instrument Sans'", 'system-ui', 'sans-serif'],
        // Wordmark THE ALGORITHM (uso exclusivo: header + carga)
        wordmark: ["'Anton'", 'system-ui', 'sans-serif'],
      },
      // Escala tipográfica única DESIGN §3: 12/14/16/20/24/32/48/64
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '48px',
        '5xl': '64px',
      },
      borderRadius: {
        card: '20px',
        inner: '12px',
        pill: '999px',
      },
      backgroundImage: {
        // ÚNICO gradiente del sistema (Opportunity Score, DESIGN §1/§6.3)
        'grad-brand': 'var(--grad-brand)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,24,31,.06)',
      },
      maxWidth: {
        shell: '1200px',
      },
    },
  },
  plugins: [],
}
