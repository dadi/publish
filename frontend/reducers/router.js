'use strict'

import * as Types from 'actions/actionTypes'

const initialState = {
  action: null,
  locationBeforeTransitions: null,
  parameters: {},
  room: null,
  search: {}
}

export default function router (state = initialState, action = {}) {
  switch (action.type) {
    case Types.LOCATION_CHANGE:
      let {locationBeforeTransitions, search} = action

      return {
        ...state,
        action: action.action,
        locationBeforeTransitions,
        search: search || {}
      }

    case Types.ROOM_CHANGE:
      return {
        ...state,
        room: action.room
      }

    case Types.SET_ROUTE_PARAMETERS:
      return {
        ...state,
        parameters: action.parameters
      }

    default:
      return state
  }
}