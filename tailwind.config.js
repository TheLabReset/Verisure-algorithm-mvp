/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Powerpay Brand Colors - Morado (BNPL fintech)
        fitzone: {
          // Primarios - Morado Powerpay
          purple: '#7B2CBF',        // Morado oficial Powerpay
          darkPurple: '#5A1F8E',    // Morado hover/oscuro
          lightPurple: '#9D4FD9',   // Morado claro (acentos sobre dark)

          // Secundarios - Oscuros warm con tinte morado
          charcoal: '#0F0719',      // Fondo de página (deep warm)
          slate: '#1A0F26',         // Cards
          darkSlate: '#0A0411',     // Contraste extra

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

          // Secundario CTA (ámbar warm Powerpay)
          orange: '#F4B842',        // Acento CTA secundario
          darkOrange: '#D89B1F',    // Hover acento secundario

          // Neutros
          white: '#FFFFFF',
          lightGray: '#F5F0FA',     // Texto claro warm sobre dark
          textGray: '#B8A8C7',      // Texto muted sobre dark
          mediumGray: '#6B5973',    // Decorativo
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
        // Gradientes Powerpay Morado
        'gradient-fitzone': 'linear-gradient(135deg, #7B2CBF 0%, #5A1F8E 100%)',
        'gradient-fitzone-dark': 'linear-gradient(135deg, #1A0F26 0%, #0F0719 100%)',
        'gradient-fitzone-energy': 'linear-gradient(135deg, #7B2CBF 0%, #F4B842 100%)',
        'gradient-fitzone-tech': 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
        'gradient-fitzone-premium': 'linear-gradient(135deg, #0F0719 0%, #1A0F26 50%, #7B2CBF 100%)',
        'gradient-hero': 'linear-gradient(180deg, #0F0719 0%, #1A0F26 100%)',
      },
      boxShadow: {
        'fitzone': '0 20px 50px rgba(123, 44, 191, 0.15)',
        'fitzone-lg': '0 30px 60px rgba(123, 44, 191, 0.25)',
        'fitzone-glow': '0 0 30px rgba(123, 44, 191, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 30px rgba(123, 44, 191, 0.2)',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(123, 44, 191, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(123, 44, 191, 0.6)' },
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
