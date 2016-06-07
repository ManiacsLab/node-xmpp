'use strict'

/*
 *  Here Lies Extensible Messaging and Presence Protocol (XMPP) Session
                             Establishment
                     draft-cridland-xmpp-session-01
 *  https://tools.ietf.org/html/draft-cridland-xmpp-session-01
 */

const ltx = require('ltx')

const NS = 'urn:ietf:params:xml:ns:xmpp-session'

function session (cb) {
  return this.request(ltx`
    <iq type='set'>
     <session xmlns='${NS}'/>
   </iq>
  `, cb)
}

module.exports = (client) => {
  client.session = session
}
