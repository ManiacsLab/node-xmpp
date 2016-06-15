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

  return auth.authenticate(client, creds, client.features);
}

function plugin(client) {
  client.authenticators = [];
}

exports.default = plugin;