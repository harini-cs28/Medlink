/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        brand: {
          dark: '#172033',
          teal: '#0F9D8A',
          purple: '#8B7CF6',
        },
        navy: {
          800: '#153a5b',
          900: '#123047',
          950: '#0c2030',
        },
        bg: {
          main: '#F7F9F8',
          subtle: '#F1F5F4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        instrument: ['"Instrument Serif"', 'Georgia', 'serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
