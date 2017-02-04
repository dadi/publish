'use strict'

import 'whatwg-fetch'

const Api = function (options) {
  this.query = {}
  this.options = options
  return this
}

Api.prototype.in = function (collection) {
  this.collection = collection
  return this
}

Api.prototype.whereFieldExists = function (field) {
  this.query[field] = {"$neq": null}
  return this
}

Api.prototype.find = function (opts) {
  return fetch(`/db/${this.collection}`, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    return response.json().then(json => {
      return opts.extractResults ? json.results : json
    })
  })
  return this.query
}

module.exports = function (options) {
  return new Api(options)
}