import 'fetch'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import * as documentActions from 'actions/documentActions'

import {getApiForUrlParams, getCollectionForUrlParams} from 'lib/collection-lookup'
import apiBridgeClient from 'lib/api-bridge-client'
import {batchActions} from 'lib/redux'

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

export function registerSaveUserAttempt () {
  return {
    type: Types.ATTEMPT_SAVE_USER
  }
}

export function saveUser () {
  return (dispatch, getState) => {
    const currentUser = getState().user.remote

    dispatch(
      setUserStatus(Constants.STATUS_SAVING)
    )

    let api = getState().app.config.apis[0]
    let update = getState().user.local
    let apiBridge = apiBridgeClient({
      accessToken: getState().user.accessToken,
      api
    })

    if (update.secret) {
      let parsedSecret = JSON.parse(update.secret)

      update.currentSecret = parsedSecret.current
      update.secret = parsedSecret.new
    }

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
        let actions = [
          setUserStatus(Constants.STATUS_FAILED)
        ]

        // The operation failed because the current secret was missing
        // or invalid, so we must create a validation error accordingly.
        if (error.code === 'API-0007' || error.code === 'API-0008') {
          actions.push(
            setFieldErrorStatus('secret', null, Constants.ERROR_WRONG_PASSWORD)
          )
        }

        dispatch(
          batchActions(actions)
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

export function setRemoteUser (user) {
  return {
    type: Types.SET_REMOTE_USER,
    user
  }
}

export function setUserStatus (status, data) {
  return {
    data,
    status,
    type: Types.SET_USER_STATUS
  }
}

export function signIn (clientId, secret) {
  return (dispatch, getState) => {
    let apiUrl = getState().app.config.apis[0].host
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

    dispatch(
      setUserStatus(Constants.STATUS_LOADING)
    )

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
          setUserStatus(Constants.STATUS_FAILED, error.status)
        )
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
