import 'fetch'
import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const NOTIFICATION_DEFAULTS = {
  dismissAfterRouteChange: true,
  dismissAfterSeconds: 10,
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

export function loadAppConfig (config) {
  return (dispatch, getState) => {
    dispatch(setAppStatus(Constants.STATUS_LOADING))

    fetch('/config', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET'
    }).then(response => {
      return response.json()
    }).then(parsedResponse => {
      dispatch({
        config: parsedResponse,
        type: Types.SET_APP_CONFIG
      })
    })
    .catch(err => {
      dispatch(setAppStatus(Constants.STATUS_FAILED))
    })
  }
}

export function setAppStatus (status) {
  return {
    status,
    type: Types.SET_APP_STATUS
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
