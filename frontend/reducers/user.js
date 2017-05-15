'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const initialState = {
  failedSignInAttempts: 0,
  hasSignedOut: false,
  remote: null,
  resetEmail: null,
  resetError: null,
  resetSuccess: null,
  status: Constants.STATUS_IDLE
}

export default function user (state = initialState, action = {}) {
  switch (action.type) {

    // Action: register failed sign-in attempt
    case Types.REGISTER_FAILED_SIGN_IN:
      return {
        ...state,
        failedSignInAttempts: state.failedSignInAttempts + 1,
        status: Constants.STATUS_FAILED
      }

    // Action: set user
    case Types.SET_REMOTE_USER:
      return {
        ...state,
        failedSignInAttempts: 0,
        hasSignedOut: false,
        remote: action.user,
        status: Constants.STATUS_LOADED
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
        hasSignedOut: true
      }

    default:
      return state
  }
}
