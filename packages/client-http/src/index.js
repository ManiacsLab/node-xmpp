import nodeFetch from 'node-fetch'

const fetch = global.fetch || nodeFetch

export function http (url, options, cb = () => {}) {
  if (typeof options === 'function') {
    cb = options
  }

  return fetch(url, options)
    .then((...args) => cb(null, ...args))
    .catch(cb)
}

export default http
