'use strict'

const config = require(paths.config)
const DadiAPI = require('@dadi/api-wrapper')
const log = require('@dadi/logger')

const REGEX_NUMBER = '[^\\d+$]'
const REGEX_DOCUMENT_ID = '[^(?:[a-f0-9]{24}|[a-f0-9]{32}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})]'
const REGEX_SLUG = '[^[a-z-]]'

const Collection = function ({accessToken} = {}) {
  this.accessToken = accessToken
}

Collection.prototype.buildCollectionRoutes = function () {
  log.debug({ module: 'collection' }, 'Building collection Routes')

  let routes = {
    create: [
      // Create a new document, pointing to a specific section.
      `:collection${REGEX_SLUG}/new/:section?`,

      // Create a new document in a collection within a group,
      // pointing to a specific section.
      `:group${REGEX_SLUG}/:collection${REGEX_SLUG}/new/:section?`
    ],
    edit: [
      // Edit a document with a given ID, pointing to a specific section.
      `:collection${REGEX_SLUG}/:documentId${REGEX_DOCUMENT_ID}/:section?`,

      // Edit a document in a collection within a group, pointing to a
      // specific section.
      `:group${REGEX_SLUG}/:collection${REGEX_SLUG}/:documentId${REGEX_DOCUMENT_ID}/:section?`
    ],
    list: [
      // List documents in a collection at a given page.
      `:collection${REGEX_SLUG}/:page?${REGEX_NUMBER}`,

      // Selects a document to be assigned to a reference field of a
      // document that is being created, with pagination.
      `:collection${REGEX_SLUG}/new/select/:referencedField/:page?${REGEX_NUMBER}`,

      // Selects a document to be assigned to a reference field of an
      // existing document with a given ID, with pagination.
      `:collection${REGEX_SLUG}/:documentId${REGEX_DOCUMENT_ID}/select/:referencedField/:page?${REGEX_NUMBER}`,

      // List documents in a collection within a group, at a given page.
      `:group${REGEX_SLUG}/:collection${REGEX_SLUG}/:page?${REGEX_NUMBER}`,

      // Selects a document to be assigned to a reference field of a
      // document that is being created in a collection within a group,
      // with pagination.
      `:group${REGEX_SLUG}/:collection${REGEX_SLUG}/new/select/:referencedField/:page?${REGEX_NUMBER}`,

      // Selects a document to be assigned to a reference field of an
      // existing document with a given ID, in a collection within a
      // group, with pagination.
      `:group${REGEX_SLUG}/:collection${REGEX_SLUG}/:documentId${REGEX_DOCUMENT_ID}/select/:referencedField/:page?${REGEX_NUMBER}`
    ]
  }

  return Promise.resolve(routes)
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
