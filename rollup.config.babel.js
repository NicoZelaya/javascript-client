import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
// import babel from '@rollup/plugin-babel';
import ts from '@wessberg/rollup-plugin-ts';
import { terser } from 'rollup-plugin-terser';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import pkg from './package.json';
import visualizer from 'rollup-plugin-visualizer';

const VERSION = pkg.version;

const extensions = [
  '.mjs', '.js', '.json', '.node', '.ts'
];

const plugins = [

  nodeResolve({
    extensions,
    browser: true,
    preferBuiltins: false,
  }),
  commonjs(),
  json(),
  // It works fine when linking @splitsoftware/js-commons package
  // ? Not working with file import (i.e. "@splitsoftware/js-commons": "file:../js-commons")
  ts({
    transpiler: 'babel',
    typescript: require('typescript'),
    babelConfig: './babel.config.js',
  }),
  nodePolyfills()

  /**
   * Couldn't fix errors when using '@rollup/plugin-babel'
   */
  // babel({
  //   extensions,
  //   babelHelpers: 'runtime',
  //   include: ['src/**/*', 'node_modules/**/*'],
  //   // exclude: /node_modules[/](?!@splitsoftware)/,
  // }),
];

const createRollupConfig = (input, outputPrefix) => ({
  input,
  output: [{
    format: 'umd', // `umd` works as `cjs`, `iife` and `amd` all in one
    name: 'splitio',  // umd format requires a name
    file: `umd-rollup-babel/${outputPrefix}-${VERSION}.js`,
  }, {
    format: 'umd', // `umd` works as `cjs`, `iife` and `amd` all in one
    name: 'splitio',  // umd format requires a name
    file: `umd-rollup-babel/${outputPrefix}-${VERSION}.min.js`,
    // Including sourcemap to use the rollup vizualizer over the minified bundle
    sourcemap: true,
    plugins: [
      terser(),
      visualizer({
        filename: `stats/rollup-babel-${outputPrefix}-${VERSION}.min.html`,
        sourcemap: true
      })
    ]
  }],
  plugins
});

export default [
  createRollupConfig('src/umd.js', 'split'),
  createRollupConfig('src/umdMinimalOnline.js', 'split-min-online'),
  createRollupConfig('src/umdMinimalOffline.js', 'split-min-offline'),
  createRollupConfig('src/umdMinimal.js', 'split-min')
];