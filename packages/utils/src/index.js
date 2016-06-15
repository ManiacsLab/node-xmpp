export function promiseEvent (target, event, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = typeof options.timeout === 'number' ? setTimeout(() => {
      target.removeListener(event, handler)
      reject(new Error('timeout'))
    }, options.timeout) : null

    function handler (value) {
      clearTimeout(timeout)
      resolve(value)
    }

    target.once(event, handler)
  })
}
