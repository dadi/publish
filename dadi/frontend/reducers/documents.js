'use strict'

import * as types from 'actions/actionTypes'
import * as Constants from 'lib/constants'

const initialState = {
  list: null,
  status: Constants.STATUS_IDLE,
  sortBy: null,
  sortOrder: null
}

export default function document(state = initialState, action = {}) {
  switch (action.type) {
    // Action: set document list
    case types.SET_DOCUMENT_LIST:
      return {
        ...state,
        status: Constants.STATUS_IDLE,
        list: action.documents,
        sortBy: action.sortBy,
        sortOrder: action.sortOrder
      }

    // Action: clear document list
    case types.CLEAR_DOCUMENT_LIST:
      return {
        ...state,
        status: Constants.STATUS_IDLE,
        list: null,
        sortBy: null,
        sortOrder: null
      }

    // Action: set document loading status
    case types.SET_DOCUMENT_LIST_STATUS:
      return {
        ...state,
        status: action.status
      }

    // Action: user signed out
    case types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}
