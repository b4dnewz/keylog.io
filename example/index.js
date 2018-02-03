'use strict';

// Require the module
const keyloggerServer = require('../main');

// Start the server
keyloggerServer({
  serveDemo: true,
  serveClient: true
});
