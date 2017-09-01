'use strict'

import 'fetch'
import * as Constants from 'lib/constants'

export const minWatchInterval = 1000

export function isOnline () {
  // Return true when property undefined
  return window.navigator.onLine !== undefined || window.navigator.onLine
}

export function isServerOnline () {
  return fetch('/', {
    credentials: 'include',
    method: 'HEAD'
  })
  .then(response => response.status === 200)
  .catch(err => false)
}

export default class ConnectionMonitor {
  constructor () {
    return this
  }

  watch (interval) {
    if (isNaN(interval)) {
      throw new Error(`Watch interval should be a number greater than ${minWatchInterval}`)
    }

    this.monitor = setInterval(() => {
      if (!isOnline()) {
        this.status = Constants.NETWORK_NO_INTERNET_CONNECTION
      } else {
        isServerOnline()
          .then(isUp => {
            this.status = !isUp ?
            Constants.NETWORK_SERVER_UNRESPONSIVE :
            Constants.NETWORK_OK
          })
      }
    }, Math.max(minWatchInterval, interval))

    return this
  }

  get status () {
    return this.statusCode
  }

  set status (statusCode) {
    if (
      this.statusCode &&
      statusCode !== this.statusCode &&
      typeof this.callback === 'function'
    ) {
      this.callback(statusCode)
    }
    this.statusCode = statusCode
  }

  registerStatusChangeCallback (callback) {
    if (typeof callback !== 'function') {
      throw new Error('Status callback must be a function')
    }
    this.callback = callback
  }
}