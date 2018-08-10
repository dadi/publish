'use strict'

import * as Constants from 'lib/constants'
import * as Cookies from 'js-cookie'
import * as Types from 'actions/actionTypes'
import {isValidJSON} from 'lib/util'

const initialState = {
  accessToken: Cookies.get('accessToken'),
  failedSignInAttempts: 0,
  failedSignInError: null,
  hasBeenSubmitted: false,
  hasBeenValidated: false,
  isAuthenticating: false,
  isSignedIn: Boolean(window.__client__),
  local: {},
  remote: window.__client__ || {},
  validationErrors: null
}

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

export default function user (state = initialState, action = {}) {
  switch (action.type) {

    // Action: force local user to be validated.
    case Types.ATTEMPT_SAVE_USER:
      return {
        ...state,
        hasBeenSubmitted: true
      }

    // Action: authenticate
    case Types.AUTHENTICATE:
      let {
        accessToken,
        accessTokenTTL,
        client
      } = action
      let expiryDate = new Date(
        Date.now() + (accessTokenTTL * 1000)
      )

      Cookies.set('accessToken', accessToken, {
        expires: expiryDate
      })

      return {
        ...state,
        accessToken,
        failedSignInAttempts: 0,
        isSignedIn: true,
        remote: client
      }

    // Action: register failed sign-in attempt
    case Types.REGISTER_FAILED_SIGN_IN:
      return {
        ...state,
        failedSignInAttempts: state.failedSignInAttempts + 1,
        isSignedIn: false
      }

    case Types.SET_API_STATUS:
      if (action.error === Constants.API_UNAUTHORISED_ERROR) {
        Cookies.remove('accessToken')

        return {
          ...initialState,
          accessToken: undefined
        }
      }

      return state

    case Types.SET_REMOTE_USER:
      return {
        ...state,
        hasBeenSubmitted: true,
        isSignedIn: true,
        local: {},
        remote: action.user
      }

    // Document action: set field error status
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

    // Action: set user status
    case Types.SET_USER_STATUS:
      return {
        ...state,
        status: action.status
      }

    // Action: clear user
    case Types.SIGN_OUT:
      Cookies.remove('accessToken')

      return {
        ...initialState,
        accessToken: undefined,
        isSignedIn: false
      }

    // Action: update local user
    case Types.UPDATE_LOCAL_USER:
      return mergeUpdate(
        {...state, hasBeenValidated: true},
        action.fieldName,
        action.value
      )

    case Types.USER_START_AUTHENTICATING:
      return {
        ...state,
        isAuthenticating: true
      }

    case Types.USER_SET_AUTHENTICATION_ERROR:
      return {
        ...state,
        failedSignInError: action.error,
        isAuthenticating: false
      }

    default:
      return state
  }
}
