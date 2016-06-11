'use strict'

const mech = require('sasl-xoauth2')

module.exports = function (client) {
  client.SASL.use(mech)
}
