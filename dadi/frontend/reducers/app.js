'use strict'

import * as types from 'actions/actionTypes'

// These breakpoints are declared both here and in Main.css. It'd
// be great to get this DRY, but I can't think of a way at the mo.
const viewportBreakpoints = {
  'medium': 600,
  'large': 1000
}

const getActiveBreakpoint = function (windowWidth) {
  let breakpointName = null

  for (var breakpoint in viewportBreakpoints) {
    if (windowWidth < viewportBreakpoints[breakpoint]) {
      break
    }

    breakpointName = breakpoint
  }

  return breakpointName
}

const initialState = {
  breakpoint: getActiveBreakpoint(window.innerWidth),
  config: null
}

export default function app (state = initialState, action = {}) {
  switch (action.type) {
    case types.SET_APP_CONFIG:
      return {
        ...state,
        config: action.config
      }

    case types.SET_SCREEN_WIDTH:
      const breakpoint = getActiveBreakpoint(action.width)

      if (breakpoint === state.breakpoint) {
        return state
      }

      return {
        ...state,
        breakpoint
      }

    default:
      return state
  }
}
