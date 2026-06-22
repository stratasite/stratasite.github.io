/** @type {import('tailwindcss').Config} */
const strata = require('./brand/tailwind.brand.js');

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      ...strata,
    },
  },
  plugins: [],
};
