/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Verisure Brand Colors — Rojo Verisure sobre dark cool
        fitzone: {
          // Primarios — Rojo Verisure
          purple: '#ED002F',        // Rojo Verisure principal (accent)
          darkPurple: '#B30024',    // Rojo Verisure hover (≥4,5:1 sobre blanco)
          lightPurple: '#FF5C7A',   // Rojo claro / tint sobre fondos oscuros

          // Secundarios — Dark cool neutral (security/trust feel)
          charcoal: '#0B0E16',      // Fondo de página
          slate: '#141826',         // Cards
          darkSlate: '#050810',     // Contraste extra

          // Acentos tech/datos
          cyan: '#06B6D4',          // Cyan (datos, tech)
          electric: '#22D3EE',      // Cyan brillante (gráficos)

          // Éxito/Positivo
          emerald: '#10B981',       // Esmeralda (éxito, crecimiento)
          green: '#22C55E',         // Verde (positivo)
          lime: '#84CC16',          // Lima (positivo secundario)

          // Alerta/Advertencia
          red: '#DC2626',           // Rojo alerta semantic (oscuro, distinto del brand #ED002F)
          amber: '#F59E0B',         // Ámbar warning / CTA secundario

          // Alias accent
          orange: '#ED002F',        // Acento CTA secundario (= accent)
          darkOrange: '#B30024',    // Hover acento secundario

          // Neutros
          white: '#FFFFFF',
          lightGray: '#E2E8F0',     // Texto claro sobre dark
          textGray: '#94A3B8',      // Texto muted (≥4,5:1 sobre slate/charcoal)
          mediumGray: '#475569',    // Decorativo
        },
        // Colores oficiales de plataformas — NO modificar
        platform: {
          google:     '#1A73E8',    // Google Trends, Google Search
          tiktok:     '#010101',    // TikTok oficial (negro)
          meta:       '#1877F2',    // Meta / Facebook brand blue
          ga4:        '#E37400',    // Google Analytics 4 oficial
          youtube:    '#FF0000',    // YouTube oficial
          instagram:  '#E4405F',    // Instagram oficial
        },
        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#DC2626',
        info: '#06B6D4',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Inter', 'Helvetica Neue', 'sans-serif'],
      },
      backgroundImage: {
        // Gradientes Verisure
        'gradient-fitzone': 'linear-gradient(135deg, #ED002F 0%, #B30024 100%)',
        'gradient-fitzone-dark': 'linear-gradient(135deg, #141826 0%, #0B0E16 100%)',
        'gradient-fitzone-energy': 'linear-gradient(135deg, #ED002F 0%, #F59E0B 100%)',
        'gradient-fitzone-tech': 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
        'gradient-fitzone-premium': 'linear-gradient(135deg, #0B0E16 0%, #141826 50%, #ED002F 100%)',
        'gradient-hero': 'linear-gradient(180deg, #0B0E16 0%, #141826 100%)',
      },
      boxShadow: {
        'fitzone': '0 20px 50px rgba(237, 0, 47, 0.15)',
        'fitzone-lg': '0 30px 60px rgba(237, 0, 47, 0.25)',
        'fitzone-glow': '0 0 30px rgba(237, 0, 47, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 30px rgba(237, 0, 47, 0.2)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideIn': 'slideIn 0.4s ease-out',
        'slideUp': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(237, 0, 47, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(237, 0, 47, 0.6)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
