import * as types from './actionTypes'

export function setAppConfig(config) {
  return {
    type: types.SET_APP_CONFIG,
    config
  }
}
