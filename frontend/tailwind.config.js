/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blackGray: '#0F0F0F',
        darkGray: '#1B1B1B',
        lightGray: '#504E4E',
        backgroundGray: '#232323'
      },
    },
  },
  plugins: [],
}

