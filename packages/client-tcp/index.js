'use strict'

const TCP = require('./lib/TCP')

module.exports = function (client) {
  client.transports.push(TCP)
}
