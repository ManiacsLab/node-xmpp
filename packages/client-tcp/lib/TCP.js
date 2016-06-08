'use strict'

const EventEmitter = require('events')
const xml = require('@xmpp/xml')
const net = require('net')
const debug = require('debug')('xmpp:client:tcp')
const StreamParser = require('./StreamParser')

const NS_STREAM = 'http://etherx.jabber.org/streams'
const NS_CLIENT = 'jabber:client'

/* References
 * Extensible Messaging and Presence Protocol (XMPP): Core http://xmpp.org/rfcs/rfc6120.html
*/

class TCP extends EventEmitter {
  constructor (options) {
    super()

    const parser = this.parser = new StreamParser()
    parser.on('element', (el) => this.emit('element', el))
  }

  connect (url, cb) {
    const sock = this.socket = new net.Socket()
    // FIXME remove listeners when closed/errored
    sock.once('connect', this._connectListener.bind(this))
    sock.on('data', this._dataListener.bind(this))
    sock.once('close', this._closeListener.bind(this))
    sock.once('error', this._errorListener.bind(this))

    sock.connect({port: 5222, hostname: 'localhost'}, cb)
    // if (cb) {
    //   const onConnect = () => {
    //     cb()
    //     sock.removeListener('error', onError)
    //   }
    //   const onError = (err) => {
    //     cb(err)
    //     sock.removeListener('connect', onConnect)
    //   }
    //   this.once('connect', onConnect)
    //   this.once('error', onError)
    // }
  }

  open (domain, cb) {
    domain = 'localhost'
    // FIXME timeout
    this.parser.once('streamStart', attrs => {
      const el = new xml.Element('stream:stream', attrs)
      if (el.name !== 'stream:stream') return // FIXME error
      if (el.attrs.version !== '1.0') return // FIXME error
      if (el.attrs.xmlns !== NS_CLIENT) return // FIXME error
      if (el.attrs['xmlns:stream'] !== NS_STREAM) return // FIXME error
      // if (el.attrs.xmlns !== NS_FRAMING) return // FIXME error
      if (el.attrs.from !== domain) return // FIXME error
      if (!el.attrs.id) return // FIXME error

      this.emit('open')

      // FIXME timeout
      this.once('element', el => {
        if (el.name !== 'stream:features') return // FIXME error

        cb(null, el)
        this.emit('stream:features', el)
      })
    })
    this.write(`
      <?xml version='1.0'?>
      <stream:stream to='localhost' version='1.0' xml:lang='en' xmlns='${NS_CLIENT}' xmlns:stream='${NS_STREAM}'>
    `)
  }

  restart (domain, cb) {
    domain = 'localhost'
    // FIXME timeout
    this.parser.once('streamStart', attrs => {
      const el = new xml.Element('stream:stream', attrs)
      if (el.name !== 'stream:stream') return // FIXME error
      if (el.attrs.version !== '1.0') return // FIXME error
      if (el.attrs.xmlns !== NS_CLIENT) return // FIXME error
      if (el.attrs['xmlns:stream'] !== NS_STREAM) return // FIXME error
      // if (el.attrs.xmlns !== NS_FRAMING) return // FIXME error
      if (el.attrs.from !== domain) return // FIXME error
      if (!el.attrs.id) return // FIXME error

      this.emit('open')

      // FIXME timeout
      this.once('element', el => {
        if (el.name !== 'stream:features') return // FIXME error

        cb(null, el)
        this.emit('stream:features', el)
      })
    })
    this.write(`
      <?xml version='1.0'?>
      <stream:stream to='localhost' version='1.0' xml:lang='en' xmlns='${NS_CLIENT}' xmlns:stream='${NS_STREAM}'>
    `)
  }

  // https://tools.ietf.org/html/rfc7395#section-3.6
  close (cb) {
    // FIXME timeout
    const handler = (element) => {
      // if (!element.is('close', NS_FRAMING)) return
      this.socket.close()
      this.removeListener('element', handler)
      if (cb) this.once('close', cb) // FIXME timeout
    }
    this.on('element', handler)
    // this.send(xml`<close xmlns="${NS_FRAMING}"/>`)
  }

  _connectListener () {
    debug('opened')
    this.emit('connect')
  }

  _dataListener (data) {
    debug('<-', data.toString('utf8'))

    this.parser.write(data.toString('utf8'))
  }

  _closeListener () {
    debug('closed')
    this.emit('close')
  }

  _errorListener (error) {
    debug('errored')
    this.emit('error', error)
  }

  write (data) {
    data = data.trim()
    debug('->', data)
    this.socket.write(data, 'utf8')
  }

  send (data) {
    data = data.root().toString()
    this.write(data)
  }

  static match (uri) {
    return uri.includes('://') ? false : uri
  }
}

TCP.NS_STREAM = NS_STREAM

module.exports = TCP
