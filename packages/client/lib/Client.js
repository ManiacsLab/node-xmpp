'use strict'

const Connection = require('@xmpp/client-connection')

// plugins
const plugins = [
  require('@xmpp/client-authentication'),
  require('@xmpp/client-bind'),
//require('@xmpp/client-reconnect') TODO
  require('@xmpp/client-sasl'),
  require('@xmpp/client-sasl-anonymous'),
  require('@xmpp/client-sasl-digest-md5'),
  require('@xmpp/client-sasl-plain'),
  require('@xmpp/client-sasl-scram-sha-1'),
  require('@xmpp/client-legacy-authentication'),
  require('@xmpp/client-iq-callee'),
  require('@xmpp/client-iq-caller'),
  require('@xmpp/client-stream-management'),
  require('@xmpp/client-websocket'),
  require('@xmpp/client-bosh'),
  require('@xmpp/client-http'),
  require('@xmpp/client-alternative-connection-methods')
]
// const plugins = [
//   'authentication',
//   'bind',
//   // 'reconnect', TODO
//   'sasl',
//   'sasl-anonymous', TODO
//   'sasl-digest-md5',
//   'sasl-plain',
//   'sasl-scram-sha-1',
//   'legacy-authentication',
//   'iq-callee',
//   'iq-caller',
//   'stream-management',
//   // 'tcp', TODO
//   // 'bosh', TODO
//   'websocket',
//   // 'srv' TODO
//   'bosh',
//   'http',
//   // 'srv', TODO
//   'alternative-connection-methods'
//   // 'promise', TODO
//   // 'ping', TODO
// ]

class Client extends Connection {
  constructor () {
    super()
    // TODO move to client-connection ?
    plugins.forEach(plugin => {
      // plugin = require('@xmpp/client-' + plugin)
      // // ignored by bundler
      // if (typeof plugin !== 'function' || Object.keys(plugin) === 0) return
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
