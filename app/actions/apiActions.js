import * as Types from 'actions/actionTypes'

export function setApi(api) {
  return {
    api,
    type: Types.SET_API
  }
}

export function setApiStatus(status, error) {
  return {
    error,
    status,
    type: Types.SET_API_STATUS
  }
}
