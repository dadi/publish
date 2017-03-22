import * as Types from 'actions/actionTypes'

export function setAppConfig(config) {
  return {
    config,
    type: Types.SET_APP_CONFIG
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
    onComplete,
    status,
    type: Types.REGISTER_NETWORK_CALL
  }
}