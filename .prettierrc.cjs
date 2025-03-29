const baseConfig = require('eslint-config-mantine/.prettierrc.js');

/** @type {import('prettier').Options} */
module.exports = {
  ...baseConfig,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid',
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.cjs',
}
