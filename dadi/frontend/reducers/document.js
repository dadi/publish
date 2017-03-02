'use strict'

import * as types from 'actions/actionTypes'

const initialState = {
  list: null,
  data: null,
  collection: null,
  listIsLoading: false,
  docIsLoading: false
}

export default function document(state = initialState, action = {}) {
  switch (action.type) {
    // Action: set document list
    case types.SET_DOCUMENT_LIST:
      return {
        ...state,
        listIsLoading: false,
        list: action.documents || initialState.list,
        collection: action.collection || initialState.collection
      }

    // Action: set document loading status
    case types.SET_DOCUMENT_LIST:
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
