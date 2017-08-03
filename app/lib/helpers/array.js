'use strict'

class ArrayHelper {
  reduce (arrays) {
    return arrays.reduce((a, b) => a.concat(b))
  }
  unique (v, i, a) {
    return a.indexOf(v) === i
  }
}
module.exports = new ArrayHelper()
