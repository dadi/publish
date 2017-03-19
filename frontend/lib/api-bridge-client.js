'use strict'

import 'fetch'
import * as Constants from 'lib/constants'

const APIWrapper = require('@dadi/api-wrapper-core')

let onUpdate = null

const apiBridgeFetch = function (requestObject) {
  return fetch('/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin',
    body: JSON.stringify(requestObject)
  }).then(response => {
    if (response.status === 200) {
      return response.json()
    }

    return response.json().then(response => {
      const error = response.error || ''

      return Promise.reject(JSON.parse(error))
    })
  })
}

const buildAPIBridgeClient = function (api, inBundle) {
  if (!api) {
    throw 'buildAPIBridgeClient: Missing API'
  }

  const { _publishId, host, port, version, database } = api

  const APIBridgeClient = function () {
    this._publishId = _publishId
    this.inBundle = inBundle

    if (onUpdate) {
      this.onUpdate = onUpdate
    }
  }

  APIBridgeClient.prototype = new APIWrapper({
    uri: host,
    port,
    version,
    database
  })

  APIBridgeClient.prototype._create = APIBridgeClient.prototype.create
  APIBridgeClient.prototype._find = APIBridgeClient.prototype.find
  APIBridgeClient.prototype._getCollections = APIBridgeClient.prototype.getCollections
  APIBridgeClient.prototype._getConfig = APIBridgeClient.prototype.getConfig
  APIBridgeClient.prototype._getStatus = APIBridgeClient.prototype.getStatus
  APIBridgeClient.prototype._update = APIBridgeClient.prototype.update

  APIBridgeClient.prototype.create = function (document) {
    return this.serveQuery(this._create(document))
  }

  APIBridgeClient.prototype.find = function () {
    return this.serveQuery(this._find(Array.prototype.slice.call(arguments)))
  }

  APIBridgeClient.prototype.getCollections = function () {
    return this.serveQuery(this._getCollections())
  }
  APIBridgeClient.prototype.getStatus = function () {
    return this.serveQuery(this._getStatus())
  }

  APIBridgeClient.prototype.getConfig = function () {
    return this.serveQuery(this._getConfig())
  }

  APIBridgeClient.prototype.serveQuery = function (query) {
    let queryWithIndex = Object.assign({}, query, {_publishId: this._publishId})

    if (this.inBundle) return queryWithIndex

    if (typeof this.onUpdate === 'function') {
      this.onUpdate.call(this, Constants.STATUS_LOADING)
    }

    return apiBridgeFetch(queryWithIndex).then(response => {
      if (typeof this.onUpdate === 'function') {
        const onComplete = this.onUpdate.bind(this, Constants.STATUS_COMPLETE)

        this.onUpdate.call(this, Constants.STATUS_IDLE, onComplete)
      }

      return response
    }).catch(err => {
      if (typeof this.onUpdate === 'function') {
        this.onUpdate.call(this, Constants.STATUS_FAILED)
      }

      return Promise.reject(err)
    })
  }

  APIBridgeClient.prototype.update = function (document) {
    return this.serveQuery(this._update(document))
  }

  return new APIBridgeClient()
}

module.exports = (api, inBundle) => buildAPIBridgeClient(api, inBundle)

module.exports.registerProgressCallback = callback => {
  onUpdate = callback
}

module.exports.Bundler = () => {
  const APIBridgeBundler = function (api) {
    this.queries = []

    if (onUpdate) {
      this.onUpdate = onUpdate
    }
  }

  APIBridgeBundler.prototype.add = function (query) {
    this.queries.push(query)
  }

  APIBridgeBundler.prototype.run = function () {
    if (typeof this.onUpdate === 'function') {
      this.onUpdate.call(this, Constants.STATUS_LOADING)
    }

    return apiBridgeFetch(this.queries).then(response => {
      if (typeof this.onUpdate === 'function') {
        const onComplete = this.onUpdate.bind(this, Constants.STATUS_COMPLETE)

        this.onUpdate.call(this, Constants.STATUS_IDLE, onComplete)
      }

      return response
    }).catch(err => {
      if (typeof this.onUpdate === 'function') {
        this.onUpdate.call(this, Constants.STATUS_FAILED)
      }

      return Promise.reject(err)
    })
  }

  return new APIBridgeBundler()
}
