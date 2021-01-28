module.exports = {
  entry: {
    split: ['./src/umd'],
    'split-min-online': ['./src/umdMinimalOnline'],
    'split-min-offline': ['./src/umdMinimalOffline'],
    'split-min': ['./src/umdMinimal'],
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  output: {
    path: __dirname + '/umd-webpack-tsc',
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
