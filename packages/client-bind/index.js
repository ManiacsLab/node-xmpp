'use strict'

const debug = require('debug')('xmpp:client:bind')
const ltx = require('ltx')

/*
 * https://xmpp.org/rfcs/rfc6120.html#bind
 */

const NS = 'urn:ietf:params:xml:ns:xmpp-bind'

function bind (resource, cb) {
  if (typeof resource === 'function') {
    cb = resource
    resource = ''
  }

  if (resource) debug(`binding resource "${resource}"`)
  else debug('binding server resource')

  const iq = ltx`
    <iq type='set'>
      <bind xmlns="${NS}"/>
    </iq>
  `
  if (resource) iq.getChild('bind').cnode(ltx`<resource>${resource}</resource>`)

  return this.request(iq, {next: true}, (err, res) => {
    if (err) return cb(err)
    cb(null, res.getChild('jid').text())
    this.emit('online')
  })
}

module.exports = function (client) {
  client.bind = bind
}
