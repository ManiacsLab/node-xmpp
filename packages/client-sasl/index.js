'use strict'

const ltx = require('ltx')
const debug = require('debug')('xmpp:client:sasl')
const SASLFactory = require('saslmechanisms')
const {encode, decode} = require('./b64')

const NS_SASL = 'urn:ietf:params:xml:ns:xmpp-sasl'

function getBestMechanism (SASL, mechs, features) {
  // FIXME preference order ?
  // var SASL = new SASLFactory()
  // mechs.forEach((mech) => {
  //   if (typeof mech === 'string') {
  //     const existingMech = SASL_MECHS[mech.toLowerCase()]
  //     if (existingMech) {
  //       SASL.use(existingMech)
  //     }
  //   } else {
  //     SASL.use(mech)
  //   }
  // })

  const mechanisms = features.getChild('mechanisms', NS_SASL).children.map(el => el.text())
  return SASL.create(mechanisms)
}

function authenticate (client, credentials, features, cb) {
  const mech = getBestMechanism(client.SASL, client.options.sasl, features)
  if (!mech) {
    debug('no compatible mechanism')
    return
  }

  const {domain} = client.options
  const creds = {}
  Object.assign(creds, {
    username: null,
    password: null,
    server: domain,
    host: domain,
    realm: domain,
    serviceType: 'xmpp',
    serviceName: domain
  }, credentials)

  console.log(creds)

  if (debug.enabled) {
    const {password} = creds
    creds.password = '******'
    debug('using ', mech.name, 'with credentials', creds)
    creds.password = password
  }

  const handler = (element) => {
    if (element.attrs.xmlns !== NS_SASL) return

    debug('<-', element.name)

    if (element.name === 'challenge') {
      mech.challenge(decode(element.text()))
      const resp = mech.response(creds)
      debug('-> response')
      client.send(ltx`
        <response xmlns='${NS_SASL}' mechanism='${mech.name}'>${typeof resp === 'string' ? encode(resp) : ''}</response>
      `)
      return
    }

    if (element.name === 'failure') {
      cb(true)
    } else if (element.name === 'success') {
      client._restart(cb)
    }

    client.removeListener('nonza', handler)
  }
  client.on('nonza', handler)

  if (mech.clientFirst) {
    debug('-> auth')
    client.send(ltx`
      <auth xmlns='${NS_SASL}' mechanism='${mech.name}'>${encode(mech.response(creds))}</auth>
    `)
  }
}

function match (features) {
  return !!features.getChild('mechanisms', NS_SASL)
}

const authenticator = {authenticate, match, name: 'SASL'}

module.exports = function (client) {
  client.SASL = new SASLFactory()
  client.authenticators.push(authenticator)
}
