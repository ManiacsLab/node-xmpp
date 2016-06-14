export function promiseEvent (target, event, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = typeof options.time === 'number'
      ? setTimeout(() => reject(new Error('timeout')), options.timeout)
      : null

    const handler = (err, ...args) => {
      clearTimeout(timeout)
      if (err) reject(err)
      else resolve(...args)
    }

    function eventHandler (...args) {
      clearTimeout(timeout)
    }

    function errorHandler () {
      clearTimeout(timeout)
    }

    target.once(event, (...args) => {
      clearTimeout(timeout)
      resolve()
    })
  })
}
