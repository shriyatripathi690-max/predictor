/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B18',
          900: '#0B132B',
          850: '#101B3A',
          800: '#172554',
          750: '#1E2F68',
          700: '#2A3C7A',
          600: '#3B519A',
        },
        hazard: {
          low: '#10B981',
          moderate: '#F59E0B',
          high: '#F97316',
          severe: '#EF4444',
        }
      },
    },
  },
  plugins: [],
}

