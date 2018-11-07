'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const initialState = {
  isDeleting: false,
  isLoading: false,
  isSaving: false,
  list: null,
  query: null,
  remoteError: null,
  selected: []
}

export default function document (state = initialState, action = {}) {
  switch (action.type) {

    // Action: delete documents.
    case Types.DELETE_DOCUMENTS:
      return initialState

    // Action: set document list.
    case Types.SET_DOCUMENT_LIST:
      return {
        ...state,
        isLoading: false,
        list: action.documents,
        query: action.query,
        remoteError: null
      }

    // Action: clear document list.
    case Types.CLEAR_DOCUMENT_LIST:
      return {
        ...state,
        isLoading: false,
        list: null,
        query: null,
        selected: [],
        sortBy: null,
        sortOrder: null
      }

    // Action: set document loading status.
    case Types.SET_DOCUMENT_LIST_STATUS:
      switch (action.status) {
        case Constants.STATUS_DELETING:
          return {
            ...state,
            isDeleting: action.data
          }

        case Constants.STATUS_IDLE:
          return {
            ...state,
            isDeleting: false,
            isLoading: false,
            isSaving: false,
            remoteError: null
          }

        case Constants.STATUS_LOADING:
          return {
            ...state,
            isLoading: true
          }

        case Constants.STATUS_FAILED:
          return {
            ...state,
            isDeleting: false,
            isLoading: false,
            list: null,
            remoteError: action.data,
          }

        case Constants.STATUS_SAVING:
          return {
            ...state,
            isSaving: true
          }

        default:
          return state
      }

    // Action: set document list selection.
    case Types.SET_DOCUMENT_SELECTION:
      return {
        ...state,
        selected: action.selectedDocuments
      }

    // Action: user signed out
    case Types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}
