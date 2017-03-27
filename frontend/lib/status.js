'use strict'

import 'fetch'

export function isOnline () {
  // Return true when property undefined
  return typeof window.navigator.onLine !== 'undefined' || window.navigator.onLine
}

export function isServerOnline () {
  return fetch('/', {
    credentials: 'same-origin',
    method: 'HEAD'
  })
  .then(response => response.status === 200)
  .catch(err => false)
}