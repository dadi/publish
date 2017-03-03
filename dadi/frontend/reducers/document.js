'use strict'

import * as types from 'actions/actionTypes'

const initialState = {
  list: null,
  data: null,
  collection: null,
  listIsLoading: false,
  docIsLoading: false,
  sortBy: null,
  sortOrder: null
}

export default function document(state = initialState, action = {}) {
  switch (action.type) {
    // Action: clear document list
    case types.CLEAR_DOCUMENT_LIST:
      return {
        ...state,
        listIsLoading: false,
        list: null,
        collection: null
      }

    // Action: set document list
    case types.SET_DOCUMENT_LIST:
      return {
        ...state,
        listIsLoading: false,
        list: action.documents,
        collection: action.collection,
        sortBy: action.sortBy,
        sortOrder: action.sortOrder
      }

    // Action: set document loading status
    case types.SET_DOCUMENT_LOADING_STATUS:
      return {
        ...state,
        listIsLoading: action.isLoading
      }

    // Action: set document
    case types.SET_DOCUMENT:
      return {
        ...state,
        docIsLoading: action.docIsLoading,
        data: action.data || initialState.data
      }

    default:
      return state
  }
}
