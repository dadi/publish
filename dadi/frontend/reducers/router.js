'use strict'

import * as types from 'actions/actionTypes'

const initialState = {
  locationBeforeTransitions: null
}

export default function router(state = initialState, {type, payload} = {}) {
  switch (type) {
    case types.LOCATION_CHANGE:
      return {
        ...state,
        locationBeforeTransitions: payload
      }
    default:
      return state
  }
}