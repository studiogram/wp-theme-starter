/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.{twig,php}'],
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
