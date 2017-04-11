'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const initialState = {
  apis: [],
  status: Constants.STATUS_IDLE
}

export default function api (state = initialState, action = {}) {
  switch (action.type) {

    // Action: set API list
    case Types.SET_API_LIST:
      return {
        ...state,
        apis: action.apis,
        status: Constants.STATUS_IDLE
      }

    // Action: Set status of API
    case Types.SET_API_STATUS:
      return {
        ...state,
        status: action.status
      }

    // Action: user signed out
    case Types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}
