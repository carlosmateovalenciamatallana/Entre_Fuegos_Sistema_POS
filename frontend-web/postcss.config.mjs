/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Cambiamos 'tailwindcss' por el nuevo nombre del paquete
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  },
};

export default config;