'use strict'

const mech = require('sasl-x-oauth2')

module.exports = function (client) {
  client.SASL.use(mech)
}
