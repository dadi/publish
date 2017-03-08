import * as types from 'actions/actionTypes'

export function locationChange(payload) {
  return {
    type: types.LOCATION_CHANGE,
    payload
  }
}

