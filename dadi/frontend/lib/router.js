'use strict'

import {route} from 'preact-router'
import {urlHelper} from 'lib/util'

export function router({path, params, update}) {
  let newRoute = createRoute(...arguments)
  route(newRoute)
}

export function createRoute({path=window.location.pathname, params=null, update=false}) {
  let newParams

  if (update && window.location.search) {
    // Retain existing params
    newParams = urlHelper().paramsToObject(window.location.search)

  }
  if (params) {
    // Append new params to newParams object
    newParams = Object.assign({}, newParams, params)
  }
  if (newParams) {
    let encodedParams = urlHelper().paramsToString(newParams)
    return `${path}${encodedParams}`
  } else {
    return `${path}`
  }
}