/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Matched to the Nobus cloud console: bright blue actions on white,
        // very dark navy sidebar/nav surfaces.
        nobus: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#b9d1ff',
          300: '#8ab0ff',
          400: '#5a8bff',
          500: '#2e6bff',
          600: '#1d54e8',
          700: '#1743c4',
          800: '#16389b',
          900: '#13245c',
          950: '#0a1229',
        },
        accent: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b9dfff',
          300: '#7cc4ff',
          400: '#36a6ff',
          500: '#0c8ce9',
          600: '#006dc7',
          700: '#0157a1',
          800: '#064a85',
          900: '#0b3e6e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
