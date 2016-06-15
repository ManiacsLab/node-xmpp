/*
 * References
 * https://xmpp.org/rfcs/rfc6120.html#bind
 */

import JID from '@xmpp/jid'
import {request} from '@xmpp/client-iq-caller'

export const NS = 'urn:ietf:params:xml:ns:xmpp-bind'

export function stanza (resource) {
  return (
    <iq type='set'>
      <bind xmlns={NS}>{
      resource
      ? <resource>{resource}</resource>
      : null
      }
      </bind>
    </iq>
  )
}

export function hasSupport (features) {
  return features.getChild('bind', NS)
}

export function bind (client, resource) {
  return request(client, stanza(resource), {next: true})
    .then(result => {
      const jid = new JID(result.getChild('jid').text())
      client.jid = jid
      client.emit('online')
      return jid
    })
}

export function clientBind (...args) {
  bind(this, ...args)
}

export function plugin (client) {
  client.bind = clientBind
}

export default plugin
