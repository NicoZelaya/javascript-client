module.exports = {
  entry: {
    split: ['./src/umd']
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  output: {
    path: __dirname + '/umd-tsc',
    library: 'splitio',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  devtool: 'none',
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        }
      }
    ]
  },

  node: {
    fs: 'empty',
    module: 'empty',
    console: false
  }
};
