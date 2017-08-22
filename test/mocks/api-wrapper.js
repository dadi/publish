'use strict'

const APIWrapper = function () {
  this.fieldFilters = []

  return this
}

APIWrapper.prototype.in = function (collection) {
  this.collection = collection

  return this
}

APIWrapper.prototype.whereFieldIsEqualTo = function (field, value) {
  this.fieldFilters.push({[field]: value})

  return this
}

APIWrapper.prototype.update = function (query) {
  this.query = query

  return new Promise(resolve => {
    resolve()
  })
}

APIWrapper.prototype.find = function (query) {
  this.query = query

  return new Promise(resolve => {
    resolve()
  })
}


module.exports = function () {
  return new APIWrapper()
}

module.exports.APIWrapper = APIWrapper