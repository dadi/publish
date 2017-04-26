'use strict'

import * as Types from 'actions/actionTypes'

const initialState = {
  action: null,
  locationBeforeTransitions: null,
  params: {},
  room: null
}

export default function router (state = initialState, {
  type,
  locationBeforeTransitions,
  params,
  action,
  room
} = {}) {
  switch (type) {
    case Types.LOCATION_CHANGE:
      return {
        ...state,
        action: action,
        locationBeforeTransitions,
        params: params || {}
      }
    case Types.ROOM_CHANGE:
      return {
        ...state,
        room
      }
    default:
      return state
  }
}