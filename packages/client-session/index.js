'use strict'

// https://tools.ietf.org/html/draft-cridland-xmpp-session-01

const ltx = require('ltx')
const iq = require('@xmpp/client-iq')

const NS = 'urn:ietf:params:xml:ns:xmpp-session'

function session (cb) {
  return this.request(ltx`
    <iq type='set'>
     <session xmlns='${NS}'/>
   </iq>
  `, cb)
}

module.exports = (client) => {
  client.use(iq)
  client.session = session
}
