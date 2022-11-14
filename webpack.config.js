const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    first: './test/first.test.js',
    //crypto: './test/crypto.test.js',
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
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'web',
  externals: /k6(\/.*)?/,
  performance : {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};
