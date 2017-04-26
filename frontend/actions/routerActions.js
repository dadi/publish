import * as Types from 'actions/actionTypes'

export function locationChange (locationBeforeTransitions, params, action) {
  return {
    action,
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
