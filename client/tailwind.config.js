module.exports = {
  purge: [
    './public/**/*.html',
    './src/**/*.js',
    './src/**/*.html'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    minHeight: {
      '300': '300px'
    },
    extend: {},
  },
  variants: {
    extend: {
      opacity: ['disabled']
    },
  },
  plugins: [],
}
