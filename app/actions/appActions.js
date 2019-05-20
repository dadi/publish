import 'unfetch/polyfill'
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

export function registerNetworkError (error) {
  return {
    error,
    type: Types.REGISTER_NETWORK_ERROR
  }
}

export function setNetworkStatus (networkStatus) {
  return {
    networkStatus,
    type: Types.SET_NETWORK_STATUS
  }
}

export function setNotification (notification) {
  const notificationObject = {
    ...NOTIFICATION_DEFAULTS,
    ...notification,
    timestamp: new Date().getTime()
  }

  return dispatch => {
    // We're using a setTimeout to defer the `dispatch` to the event loop,
    // so that we can fire a notification immediately before unmounting a
    // component.
    setTimeout(() => {
      dispatch({
        notification: notificationObject,
        type: Types.SET_NOTIFICATION
      })
    }, 0)
  }
}

export function setScreenWidth (width) {
  return {
    type: Types.SET_SCREEN_WIDTH,
    width
  }
}
