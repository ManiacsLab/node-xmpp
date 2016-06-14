export function authenticate (client, creds) {
  const auth = client.authenticators.find(auth => auth.match(client.features))

  if (!auth) return Promise.reject(new Error('no compatible authentication'))

  return new Promise((resolve, reject) => {
    auth.authenticate(client, creds, client.features, (err, ...args) => {
      if (err) reject(err)
      else resolve(...args)
    })
  })
}

export function plugin (client) {
  client.authenticators = []
}

export default plugin
