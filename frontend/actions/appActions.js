import * as Types from 'actions/actionTypes'

export function registerNetworkCall (status, onComplete) {
  return {
    onComplete,
    status,
    type: Types.REGISTER_NETWORK_CALL
  }
}

export function setAppConfig (config) {
  return {
    config,
    type: Types.SET_APP_CONFIG
  }
}

export function setNetworkStatus (networkStatus) {
  return {
    networkStatus,
    type: Types.SET_NETWORK_STATUS
  }
}

export function setNotification (notification) {
  return {
    notification,
    type: Types.SET_NOTIFICATION
  }
}

export function setScreenWidth (width) {
  return {
    type: Types.SET_SCREEN_WIDTH,
    width
  }
}
