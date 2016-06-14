import Connection from '@xmpp/client-connection'
import plugins from './plugins'

import {bind} from '@xmpp/client-bind'
import {authenticate} from '@xmpp/client-authentication'

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
  connect (options) {
    let params = {}
    if (typeof options === 'string') {
      params.uri = options
    } else {
      Object.assign(params, options)
    }

    // TODO promise, SRV
    // this.getAltnernativeConnectionsMethods('localhost', (err, methods) => {
      // console.log(err || methods)
    return super.connect(params.uri)
    .then(() => this.open(params.domain))
    .then(() => authenticate(this, params))
    .then(() => {
      console.log('authenticated')
    })
    .then(() => {
      bind(this, params.resource)
    })
    .then(jid => {
      console.log(jid.toString())
    })
    .catch(err => {
      console.log(err)
    })

    // return super
    //   .connect(params.uri)
    //   .then(this.open(params.domain))
    //   .then(this.authenticate(params))
    //   .then(this.bind(params.resource))
    // })
  }
}
