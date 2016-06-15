import test from 'ava'
import EventEmitter from 'events'
import {promiseEvents} from '../src'

test('resolve', t => {
  const ee = new EventEmitter()
  const p = promiseEvents(ee, 'connect', 'error')
  t.is(ee.listenerCount('connect'), 1)
  t.is(ee.listenerCount('error'), 1)
  ee.emit('connect', 'foo')
  return p.then(value => {
    t.is(value, 'foo')
    t.is(ee.listenerCount('connect'), 0)
    t.is(ee.listenerCount('error'), 0)
  })
})

test('reject', t => {
  const ee = new EventEmitter()
  const p = promiseEvents(ee, 'connect', 'error')
  t.is(ee.listenerCount('connect'), 1)
  t.is(ee.listenerCount('error'), 1)
  ee.emit('error', new Error('bar'))
  t.throws(p, 'bar')
  p.catch(() => {
    t.is(ee.listenerCount('connect'), 0)
    t.is(ee.listenerCount('error'), 0)
  })
})

test('timeout', t => {
  const ee = new EventEmitter()
  const p = promiseEvents(ee, 'connect', 'error', 1000)
  t.is(ee.listenerCount('connect'), 1)
  t.is(ee.listenerCount('error'), 1)
  t.throws(p, 'timeout')
  p.catch(() => {
    t.is(ee.listenerCount('connect'), 0)
    t.is(ee.listenerCount('error'), 0)
  })
})
