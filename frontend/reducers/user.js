'use strict'

import * as Types from 'actions/actionTypes'
import * as Constants from 'lib/constants'

const initialState = {
  remote: null,
  remoteStatus: Constants.STATUS_IDLE,
  local: null
}

export default function user(state = initialState, action = {}) {
  switch (action.type) {
    // Action: user signed in
    case Types.SET_REMOTE_USER:
      return {
        ...state,
        remote: action.user,
        local: Object.assign({}, action.user)
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
