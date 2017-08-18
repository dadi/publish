'use strict'

class ArrayHelper {

  // Merge nested arrays.
  reduce (arrays) {
    if (!Array.isArray(arrays)) return

    return arrays
      .reduce((a, b) => {
        return Array.isArray(a) && Array.isArray(b) && a.concat(b)
      })
  }

  // Remove duplicate values in array.
  unique (value, index, array) {
    if (!Array.isArray(array)) return

    return array.indexOf(value) === index
  }
}
module.exports = new ArrayHelper()
