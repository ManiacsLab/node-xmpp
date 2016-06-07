'use strict'

const Client = require('./client-connection')

const client = new Client()

// emitted for any error
client.once('error', (err) => {
  console.log('errored', err)
})

/*
 * connection events
 */
// emitted when connection is established
// client.once('connect', function () {
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

client.use(require('./client-iq-caller'))
// client.use(require('./client-tcp'))
client.use(require('./client-websocket'))
client.use(require('./client-authentication'))
client.use(require('./client-legacy-authentication'))
client.use(require('./client-sasl'))
client.use(require('./client-sasl-scram-sha-1'))
client.use(require('./client-sasl-plain'))
client.use(require('./client-bind'))
client.use(require('./client-stream-management')) // SM

// client.connect('ws://localhost:5280/xmpp-websocket')

let first = false

client.connect('ws://localhost:5280/xmpp-websocket', function (err) {
  if (err) return console.error(err)

  client.open(function (err, features) {
    if (err) return console.error(err)

    client.authenticate({'username': 'sonny', 'password': 'foobar'}, function (err) {
      if (err) return console.error(err)

      client.bind((err, jid) => {
        if (err) return console.error(err)

        console.log(jid)

        // client.enableSM((err) => {
          // if (err) return console.error(err)
          // console.log('SM enabled!!!!')

        if (!first) {
          // client.transport.socket.close()
          first = true
        }
        // })
        // READ
      })
    })
  })
})
