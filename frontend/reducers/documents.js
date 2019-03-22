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

    // Resetting state when user authenticates.
    case Types.AUTHENTICATE:
      return initialState

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
      const {selectedDocuments, isFilteringSelection} = action

      let newState = {
        ...state,
        selected: selectedDocuments
      }

      // If we're showing only selected documents, it means that we must remove
      // from the document list any documents that have been deselected.
      if (isFilteringSelection) {
        const newList = state.list.results.filter(document => {
          return selectedDocuments.find(({_id}) => document._id === _id)
        })
        const numberOfDocuments = newList.length

        newState.list = {
          metadata: {
            limit: numberOfDocuments,
            offset: 0,
            page: 1,
            totalCount: numberOfDocuments,
            totalPages: 1
          },
          results: newList,
        }
      }

      return newState

    // Action: user signed out
    case Types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}
