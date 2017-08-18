'use strict'

import * as Constants from 'lib/constants'
import {bindActionCreators} from 'redux'
import {connect} from 'preact-redux'

export function connectHelper (stateMap, dispatchMap) {
  return connect((state) => {
    return {
      state: stateMap(state)
    }
  }, (dispatch) => {
    if (dispatchMap) {
      return {
        actions: dispatchMap(dispatch)
      }
    }

    return {
      dispatch
    }
  })
}

// Generates a unique ID for DOM elements
let lastId = 0

// Having a prefix is useful in case we ever decide to do
// server-side rendering. In that case, components generated
// on the server should have a different prefix from the ones
// generated on the client to avoid conflicts
const ID_PREFIX = 'c'

export function getUniqueId () {
  return `${ID_PREFIX}-${lastId++}`
}

export function objectToArray (obj, keyField) {
  if (!obj) return []

  return Object.keys(obj)
    .map(key => Object.assign({}, {[keyField || 'key']: key, value: obj[key]}))
}

export function arrayToObject (arr, keyField) {
  if (!arr.length) return null

  return Object.assign({}, ...arr.map(obj => {
    return {[obj[keyField] || 'key']: obj.value}
  }))
}

// Object and Field validation
export function isValidJSON (string) {
  if (!string || typeof string !== 'string') return

  return /^[\],:{}\s]*$/
    .test(string.replace(/\\["\\\/bfnrtu]/g, '@')
    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
}

export function isEmpty (subject) {
  return !subject || (typeof subject === 'object' && subject.length < 1)
}

export function debounce (func, wait, immediate) {
  let timeout

  // Must return standard function.
  // An arrow function here would not use arguments.
  return function () {
    let context = this
    let args = arguments
    let later = () => {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    let callNow = immediate && !timeout

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

export function throttle (func, threshold) {
  let lastCall
  let timeout

  // Must return standard function.
  // An arrow function here would not use arguments.
  return function () {
    let now = new Date().getTime()
    let args = arguments

    if (lastCall && (now < lastCall + threshold)) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        lastCall = now
        func.apply(this, args)
      }, threshold)
    } else {
      lastCall = now
      func.apply(this, args)
    }
  }
}

export function setPageTitle (title) {
  document.title = (title ? title + ' / ' : '') + 'DADI Publish'
}
