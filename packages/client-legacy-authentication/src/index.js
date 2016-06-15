/*
 * XEP-0078: Non-SASL Authentication
 * https://xmpp.org/extensions/xep-0078.html
 */

import JID from '@xmpp/jid'

export const NS = 'http://jabber.org/features/iq-auth'
export const NS_AUTH = 'jabber:iq:auth'

function bind () {
  const jid = this._legacy_authentication_jid
  delete this._legacy_authentication_jid
  this.jid = jid // TODO probably not here...
  return Promise.resolve(jid)
}

export function authenticate (client, credentials, features) {
  const resource = credentials.resource || client.id()

  // In XEP-0078, authentication and binding are parts of the same operation
  // so we assign a dumb function
  client.bind = bind

  const jid = new JID(credentials.username, client.domain, resource)
  client._legacy_authentication_jid = jid

  const stanza = (
    <iq type='set'>
      <query xmlns={NS_AUTH}>
        <username>{jid.local}</username>
        <password>{credentials.password}</password>
        <resource>{jid.resource}</resource>
      </query>
    </iq>
  )

  return client.request(stanza, {next: true})
}

export function match (features) {
  return !!features.getChild('auth', NS)
}

export const authenticator = {authenticate, match, name: 'legacy'}

export function plugin (client) {
  client.authenticators.push(authenticator)
}

export default plugin
