'use strict'

import 'unfetch'

const APIWrapper = require('@dadi/api-wrapper-core')

const apiBridgeFetch = function (requestObject) {
  return fetch('/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin',
    body: JSON.stringify(requestObject)
  }).then(response => {
    return response.json()
  })
}

const buildAPIBridgeClient = function (api, preventFetch) {
  if (!api) {
    throw 'buildAPIBridgeClient: Missing API'
    return
  }
  const { _publishId, host, port, version, database } = api

  const APIBridgeClient = function () {
    this._publishId = _publishId
    this.preventFetch = preventFetch
  }

  APIBridgeClient.prototype = new APIWrapper({
    uri: host,
    port,
    version,
    database
  })

  APIBridgeClient.prototype._find = APIBridgeClient.prototype.find
  APIBridgeClient.prototype._getCollections = APIBridgeClient.prototype.getCollections
  APIBridgeClient.prototype._getStatus = APIBridgeClient.prototype.getStatus
  APIBridgeClient.prototype._getConfig = APIBridgeClient.prototype.getConfig

  APIBridgeClient.prototype.find = function () {
    return this.serveQuery(this._find(arguments))
  }

  APIBridgeClient.prototype.getCollections = function () {
    return this.serveQuery(this._getCollections(arguments))
  }
  APIBridgeClient.prototype.getStatus = function () {
    return this.serveQuery(this._getStatus(arguments))
  }

  APIBridgeClient.prototype.getConfig = function () {
    return this.serveQuery(this._getConfig(arguments))
  }

  APIBridgeClient.prototype.serveQuery = function (query) {
    let queryWithIndex = Object.assign({}, query, {_publishId: this._publishId})

    if (preventFetch) return queryWithIndex

    return apiBridgeFetch(queryWithIndex)
  }

  return new APIBridgeClient()
}

module.exports = (api, preventFetch) => buildAPIBridgeClient(api, preventFetch)

module.exports.Bundler = () => {
  const APIBridgeBundler = function (api) {
    this.queries = []
  }

  APIBridgeBundler.prototype.add = function (query) {
    this.queries.push(query)
  }

  APIBridgeBundler.prototype.run = function () {
    return apiBridgeFetch(this.queries)
  }

  return new APIBridgeBundler()
}
