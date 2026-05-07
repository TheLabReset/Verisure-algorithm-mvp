/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WIN Brand Colors - Naranja (telco fibra óptica)
        fitzone: {
          // Primarios - Naranja WIN
          purple: '#F26A1F',        // Naranja oficial WIN
          darkPurple: '#C44E0E',    // Naranja hover/oscuro (≥4,5:1 sobre blanco)
          lightPurple: '#FF8A4D',   // Naranja claro (acentos sobre dark)

          // Secundarios - Oscuros warm con tinte naranja
          charcoal: '#0F0810',      // Fondo de página (deep warm)
          slate: '#1F0F0A',         // Cards
          darkSlate: '#0A0506',     // Contraste extra

          // Acentos tech/datos
          cyan: '#06B6D4',          // Cyan (datos, tech)
          electric: '#22D3EE',      // Cyan brillante (gráficos)

          // Éxito/Positivo
          emerald: '#10B981',       // Esmeralda (éxito, crecimiento)
          green: '#22C55E',         // Verde (positivo)
          lime: '#84CC16',          // Lima (positivo secundario)

          // Alerta/Advertencia
          red: '#EF4444',           // Rojo (alerta)
          amber: '#F4B842',         // Ámbar warm (advertencia / CTA secundario)

          // Secundario CTA (alias del accent naranja)
          orange: '#F26A1F',        // Acento CTA secundario (= accent)
          darkOrange: '#C44E0E',    // Hover acento secundario

          // Neutros
          white: '#FFFFFF',
          lightGray: '#FAF0EA',     // Texto claro warm sobre dark
          textGray: '#C7B5A8',      // Texto muted sobre dark
          mediumGray: '#73655A',    // Decorativo
        },
        // Semantic colors
        success: '#10B981',
        warning: '#F4B842',
        error: '#EF4444',
        info: '#06B6D4',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Inter', 'Helvetica Neue', 'sans-serif'],
      },
      backgroundImage: {
        // Gradientes WIN Naranja
        'gradient-fitzone': 'linear-gradient(135deg, #F26A1F 0%, #C44E0E 100%)',
        'gradient-fitzone-dark': 'linear-gradient(135deg, #1F0F0A 0%, #0F0810 100%)',
        'gradient-fitzone-energy': 'linear-gradient(135deg, #F26A1F 0%, #F4B842 100%)',
        'gradient-fitzone-tech': 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
        'gradient-fitzone-premium': 'linear-gradient(135deg, #0F0810 0%, #1F0F0A 50%, #F26A1F 100%)',
        'gradient-hero': 'linear-gradient(180deg, #0F0810 0%, #1F0F0A 100%)',
      },
      boxShadow: {
        'fitzone': '0 20px 50px rgba(242, 106, 31, 0.15)',
        'fitzone-lg': '0 30px 60px rgba(242, 106, 31, 0.25)',
        'fitzone-glow': '0 0 30px rgba(242, 106, 31, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 30px rgba(242, 106, 31, 0.2)',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(242, 106, 31, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(242, 106, 31, 0.6)' },
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
