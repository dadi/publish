'use strict'

import * as Constants from 'lib/constants'
import * as Cookies from 'js-cookie'
import * as Types from 'actions/actionTypes'
import {isValidJSON} from 'lib/util'

const initialState = {
  accessToken: Cookies.get('accessToken'),
  authEnabled: window.__auth__,
  failedSignInAttempts: 0,
  hasSignedOut: false,
  remote: window.__userData__ || null,
  resetEmail: null,
  resetError: null,
  resetSuccess: false,
  status: (window.__auth__ && !window.__userData__) ?
    Constants.STATUS_FAILED :
    Constants.STATUS_LOADED
}

export default function user (state = initialState, action = {}) {
  switch (action.type) {

    // Action: authenticate
    case Types.AUTHENTICATE:
      let client = action.client
      let expiryDate = new Date(
        Date.now() + (client.expiresIn * 1000)
      )

      Cookies.set('accessToken', client.accessToken, {
        expires: expiryDate
      })

      return {
        ...state,
        accessToken: client.accessToken,
        failedSignInAttempts: 0,
        status: Constants.STATUS_LOADED
      }

    // Action: register failed sign-in attempt
    case Types.REGISTER_FAILED_SIGN_IN:
      return {
        ...state,
        failedSignInAttempts: state.failedSignInAttempts + 1,
        status: action.errorStatus || Constants.STATUS_FAILED
      }

    case Types.REQUEST_PASSWORD_RESET:
      return {
        ...state,
        resetEmail: action.resetEmail
      }

    case Types.REQUEST_PASSWORD_RESET_SUCCESS:
      return {
        ...state,
        resetError: action.error,
        resetSuccess: action.success
      }

    // Action: set user status
    case Types.SET_USER_STATUS:
      return {
        ...state,
        status: action.status
      }

    // Action: clear user
    case Types.SIGN_OUT:
      return {
        ...initialState,
        hasSignedOut: true,
        remote: null,
        status: Constants.STATUS_FAILED
      }

    default:
      return state
  }
}
