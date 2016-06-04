'use strict'

const {EventEmitter} = require('events')
const ltx = require('ltx')
const inherits = require('inherits')
const net = require('net')
const debug = require('debug')('xmpp:client:tcp')

const NS_FRAMING = 'urn:ietf:params:xml:ns:xmpp-framing'
const NS_STREAM = 'http://etherx.jabber.org/streams'

/* References
 * TCP protocol https://tools.ietf.org/html/rfc6455
 * TCP Web API https://html.spec.whatwg.org/multipage/comms.html#network
 * XMPP over TCP https://tools.ietf.org/html/rfc7395
*/

function TCP (options) {
  EventEmitter.call(this)
}

inherits(TCP, EventEmitter)

TCP.prototype.connect = function (options, cb) {
  const sock = this.socket = new net.Socket(options)
  sock.once('connect', this._connectListener.bind(this))
  sock.once('close', this._closeListener.bind(this))
  sock.on('data', this._dataListener.bind(this))
  // sock.on('drain')
  sock.on('end', this._endListener.bind(this))
  sock.on('error', this._errorListener.bind(this))
  sock.on('timeout', this._timeoutListener.bind(this))

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

  sock.connect({port: 5222, hostname: 'localhost'})
}

TCP.prototype.open = function (domain, cb) {
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

TCP.prototype.restart = function (domain, cb) {
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
TCP.prototype.close = function (cb) {
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

TCP.prototype._connectListener = function () {
  debug('opened')
  this.emit('connect')
}

TCP.prototype._dataListener = function (data) {
  return
  // debug('<-', data)
  // if (typeof data !== 'string') FIXME stream error

  // const element = parse(data) // FIXME use StreamParser
  // this.emit('element', element)
}

TCP.prototype._closeListener = function () {
  debug('closed')
  this.emit('close')
}

TCP.prototype._endListener = function () {
  debug('ended')
  // this.emit('end') // ??
}

TCP.prototype._errorListener = function (error) {
  debug('errored')
  this.emit('error', error)
}

TCP.prototype.send = function (data) {
  data = data.root().toString()
  debug('->', data)
  this.socket.write(data)
}

TCP.prototype._timeoutListener = function () {

}

TCP.match = function ({uri = ''}) {
  return uri.includes('://') ? false : uri
}

TCP.NS_FRAMING = NS_FRAMING

module.exports = TCP
