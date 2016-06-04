'use strict'

const ltx = require('ltx')
const debug = require('debug')('xmpp:client:legacy-authentication')

const NS = 'http://jabber.org/features/iq-auth'
const NS_AUTH = 'jabber:iq:auth'

// https://xmpp.org/extensions/xep-0078.html

function authenticate (client, creds, features, cb) {
  const resource = creds.resource || client.id()

  debug(`using resource "${resource}"`)

  return client.request(ltx`
    <iq type='set'>
      <query xmlns='${NS_AUTH}'>
      <username>${creds.username}</username>
      <password>${creds.password}</password>
      <resource>${resource}</resource>
      </query>
    </iq>
  `, {next: true, cb})
}

function match (features) {
  return !!features.getChild('auth', NS)
}

const authenticator = {authenticate, match, name: 'legacy'}

module.exports = function (client) {
  client.authenticators.push(authenticator)
}
