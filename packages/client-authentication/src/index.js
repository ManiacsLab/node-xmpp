export function authenticate (client, creds) {
  const auth = client.authenticators.find(auth => auth.match(client.features))

  if (!auth) return Promise.reject(new Error('no compatible authentication'))

  return auth.authenticate(client, creds, client.features)
}

export function plugin (client) {
  client.authenticators = []
}

export default plugin
