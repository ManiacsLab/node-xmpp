'use strict'

import EventEmitter from 'events'
import {parse} from 'url' // FIXME not browser friendly

export const NS = 'jabber:client'

export default class Client extends EventEmitter {
  constructor (options) {
    super()
    this.plugins = []
    this.transports = []
    this.transport = null
    this.jid = null
    this.uri = ''
    this._domain = ''
    this.options = typeof options === 'object' ? options : {}
  }

  id () {
    return Math.random().toString().split('0.')[1]
  }

  // TODO is this useful?
  promise (event) {
    return new Promise((resolve, reject) => {
      this.once(event, resolve)
    })
  }

  connect (uri) {
    let params
    const Transport = this.transports.find(Transport => {
      return params = Transport.match(uri) // eslint-disable-line no-return-assign
    })

    // FIXME callback?
    if (!Transport) throw new Error('No transport found')

    const transport = this.transport = new Transport()
    ;['stream:features', 'close', 'error'].forEach((e) => {
      transport.on(e, (...args) => this.emit(e, ...args))
    })
    transport.on('element', (element) => this._onelement(element))
    transport.on('close', (element) => this._onclose())

    return transport
      .connect(params)
      .then(() => { this.uri = uri })
  }

  open (params = {}) {
    if (typeof params === 'string') {
      params = {domain: params}
    }

    const domain = params.domain || parse(this.uri).hostname

    return this.transport
      .open(domain)
      .then(features => {
        this._domain = domain
        this.features = features
        this.emit('open', features)
      })
  }

  close () {
    return this.transport.close()
  }

  _onclose () {
    delete this._domain
  }

  _restart (domain = this._domain) {
    return this.transport
      .restart(domain)
  }

  _onelement (element) {
    this.emit('element', element)

    ;['iq', 'message', 'presence'].some(
      n => n === element.name
    )
      ? this.emit('stanza', element)
      : this.emit('nonza', element)
  }

  send (stanza) {
    stanza = stanza.root()

    // FIXME move to WebSocket?
    switch (stanza.name) {
      case 'iq':
      case 'presence':
      case 'message':
        stanza.attrs.xmlns = stanza.attrs.xmlns || NS
    }

    this.transport.send(stanza)
  }

  use (plugin) {
    if (this.plugins.includes(plugin)) return
    this.plugins.push(plugin)
    plugin(this)
  }
}
