'use strict';

// Require the module
const keyloggerServer = require('../main');

// Start the server
keyloggerServer({
  open: true,
  serveDemo: true,
  serveClient: true
});
