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

export function registerNetworkCall(status, onComplete) {
  return {
    type: Types.REGISTER_NETWORK_CALL,
    status,
    onComplete
  }
}