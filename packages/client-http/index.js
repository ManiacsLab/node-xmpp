'use strict'

const fetch = global.fetch || require('node-fetch')

function http (url, options, cb = () => {}) {
  if (typeof options === 'function') {
    cb = options
  }

  return fetch(url, options)
    .then((...args) => cb(null, ...args))
    .catch(cb)
}

module.exports = function (client) {
  client.http = http
}
