import * as Types from 'actions/actionTypes'

export function locationChange (locationBeforeTransitions, params) {
  return {
    locationBeforeTransitions,
    params,
    type: Types.LOCATION_CHANGE
  }
}
