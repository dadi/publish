'use strict'

import * as types from '../actions/actionTypes'

const initialState = {
  apis: config.apis.map((api, index) => {
    return Object.assign({}, api, {_index: index})
  }),
  status: 'canFetch'
}

export default function api(state = initialState, action = {}) {
  switch (action.type) {
    case types.SET_API_LIST:
      return {
        ...state,
        apis: action.apis
      }
    case types.SET_API_FETCH_STATUS:
      return {
        ...state,
        status: action.status
      }
    default:
      return state
  }
}
