module.exports = {
  entry: {
    'counter': './src/counter/counter.we?entry',
    'counter-hot': './src/counter-hot/counter.we?entry',
    'counter-mutations': './src/counter-mutations/counter.we?entry',
    'chat': './src/chat/chat.we?entry',
    'shopping-cart': './src/shopping-cart/shopping-cart.we?entry'
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
