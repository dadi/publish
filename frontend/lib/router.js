'use strict'

import {route} from 'preact-router'
import {urlHelper} from 'lib/util/url-helper'

export function router ({path, params, update}) {
  let newRoute = createRoute(...arguments)

  route(newRoute)
}

export function createRoute ({path = window.location.pathname, params = null, update = false}) {
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

    return `${fullPath}${encodedParams ? `?${encodedParams}` : ''}`
  } else {
    return `${fullPath}`
  }
}

export function buildUrl (...parts) {
  return (/^(http|https)/.test(parts[0]) ? '' : '/') + (parts.filter(part => {
    return (typeof part === 'string' || typeof part === 'number') && part !== ''
  })
    .join('/')
    .replace(/^\/|\/$/g, ''))
}