module.exports = {
  entry: './counter.we?entry',
  output: {
    path: './dist',
    filename: 'counter.js'
  },
  module: {
    loaders: [
      {
        test: /\.we(\?[^?]+)?$/,
        loader: 'weex'
      },
      {
        test: /\.js(\?[^?]+)?$/,
        loader: 'babel'
      }
    ]
  }
}
