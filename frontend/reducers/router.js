'use strict'

import * as types from 'actions/actionTypes'

const initialState = {
  locationBeforeTransitions: null,
  params: null
}

export default function router(state = initialState, {
  type,
  locationBeforeTransitions,
  params
} = {}) {
  switch (type) {
    case types.LOCATION_CHANGE:
      return {
        ...state,
        locationBeforeTransitions: locationBeforeTransitions,
        params: params || null
      }
    default:
      return state
  }
}