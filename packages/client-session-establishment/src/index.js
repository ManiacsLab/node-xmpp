/*
 *  Here Lies Extensible Messaging and Presence Protocol (XMPP) Session
                             Establishment
                     draft-cridland-xmpp-session-01
 *  https://tools.ietf.org/html/draft-cridland-xmpp-session-01
 */

export const name = 'session-establisment'

export const NS = 'urn:ietf:params:xml:ns:xmpp-session'

export function establishSession (client, cb) {
  const stanza = (
    <iq type='set'>
      <session xmlns={NS} />
    </iq>
  )
  return client.request(stanza, cb)
}

export function clientEstablishSession (...args) {
  establishSession(this, ...args)
}

export function plugin (client) {
  client.establishSession = clientEstablishSession
}

export default plugin
