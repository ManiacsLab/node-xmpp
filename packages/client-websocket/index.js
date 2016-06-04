'use strict'

const WebSocket = require('./lib/WebSocket')

module.exports = (client) => {
  client.transports.push(WebSocket)
}
