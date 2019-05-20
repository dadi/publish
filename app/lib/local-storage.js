'use strict'

function clear (key) {
  if (!window.localStorage) return null

  try {
    window.localStorage.removeItem(key)

    if (process.env.NODE_ENV === 'development') {
      console.log('Removing key from local storage:', key)
    }

    return true
  } catch (err) {
    return false
  }
}

function read (key) {
  if (!window.localStorage) return null

  try {
    const item = window.localStorage.getItem(key)
    const deserialisedItem = JSON.parse(item)

    if (process.env.NODE_ENV === 'development') {
      console.log(`Reading from local storage with key ${key}:`, deserialisedItem)
    }

    return deserialisedItem
  } catch (err) {
    return null
  }
}

function write (key, payload) {
  if (!window.localStorage) return false

  try {
    const serialisedItem = JSON.stringify(payload)

    if (process.env.NODE_ENV === 'development') {
      console.log(`Writing to local storage with key ${key}:`, payload)
    }

    window.localStorage.setItem(key, serialisedItem)

    return true
  } catch (err) {
    return false
  }
}

export function clearDocument (key) {
  return clear(key)
}

export function readDocument (key) {
  return read(key)
}

export function writeDocument (key, value) {
  const hasSetKeys = Object.keys(value).some(key => {
    return value[key] !== undefined
  })

  if (!hasSetKeys) return

  return write(key, value)
}
