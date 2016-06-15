import test from 'ava'
import {promisify} from '../src'

test('resolve', t => {
  function delay (time, value, cb) {
    setTimeout(() => cb(null, value), time)
  }
  const promisified = promisify(delay)
  return promisified(10, 'foo').then(value => { // eslint-disable-line promise/always-return
    t.is(value, 'foo')
  })
})

test('reject', t => {
  function delay (time, cb) {
    setTimeout(() => cb(new Error('foo')), time)
  }
  const promisified = promisify(delay)
  t.throws(promisified(10), 'foo')
})

test('timeout', t => {
  function delay (time, cb) {}
  const promisified = promisify(delay, 500)
  t.throws(promisified(123), 'timeout')
})
