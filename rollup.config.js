const buble = require('rollup-plugin-buble')
const version = process.env.VERSION || require('./package.json').version

module.exports = {
  entry: './src/index.js',
  dest: './dist/weex-x.js',
  format: 'cjs',
  moduleName: 'Weex-x',
  plugins: [buble()]
}
