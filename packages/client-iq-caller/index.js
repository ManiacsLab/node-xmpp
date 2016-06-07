'use strict'

function request (stanza, options, cb = () => {}) {
  if (typeof options === 'function') {
    cb = options
    options = {}
  }

  stanza = stanza.root()
  if (!stanza.attrs.id) this.id()

  // TODO
  if (options.next === true) this._iqNext = true

  this._iqHandlers[stanza.attrs.id] = cb

  this.send(stanza)
}

function onStanza (stanza) {
  const id = stanza.attrs.id
  if (
    !stanza.is('iq') ||
    !id ||
    (stanza.attrs.type !== 'error' && stanza.attrs.type !== 'result')
  ) return

  const handler = this._iqHandlers[id]
  if (!handler) return

  if (stanza.attrs.type === 'error') {
    handler(stanza.getChild('error'))
  } else {
    handler(null, stanza.children[0])
  }

  delete this._iqHandlers[id]
}

module.exports = function (client) {
  client._iqHandlers = Object.create(null)
  client.on('stanza', onStanza.bind(client))
  client.request = request
}
