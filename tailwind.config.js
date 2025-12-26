/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          cream: '#FDFBF7',
          gold: '#D4AF37',
          rust: '#C05832',
          black: '#1a2e1a', // Dark Vintage Green/Black
          dark: '#121212',
        }
      },
      fontFamily: {
        'serif-display': ['"DM Serif Display"', 'serif'],
        'sans-body': ['"Work Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

