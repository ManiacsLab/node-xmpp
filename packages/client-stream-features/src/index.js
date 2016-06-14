export function register (client, fn) {
  client._streamFeatures.add(fn)
}

export function plugin (client) {
  client._streamFeatures = new Set()
  client.on('features', (features) => {
    // let c = 0

    // client._streamFeatures.
  })
}
