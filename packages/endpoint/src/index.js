'use strict'

import EventEmitter from 'events'
import {promiseEvent} from '@xmpp/utils'
import {match} from '@xmpp/xml'

export default class Endpoint {
  constructor () {
    this.ee = this.eventEmitter = new EventEmitter()
  }

  // EventEmitter
  on (...args) {
    this.eventEmitter.on(...args)
  }
  addListener (...args) {
    this.eventEmitter.addListener(...args)
  }
  removeListener (...args) {
    this.eventEmitter.removeListener(...args)
  }
  emit (...args) {
    this.eventEmitter.emit(...args)
  }

  // promise
  promise (event) {
    if (typeof event === 'string') return promiseEvent(this.eventEmitter, event, options)

    return promiseEvent(this.eventEmitter, 'element', options)
      .then(el => {
        if (!match(el, event)) throw new Error('no match')
        else return el
      })
  }
}
