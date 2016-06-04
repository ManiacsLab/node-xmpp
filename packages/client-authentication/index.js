'use strict'

const debug = require('debug')('xmpp:client:authentication')

function authenticate (creds, cb) {
  const auth = this.authenticators.find(auth => auth.match(this.features))
  // FIXME cb error?
  if (!auth) throw new Error('No authentication found')
  debug(`using "${auth.name}" authentication`)

  auth.authenticate(this, creds, this.features, cb)
}

module.exports = function (client) {
  client.authenticators = []
  client.authenticate = authenticate
}
