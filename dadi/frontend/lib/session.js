'use strict'

import 'whatwg-fetch'

/**
 * @constructor
 */
const Session = function () {}

/**
 * Is User Logged in
 * @return {Boolean} Logged in status
 */
Session.prototype.isLoggedIn = function() {
  return false
}

/**
 * Login required check
 * @param  {event} e Page navigation event
 * @return {boolean}   Is login required
 */
Session.prototype.loginRequired = function (e) {
  return e.current.attributes.Sessionenticate || false
}

Session.prototype.createSession = function ({username, password}) {
  return fetch(`/session`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({username, password})
  }).then(response => {
    return response.json().then(json => {
      return {
        signedIn: json ? true : false,
        username: json.username || null
      }
    })
  })
}

Session.prototype.getSession = function () {
  return fetch(`/session`, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    return response.json().then(json => {
      return {
        signedIn: json._id ? true : false,
        username: json.username
      }
    })
  })
}

module.exports = function () {
  return new Session()
}

module.Session = Session