/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.twig'],
  theme: {
    extend: {
      extend: {
        colors: {
          blue: '#232c40',
        },
      },
    },
  },
  plugins: [],
};
