'use strict'

// Reduce multiple arrays into single concatinated array.
export function reduce (arrays) {
  return arrays.reduce((a, b) => a.concat(b))
}

export function unique (v, i, a) {
  return a.indexOf(v) === i
}