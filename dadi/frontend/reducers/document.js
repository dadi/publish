'use strict'

import * as types from '../actions/actionTypes'

const initialState = {
  documents: {
    results: [],
    metadata: {
      limit: 20,
      page: 1,
      offset: 0,
      totalPages: 1
    }
  }
}

export default function document(state = initialState, action = {}) {
  switch (action.type) {
    case types.SET_DOCUMENT_LIST:
      return {
        ...state,
        documents: action.documents
      }
    case types.SET_DOCUMENT:
      return {
        ...state,
        document: action.document
      }
    default:
      return state
  }
}
