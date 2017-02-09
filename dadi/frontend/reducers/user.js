import * as types from '../actions/actionTypes'

const initialState = {
  signedIn: false,
  username: null,
  users: []
}

export default function user(state = initialState, action = {}) {
  switch (action.type) {
    case types.SIGN_IN:
      return {
        ...state,
        signedIn: action.signedIn,
        username: action.username
      }

    case types.SIGN_OUT:
      return {
        ...state,
        signedIn: false,
        username: null,
        name: null
      }

    default:
      return state
  }
}
