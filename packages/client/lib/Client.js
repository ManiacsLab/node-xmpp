'use strict'

const Connection = require('@xmpp/client-connection')

// plugins
const plugins = [
  require('@xmpp/client-authentication'),
  require('@xmpp/client-bind'),
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
  require('@xmpp/client-tcp'),
  require('@xmpp/client-http'),
  require('@xmpp/client-alternative-connection-methods-http'),
  require('@xmpp/client-session-establishment')
// TODO
// require('@xmpp/client-reconnect')
// require('@xmpp/client-alternative-connection-methods-srv')
// require('@xmpp/client-promise')
// require('@xmpp/client-ping')
// require('@xmpp/client-pong')
// require('@xmpp/srv')
// require('@xmpp/client-promise')
// require('@xmpp/client-ping')
]

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

    // TODO promise, SRV
    // this.getAltnernativeConnectionsMethods('localhost', (err, methods) => {
      // console.log(err || methods)
    super.connect(params.uri, (err) => {
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

    // return super
    //   .connect(params.uri)
    //   .then(this.open(params.domain))
    //   .then(this.authenticate(params))
    //   .then(this.bind(params.resource))
    // })
  }
}

module.exports = Client
