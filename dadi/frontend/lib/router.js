'use strict'

import {route} from 'preact-router'
import {urlHelper} from 'lib/util'

export function router ({path, params, update}) {
  let newRoute = createRoute(...arguments)
  route(newRoute)
}

export function createRoute ({path=window.location.pathname, params=null, update=false}) {
  let newParams

  let fullPath = typeof path === 'object' ? buildUrl(...path) : path

  if (update && window.location.search) {
    // Retain existing params
    newParams = urlHelper().paramsToObject(window.location.search)
  }

  if (params) {
    // Append new params to newParams object
    newParams = Object.assign({}, newParams, params)
  }

  if (newParams && Object.keys(newParams).length) {
    let encodedParams = urlHelper().paramsToString(newParams)
    // console.log(`${fullPath}${encodedParams}`)
    return `${fullPath}${encodedParams ? `?${encodedParams}` : ''}`
  } else {
    // console.log(`${fullPath}`)
    return `${fullPath}`
  }
}

export function buildUrl (...parts) {
  return '/' + parts.filter(part => {
    return (typeof part === 'string' || typeof part === 'number') && part !== ''
  }).join('/')
}