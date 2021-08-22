const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    load: './test/load.faker.test.js',
    scenario: './test/scenario.test.js',
    advanced: './test/advanced.test.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
    filename: '[name].bundle.js',
  },
  module: {
    rules: [{ test: /\.js$/, use: 'babel-loader' }],
  },
  target: 'web',
  externals: /k6(\/.*)?/,
};