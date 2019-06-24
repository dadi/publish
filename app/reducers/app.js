import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

// These breakpoints are declared both here and in Main.css. It'd
// be great to get this DRY, but I can't think of a way at the mo.
const VIEWPORT_BREAKPOINTS = {
  large: 1000,
  medium: 600
}

// The interval (in ms) of network inactivity after a finished request used
// to determine whether all necessary network requests have been issued.
const NETWORK_DEBOUNCE = 200

// The initial state
const initialState = {
  breakpoint: getActiveBreakpoint(window.innerWidth),
  config: window.__config__,
  isLoading: false,
  networkStatus: Constants.NETWORK_OK,
  notification: null,
  status: Constants.STATUS_IDLE,
  version: window.__version__
}

let debouncedNetworkCall = null

function getActiveBreakpoint(windowWidth) {
  let breakpointName = null

  for (const breakpoint in VIEWPORT_BREAKPOINTS) {
    if (windowWidth < VIEWPORT_BREAKPOINTS[breakpoint]) {
      break
    }

    breakpointName = breakpoint
  }

  return breakpointName
}

export default function app(state = initialState, action = {}) {
  switch (action.type) {
    // App action: authenticate
    case Types.AUTHENTICATE:
      return {
        ...state,
        config: action.config
      }

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

          // Something is loading from the network. If the state doesn't already
          // reflect that, it needs to.
          if (!state.isLoading) {
            return {
              ...state,
              isLoading: true
            }
          }

          return state

        case Constants.STATUS_IDLE:
          // We were previously loading something from the network, but now
          // the request has successfully finished.
          if (state.isLoading) {
            // If there's already a queued timer, we cancel it so it can be
            // replaced with the new (most recent) one.
            if (debouncedNetworkCall !== null) {
              clearTimeout(debouncedNetworkCall)
            }

            // We queue the new timer. When the timer runs, we'll run the action
            // sent as the `onUpdate` parameter.
            debouncedNetworkCall = setTimeout(
              action.onComplete,
              NETWORK_DEBOUNCE
            )
          }

          return state

        case Constants.STATUS_COMPLETE:
        case Constants.STATUS_FAILED:
          return {
            ...state,
            isLoading: false
          }
      }

      return state

    // App action: set app status
    case Types.SET_APP_STATUS:
      return {
        ...state,
        status: action.status
      }

    // App action: set network status
    case Types.SET_NETWORK_STATUS:
      return {
        ...state,
        networkStatus: action.networkStatus
      }

    // App action: set notification
    case Types.SET_NOTIFICATION:
      if (
        state.notification &&
        state.notification.timestamp === action.notification.timestamp
      ) {
        return state
      }

      return {
        ...state,
        notification: action.notification
      }

    // App action: set screen width
    case Types.SET_SCREEN_WIDTH: {
      const breakpoint = getActiveBreakpoint(action.width)

      if (breakpoint === state.breakpoint) {
        return state
      }

      return {
        ...state,
        breakpoint
      }
    }

    // User action: user signed out
    case Types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}
