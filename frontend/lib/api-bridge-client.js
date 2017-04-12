'use strict'

import 'fetch'
import * as Constants from 'lib/constants'

const APIWrapper = require('@dadi/api-wrapper-core')

// The maximum number of allowed API calls per second. Any API Bridge calls
// past this limit will be blocked and the Promise will reject.
const MAX_CALLS_PER_SECOND = 10

let callCount = 0
let onUpdate = null
let throttle = null

function throttleAllow () {
  clearInterval(throttle)
  throttle = setTimeout(() => callCount = 0, 1000)

  return ++callCount <= MAX_CALLS_PER_SECOND
}

const apiBridgeFetch = function (requestObject) {
  if (!throttleAllow()) {
    return Promise.reject('API_CALL_QUOTA_EXCEEDED')
  }

  return fetch('/api', {
    body: JSON.stringify(requestObject),
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
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

  const {_publishId, host, port, version, database} = api

  const APIBridgeClient = function () {
    this._publishId = _publishId
    this.inBundle = inBundle

    if (onUpdate) {
      this.onUpdate = onUpdate
    }
  }

  APIBridgeClient.prototype = new APIWrapper({
    database,
    port,
    uri: host,
    version
  })

  APIBridgeClient.prototype._create = APIBridgeClient.prototype.create
  APIBridgeClient.prototype._delete = APIBridgeClient.prototype.delete
  APIBridgeClient.prototype._find = APIBridgeClient.prototype.find
  APIBridgeClient.prototype._getCollections = APIBridgeClient.prototype.getCollections
  APIBridgeClient.prototype._getConfig = APIBridgeClient.prototype.getConfig
  APIBridgeClient.prototype._getStatus = APIBridgeClient.prototype.getStatus
  APIBridgeClient.prototype._update = APIBridgeClient.prototype.update

  APIBridgeClient.prototype.create = function (document) {
    return this.serveQuery(this._create(document))
  }

  APIBridgeClient.prototype.delete = function (document) {
    return this.serveQuery(this._delete(document))
  }

  APIBridgeClient.prototype.find = function () {
    return this.serveQuery(this._find(Array.prototype.slice.call(arguments)))
  }

  APIBridgeClient.prototype.getCollections = function () {
    return this.serveQuery(this._getCollections())
  }

  APIBridgeClient.prototype.getConfig = function () {
    return this.serveQuery(this._getConfig())
  }

  APIBridgeClient.prototype.getQuery = function () {
    return this.query
  }

  APIBridgeClient.prototype.getStatus = function () {
    return this.serveQuery(this._getStatus())
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

module.exports.getBundler = () => {
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

    if (this.queries.length === 0) {
      return Promise.resolve([])
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
