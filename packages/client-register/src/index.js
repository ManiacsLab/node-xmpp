'use strict'

const ltx = require('ltx')

/* References
 *  - In-Band Registration https://xmpp.org/extensions/xep-0077.html
 *  - prosody mod_register https://prosody.im/doc/modules/mod_register
 */
function register (creds, cb) {
  const iq = ltx`
    <iq type='set'>
      <query xmlns='jabber:iq:register'>
        <username>${creds.username}</username>
        <password>${creds.password}</password>
      </query>
    </iq>
  `

  return this.request(iq, cb)
}

register.supported = function (element) {
  if (element.is('stream:features')) {
    return !!element.getChild('register', 'http://jabber.org/features/iq-register')
  }

  const query = element.getChild('query', 'http://jabber.org/protocol/disco#info')
  return element.is('iq') && query && query.getChild('register', 'jabber:iq:register')
}

module.exports = (client) => {
  client.register = register
}
