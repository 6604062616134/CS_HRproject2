/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // <== สำคัญมาก
  ],
  theme: {
    extend: {
      fontFamily: {
        sarabun: ['Sarabun', 'sans-serif'],
      },
    },
  },
  plugins: [],
  safelist: [
    'col-index',
    'col-id',
    'col-name',
    'col-thesis',
    'col-chairman',
    'col-director',
    'col-main-mentor',
    'col-co-mentor',
    'col-year',
    'col-room',
    'col-grade',
    'col-note',
  ],

}
