// run @babel/register but configured to transpile typescript files from `@splitsoftware/js-commons/src`
// https://babeljs.io/docs/en/babel-register
require('@babel/register')({
  extensions: ['.js', '.ts'], // `babel` doesn't consider .ts files by default
  ignore: [/node_modules[/](?!@splitsoftware)/], // `@babel/register` ignores node_modules by default
});