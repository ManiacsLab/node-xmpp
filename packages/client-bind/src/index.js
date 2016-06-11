import JID from '@xmpp/jid'

/*
 * References
 * https://xmpp.org/rfcs/rfc6120.html#bind
 */

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

export function bind (client, resource, cb) {
  if (typeof resource === 'function') {
    cb = resource
    resource = ''
  }

  return client.request(stanza(resource), {next: true}, (err, res) => {
    if (err) return cb(err)
    const jid = new JID(res.getChild('jid').text())
    client.jid = jid
    cb(null, jid)
    client.emit('online')
  })
}

export function clientBind (...args) {
  bind(this, ...args)
}

export function plugin (client) {
  client.bind = clientBind
}

export default plugin
