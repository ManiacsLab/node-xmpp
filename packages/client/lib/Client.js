'use strict'

const Connection = require('@xmpp/client-connection')

const plugins = [
  'authentication',
  'bind',
  // 'reconnect', TODO
  'sasl',
  // 'sasl-anonymous', TODO
  'sasl-digest-md5',
  'sasl-plain',
  'sasl-scram-sha-1',
  'legacy-authentication',
  'iq-callee',
  'iq-caller',
  'stream-management',
  // 'tcp', TODO
  // 'bosh', TODO
  'websocket'
  // 'srv' TODO
  // 'alternative-connection-methods' TODO
  // 'promise', TODO
  // 'ping', TODO
]

class Client extends Connection {
  constructor () {
    super()
    // TODO move to client-connection ?
    plugins.forEach(plugin => {
      plugin = require('@xmpp/client-' + plugin)
      // ignored by bundler
      if (typeof plugin !== 'function' || Object.keys(plugin) === 0) return
      this.use(plugin)
    })
  }

  // TODO move to a plugin ?
  connect (options, cb = () => {}) {
    let params = {}
    if (typeof options === 'string') {
      params.uri = options
    } else {
      Object.assign(params, options)
    }

    return super.connect(params.uri, (err) => {
      if (err) return cb(err)
      this.open(params.domain, (err) => {
        if (err) return cb(err)
        this.authenticate(params, (err) => {
          if (err) return cb(err)
          this.bind(params.resource, (err) => {
            if (err) return cb(err)
            cb()
          })
        })
      })
    })
  }
}

module.exports = Client
