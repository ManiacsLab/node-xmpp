'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HOST_META = exports.REL_WS = exports.REL_BOSH = exports.NS_XRD = undefined;
exports.getAltnernativeConnectionsMethods = getAltnernativeConnectionsMethods;
exports.plugin = plugin;

var _xml = require('@xmpp/xml');

var _xml2 = _interopRequireDefault(_xml);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NS_XRD = exports.NS_XRD = 'http://docs.oasis-open.org/ns/xri/xrd-1.0'; /*
                                                                            * References
                                                                            * XEP-0156: Discovering Alternative XMPP Connection Methods
                                                                            *   https://xmpp.org/extensions/xep-0156.html
                                                                            * RFC 6415: Web Host Metadata
                                                                            *   https://tools.ietf.org/html/rfc6415
                                                                            *
                                                                            * https://github.com/xsf/xeps/pull/198
                                                                            */

var REL_BOSH = exports.REL_BOSH = 'urn:xmpp:alt-connections:xbosh';
var REL_WS = exports.REL_WS = 'urn:xmpp:alt-connections:websocket';
var HOST_META = exports.HOST_META = '/.well-known/host-meta';

function getAltnernativeConnectionsMethods(domain, cb) {
  this.http('http://' + domain + HOST_META, {
    headers: {
      accept: 'application/xrd+xml'
    }
  }, function (err, response) {
    if (err) return cb(err);
    response.text().then(function (text) {
      var doc = void 0;
      try {
        doc = (0, _xml2.default)(text);
      } catch (e) {
        cb(new Error('invalid XRD document'));
      }

      if (!doc.is('XRD', NS_XRD)) {
        cb(new Error('invalid XRD document'));
        return;
      }

      var bosh = [];
      var websocket = [];

      doc.getChildren('Link').forEach(function (link) {
        var _link$attrs = link.attrs;
        var rel = _link$attrs.rel;
        var href = _link$attrs.href;

        if (rel === REL_BOSH) bosh.push(href);else if (rel === REL_WS) websocket.push(href);
      });

      cb(null, { bosh: bosh, websocket: websocket });
    });
  });
}

function plugin(client) {
  client.getAltnernativeConnectionsMethods = getAltnernativeConnectionsMethods;
}

exports.default = plugin;