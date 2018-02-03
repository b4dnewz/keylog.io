require('dotenv').config();

const path = require('path');
const webpack = require('webpack');

const hostname = process.env.SERVER_URL;
const port = process.env.SERVER_PORT;

// Socket server endpoint
const endpoint = hostname ? `${hostname}:${port}` : ''

module.exports = {
  target: 'web',
  entry: path.resolve(__dirname, 'lib/client.js'),
  output: {
    path: path.resolve(__dirname, 'lib/demo'),
    filename: 'bundle.min.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      SERVER_URL: JSON.stringify(endpoint)
    }),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true
    })
  ]
};
