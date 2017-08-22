'use strict'

const APIWRapperMock = function () {
  this.fieldFilters = []

  return this
}

APIWRapperMock.prototype.in = function (collection) {
  this.collection = collection

  return this
}

APIWRapperMock.prototype.whereFieldIsEqualTo = function (field, value) {
  this.fieldFilters.push({[field]: value})

  return this
}

APIWRapperMock.prototype.update = function (query) {
  this.query = query

  return new Promise(resolve => {
    resolve()
  })
}


module.exports = function () {
  return new APIWRapperMock()
}