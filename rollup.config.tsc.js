import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
// import typescript from '@rollup/plugin-typescript';
// import typescript2 from 'rollup-plugin-typescript2';
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
  ts({
    typescript: require('typescript'),
    tsconfig: './tsconfig.json'
  }),
  nodePolyfills()

  /**
   * Couldn't solve errors when using '@rollup/plugin-typescript' and 'rollup-plugin-typescript2'
   */
  // typescript2({
  //   typescript: require('typescript'),
  //   tsconfig: './tsconfig.json',
  //   /* verbosity: 3, */
  // }),
  // typescript({
  //   tsconfig: './tsconfig.json',
  //   // allowJs: true,
  //   // rootDir: 'src',
  //   exclude: [/node_modules[/](?!@splitsoftware)/]
  // }),
];

const createRollupConfig = (input, outputPrefix) => ({
  input,
  output: [{
    format: 'umd', // `umd` works as `cjs`, `iife` and `amd` all in one
    name: 'splitio',  // umd format requires a name
    file: `umd-rollup-tsc/${outputPrefix}-${VERSION}.js`,
  }, {
    format: 'umd', // `umd` works as `cjs`, `iife` and `amd` all in one
    name: 'splitio',  // umd format requires a name
    file: `umd-rollup-tsc/${outputPrefix}-${VERSION}.min.js`,
    // Including sourcemap to use the rollup vizualizer over the minified bundle
    sourcemap: true,
    plugins: [
      terser(),
      visualizer({
        filename: `stats/rollup-tsc-${outputPrefix}-${VERSION}.min.html`,
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