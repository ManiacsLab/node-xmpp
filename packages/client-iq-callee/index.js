'use strict'

const ltx = require('ltx')

const NS_STANZA = 'urn:ietf:params:xml:ns:xmpp-stanzas'

function addRequestHandler (match, handle) {
  this._iqMatchers.set(match, handle)
}

function handler (stanza) {
  if (
    !stanza.is('iq') ||
    stanza.attrs.id === 'error' ||
    stanza.attrs.id === 'result'
  ) return

  let matched

  const iq = ltx`
    <iq id="${stanza.attrs.id}"/>
  `

  this._iqMatchers.forEach((handler, match) => {
    const matching = match(stanza)
    if (!matching) return
    matched = true
    handler(matching, (err, res) => {
      if (err) {
        stanza.attrs.type = 'error'
        if (ltx.isElement()) {
          iq.cnode(err)
        }
        // else // FIXME
      } else {
        stanza.attrs.type = 'result'
        if (res instanceof ltx.Element) {
          iq.cnode(res)
        }
      }
    })
  })

  if (!matched) {
    iq.attrs.type === 'error'
    iq.cnode(stanza.children[0].clone())
    iq.c('error', {type: 'cancel'})
        .c('service-unavailable', NS_STANZA)
  }

  this.send(iq)
}

module.exports = (client) => {
  client._iqMatchers = new Map()
  client.addRequestHandler = addRequestHandler
  client.on('stanza', handler.bind(client))
}
