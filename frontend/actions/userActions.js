import 'fetch'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import * as documentActions from 'actions/documentActions'

import {getApiForUrlParams, getCollectionForUrlParams} from 'lib/collection-lookup'
import apiBridgeClient from 'lib/api-bridge-client'

export function authenticate ({
  accessToken,
  accessTokenTTL,
  client,
  config,
  routes
}) {
  return {
    accessToken,
    accessTokenTTL,
    client,
    config,
    routes,
    type: Types.AUTHENTICATE
  }
}

export function registerFailedSignInAttempt (errorStatus) {
  return {
    errorStatus,
    type: Types.REGISTER_FAILED_SIGN_IN
  }
}

export function registerSaveUserAttempt () {
  return {
    type: Types.ATTEMPT_SAVE_USER
  }
}

export function setPasswordReset ({
  resetEmail
} = {}) {
  return {
    resetEmail,
    type: Types.REQUEST_PASSWORD_RESET
  }
}

export function setPasswordResetSuccess ({
  response
} = {}) {
  return {
    error: response.error,
    success: response.success,
    type: Types.REQUEST_PASSWORD_RESET_SUCCESS
  }
}

export function requestPasswordReset (resetEmail) {
  return (dispatch, getState) => {
    return runSessionQuery({path: '/session/reset-token', payload: {email: resetEmail}})
      .then(response => {
        dispatch(setPasswordReset({resetEmail}))
      })
  }
}

export function passwordReset (token, password) {
  return (dispatch, getState) =>
    runSessionQuery({path: '/session/password-reset', payload: {
      password,
      token
    }})
    .then(response => dispatch(setPasswordResetSuccess({response})))
}

/**
 * Run Session Query
 * @param  {String} options.method Request method
 * @param  {String} options.path Relative path
 * @param  {Object} options.payload Optional data payload (POST only)
 * @return {Promise} Fetch callback Promise
 */
function runSessionQuery ({
  method = 'GET',
  path = '/session',
  payload = null
} = {}) {
  let request = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    method: method
  }

  if (payload) {
    // Force POST method if there is a payload.
    if (request.method === 'GET') {
      request.method = 'POST'
    }

    // JSON stringify payload.
    request.body = JSON.stringify(payload)
  }

  return fetch(path, request).then(response =>
    response.json()
      .then(parsedResponse =>
        response.status === 200 ? parsedResponse : Promise.reject(parsedResponse)
      )
  )
}

/**
 * Save User
 * @return {Promise} API request Promise callback
 */
export function saveUser () {
  return (dispatch, getState) => {
    const currentUser = getState().user.remote

    dispatch(
      setUserStatus(Constants.STATUS_SAVING)
    )

    let api = getState().app.apiMain
    let update = getState().user.local
    let apiBridge = apiBridgeClient({
      accessToken: getState().user.accessToken,
      api
    })

    apiBridge
      .inClients()
      .whereClientIsSelf()
      .update(update)
      .then(({results}) => {
        if (results.length !== 1) {
          return dispatch(
            setUserStatus(Constants.STATUS_FAILED)
          )
        }

        dispatch(
          setRemoteUser(results[0])
        )
      })
      .catch(error => {
        dispatch(
          setUserStatus(Constants.STATUS_FAILED)
        )
      })
  }
}

export function setFieldErrorStatus (fieldName, value, error) {
  return {
    error,
    fieldName,
    type: Types.SET_USER_FIELD_ERROR_STATUS,
    value
  }
}

/**
 * Set User Status
 * @param {String} status Status of user
 */
export function setRemoteUser (user) {
  return {
    type: Types.SET_REMOTE_USER,
    user
  }
}

/**
 * Set User Status
 * @param {String} status Status of user
 */
export function setUserStatus (status) {
  return {
    status,
    type: Types.SET_USER_STATUS
  }
}

export function signIn (clientId, secret) {
  return (dispatch, getState) => {
    let apiUrl = getState().app.apiMain.host
    let options = {
      body: JSON.stringify({
        clientId,
        secret
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }

    return fetch(`${apiUrl}/token`, options)
      .then(response => response.json())
      .then(response => {
        let accessToken = response.accessToken
        let accessTokenTTL = response.expiresIn

        if (typeof accessToken !== 'string') {
          return Promise.reject(client)
        }

        return fetch(`/config?accessToken=${accessToken}`)
          .then(client => client.json())
          .then(({client, config, routes}) => {
            return dispatch(
              authenticate({
                accessToken,
                accessTokenTTL,
                client,
                config,
                routes
              })
            )
          })
      })
  }
}

export function signOut () {
  return {
    type: Types.SIGN_OUT
  }
}

export function updateLocalUser (fieldName, value) {
  return {
    fieldName,
    type: Types.UPDATE_LOCAL_USER,
    value
  }
}
