import * as Types from 'actions/actionTypes'

export function locationChange (locationBeforeTransitions, params, action, component) {
  return {
    action,
    component,
    locationBeforeTransitions,
    params,
    type: Types.LOCATION_CHANGE
  }
}

export function roomChange (room) {
  return {
    room,
    type: Types.ROOM_CHANGE
  }
}
