const merge = require('webpack-merge');
const common = require('./webpack.common.babel.js');
const pkg = require('./package.json');

const VERSION = pkg.version;

module.exports = env => merge(common, {
  mode: 'development',
  output: {
    filename: `[name]${env.branch !== 'master' ? `-dev-${env.commit_hash}` : `-${VERSION}`}.js`
  }
});
