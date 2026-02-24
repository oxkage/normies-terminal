/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        normie: {
          bg: '#e3e5e4',
          text: '#48494b',
        },
      },
      fontFamily: {
        terminal: ['"VT323"', 'monospace'],
      },
      animation: {
        'blink-cursor': 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
