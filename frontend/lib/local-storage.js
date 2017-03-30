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

function getKeyFromContext ({collection, documentId, group}) {
  let key

  if (documentId) {
    key = documentId
  } else if (group) {
    key = `${group}/${collection.name}`
  } else {
    key = collection.name
  }

  return key
}

function read (key) {
  if (!window.localStorage) return null

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

  try {
    const serialisedItem = JSON.stringify(payload)

    window.localStorage.setItem(key, serialisedItem)

    return true
  } catch (err) {
    return false
  }
}

export function clearDocument (context) {
  return clear(getKeyFromContext(context))
}

export function readDocument (context) {
  return read(getKeyFromContext(context))
}

export function writeDocument (context, value) {
  return write(getKeyFromContext(context), value)
}
