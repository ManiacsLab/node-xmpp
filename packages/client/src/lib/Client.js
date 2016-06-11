import Connection from '@xmpp/client-connection'
import plugins from './plugins'

export default class Client extends Connection {
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
