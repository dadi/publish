'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

export const initialState = {
  apis: [],
  error: undefined,
  isLoading: false,
  paths: window.__documentRoutes__,
  remoteError: null
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
        isLoading: false,
        status: Constants.STATUS_IDLE
      }

    // Action: Set status of API
    case Types.SET_API_STATUS:
      if (action.error === Constants.API_UNAUTHORISED_ERROR) {
        return initialState
      }

      switch (action.status) {
        case Constants.STATUS_LOADING:
        case Constants.STATUS_SAVING:
          return {
            ...state,
            isLoading: true
          }

        // Fetch or save have failed.
        case Constants.STATUS_FAILED:
          return {
            ...state,
            isLoading: false,
            remoteError: action.data || 500
          }
      }

      return state

    // Action: user signed out
    case Types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}
