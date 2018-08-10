'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

export const initialState = {
  apis: [],
  error: undefined,
  paths: window.__documentRoutes__,
  status: Constants.STATUS_IDLE
}

export default function api (state = initialState, action = {}) {
  switch (action.type) {

    // App action: authenticate
    case Types.AUTHENTICATE:
      return {
        ...state,
        paths: action.routes
      }

    // Action: set API list
    case Types.SET_API_LIST:
      return {
        ...state,
        apis: action.apis,
        status: Constants.STATUS_IDLE
      }

    // Action: Set status of API
    case Types.SET_API_STATUS:
      if (action.error === Constants.API_UNAUTHORISED_ERROR) {
        return initialState
      }

      return {
        ...state,
        error: action.error,
        status: action.status
      }

    // Action: user signed out
    case Types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}
