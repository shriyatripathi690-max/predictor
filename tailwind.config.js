/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        charcoal: {
          950: '#0c0e14', // Ultra-deep dark canvas background matching reference map
          900: '#12151e', // Navigation & sidebar background
          850: '#171a24', // Card & panel surface
          800: '#1f2330', // Elevated panel / card hover
          750: '#282d3e', // Subtle borders
          700: '#343b50', // High contrast borders / dividers
          600: '#4b5472', // Muted icon stroke
        },
        navy: {
          950: '#0c0e14',
          900: '#12151e',
          850: '#171a24',
          800: '#1f2330',
          750: '#282d3e',
          700: '#343b50',
          600: '#4b5472',
        },
        brand: {
          orange: '#ff6a00',
          orangeLight: '#ff8833',
          amber: '#ff9800',
          amberLight: '#ffb338',
          red: '#ef4444',
          darkOrange: '#cc4e00',
        },
        hazard: {
          low: '#10b981',
          moderate: '#ff9800',
          high: '#ff6a00',
          severe: '#ef4444',
        }
      },
      boxShadow: {
        'glow-orange': '0 0 30px -5px rgba(255, 106, 0, 0.35)',
        'glow-amber': '0 0 30px -5px rgba(255, 152, 0, 0.35)',
        'glow-red': '0 0 30px -5px rgba(239, 68, 68, 0.4)',
        'card-dark': '0 12px 35px -8px rgba(0, 0, 0, 0.65)',
      },
    },
  },
  plugins: [],
}

