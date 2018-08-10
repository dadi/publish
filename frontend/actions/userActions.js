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

export function setAuthenticationError (error) {
  return {
    error,
    type: Types.USER_SET_AUTHENTICATION_ERROR
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

    dispatch(startAuthenticating())

    return fetch(`${apiUrl}/token`, options)
      .then(response => {
        if (response.status === 200) {
          return response.json()
        }

        return Promise.reject(response)
      })
      .then(response => {
        let accessToken = response.accessToken
        let accessTokenTTL = response.expiresIn

        if (typeof accessToken !== 'string') {
          return Promise.reject(client)
        }

        return fetch(`/config?accessToken=${accessToken}`)
          .then(response => {
            if (response.status === 200) {
              return response.json()
            }

            return Promise.reject(response)
          })
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
      .catch(error => {
        dispatch(
          setAuthenticationError(error.status)
        )
      })
  }
}

export function signOut () {
  return {
    type: Types.SIGN_OUT
  }
}

export function startAuthenticating () {
  return {
    type: Types.USER_START_AUTHENTICATING
  }
}

export function updateLocalUser (fieldName, value) {
  return {
    fieldName,
    type: Types.UPDATE_LOCAL_USER,
    value
  }
}
