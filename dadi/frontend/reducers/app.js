'use strict'

import * as types from '../actions/actionTypes'

const initialState = {
  config: null
}

export default function app(state = initialState, action = {}) {
  switch (action.type) {
    case types.SET_APP_CONFIG:
      return {
        ...state,
        config: action.config
      }
    default:
      return state
  }
}
