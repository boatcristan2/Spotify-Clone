/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1db954',
        'spotify-black': '#191414',
        'spotify-gray': '#282828',
      }
    },
  },
  plugins: [],
}