import * as Types from 'actions/actionTypes'

export function setRouteParameters (parameters) {
  return {
    parameters,
    type: Types.SET_ROUTE_PARAMETERS
  }
}

export function roomChange (room) {
  return {
    room,
    type: Types.ROOM_CHANGE
  }
}
