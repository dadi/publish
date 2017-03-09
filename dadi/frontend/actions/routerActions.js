import * as Types from 'actions/actionTypes'

export function locationChange(payload) {
  return {
    type: Types.LOCATION_CHANGE,
    payload
  }
}
