module.exports = {
  entry: {
    split: ['./src/umd']
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  output: {
    path: __dirname + '/umd',
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
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', {
              'useBuiltIns': false, // default value: don't add core-js or babel polyfills
              'targets': {
                'ie': '10',
                'node': '6'
              }
            }], '@babel/preset-typescript'],
            plugins: [['@babel/plugin-transform-runtime', {
              // default values
              'absoluteRuntime': false,
              'corejs': false,
              'regenerator': true,
              'useESModules': false,
              'helpers': true,
            }], '@babel/plugin-proposal-class-properties']
          }
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
