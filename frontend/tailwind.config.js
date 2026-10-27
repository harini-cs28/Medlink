/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medlink: {
          bg: '#F7F8F4',
          'bg-secondary': '#EEF3F0',
          white: '#FFFFFF',
          brand: '#087F73',
          'brand-secondary': '#5BAFA3',
          'ai-accent': '#9B8AFB',
          'ai-light': '#EEEAFE',
          text: '#172321',
          'text-secondary': '#667572',
          success: '#3FA66B',
          warning: '#E9A23B',
          'high-risk': '#E56B6F',
        },
        teal: {
          700: '#087F73',
          800: '#06655C',
          900: '#044C45',
        },
        brand: {
          dark: '#172321',
          teal: '#087F73',
          purple: '#9B8AFB',
        },
        navy: {
          800: '#153a5b',
          900: '#123047',
          950: '#0c2030',
        },
        bg: {
          main: '#F7F8F4',
          subtle: '#EEF3F0',
        }
      },
      fontFamily: {
        sans: ['Barlow', 'Inter', 'sans-serif'],
        body: ['Barlow', 'Inter', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        instrument: ['"Instrument Serif"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
