'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NS = undefined;
exports.stanza = stanza;
exports.hasSupport = hasSupport;
exports.bind = bind;
exports.clientBind = clientBind;
exports.plugin = plugin;

var _xml = require('@xmpp/xml');

var _xml2 = _interopRequireDefault(_xml);

var _jid = require('@xmpp/jid');

var _jid2 = _interopRequireDefault(_jid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * References
 * https://xmpp.org/rfcs/rfc6120.html#bind
 */

var NS = exports.NS = 'urn:ietf:params:xml:ns:xmpp-bind';

function stanza(resource) {
  return _xml2.default.createElement(
    'iq',
    { type: 'set' },
    _xml2.default.createElement(
      'bind',
      { xmlns: NS },
      resource ? _xml2.default.createElement(
        'resource',
        null,
        resource
      ) : null
    )
  );
}

function hasSupport(features) {
  return features.getChild('bind', NS);
}

function bind(client, resource, cb) {
  if (typeof resource === 'function') {
    cb = resource;
    resource = '';
  }

  return client.request(stanza(resource), { next: true }, function (err, res) {
    if (err) return cb(err);
    var jid = new _jid2.default(res.getChild('jid').text());
    client.jid = jid;
    cb(null, jid);
    client.emit('online');
  });
}

function clientBind() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  bind.apply(undefined, [this].concat(args));
}

function plugin(client) {
  client.bind = clientBind;
}