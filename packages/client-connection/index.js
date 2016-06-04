'use strict'

const {EventEmitter} = require('events')
const inherits = require('inherits')
const {parse} = require('url') // FIXME not browser friendly
const debug = require('debug')('xmpp:client')

const NS_CLIENT = 'jabber:client'

function Client (options) {
  EventEmitter.call(this)
  this.plugins = []
  this.transports = []
  this.transport = null
  this.options = typeof options === 'object' ? options : {}
  this.hooks = new Map()
}

Client.prototype.id = function () {
  return Math.random().toString().split('0.')[1]
}

Client.prototype.connect = function (options, cb = () => {}) {
  if (typeof options === 'function') {
    cb = options
    options = {}
  } else if (typeof options === 'string') {
    options = {uri: options}
  }

  if (options.uri) this.uri = options.uri

  // we can't use domain property because EventEmitter uses it
  if (options.domain) {
    this._domain = options.domain
  } else if (this.uri) {
    this._domain = parse(options.uri).hostname
  }

  if (options.uri) this.uri = options.uri

  let params
  const Transport = this.transports.find(Transport => {
    return params = Transport.match(this) // eslint-disable-line no-return-assign
  })

  // FIXME callback?
  if (!Transport) throw new Error('No transport found')

  debug('using', Transport.name, 'transport with', params)

  const transport = this.transport = new Transport()
  ;['stream:features', 'close', 'error'].forEach((e) => {
    transport.on(e, (...args) => this.emit(e, ...args))
  })
  transport.on('element', (element) => this._onelement(element))

  // FIXME merge connect and open?
  // remove stream features event from transport?
  transport.connect(params, (err) => {
    if (err) return cb(err)
    transport.open(this._domain, (err, features) => {
      if (err) return cb(err)
      this.features = features
      this.emit('connect', features)
      cb(null, features)
    })
  })
}

Client.prototype.close = function (cb) {
  this.transport.close(cb)
}

Client.prototype._restart = function (cb) {
  this.transport.restart(this._domain, (err, features) => {
    if (err) return cb(err)
    this.features = features
    cb()
  })
}

// merge with send? add timeout? FIXME
// Client.prototype.request = function (stanza, cb) {
//   stanza = stanza.root()
//   const id = stanza.attrs.id || (stanza.attrs.id = Math.random().toString())
//   this.iqHandlers[id] = cb
//   this.send(stanza)
// }

Client.prototype._onelement = function (element) {
  debug('<-', element.toString())
  this.emit('element', element)

  ;['iq', 'message', 'presence'].some(
    n => n === element.name
  )
    ? this.emit('stanza', element)
    : this.emit('nonza', element)

  // FIXME send service-unavailable for un-handled iqs
  // maybe if (!this._iqMatches) ? (client-iq-callee)
}

Client.prototype.send = function (stanza) {
  stanza = stanza.root()

  // FIXME move to WebSocket?
  switch (stanza.name) {
    case 'iq':
    case 'presence':
    case 'message':
      stanza.attrs.xmlns = NS_CLIENT
  }

  if (debug.enabled) {
    debug('->', stanza.toString())
  }

  this.transport.send(stanza)
}

Client.prototype.use = function (plugin) {
  if (this.plugins.includes(plugin)) return
  this.plugins.push(plugin)
  plugin(this)
}

inherits(Client, EventEmitter)

module.exports = Client
