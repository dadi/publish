'use strict'

import * as Constants from 'lib/constants'
import * as Cookies from 'js-cookie'
import * as Types from 'actions/actionTypes'

const initialState = {
  accessToken: Cookies.get('accessToken'),
  accessTokenExpiry: parseInt(Cookies.get('accessTokenExpiry')),
  hasBeenSubmitted: false,
  hasBeenValidated: false,
  isAuthenticating: false,
  isSaving: false,
  isSignedIn: Boolean(window.__client__),
  local: {},
  remote: window.__client__ || {},
  remoteError: null,
  sessionHasExpired: false,
  validationErrors: null
}

// Merges the current state with a new value for a given client property,
// which can be nested if it represents a data property
// (e.g. `data.publishFirstName`).
function mergeUpdate (current, fieldName, value) {
  let fieldNameParts = fieldName.split('.')
  let update

  if (fieldNameParts.length === 1) {
    update = {
      [fieldName]: value
    }
  } else {
    update = {
      [fieldNameParts[0]]: {
        [fieldNameParts[1]]: value
      }
    }
  }

  return {
    ...current,
    local: {
      ...current.local,
      ...update,
      data: {
        ...current.local.data,
        ...update.data
      }
    }
  }
}

function signOut (action) {
  Cookies.remove('accessToken')
  Cookies.remove('accessTokenExpiry')

  return {
    ...initialState,
    accessToken: undefined,
    isSaving: false,
    isSignedIn: false,
    sessionHasExpired: Boolean(action.sessionHasExpired)
  }
}

export default function user (state = initialState, action = {}) {
  switch (action.type) {

    case Types.SET_API_LIST:
      if (action.apis.length === 0) {
        return signOut(action)
      }

      return state

    case Types.ATTEMPT_SAVE_USER:
      return {
        ...state,
        hasBeenSubmitted: true
      }

    case Types.AUTHENTICATE:
      let {
        accessToken,
        accessTokenTTL,
        client
      } = action
      let expiryTimestamp = Date.now() + (accessTokenTTL * 1000)
      let expiryDate = new Date(expiryTimestamp)

      Cookies.set('accessToken', accessToken, {
        expires: expiryDate
      })

      Cookies.set('accessTokenExpiry', expiryTimestamp, {
        expires: expiryDate
      })

      return {
        ...state,
        accessToken,
        accessTokenExpiry: expiryTimestamp,
        failedSignInAttempts: 0,
        isSignedIn: true,
        remote: client,
        sessionHasExpired: false
      }

    case Types.REGISTER_NETWORK_ERROR:
      // We're interested in processing errors with the code API-0005 only, as
      // those signal an authentication error (i.e. the access token stored is
      // no longer valid). If that's not the error we're seeing here, there's
      // nothing for us to do. If it is, we return the result of `signOut()`.
      if (
        !action.error ||
        !action.error.code ||
        action.error.code !== Constants.API_UNAUTHORISED_ERROR
      ) {
        return state
      }

      return signOut(action)

    case Types.SET_API_STATUS:
      if (action.error === Constants.API_UNAUTHORISED_ERROR) {
        Cookies.remove('accessToken')
        Cookies.remove('accessTokenExpiry')

        return {
          ...initialState,
          accessToken: undefined,
          isSignedIn: false
        }
      }

      return state

    case Types.SET_REMOTE_USER:
      return {
        ...state,
        hasBeenSubmitted: true,
        isSaving: false,
        isSignedIn: true,
        local: {},
        remote: action.user,
        remoteError: null
      }

    case Types.SET_USER_FIELD_ERROR_STATUS:
      const {
        error = null,
        fieldName,
        value
      } = action
      const {validationErrors} = state

      // If the validation error status for the field hasn't changed, there's nothing
      // to do here, so we return the current state (avoiding a re-render).
      // Note that the weak comparison (== instead of ===) is on purpose, as we want
      // `null` and `undefined` to evaluate the same way.
      if (validationErrors && validationErrors[fieldName] == error) {
        return state
      }

      return {
        ...state,
        ...mergeUpdate(state, fieldName, value),
        hasBeenValidated: true,
        validationErrors: {
          ...state.validationErrors,
          [fieldName]: error
        }
      }

    case Types.SET_USER_STATUS:
      switch (action.status) {

        // User is signing in.
        case Constants.STATUS_LOADING:
          return {
            ...state,
            isAuthenticating: true,
            sessionHasExpired: false
          }

        // User is signing in.
        case Constants.STATUS_SAVING:
          return {
            ...state,
            isSaving: true,
            sessionHasExpired: false
          }

        // Sign in or save have failed.
        case Constants.STATUS_FAILED:
          return {
            ...state,
            isAuthenticating: false,
            isSaving: false,
            remoteError: action.data,
            sessionHasExpired: false
          }
      }

      return state

    case Types.SIGN_OUT:
      return signOut(action)

    case Types.UPDATE_LOCAL_USER:
      return mergeUpdate(
        {...state, hasBeenValidated: true},
        action.fieldName,
        action.value
      )

    default:
      return state
  }
}
