'use strict'

import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'

export function bindActions (actions) {
  return dispatch => ({
    ...bindActionCreators(actions, dispatch)
  })
}

export function connectHelper (stateMap, dispatchMap) {
  return connect((state) => {
    return {
      state: stateMap(state)
    }
  }, (dispatch) => {
    return {
      actions: dispatchMap(dispatch)
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

// Object and Field validation
export function isValidJSON (string) {
  if (!string) return

  return /^[\],:{}\s]*$/.test(string.replace(/\\["\\\/bfnrtu]/g, '@')
    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
}

export function isEmpty (subject) {
  return subject === undefined || subject === null || (typeof subject === 'object' && subject.length < 1)
}

export function debounce (func, wait, immediate) {
  var timeout

  return function () {
    var context = this, args = arguments
    var later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

// Styles
const Style = function (styles, ...initClasses) {
  this.classes = initClasses
  this.styles = styles
}

Style.prototype.add = function (className) {
  if ((typeof className === 'string') && this.styles[className]) {
    this.classes.push(className)
  }

  return this
}

Style.prototype.addIf = function (className, condition) {
  console.log('--> condition_', condition)
  if (!condition) return this

  return this.add(className)
}

Style.prototype.getClasses = function () {
  return this.classes.map(className => this.styles[className]).join(' ')
}

export { Style }
