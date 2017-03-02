'use strict'
import * as types from 'actions/actionTypes'

const initialState = {
  user: null
}

export default function user(state = initialState, action = {}) {
  switch (action.type) {
    case types.SIGN_IN:
      return {
        ...state,
        user: action.user
      }

    case types.SIGN_OUT:
      return {
        ...state,
        user: null
      }

    default:
      return state
  }
}
