'use strict'

const EventEmitter = require('events')
const {parse} = require('url') // FIXME not browser friendly
const debug = require('debug')('xmpp:client')

const NS_CLIENT = 'jabber:client'

class Client extends EventEmitter {
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

  connect (uri, cb = () => {}) {
    let params
    const Transport = this.transports.find(Transport => {
      return params = Transport.match(uri) // eslint-disable-line no-return-assign
    })

    // FIXME callback?
    if (!Transport) throw new Error('No transport found')

    debug('using', Transport.name, 'transport with', params)

    const transport = this.transport = new Transport()
    ;['stream:features', 'close', 'error'].forEach((e) => {
      transport.on(e, (...args) => this.emit(e, ...args))
    })
    transport.on('element', (element) => this._onelement(element))
    transport.on('close', (element) => this._onclose())

    transport.connect(params, (err, ...args) => {
      if (err) return cb(err)
      this.uri = uri
      cb()
    })
  }

  open (params = {}, cb = () => {}) {
    if (typeof params === 'string') {
      params = {domain: params}
    } else if (typeof params === 'function') {
      cb = params
      params = {}
    }

    const domain = params.domain || parse(this.uri).hostname

    this.transport.open(domain, (err, features) => {
      if (err) return cb(err)
      // we can't use domain property because EventEmitter uses it
      this._domain = domain
      this.features = features
      this.emit('open', features)
      cb(null, features)
    })
  }

  close (cb) {
    this.transport.close(cb)
  }

  _onclose () {
    delete this._domain
  }

  _restart (cb) {
    this.transport.restart(this._domain, (err, features) => {
      if (err) return cb(err)
      this.features = features
      cb()
    })
  }

  _onelement (element) {
    debug('<-', element.toString())
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
        stanza.attrs.xmlns = stanza.attrs.xmlns || NS_CLIENT
    }

    if (debug.enabled) {
      debug('->', stanza.toString())
    }

    this.transport.send(stanza)
  }

  use (plugin) {
    if (this.plugins.includes(plugin)) return
    this.plugins.push(plugin)
    plugin(this)
  }
}

module.exports = Client
