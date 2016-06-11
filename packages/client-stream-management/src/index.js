'use strict'

// https://xmpp.org/extensions/xep-0198.html

const ltx = require('ltx')

const NS = 'urn:xmpp:sm:3'

const sm = {
  isSupported (features) {
    return features.getChild('sm', NS)
  },
  enable (client, resume, cb) {
    const handler = (nonza) => {
      if (nonza.attrs.xmlns !== NS) return

      if (nonza.name === 'enabled') {
        if (nonza.attrs.resume === 'true') {
          client.options.sm.id = nonza.attrs.id
        }
        cb(null, nonza)
      } else if (nonza.name === 'failed') {
        cb(nonza)
      } else {
        return
      }
      client.removeListener('nonza', handler)
    }
    client.on('nonza', handler)

    client.on('close', () => {
      client.connect(client.uri, (err, features) => {
        // if (err) return // FIXME WAT?? - reconnect + backoff module?
        // client.open((err, features) => {
        if (err) return // FIXME WAT?? - reconnect + backoff module?
        if (sm.isSupported(features) && client.options.sm.id) {
          const id = client.options.sm.id
          client.send(ltx`<enable xmlns='urn:xmpp:sm:3 resume='true' h='0' previd='${id}'/>`)
        }
      })
      // })
    })

    return client.send(ltx`<enable xmlns='urn:xmpp:sm:3' resume='true'/>`)
  }
}

module.exports = function (client) {
  if (!client.options.sm) client.options.sm = {}
  if (client.options.sm.auto !== false) client.options.sm.auto = true

  client.enableSM = function (resume, cb) {
    if (typeof resume === 'function') {
      cb = resume
      resume = true
    }

    sm.enable(client, resume, cb)
  }

  if (client.options.sm.auto) {
    client.once('stream:restart', (features) => {
      if (sm.isSupported(features)) client.enableSM()
    })
  }
}
