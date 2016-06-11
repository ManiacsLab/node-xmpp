'use strict'

import EventEmitter from 'events'
import {parse} from '@xmpp/xml'
import WS from 'ws'

export const NS_FRAMING = 'urn:ietf:params:xml:ns:xmpp-framing'
export const NS_STREAM = 'http://etherx.jabber.org/streams'

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
    this.send(<open version='1.0' xmlns={NS_FRAMING} to={domain} />)
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
    this.send(<open version='1.0' xmlns={NS_FRAMING} to={domain} />)
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
    this.send(<close xmlns={NS_FRAMING} />)
  }

  _openListener () {
    this.emit('connect')
  }

  _messageListener ({data}) {
    // if (typeof data !== 'string') FIXME stream error

    const element = parse(data) // FIXME use StreamParser
    this.emit('element', element)
  }

  _closeListener () {
    this.emit('close')
  }

  _errorListener (error) {
    this.emit('error', error)
  }

  send (data) {
    data = data.root().toString()
    this.socket.send(data)
  }

  static match (uri) {
    return typeof uri === 'string' && uri.match(/^wss?:\/\//) ? uri : null
  }
}

export default WebSocket
