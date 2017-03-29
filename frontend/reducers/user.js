'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const initialState = {
  local: null,
  remote: null
}

export default function user (state = initialState, action = {}) {
  switch (action.type) {

    // Action: user signed in
    case Types.SET_REMOTE_USER:
      return {
        ...state,
        local: Object.assign({}, action.user),
        remote: action.user
      }

    case Types.UPDATE_LOCAL_USER:
      return {
        ...state,
        local: {
          ...state.local,
          ...action.data
        }
      }

    // Action: user signed out
    case Types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}
