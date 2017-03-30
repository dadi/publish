import * as Types from 'actions/actionTypes'

export function locationChange (locationBeforeTransitions, params, action) {
  return {
    action,
    locationBeforeTransitions,
    params,
    type: Types.LOCATION_CHANGE
  }
}
