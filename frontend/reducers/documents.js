'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const initialState = {
  list: null,
  query: null,
  selectedDocuments: [],
  status: Constants.STATUS_IDLE
}

export default function document (state = initialState, action = {}) {
  switch (action.type) {

    // Action: set document list.
    case Types.SET_DOCUMENT_LIST:
      return {
        ...state,
        list: action.documents,
        query: action.query,
        status: Constants.STATUS_IDLE
      }

    // Action: clear document list.
    case Types.CLEAR_DOCUMENT_LIST:
      return {
        ...state,
        list: null,
        query: null,
        selectedDocuments: [],
        sortBy: null,
        sortOrder: null,
        status: Constants.STATUS_IDLE
      }

    // Action: set document list selection.
    case Types.SET_DOCUMENT_SELECTION:
      return {
        ...state,
        selectedDocuments: action.selectedDocuments
      }

    // Action: set document loading status.
    case Types.SET_DOCUMENT_LIST_STATUS:
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
