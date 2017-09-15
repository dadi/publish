'use strict'

const DadiAPI = require('@dadi/api-wrapper')
const CollectionRoutes = require(`${paths.lib.helpers}/collection-routes`)
const config = require(paths.config)

const Collection = function () {

}

Collection.prototype.buildCollectionRoutes = function () {
  return this.getCollections()
    .then(apiCollections => new CollectionRoutes().generateApiRoutes(apiCollections))
}

Collection.prototype.getCollections = function () {
  return Promise.all(
    config
      .get('apis')
      .map(api => {
        return new DadiAPI(Object.assign(api, {uri: api.host}))
        .getCollections()
        .then(res => this.getSchemas(api, res.collections))
      })
  )
}

Collection.prototype.getSchemas = function (api, collections) {
  return Promise.all(
    collections
      .map(collection => {
        return new DadiAPI(Object.assign(api, {uri: api.host}))
        .useDatabase(collection.database)
        .in(collection.slug)
        .getConfig()
        .then(schema => Object.assign(schema, {slug: collection.slug}))
      })
  )
}

module.exports = function () {
  return new Collection()
}

module.exports.Collection = Collection
