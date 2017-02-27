import * as types from 'actions/actionTypes'

export function setAppConfig(config) {
  return {
    type: types.SET_APP_CONFIG,
    config
  }
}

export function setScreenWidth(width) {
  return {
    type: types.SET_SCREEN_WIDTH,
    width
  }
}