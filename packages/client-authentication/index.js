'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authenticate = authenticate;
exports.plugin = plugin;
function authenticate(client, creds) {
  var auth = client.authenticators.find(function (auth) {
    return auth.match(client.features);
  });

  if (!auth) return Promise.reject(new Error('no compatible authentication'));

  return new Promise(function (resolve, reject) {
    auth.authenticate(client, creds, client.features, function (err) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (err) reject(err);else resolve.apply(undefined, args);
    });
  });
}

function plugin(client) {
  client.authenticators = [];
}

exports.default = plugin;