import * as Types from 'actions/actionTypes'

export function setAppConfig(config) {
  return {
    type: Types.SET_APP_CONFIG,
    config
  }
}

export function setScreenWidth(width) {
  return {
    type: Types.SET_SCREEN_WIDTH,
    width
  }
}