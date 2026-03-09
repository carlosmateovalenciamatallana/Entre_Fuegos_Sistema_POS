/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // El color naranja característico de Entre Fuegos
        orange: {
          500: '#f97316',
          600: '#ea580c',
        }
      },
    },
  },
  plugins: [],
}