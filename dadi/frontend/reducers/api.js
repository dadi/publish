'use strict'

import * as types from 'actions/actionTypes'

const initialState = {
  apis: [],
  status: 'canFetch'
}

export default function api(state = initialState, action = {}) {
  switch (action.type) {
    // Action: Set data for a specific API
    case types.SET_API:
      let apis = state.apis.map(api => {
        if (api._publishId === action.api._publishId) {
          return action.api
        }

        return api
      })

      return {
        ...state,
        apis
      }

    // Action: Set list of APIs
    case types.SET_API_LIST:
      return {
        ...state,
        apis: action.apis
      }

    // Action: Set API fetch status
    case types.SET_API_FETCH_STATUS:
      return {
        ...state,
        status: action.status
      }

    // Action: Set app config
    case types.SET_APP_CONFIG:
      return {
        ...state,
        apis: action.config.apis
      }

    // Action: user signed out
    case types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}
