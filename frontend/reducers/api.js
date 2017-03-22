'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const initialState = {
  apis: [],
  status: Constants.STATUS_IDLE
}

export default function api(state = initialState, action = {}) {
  switch (action.type) {

    // Action: Set data for a specific API
    case Types.SET_API:
      const apis = state.apis.map(api => {
        if (api._publishId === action.api._publishId) {
          return action.api
        }

        return api
      })

      // Whenever we add the schema for an API, we check to see how many APIs
      // we have without collections (i.e. how many are still loading). If
      // there are none, we change the status to idle.
      const apisWithoutCollections = apis.some(api => !api.hasCollections)
      const status = apisWithoutCollections ? state.status : Constants.STATUS_IDLE

      return {
        ...state,
        apis,
        status
      }

    // Action: Set status of API
    case Types.SET_API_STATUS:
      return {
        ...state,
        status: action.status
      }

    // Action: Set app config
    case Types.SET_APP_CONFIG:
      return {
        ...state,
        apis: action.config.apis
      }

    // Action: user signed out
    case Types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}
