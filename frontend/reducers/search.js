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
            isReady: false,
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
            isReady: true,
            results: action.results
          }
        }
      }

    default:
      return state
  }
}
