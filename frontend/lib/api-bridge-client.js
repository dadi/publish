'use strict'

import 'fetch'
import * as Constants from 'lib/constants'

const APIWrapper = require('@dadi/api-wrapper-core')

// The maximum number of allowed API calls per second. Any API Bridge calls
// past this limit will be blocked and the Promise will reject.
const MAX_CALLS_PER_SECOND = 50

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
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  }).then(response => {
    if (response.status === 200) {
      return response.json()
    }

    return response.json().then(parsedResponse => {
      let error = parsedResponse.error || ''

      try {
        error = JSON.parse(error)
      } catch (parsingError) {}

      return Promise.reject(error)
    })
  })
}

const apiBridgeFactory = function ({
  api,
  collection = {},
  fields = [],
  inBundle = false
}) {
  if (!api) {
    throw 'apiBridgeFactory: Missing API'
  }

  const {
    publishId,
    host,
    port
  } = api
  const {
    database,
    version
  } = collection

  const callback = requestObject => {
    let requestObjectWithPublishId = Object.assign({}, requestObject, {
      publishId
    })

    if (inBundle) {
      return requestObjectWithPublishId
    }

    return serveQuery(requestObjectWithPublishId)
  }

  const serveQuery = query => {
    if (typeof onUpdate === 'function') {
      onUpdate.call(this, Constants.STATUS_LOADING)
    }

    return apiBridgeFetch(query).then(response => {
      if (typeof onUpdate === 'function') {
        const onComplete = onUpdate.bind(this, Constants.STATUS_COMPLETE)

        onUpdate.call(this, Constants.STATUS_IDLE, onComplete)
      }

      return response
    }).catch(err => {
      if (typeof onUpdate === 'function') {
        onUpdate.call(this, Constants.STATUS_FAILED)
      }

      return Promise.reject(err)
    })
  }

  const apiWrapperOptions = {
    callback,
    database,
    port,
    uri: host,
    version
  }

  let apiWrapperInstance = new APIWrapper(apiWrapperOptions)
    .useFields(fields)
    .withComposition() // Force composition

  // If we were given a collection, we might as well run the `.in()` filter.
  if (collection.slug) {
    apiWrapperInstance = apiWrapperInstance.in(collection.slug)
  }

  return apiWrapperInstance
}

module.exports = apiBridgeFactory

module.exports.getBundler = () => {
  const APIBridgeBundler = function (api) {
    this.queries = []
  }

  APIBridgeBundler.prototype.add = function (query) {
    this.queries.push(query)
  }

  APIBridgeBundler.prototype.run = function () {
    if (typeof onUpdate === 'function') {
      onUpdate.call(this, Constants.STATUS_LOADING)
    }

    if (this.queries.length === 0) {
      return Promise.resolve([])
    }

    return apiBridgeFetch(this.queries).then(response => {
      if (typeof onUpdate === 'function') {
        const onComplete = onUpdate.bind(this, Constants.STATUS_COMPLETE)

        onUpdate.call(this, Constants.STATUS_IDLE, onComplete)
      }

      return response
    }).catch(err => {
      if (typeof onUpdate === 'function') {
        onUpdate.call(this, Constants.STATUS_FAILED)
      }

      return Promise.reject(err)
    })
  }

  return new APIBridgeBundler()
}

module.exports.registerProgressCallback = callback => {
  onUpdate = callback
}
