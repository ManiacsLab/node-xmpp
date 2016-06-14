/*
 * References
 * XEP-0156: Discovering Alternative XMPP Connection Methods
 *   https://xmpp.org/extensions/xep-0156.html
 * RFC 6415: Web Host Metadata
 *   https://tools.ietf.org/html/rfc6415
 *
 * https://github.com/xsf/xeps/pull/198
 */

import parse from '@xmpp/xml'
import http from '@xmpp/client-http'

export const NS_XRD = 'http://docs.oasis-open.org/ns/xri/xrd-1.0'
export const REL_BOSH = 'urn:xmpp:alt-connections:xbosh'
export const REL_WS = 'urn:xmpp:alt-connections:websocket'
export const HOST_META = '/.well-known/host-meta'

export function getAltnernativeConnectionsMethods (domain, secure, cb) {
  http(`http${secure ? 's' : ''}://${domain}${HOST_META}`, {
    headers: {
      accept: 'application/xrd+xml'
    }
  }, (err, response) => {
    if (err) return cb(err)
    response.text().then(text => {
      let doc
      try {
        doc = parse(text)
      } catch (e) {
        cb(new Error('invalid XRD document'))
      }

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

export default getAltnernativeConnectionsMethods
