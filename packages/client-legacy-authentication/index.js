'use strict'

/*
 * XEP-0078: Non-SASL Authentication
 * https://xmpp.org/extensions/xep-0078.html
 */

const JID = require('@xmpp/jid')
const ltx = require('ltx')
const debug = require('debug')('xmpp:client:legacy-authentication')

const NS = 'http://jabber.org/features/iq-auth'
const NS_AUTH = 'jabber:iq:auth'

function bind (resource, cb) {
  if (typeof resource === 'function') {
    cb = resource
  }

  // dezalgo...
  // FIXME promise?
  setTimeout(() => {
    const jid = this._legacy_authentication_jid
    delete this._legacy_authentication_jid
    this.jid = jid
    cb(null, jid)
  })
}

function authenticate (client, credentials, features, cb) {
  const resource = credentials.resource || client.id()

  if (debug.enabled) {
    const creds = {}
    const {password} = credentials
    Object.assign(creds, credentials, {resource})
    creds.password = '******'
    debug('using credentials ', creds)
    creds.password = password
  }

  // In XEP-0078, authentication and binding are parts of the same operation
  // so we assign a dumb function that'll simply callback
  client.bind = bind

  // FIXME use JID()?
  const jid = new JID(credentials.username, client._domain, resource)
  client._legacy_authentication_jid = jid

  const iq = ltx`
    <iq type='set'>
      <query xmlns='${NS_AUTH}'>
        <username>${jid.local}</username>
        <password>${credentials.password}</password>
        <resource>${jid.resource}</resource>
      </query>
    </iq>
  `

  return client.request(iq, {next: true}, cb)
}

function match (features) {
  return !!features.getChild('auth', NS)
}

const authenticator = {authenticate, match, name: 'legacy'}

module.exports = function (client) {
  client.authenticators.push(authenticator)
}
