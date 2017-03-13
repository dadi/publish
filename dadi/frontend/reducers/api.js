'use strict'

import * as types from 'actions/actionTypes'

const initialState = {
  apis: [],
  currentCollection: null
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

    // Action: Set app config
    case types.SET_APP_CONFIG:
      return {
        ...state,
        apis: action.config.apis
      }

    // Action: user signed out
    case types.SIGN_OUT:
      return initialState

    // Actions: set document or set document list
    case types.SET_REMOTE_DOCUMENT:
    case types.SET_DOCUMENT_LIST:
      if (!action.currentCollection) return state

      let collectionSchema

      // (!) TO DO: This will need to take the group into account
      state.apis.some(api => {
        return api.collections && api.collections.some(collection => {
          if (collection.name === action.currentCollection) {
            collectionSchema = collection

            return true
          }
        })
      })

      return {
        ...state,
        currentCollection: collectionSchema
      }  

    default:
      return state
  }
}
