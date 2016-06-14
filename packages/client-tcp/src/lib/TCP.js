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

  connect (uri) {
    return new Promise((resolve, reject) => {
      const sock = this.socket = new net.Socket()
      // FIXME remove listeners when closed/errored
      sock.once('connect', this._connectListener.bind(this))
      sock.on('data', this._dataListener.bind(this))
      sock.once('close', this._closeListener.bind(this))
      sock.once('error', this._errorListener.bind(this))

      const {hostname, port} = url.parse(uri)

      sock.connect({port: port || 5222, hostname}, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  open (domain) {
    return new Promise((resolve, reject) => {
      // FIXME timeout
      this.parser.once('streamStart', attrs => {
        if (attrs.version !== '1.0') return // FIXME error
        if (attrs.xmlns !== NS_CLIENT) return // FIXME error
        if (attrs['xmlns:stream'] !== NS_STREAM) return // FIXME error
        if (attrs.from !== domain) return // FIXME error
        if (!attrs.id) return // FIXME error

        this._domain = domain
        this.emit('open')

        // FIXME timeout
        this.once('element', el => {
          if (el.name !== 'stream:features') return // FIXME error

          this.emit('features', el)
          resolve(el)
        })
      })
      this.write(`
        <?xml version='1.0'?>
        <stream:stream to='localhost' version='1.0' xml:lang='en' xmlns='${NS_CLIENT}' xmlns:stream='${NS_STREAM}'>
      `)
    })
  }

  restart (domain) {
    return new Promise((resolve, reject) => {
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

          this.emit('features', el)

          resolve(el)
        })
      })
      this.write(`
        <?xml version='1.0'?>
        <stream:stream to='localhost' version='1.0' xml:lang='en' xmlns='${NS_CLIENT}' xmlns:stream='${NS_STREAM}'>
      `)
    })
  }

  // https://xmpp.org/rfcs/rfc6120.html#streams-close
  close () {
    return new Promise((resolve, reject) => {
      // TODO timeout
      const handler = () => {
        this.socket.close()
        this.once('close', resolve)
      }
      this.parser.once('end', handler)
      this.write('</stream:stream>')
    })
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
    data = data.toString('utf8').trim()
    d('->', data)
    return new Promise((resolve, reject) => {
      this.socket.write(data, 'utf8', resolve)
    })
  }

  send (element) {
    return this.write(element.root())
  }

  static match (uri) {
    return uri.startsWith('xmpp:') ? uri : false
  }
}
