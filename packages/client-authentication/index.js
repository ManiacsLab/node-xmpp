'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authenticate = authenticate;
exports.clientAuthenticate = clientAuthenticate;
exports.plugin = plugin;
function authenticate(client, creds, cb) {
  var auth = client.authenticators.find(function (auth) {
    return auth.match(client.features);
  });

  if (!auth) {
    // dezalgo... TODO use process.nextTick/setImmediate/Promise.resolve/... when available
    setTimeout(function () {
      cb(new Error('no compatible authentication'));
    });
    return;
  }

  auth.authenticate(client, creds, client.features, cb);
}

function clientAuthenticate() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  authenticate.apply(undefined, [this].concat(args));
}

function plugin(client) {
  client.authenticators = [];
  client.authenticate = clientAuthenticate;
}