'use strict'

// Reduce multiple arrays into single concatinated array.
export function reduce (arrays) {
  return arrays.reduce((a, b) => a.concat(b))
}