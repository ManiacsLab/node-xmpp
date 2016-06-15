/* References
 * https://xmpp.org/extensions/xep-0198.html
 */

export const name = 'stream-management' // TODO add name to all plugins, maybe reference with doc?

export const NS = 'urn:xmpp:sm:3'

export function isSupported (features) {
  return features.getChild('sm', NS)
}

export function enable (client, resume, cb) {
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
      if (isSupported(features) && client.options.sm.id) {
        const id = client.options.sm.id
        client.send(<enable xmlns={NS} resume='true' h='0' previd={id}/>)
      }
    })
    // })
  })

  return client.send(<enable xmlns={NS} resume='true'/>)
}

export function clientEnable (client, ...args) {
  enable(client, ...args)
}

export function plugin (client) {
  if (!client.options.sm) client.options.sm = {}
  if (client.options.sm.auto !== false) client.options.sm.auto = true

  client.enableSM = clientEnable

  if (client.options.sm.auto) {
    client.once('stream:restart', (features) => {
      if (isSupported(features)) client.enableSM()
    })
  }
}

export default plugin
