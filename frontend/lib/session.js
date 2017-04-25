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
  if (!user) return null
  if (user.err) return user

  return user
}

/**
 * Issues a request to the app endpoint to create a session.
 *
 * @param {object} Object containing the email and password.
 *
 * @return {object} The corresponding user object.
 */
Session.prototype.createSession = function ({email, password}) {
  return this.query({
    method: 'POST',
    payload: {
      password,
      username: email
    }
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
  return this.query({method: 'POST', path: '/session/destroy'})
}

/**
 * Query
 * @param  {String} path    Request URL path
 * @param  {String} method  Request method
 * @param  {Object} payload Payload object (optional)
 * @return {Promise}        Response callback
 */
Session.prototype.query = function ({path = '/session', method = 'GET', payload = null}) {
  let request = {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    method: method
  }

  if (payload) {
    request.body = JSON.stringify(payload)
  }

  return fetch(path, request)
}

/**
 * Retrieves the current active session from the app endpoint.
 *
 * @return {object} The corresponding user object.
 */
Session.prototype.getSession = function () {
  return this.query({}).then(response => {
    return response.json().then(this.buildUserObject)
  })
}

module.exports = function () {
  return new Session()
}

module.exports.errors = {
  AUTH_FAILED: 'Email not found or password incorrect.',
  MISSING_AUTH_API: 'Authentication API unreachable.',
  undefined: 'Unknown error'
}

module.exports.Session = Session