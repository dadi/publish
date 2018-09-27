import 'fetch'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import * as documentActions from 'actions/documentActions'

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
    let api = getState().app.config.apis[0]
    let apiUrl = api.host
    let requiredFeatures = [
      'aclv1',
      'i18nv2',
      'collectionsv1'
    ]

    if (api.port) {
      apiUrl += ':' + api.port
    }

    let options = {
      body: JSON.stringify({
        clientId,
        secret
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-dadi-requires': requiredFeatures.join(';')
      },
      method: 'POST'
    }

    dispatch(
      setUserStatus(Constants.STATUS_LOADING)
    )

    return fetch(`${apiUrl}/token`, options)
      .then(response => {
        let supportedFeatures = (response.headers.get('X-DADI-Supports') || '').split(';')
        let missingFeatures = requiredFeatures.filter(feature => {
          return supportedFeatures.indexOf(feature) === -1
        })

        if (missingFeatures.length > 0) {
          return Promise.reject({
            status: 501
          })
        }

        if (response.status === 200) {
          return response.json()
        }

        return Promise.reject(response)
      })
      .then(response => {
        let accessToken = response.accessToken
        let accessTokenTTL = response.expiresIn

        if (typeof accessToken !== 'string') {
          return Promise.reject({
            status: 401
          })
        }

        return fetch(`/config?accessToken=${accessToken}`)
          .then(response => {
            if (response.status === 200) {
              return response.json()
            }

            return Promise.reject(response.status)
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
        // This means that the API is unreachable.
        if (error.message === 'Failed to fetch') {
          // To understand whether the error results from a truly unreachable
          // API or from an API that is running with CORS disabled, we ping
          // the /hello with the `no-cors` mode. If that also fails, it means
          // that the API is unreachable. If it succeeds, it means that the
          // API has CORS disabled.
          return fetch(`${apiUrl}/hello`, {
            mode: 'no-cors'
          }).then(response => {
            dispatch(
              setUserStatus(Constants.STATUS_FAILED, 'NO-CORS')
            )
          }).catch(error => {
            dispatch(
              setUserStatus(Constants.STATUS_FAILED, 404)
            )
          })
        }

        dispatch(
          setUserStatus(Constants.STATUS_FAILED, error.status || 404)
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
