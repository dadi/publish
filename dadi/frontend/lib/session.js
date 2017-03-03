'use strict'

import 'fetch'

/**
 * @constructor
 */
const Session = function () {}

/**
 * Builds a user object from the app endpoint response.
 *
 * @param {object} The response from the app endpoint.
 *
 * @return {object} The user object.
 */
Session.prototype.buildUserObject = function (user) {
  if (!user || user.noAuth) return null

  return {
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username
  }
}

/**
 * Is User Logged in
 *
 * @return {Boolean} Logged in status
 */
Session.prototype.isLoggedIn = function() {
  return false
}

/**
 * Login required check
 *
 * @param {event} e Page navigation event
 *
 * @return {boolean} Is login required
 */
Session.prototype.loginRequired = function (e) {
  return e.current.attributes.Sessionenticate || false
}

/**
 * Issues a request to the app endpoint to create a session.
 *
 * @param {object} Object containing the username and password.
 *
 * @return {object} The corresponding user object.
 */
Session.prototype.createSession = function ({username, password}) {
  return fetch(`/session`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({username, password})
  }).then(response => {
    return response.json().then(this.buildUserObject)
  })
}

/**
 * Issues a request to the app endpoint to destroy the current session
 *
 * @return {object} The corresponding user object.
 */
Session.prototype.destroy = function () {
  return fetch(`/session/destroy`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
  }).then(response => {
    console.log("DONE")
    return response
  })
}

/**
 * Retrieves the current active session from the app endpoint.
 *
 * @return {object} The corresponding user object.
 */
Session.prototype.getSession = function () {
  return fetch(`/session`, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    return response.json().then(this.buildUserObject)
  })
}

module.exports = function () {
  return new Session()
}

module.Session = Session