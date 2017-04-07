'use strict'

function clear (key) {
  if (!window.localStorage) return null

  try {
    window.localStorage.removeItem(key)

    return true
  } catch (err) {
    return false
  }
}

function read (key) {
  if (!window.localStorage) return null
console.log('(LS) Reading:', key)
  try {
    const item = window.localStorage.getItem(key)
    const deserialisedItem = JSON.parse(item)

    return deserialisedItem
  } catch (err) {
    return null
  }
}

function write (key, payload) {
  if (!window.localStorage) return false
console.log('(LS) Writing:', key, payload)
  try {
    const serialisedItem = JSON.stringify(payload)

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
  return write(key, value)
}
