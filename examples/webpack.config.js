module.exports = {
  entry: {
    'counter': './src/counter/counter.we?entry',
    'counter-hot': './src/counter-hot/counter.we?entry'
  },
  output: {
    path: './dist',
    filename: '[name].js'
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
