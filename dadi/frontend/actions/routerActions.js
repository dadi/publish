import * as Types from 'actions/actionTypes'

export function locationChange(locationBeforeTransitions, params) {
  return {
    type: Types.LOCATION_CHANGE,
    locationBeforeTransitions,
    params
  }
}
