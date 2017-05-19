'use strict'

import 'fetch'
import * as Constants from 'lib/constants'

export function isOnline () {
  // Return true when property undefined
  return window.navigator.onLine !== undefined || window.navigator.onLine
}

export function isServerOnline () {
  return fetch('/', {
    credentials: 'same-origin',
    method: 'HEAD'
  })
  .then(response => response.status === 200)
  .catch(err => false)
}

class ConnectionStatus {
  constructor (interval = 2000) {
    this.watch(interval)

    return this
  }

  watch (interval) {
    this.monitor = setInterval(() => {
      if (!isOnline()) {
        this.status = Constants.NETWORK_NO_INTERNET_CONNECTION
      } else {
        isServerOnline()
          .then(isUp => {
            this.status = !isUp ? Constants.NETWORK_SERVER_UNRESPONSIVE : Constants.NETWORK_OK
          })
      }
    }, interval)
  }

  get status () {
    return this.statusCode
  }

  set status (statusCode) {
    if (this.statusCode && statusCode !== this.statusCode) {
      if (typeof this.callback === 'function') {
        this.callback(statusCode)
      }
    }
    this.statusCode = statusCode
  }

  registerStatusChangeCallback (callback) {
    this.callback = callback
  }
}

export default function ConnectionMonitor (interval) {
  return new ConnectionStatus(interval)
}