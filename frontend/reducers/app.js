'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

// These breakpoints are declared both here and in Main.css. It'd
// be great to get this DRY, but I can't think of a way at the mo.
const VIEWPORT_BREAKPOINTS = {
  'large': 1000,
  'medium': 600
}

// The interval (in ms) of network inactivity after a finished request used
// to determine whether all necessary network requests have been issued.
const NETWORK_DEBOUNCE = 200

// The default schema for a notification
const NOTIFICATION_DEFAULTS = {
  dismissAfterRouteChange: true,
  dismissAfterSeconds: 10,
  dismissOnHover: true,
  options: {},
  type: Constants.NOTIFICATION_TYPE_WARNING
}

// The initial state
const initialState = {
  breakpoint: getActiveBreakpoint(window.innerWidth),
  config: null,
  networkStatus: Constants.NETWORK_OK,
  notification: null,
  status: Constants.STATUS_IDLE
}

let debouncedNetworkCall = null

function getActiveBreakpoint (windowWidth) {
  let breakpointName = null

  for (let breakpoint in VIEWPORT_BREAKPOINTS) {
    if (windowWidth < VIEWPORT_BREAKPOINTS[breakpoint]) {
      break
    }

    breakpointName = breakpoint
  }

  return breakpointName
}

function getNotificationObject (notification) {
  const notificationObject = Object.assign({}, NOTIFICATION_DEFAULTS, notification, {
    timestamp: new Date().getTime()
  })

  return notificationObject
}

export default function app (state = initialState, action = {}) {
  switch (action.type) {

    // App action: register network call
    case Types.REGISTER_NETWORK_CALL:
      switch (action.status) {
        case Constants.STATUS_LOADING:
          // If there's a queued timer, it means we're about to declare all
          // network requestes finished. We just received a new one that is
          // starting, so this needs to be cancelled.
          if (debouncedNetworkCall !== null) {
            clearTimeout(debouncedNetworkCall)
          }

          // Something is loading from the network. If the `status` property
          // doesn't already reflect that, it needs to.
          if (state.status !== Constants.STATUS_LOADING) {
            return {
              ...state,
              status: Constants.STATUS_LOADING
            }
          }

          break

        case Constants.STATUS_IDLE:
          // We were previously loading something from the network, but now
          // the request has successfully finished.
          if (state.status === Constants.STATUS_LOADING) {
            // If there's already a queued timer, we cancel it so it can be
            // replaced with the new (most recent) one.
            if (debouncedNetworkCall !== null) {
              clearTimeout(debouncedNetworkCall)
            }

            // We queue the new timer. When the timer runs, we'll run the action,
            // sent as the `onUpdate` parameter, which will contain STATUS_COMPLETE.
            // and set the general status back to STATUS_IDLE.
            debouncedNetworkCall = setTimeout(action.onComplete, NETWORK_DEBOUNCE)
          }

          return state

        case Constants.STATUS_COMPLETE:
          return {
            ...state,
            status: Constants.STATUS_IDLE
          }
      }

      return state

    // App action: set config
    case Types.SET_APP_CONFIG:
      return {
        ...state,
        config: action.config
      }

    // App action: set network status
    case Types.SET_NETWORK_STATUS:
      return {
        ...state,
        networkStatus: action.networkStatus
      }

    // App action: set notification
    case Types.SET_NOTIFICATION:
      if (state.notification && (state.notification.message === action.notification.message)) {
        return state
      }

      return {
        ...state,
        notification: getNotificationObject(action.notification)
      }

    // App action: set screen width
    case Types.SET_SCREEN_WIDTH:
      const breakpoint = getActiveBreakpoint(action.width)

      if (breakpoint === state.breakpoint) {
        return state
      }

      return {
        ...state,
        breakpoint
      }

    // Document action: save document
    case Types.SAVE_DOCUMENT:
      if (!action.notification) {
        return state
      }

      return {
        ...state,
        notification: getNotificationObject(action.notification)
      }

    // User action: user signed out
    case Types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}
