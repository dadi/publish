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
  if (
    !(obj && typeof obj === 'object') ||
    !(keyField && typeof keyField === 'string')
  ) return []

  return Object.keys(obj)
    .map(key => Object.assign({}, {[keyField || 'key']: key, value: obj[key]}))
}

// To do - move to util.array
export function arrayToObject (arr, keyField) {
  if (!arr || !Array.isArray(arr) || !arr.length) return null

  return Object.assign({},
    ...arr
      .map(obj => {
        if (!obj.value || !obj[keyField]) return

        return {[obj[keyField] || 'key']: obj.value}
      })
      .filter(Boolean)
  )
}

// Object and Field validation
export function isValidJSON (string) {
  if (!string || typeof string !== 'string') return

  return /^[\],:{}\s]*$/
    .test(string.replace(/\\["\\\/bfnrtu]/g, '@')
    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
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
    const now = new Date().getTime()
    const args = arguments

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
  if (typeof document === 'undefined') {
    return
  }

  const isValidTitle = title && (typeof title === 'string' || typeof title === 'number')

  document.title = `${isValidTitle ? title + ' / ' : ''}DADI Publish`
}
