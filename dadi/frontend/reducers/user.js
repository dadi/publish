'use strict'
import * as types from 'actions/actionTypes'

const initialState = {
  signedIn: null,
  email: null,
  users: []
}

export default function user(state = initialState, action = {}) {
  switch (action.type) {
    case types.SIGN_IN:
      return {
        ...state,
        signedIn: action.signedIn,
        email: action.email
      }

    case types.SIGN_OUT:
      return {
        ...state,
        signedIn: false,
        email: null,
        name: null
      }

    default:
      return state
  }
}
