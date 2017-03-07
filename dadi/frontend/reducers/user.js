'use strict'
import * as types from 'actions/actionTypes'

const initialState = {
  user: null
}

export default function user(state = initialState, action = {}) {
  switch (action.type) {
    // Action: user signed in
    case types.SIGN_IN:
      return {
        ...state,
        user: action.user
      }

    // Action: user signed out
    case types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}
