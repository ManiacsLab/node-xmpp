'use strict'

import EventEmitter from 'events'
import net from 'net'
import StreamParser from './StreamParser'
import url from 'url'
import debug from 'debug'

const d = debug('xmpp:client:tcp')

export const NS_STREAM = 'http://etherx.jabber.org/streams'
export const NS_CLIENT = 'jabber:client'

/* References
 * Extensible Messaging and Presence Protocol (XMPP): Core http://xmpp.org/rfcs/rfc6120.html
*/

export default class TCP extends EventEmitter {
  constructor (options) {
    super()

    const parser = this.parser = new StreamParser()
    parser.on('element', (el) => this.emit('element', el))
  }

  connect (uri, cb) {
    const sock = this.socket = new net.Socket()
    // FIXME remove listeners when closed/errored
    sock.once('connect', this._connectListener.bind(this))
    sock.on('data', this._dataListener.bind(this))
    sock.once('close', this._closeListener.bind(this))
    sock.once('error', this._errorListener.bind(this))

    const {hostname, port} = url.parse(uri)

    sock.connect({port: port || 5222, hostname}, cb)
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
    // FIXME timeout
    this.parser.once('streamStart', attrs => {
      if (attrs.version !== '1.0') return // FIXME error
      if (attrs.xmlns !== NS_CLIENT) return // FIXME error
      if (attrs['xmlns:stream'] !== NS_STREAM) return // FIXME error
      if (attrs.from !== domain) return // FIXME error
      if (!attrs.id) return // FIXME error

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
    // FIXME timeout
    this.parser.once('streamStart', attrs => {
      if (attrs.version !== '1.0') return // FIXME error
      if (attrs.xmlns !== NS_CLIENT) return // FIXME error
      if (attrs['xmlns:stream'] !== NS_STREAM) return // FIXME error
      if (attrs.from !== domain) return // FIXME error
      if (!attrs.id) return // FIXME error

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

  // https://xmpp.org/rfcs/rfc6120.html#streams-close
  close (cb) {
    // TODO timeout
    const handler = () => {
      this.socket.close()
      this.parser.removeListener('end', handler)
      if (cb) this.once('close', cb)
    }
    this.parser.on('end', handler)
    this.write('</stream:stream>')
  }

  _connectListener () {
    this.emit('connect')
  }

  _dataListener (data) {
    d('<-', data.toString('utf8'))
    this.parser.write(data.toString('utf8'))
  }

  _closeListener () {
    this.emit('close')
  }

  _errorListener (error) {
    this.emit('error', error)
  }

  write (data) {
    d('->', data.toString('utf8'))
    data = data.trim()
    this.socket.write(data, 'utf8')
  }

  send (data) {
    data = data.root().toString()
    this.write(data)
  }

  static match (uri) {
    return uri.startsWith('xmpp:') ? uri : false
  }
}
