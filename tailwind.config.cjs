/** @type {import('tailwindcss').Config} */
const strata = require('./brand/tailwind.brand.js');

module.exports = {
  darkMode: 'class',
  // .mjs covers the remark/rehype plugins, which emit classes like .table-wrap.
  content: ['./src/**/*.{astro,html,js,mjs,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      ...strata,
    },
  },
  plugins: [],
};
