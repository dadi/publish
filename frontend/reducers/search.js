'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

export default function search (state = {}, action = {}) {
  switch (action.type) {

    case Types.COLLECTION_SEARCH_START:
      return {
        ...state,
        [action.context]: {
          ...state[action.context],
          [action.term]: {
            isLoading: true,
            results: [],
            timestamp: action.timestamp,
          }
        }
      }

    case Types.COLLECTION_SEARCH_FINISH:
      return {
        ...state,
        [action.context]: {
          ...state[action.context],
          [action.term]: {
            ...state[action.context][action.term],
            isLoading: false,
            results: action.results
          }
        }
      }

    default:
      return state
  }
}
