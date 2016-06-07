'use strict'

const {EventEmitter} = require('events')
const ltx = require('ltx')
const inherits = require('inherits')
const WS = require('ws')
const debug = require('debug')('xmpp:client:websocket')

const NS_FRAMING = 'urn:ietf:params:xml:ns:xmpp-framing'
const NS_STREAM = 'http://etherx.jabber.org/streams'

/* References
 * WebSocket protocol https://tools.ietf.org/html/rfc6455
 * WebSocket Web API https://html.spec.whatwg.org/multipage/comms.html#network
 * XMPP over WebSocket https://tools.ietf.org/html/rfc7395
*/

function WebSocket () {
  EventEmitter.call(this)
}

inherits(WebSocket, EventEmitter)

WebSocket.prototype.connect = function (url, cb) {
  const sock = this.socket = new WS(url, ['xmpp'])
  // FIXME remove listeners when closed/errored
  sock.addEventListener('open', this._openListener.bind(this))
  sock.addEventListener('message', this._messageListener.bind(this))
  sock.addEventListener('close', this._closeListener.bind(this))
  sock.addEventListener('error', this._errorListener.bind(this))

  if (cb) {
    const onConnect = () => {
      cb()
      sock.removeListener('error', onError)
    }
    const onError = (err) => {
      cb(err)
      sock.removeListener('connect', onConnect)
    }
    this.once('connect', onConnect)
    this.once('error', onError)
  }
}

WebSocket.prototype.open = function (domain, cb) {
  // FIXME timeout
  this.once('element', el => {
    if (el.name !== 'open') return // FIXME error
    if (el.attrs.version !== '1.0') return // FIXME error
    if (el.attrs.xmlns !== NS_FRAMING) return // FIXME error
    if (el.attrs.from !== domain) return // FIXME error
    if (!el.attrs.id) return // FIXME error

    this.emit('open')

    // FIXME timeout
    this.once('element', el => {
      if (el.name !== 'stream:features') return // FIXME error
      if (el.attrs['xmlns:stream'] !== NS_STREAM) return // FIXME error
   // if (stanza.attrs.xmlns !== NS_CLIENT) FIXME what about this one?

      cb(null, el)
      this.emit('stream:features', el)
    })
  })
  this.send(ltx`
    <open version="1.0" xmlns="${NS_FRAMING}" to="${domain}"/>
  `)
}

WebSocket.prototype.restart = function (domain, cb) {
  // FIXME timeout
  this.once('element', el => {
    if (el.name !== 'open') return // FIXME error
    if (el.attrs.version !== '1.0') return // FIXME error
    if (el.attrs.xmlns !== NS_FRAMING) return // FIXME error
    if (el.attrs.from !== domain) return // FIXME error
    if (!el.attrs.id) return // FIXME error

    this.emit('open')

    // FIXME timeout
    this.once('element', el => {
      if (el.name !== 'stream:features') return // FIXME error
      if (el.attrs['xmlns:stream'] !== NS_STREAM) return // FIXME error
   // if (stanza.attrs.xmlns !== NS_CLIENT) FIXME what about this one?

      cb(null, el)
    })
  })
  this.send(ltx`
    <open version="1.0" xmlns="${NS_FRAMING}" to="${domain}"/>
  `)
}

// https://tools.ietf.org/html/rfc7395#section-3.6
WebSocket.prototype.close = function (cb) {
  // FIXME timeout
  const handler = (element) => {
    if (!element.is('close', NS_FRAMING)) return
    this.socket.close()
    this.removeListener('element', handler)
    if (cb) this.once('close', cb) // FIXME timeout
  }
  this.on('element', handler)
  this.send(ltx`<close xmlns="${NS_FRAMING}"/>`)
}

WebSocket.prototype._openListener = function () {
  debug('opened')
  this.emit('connect')
}

WebSocket.prototype._messageListener = function ({data}) {
  debug('<-', data)
  // if (typeof data !== 'string') FIXME stream error

  const element = ltx.parse(data) // FIXME use StreamParser
  this.emit('element', element)
}

WebSocket.prototype._closeListener = function () {
  debug('closed')
  this.emit('close')
}

WebSocket.prototype._errorListener = function (error) {
  debug('errored')
  this.emit('error', error)
}

WebSocket.prototype.send = function (data) {
  data = data.root().toString()
  debug('->', data)
  this.socket.send(data)
}

WebSocket.match = function (uri) {
  return typeof uri === 'string' && uri.match(/^wss?:\/\//) ? uri : null
}

WebSocket.NS_FRAMING = NS_FRAMING

module.exports = WebSocket
