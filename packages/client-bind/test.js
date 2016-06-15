import test from 'ava'
import {hasSupport, stanza, plugin} from './src'

test('plugin', t => {
  const client = {}
  plugin(client)
  t.true(typeof client.bind === 'function')
})

test('hasSupport()', t => {
  const features = <features/>
  t.is(hasSupport(features), undefined)

  const bind = <bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'/>
  features.cnode(bind)
  t.is(hasSupport(features), bind)
})

test('stanza()', t => {
  t.deepEqual(stanza(), (
    <iq type='set'>
      <bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'/>
    </iq>
  ))

  t.deepEqual(stanza('foobar'), (
    <iq type='set'>
      <bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'>
        <resource>foobar</resource>
      </bind>
    </iq>
  ))
})
