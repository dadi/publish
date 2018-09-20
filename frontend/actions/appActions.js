import 'fetch'
import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const NOTIFICATION_DEFAULTS = {
  dismissAfterRouteChange: true,
  dismissAfterSeconds: 3,
  dismissOnHover: true,
  options: {},
  type: Constants.NOTIFICATION_TYPE_WARNING
}

export function registerNetworkCall (status, onComplete) {
  return {
    onComplete,
    status,
    type: Types.REGISTER_NETWORK_CALL
  }
}

export function setNetworkStatus (networkStatus) {
  return {
    networkStatus,
    type: Types.SET_NETWORK_STATUS
  }
}

export function setNotification (notification) {
  let notificationObject = Object.assign({}, NOTIFICATION_DEFAULTS, notification, {
    timestamp: new Date().getTime()
  })

  return {
    notification: notificationObject,
    type: Types.SET_NOTIFICATION
  }
}

export function setScreenWidth (width) {
  return {
    type: Types.SET_SCREEN_WIDTH,
    width
  }
}
