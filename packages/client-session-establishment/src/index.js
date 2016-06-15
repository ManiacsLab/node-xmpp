/*
 *  Here Lies Extensible Messaging and Presence Protocol (XMPP) Session
                             Establishment
                     draft-cridland-xmpp-session-01
 *  https://tools.ietf.org/html/draft-cridland-xmpp-session-01
 */

import {request} from '@xmpp/client-iq-caller'
import {register} from '@xmpp/client-stream-features'

export const name = 'session-establisment'

export const NS = 'urn:ietf:params:xml:ns:xmpp-session'

export function isSupported (features) {
  return features.getChild('session', NS)
}

export function isOptional (el) {
  return el.getChild('optional')
}

export function establishSession (client, cb) {
  const stanza = (
    <iq type='set'>
      <session xmlns={NS}/>
    </iq>
  )
  return request(client, stanza, cb)
}

export function plugin (client) {
  // TODO priority, order? this is to be done after resource binding
  register(client, (features, done) => {
    const support = isSupported(features)
    if (!support || isOptional(support)) {
      return done()
    }

    establishSession(client, done)
  })
}
