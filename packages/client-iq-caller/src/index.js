'use strict'

export function request (client, stanza, options, cb = () => {}) {
  if (typeof options === 'function') {
    cb = options
    options = {}
  }

  stanza = stanza.root()
  if (!stanza.attrs.id) stanza.attrs.id = client.id()

  // TODO
  if (options.next === true) client._iqNext = true

  client._iqHandlers[stanza.attrs.id] = cb

  client.send(stanza)
}

export function stanzaHandler (stanza) {
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

export function clientRequest (...args) {
  request(this, ...args)
}

export function plugin (client) {
  client._iqHandlers = Object.create(null)
  client.on('stanza', stanzaHandler.bind(client))
  client.request = clientRequest
}
