'use strict'

const Api = require(`${paths.lib.models}/api`)
const CollectionRoutes = require(`${paths.lib.helpers}/collection-routes`)
const config = require(paths.config)

const Collection = function () {

}

Collection.prototype.buildCollectionRoutes = function () {
  // new Api(config)
  return this.getCollections()
    .then(apiCollections => new CollectionRoutes(apiCollections))
}

Collection.prototype.getCollections = function () {
  return Promise.all(
    config
      .get('apis')
      .map(api => new Api(api)
        .getCollections()
        .then(res => this.getSchemas(api, res.collections))
      )
  )
}

Collection.prototype.getSchemas = function (api, collections) {
  return Promise.all(
    collections
      .map(collection => new Api(api)
        .in(collection.slug)
        .getConfig()
        .then(schema => Object.assign(schema, {slug: collection.slug})))
  )
}

module.exports = function () {
  return new Collection()
}

module.exports.Collection = Collection
