export function authenticate (client, creds, cb) {
  const auth = client.authenticators.find(auth => auth.match(client.features))

  if (!auth) {
    // dezalgo... TODO use process.nextTick/setImmediate/Promise.resolve/... when available
    setTimeout(() => { cb(new Error('no compatible authentication')) })
    return
  }

  auth.authenticate(client, creds, client.features, cb)
}

export function clientAuthenticate (...args) {
  authenticate(this, ...args)
}

export function plugin (client) {
  client.authenticators = []
  client.authenticate = clientAuthenticate
}
