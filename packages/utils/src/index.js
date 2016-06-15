export function normalizeOptions (options = {}) {
  if (typeof options === 'number') options = {timeout: options}
  else if (typeof options === 'function') options = {Promise: options}

  if (!options.Promise) options.Promise = Promise
  return options
}

export function promiseEvent (target, event, options) {
  const {timeout, Promise} = normalizeOptions(options)
  return new Promise((resolve, reject) => {
    const to = typeof timeout === 'number' ? setTimeout(() => {
      target.removeListener(event, handler)
      reject(new Error('timeout'))
    }, timeout) : null

    function handler (value) {
      clearTimeout(to)
      resolve(value)
    }

    target.once(event, handler)
  })
}

export function promiseEvents (target, resolveEvent, rejectEvent, options) {
  const {timeout, Promise} = normalizeOptions(options)
  return new Promise((resolve, reject) => {
    const to = typeof timeout === 'number' ? setTimeout(() => {
      target.removeListener(resolveEvent, resolveHandler)
      target.removeListener(rejectEvent, rejectHandler)
      reject(new Error('timeout'))
    }, timeout) : null

    function resolveHandler (value) {
      clearTimeout(to)
      target.removeListener(rejectEvent, rejectHandler)
      resolve(value)
    }

    function rejectHandler (err) {
      clearTimeout(to)
      target.removeListener(resolveEvent, resolveHandler)
      reject(err)
    }

    target.once(resolveEvent, resolveHandler)
    target.once(rejectEvent, rejectHandler)
  })
}

export function promisify (fn, options) {
  const {timeout, Promise} = normalizeOptions(options)
  return function (...args) {
    return new Promise((resolve, reject) => {
      const to = typeof timeout === 'number' ? setTimeout(() => {
        reject(new Error('timeout'))
      }, timeout) : null

      fn(...args, (err, value) => {
        clearTimeout(to)
        if (err) reject(err)
        else resolve(value)
      })
    })
  }
}


// promiseEvent(client, 'stanza').then()
