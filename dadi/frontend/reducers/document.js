'use strict'

import * as Types from 'actions/actionTypes'
import * as Constants from 'lib/constants'

const initialState = {
  data: null,
  status: Constants.STATUS_IDLE
}

export default function document(state = initialState, action = {}) {
  switch (action.type) {
    // Action: set document
    case Types.SET_DOCUMENT:
      return {
        ...state,
        status: Constants.STATUS_IDLE,
        data: action.document
      }

    // Action: clear document
    case Types.CLEAR_DOCUMENT:
      return {
        ...state,
        status: Constants.STATUS_IDLE,
        data: null
      }

    // Action: set document status
    case Types.SET_DOCUMENT_STATUS:
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
