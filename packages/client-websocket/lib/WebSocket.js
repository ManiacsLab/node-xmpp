'use strict'

const EventEmitter = require('events')
const xml = require('@xmpp/xml')
const WS = require('ws')
const debug = require('debug')('xmpp:client:websocket')

const NS_FRAMING = 'urn:ietf:params:xml:ns:xmpp-framing'
const NS_STREAM = 'http://etherx.jabber.org/streams'

/* References
 * WebSocket protocol https://tools.ietf.org/html/rfc6455
 * WebSocket Web API https://html.spec.whatwg.org/multipage/comms.html#network
 * XMPP over WebSocket https://tools.ietf.org/html/rfc7395
*/

class WebSocket extends EventEmitter {
  connect (url, cb) {
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

  open (domain, cb) {
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
    this.send(xml`
      <open version="1.0" xmlns="${NS_FRAMING}" to="${domain}"/>
    `)
  }

  restart (domain, cb) {
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
    this.send(xml`
      <open version="1.0" xmlns="${NS_FRAMING}" to="${domain}"/>
    `)
  }

  // https://tools.ietf.org/html/rfc7395#section-3.6
  close (cb) {
    // FIXME timeout
    const handler = (element) => {
      if (!element.is('close', NS_FRAMING)) return
      this.socket.close()
      this.removeListener('element', handler)
      if (cb) this.once('close', cb) // FIXME timeout
    }
    this.on('element', handler)
    this.send(xml`<close xmlns="${NS_FRAMING}"/>`)
  }

  _openListener () {
    debug('opened')
    this.emit('connect')
  }

  _messageListener ({data}) {
    debug('<-', data)
    // if (typeof data !== 'string') FIXME stream error

    const element = xml.parse(data) // FIXME use StreamParser
    this.emit('element', element)
  }

  _closeListener () {
    debug('closed')
    this.emit('close')
  }

  _errorListener (error) {
    debug('errored')
    this.emit('error', error)
  }

  send (data) {
    data = data.root().toString()
    debug('->', data)
    this.socket.send(data)
  }

  static match (uri) {
    return typeof uri === 'string' && uri.match(/^wss?:\/\//) ? uri : null
  }
}

WebSocket.NS_FRAMING = NS_FRAMING
WebSocket.NS_STREAM = NS_STREAM

module.exports = WebSocket
