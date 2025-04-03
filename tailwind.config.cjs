/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#473e36',
        'page-bg': '#efefef',
        'card-bg': '#dddddd',
      },
    },
    screens: {
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1400px',
    },
  },
  plugins: [],
}
