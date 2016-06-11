import test from 'ava'
import {authenticate, plugin} from './index'

test('plugin', t => {
  const client = {}
  plugin(client)
  t.deepEqual(client.authenticators, [])
  t.truthy(typeof client.authenticate === 'function')
})

test.cb('authenticate', t => {
  const creds = {}
  const client = {}
  plugin(client)
  authenticate(client, creds, (err) => {
    t.truthy(err instanceof Error)
    t.end()
  })
})
