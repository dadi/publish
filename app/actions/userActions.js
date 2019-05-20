import 'unfetch/polyfill'
import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import {batchActions} from 'lib/redux'
import apiBridgeClient from 'lib/api-bridge-client'

/**
 * Registers a successful authentication.
 *
 * @param  {String} accessToken     Access token
 * @param  {String} accessTokenTTL  TTL for the access token
 * @param  {Object} client          Client object
 * @param  {Object} config          Config object
 */
export function authenticate ({
  accessToken,
  accessTokenTTL,
  client,
  config
}) {
  return {
    accessToken,
    accessTokenTTL,
    client,
    config,
    type: Types.AUTHENTICATE
  }
}

/**
 * Registers an attempt to save changes to the current user.
 */
export function registerSaveUserAttempt () {
  return {
    type: Types.ATTEMPT_SAVE_USER
  }
}

/**
 * Saves changes to the current user.
 */
export function saveUser () {
  return (dispatch, getState) => {
    dispatch(
      setUserStatus(Constants.STATUS_SAVING)
    )

    let {api} = getState().app.config
    let update = getState().user.local
    let apiBridge = apiBridgeClient({
      accessToken: getState().user.accessToken,
      api
    })

    // The user object contains flattened properties using dot-notation
    // (e.g. data.publishFirstName). We must de-flatten these prior to
    // saving the user.
    Object.keys(update).forEach(key => {
      const [parent, child] = key.split('.')

      if (!child) return

      update[parent] = update[parent] || {}
      update[parent][child] = update[key]
      update[key] = undefined
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
        let actions = [
          setUserStatus(Constants.STATUS_FAILED, error)
        ]

        // The operation failed because the current secret was missing
        // or invalid, so we must create a validation error accordingly.
        if (error.code === 'API-0007' || error.code === 'API-0008') {
          actions.push(
            updateLocalUser({
              error: {
                currentSecret: Constants.ERROR_WRONG_PASSWORD
              },
              update: {
                currentSecret: null
              }
            })
          )
        }

        dispatch(
          batchActions(actions)
        )
      })
  }
}

/**
 * Locally stores data for the current user.
 *
 * @param  {Object} user  User object
 */
export function setRemoteUser (user) {
  return {
    type: Types.SET_REMOTE_USER,
    user
  }
}

/**
 * Sets the status of the remote user.
 *
 * @param  {String} status  Status code
 * @param  {Object} data    Optional data object
 */
export function setUserStatus (status, data) {
  return {
    data,
    status,
    type: Types.SET_USER_STATUS
  }
}

/**
 * Attempts to sign in a user with a client clientId/secret pair.
 *
 * @param  {String} clientId  Client ID
 * @param  {String} secret    Secret
 */
export function signIn (clientId, secret) {
  return (dispatch, getState) => {
    const {api} = getState().app.config
    const apiUrl = `${api.host}:${api.port}`
    const requiredFeatures = [
      'aclv1',
      'i18nv2',
      'collectionsv1',
      'mediafieldv1'
    ]
    const options = {
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
        const supportedFeatures = (response.headers.get('X-DADI-Supports') || '').split(';')
        const missingFeatures = requiredFeatures.filter(feature => {
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
        const accessToken = response.accessToken
        const accessTokenTTL = response.expiresIn

        if (typeof accessToken !== 'string') {
          return Promise.reject({
            status: 401
          })
        }

        return fetch(`/_config?accessToken=${accessToken}`)
          .then(response => {
            if (response.status === 200) {
              return response.json()
            }

            return Promise.reject(response.status)
          })
          .then(({client, config}) => {
            return dispatch(
              authenticate({
                accessToken,
                accessTokenTTL,
                client,
                config
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
          }).then(() => {
            dispatch(
              setUserStatus(Constants.STATUS_FAILED, 'NO-CORS')
            )
          }).catch(() => {
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

/**
 * Terminates the current user session.
 *
 * @param  {String} sessionHasExpired  Whether the termination was caused by
 *    an expired access token
 */
export function signOut ({
  sessionHasExpired = false
} = {}) {
  return {
    sessionHasExpired,
    type: Types.SIGN_OUT
  }
}

/**
 * Saves local changes to the current user.
 *
 * @param  {Object} error   Error update
 * @param  {Object} update  Data update
 */
export function updateLocalUser ({error = {}, update = {}}) {
  return {
    error,
    type: Types.UPDATE_LOCAL_USER,
    update
  }
}
