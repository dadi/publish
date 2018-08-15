'use strict'

const CollectionRoutes = require(`${paths.lib.helpers}/collection-routes`)
const config = require(paths.config)
const DadiAPI = require('@dadi/api-wrapper')
const log = require('@dadi/logger')

const Collection = function ({accessToken} = {}) {
  this.accessToken = accessToken
}

const formatAPIError = err => {
  switch (err.code) {
    case 404:
      return {
        detail: 'One or more APIs are unreachable. Please check your config.'
      }

    case 401:
      return {
        detail: 'The credentials for your API are incorrect.'
      }
  }
}

Collection.prototype.buildCollectionRoutes = function () {
  log.debug({ module: 'collection' }, 'Building collection Routes')

  return this.getCollections()
    .then(apiCollections => {
      return new CollectionRoutes().generateApiRoutes(apiCollections)
    })
    .catch(err => Promise.reject(formatAPIError(err)))
}

Collection.prototype.getCollections = function () {
  log.debug({ module: 'collection' }, 'Requesting collection list from API')

  let collections = config.get('apis').map(api => {
    let apiWrapperOptions = Object.assign({}, api, {
      accessToken: this.accessToken,
      uri: api.host
    })
    let apiWrapper = new DadiAPI(apiWrapperOptions)

    return apiWrapper.getCollections().then(res => {
      return this.getSchemas(api, res.collections)
    })
  })

  return Promise.all(collections)
}

Collection.prototype.getSchemas = function (api, collections) {
  let schemas = collections.map(collection => {
    log.debug({ module: 'collection' }, `Requesting collection schema for ${collection.slug} from API`)

    let apiWrapperOptions = Object.assign({}, api, {
      accessToken: this.accessToken,
      uri: api.host
    })
    let apiWrapper = new DadiAPI(apiWrapperOptions)

    return apiWrapper
      .useDatabase(collection.database)
      .in(collection.slug)
      .getConfig()
      .then(schema => {
        return Object.assign(
          {},
          schema,
          {slug: collection.slug}
        )
      })
  })

  return Promise.all(schemas)
}

module.exports = function (options) {
  return new Collection(options)
}

module.exports.Collection = Collection
