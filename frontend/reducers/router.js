'use strict'

import * as types from 'actions/actionTypes'

const initialState = {
  action: null,
  locationBeforeTransitions: null,
  params: {}
}

export default function router (state = initialState, {
  type,
  locationBeforeTransitions,
  params,
  action
} = {}) {
  switch (type) {
    case types.LOCATION_CHANGE:
      return {
        ...state,
        action: action,
        locationBeforeTransitions: locationBeforeTransitions,
        params: params || {}
      }
    default:
      return state
  }
}