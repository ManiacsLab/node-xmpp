'use strict'

const debug = require('debug')('xmpp:client:authentication')

function authenticate (creds, cb) {
  const auth = this.authenticators.find(auth => auth.match(this.features))

  if (!auth) {
    const msg = 'no compatible authentication'
    debug(msg)
    setTimeout(() => { cb(new Error(msg)) })
    return
  }

  debug(`using "${auth.name}" authentication`)

  auth.authenticate(this, creds, this.features, cb)
}

module.exports = function (client) {
  client.authenticators = []
  client.authenticate = authenticate
}
