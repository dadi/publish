'use strict'

import * as types from '../actions/actionTypes'

const initialState = {
  list: {
    results: [],
    metadata: {
      limit: 20,
      page: 1,
      offset: 0,
      totalPages: 1
    }
  },
  data: {},
  listDidLoad: false,
  listIsLoading: false,
  docDidLoad: false,
  docIsLoading: false
}

export default function document(state = initialState, action = {}) {
  switch (action.type) {
    case types.SET_DOCUMENT_LIST:
      return {
        ...state,
        listIsLoading: action.listIsLoading,
        listDidLoad: action.documents !== null,
        list: action.documents || initialState.list
      }
    case types.SET_DOCUMENT:
      return {
        ...state,
        docDidLoad: action.data !== null,
        docIsLoading: action.docIsLoading,
        data: action.data || initialState.data
      }
    default:
      return state
  }
}
