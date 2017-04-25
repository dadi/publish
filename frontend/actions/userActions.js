import 'fetch'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import * as documentActions from './documentActions'

import {getApiForUrlParams, getCollectionForUrlParams} from 'lib/collection-lookup'
import apiBridgeClient from 'lib/api-bridge-client'

export function clearRemoteUser () {
  return {
    type: Types.CLEAR_REMOTE_USER
  }
}

export function loadUserFromSession () {
  return (dispatch, getState) => {
    runSessionQuery().then(user => {
      dispatch(setRemoteUser(user))
    }).catch(err => {
      dispatch(setUserStatus(Constants.STATUS_FAILED))
    })
  }
}

export function registerFailedSignInAttempt () {
  return {
    type: Types.REGISTER_FAILED_SIGN_IN
  }
}

function runSessionQuery ({
  method = 'GET',
  path = '/session',
  payload = null
} = {}) {
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

  return fetch(path, request).then(response => {
    return response.json().then(parsedResponse => {
      if (response.status === 200) {
        return parsedResponse
      }

      return Promise.reject(parsedResponse)
    })
  })
}

export function saveUser ({api, collection, user}) {
  return (dispatch, getState) => {
    const currentUser = getState().user.remote

    dispatch(documentActions.setRemoteDocumentStatus(Constants.STATUS_SAVING))

    const apiBridge = apiBridgeClient({
      api,
      collection
    }).whereFieldIsEqualTo('_id', currentUser._id)
      .whereFieldIsEqualTo('email', currentUser.email)

    apiBridge.update(user).then(response => {
      if (response.results && response.results.length) {
        const newUser = response.results[0]

        // Update store
        dispatch(documentActions.setRemoteDocument(newUser, {
          clearLocal: true
        }))
        dispatch(setRemoteUser(newUser))

        // Update session user
        updateLocalUser(newUser)
      } else {
        dispatch(documentActions.setRemoteDocumentStatus(Constants.STATUS_FAILED))
      }
    }).catch(errors => {
      const passwordField = Object.keys(collection.fields).find(fieldName => {
        return collection.fields[fieldName].publish &&
          collection.fields[fieldName].publish.subType === 'Password'
      })

      if (!passwordField) return

      let validationErrors = getState().document.validationErrors[passwordField] || []

      if (errors instanceof Array) {
        errors.forEach(error => {
          if (error.details && error.details.includes('\'WRONG_PASSWORD\'')) {
            validationErrors.push(Constants.ERROR_WRONG_PASSWORD)
          }
        })

        dispatch(documentActions.setFieldErrorStatus(
          passwordField,
          null,
          validationErrors
        ))
      }
    })
  }
}

export function setRemoteUser (user) {
  return {
    type: Types.SET_REMOTE_USER,
    user
  }
}

export function setUserStatus (status) {
  return {
    status,
    type: Types.SET_USER_STATUS
  }
}

export function signIn (email, password) {
  return (dispatch, getState) => {
    runSessionQuery({
      method: 'POST',
      payload: {
        password,
        username: email
      }
    }).then(user => {
      dispatch(setRemoteUser(user))
    }).catch(err => {
      switch (err) {
        case 'MISSING_AUTH_API':
          dispatch(setUserStatus(Constants.STATUS_NOT_FOUND))

          break

        default:
          dispatch(registerFailedSignInAttempt())
      }
    })
  }
}

export function signOut () {
  return (dispatch, getState) => {
    runSessionQuery({
      method: 'DELETE'
    }).then(response => {
      dispatch(clearRemoteUser())
    })
  }
}

function updateLocalUser (newUser) {
  return runSessionQuery({
    method: 'PUT',
    payload: newUser
  })
}
