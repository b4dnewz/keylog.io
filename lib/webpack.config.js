const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'web',
  entry: path.resolve(__dirname, 'client.js'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.min.js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      comments: false,
      beautify: false
    })
  ]
};
