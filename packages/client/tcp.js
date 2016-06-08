'use strict'

const {Client, jid, xml} = require('.')
const client = new Client()

// emitted for any error
client.once('error', (err) => {
  console.log('errored', err)
})

/*
 * connection events
 */
// emitted when connection is established
// client.once('connect', function () {a
  // console.log('connected')
  // client.open('localhost')
// })
// emitted when connection is closed
client.once('close', () => {
  console.log('closed')
})

/*
 * stream events
 */
// emitted when stream features are received
client.once('stream:features', (element) => {
  // console.log('features')
  // console.log('features', element.toString())
})
// emitted when stream is open
client.once('stream:open', () => {
  console.log('stream open')
})
// emitted when stream is closed
client.once('stream:close', () => {
  console.log('stream close')
})

/*
 * xml events
 */
// emitted for any incoming stanza or nonza
client.on('element', () => {})
// emitted for any incoming stanza (iq, message, presence)
client.on('stanza', () => {})
// emitted for any incoming nonza
client.on('nonza', () => {})

client.connect({uri: 'localhost', username: 'sonny', password: 'foobar'}, function (err) {
  if (err) return console.error(err)
  console.log(client.jid.toString())
})


// client.getAltnernativeConnectionsMethods('localhost', (err, methods) => {
//   console.log(err || methods)
// })
