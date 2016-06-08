'use strict'

/*
 * References
 * XEP-0156: Discovering Alternative XMPP Connection Methods
 *   https://xmpp.org/extensions/xep-0156.html
 * RFC 6415: Web Host Metadata
 *   https://tools.ietf.org/html/rfc6415
 *
 * https://github.com/xsf/xeps/pull/198
 */

const xml = require('@xmpp/xml')

const NS_XRD = 'http://docs.oasis-open.org/ns/xri/xrd-1.0'
const REL_BOSH = 'urn:xmpp:alt-connections:xbosh'
const REL_WS = 'urn:xmpp:alt-connections:websocket'
const HOST_META = '/.well-known/host-meta'

// fetch = foo.http

// fetch('http')

function getAltnernativeConnectionsMethods (domain, cb) {
  this.http('http://' + domain + HOST_META, {
    headers: {
      accept: 'application/xrd+xml'
    }
  }, (err, response) => {
    if (err) return cb(err)
    response.text().then(text => {
      console.log(text)
      const doc = xml(text)
      if (!doc.is('XRD', NS_XRD)) {
        cb(new Error('invalid XRD document'))
        return
      }

      const bosh = []
      const websocket = []

      doc.getChildren('Link').forEach(link => {
        const {rel, href} = link.attrs
        if (rel === REL_BOSH) bosh.push(href)
        else if (rel === REL_WS) websocket.push(href)
      })

      cb(null, {bosh, websocket})
    })
  })
}

module.exports = function (client) {
  client.getAltnernativeConnectionsMethods = getAltnernativeConnectionsMethods
}
