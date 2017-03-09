'use strict'

import {route} from 'preact-router'
import {urlHelper} from 'lib/util'

export function router({path=window.location.pathname, params=null, update=false}) {
  let newParams

  if (params) {
    if (update) {
      let currentParams = urlHelper().paramsToObject(window.location.search)
      newParams = urlHelper().paramsToString(Object.assign({}, currentParams, params))
    } else {
      newParams = urlHelper().paramsToString(params)
    }
  }

  route(`${path}${decodeURIComponent(newParams) || ''}`)
  return {

  }
}