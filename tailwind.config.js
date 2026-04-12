/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nobus: {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#1a75ff',
          500: '#0052CC',
          600: '#0047b3',
          700: '#003d99',
          800: '#003380',
          900: '#002966',
          950: '#001a40',
        },
        accent: {
          50: '#e6fcf5',
          100: '#b3f5e0',
          200: '#80eecb',
          300: '#4de7b6',
          400: '#1ae0a1',
          500: '#00C9A7',
          600: '#00b396',
          700: '#009d84',
          800: '#008672',
          900: '#007060',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
