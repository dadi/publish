'use strict'

// Reduce multiple arrays into single concatinated array.
export function reduce (arrays) {
  if (!Array.isArray(arrays)) return

  return arrays.reduce((a, b) => a.concat(b))
}