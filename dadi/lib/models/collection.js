'use strict'

const DB = require(paths.lib.db)
const _ = require('underscore')

const Collection =  function () {
  this.db = new DB()
}

Collection.prototype.getCollectionsByApi = function (apiId) {
  // return this.db.results().get({collection: 'collections', filter: {api: {_id: apiId}}})
  return this.db.results().get({collection: 'collections', filter: {api: apiId}})
}

Collection.prototype.insert = function (collections, api) {
  if (api) {
    collections = _.map(collections, (collection) => {
      // collection.api = {_id: api._id}
      collection.api = api._id
      return collection
    })
  }
  return this.db.post({collection: 'collections'}, collections)
}

Collection.prototype.update = function (collections) {
  return this.db.results().put({collection: 'collections'}, collections)
}

module.exports = function () {
  return new Collection()
}

module.exports.Collection = Collection