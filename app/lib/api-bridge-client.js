import 'unfetch/polyfill'
import * as Constants from 'lib/constants'

const APIWrapper = require('@dadi/api-wrapper-core')

// The maximum number of allowed API calls per second. Any API Bridge calls
// past this limit will be blocked and the Promise will reject.
const MAX_CALLS_PER_SECOND = 50

let callCount = 0
let onError = null
let onUpdate = null
let throttle = null

function throttleAllow() {
  clearInterval(throttle)
  throttle = setTimeout(() => (callCount = 0), 1000)

  return ++callCount <= MAX_CALLS_PER_SECOND
}

const apiBridgeFetch = function(requestObject) {
  if (!throttleAllow()) {
    return Promise.reject('API_CALL_QUOTA_EXCEEDED')
  }

  return fetch(requestObject.uri.href, {
    body: JSON.stringify(requestObject.body),
    headers: Object.assign({}, requestObject.headers, {
      'Content-Type': 'application/json'
    }),
    method: requestObject.method
  }).then(response => {
    if (response.status === 204) {
      return null
    }

    if (response.ok) {
      return response.json()
    }

    return response.json().then(error => {
      console.error(error)

      if (typeof onError === 'function') {
        onError.call(this, error)
      }

      return Promise.reject(error)
    })
  })
}

const apiBridgeFactory = function({
  accessToken,
  api,
  collection = {},
  fields = []
}) {
  if (!api) {
    throw 'apiBridgeFactory: Missing API'
  }

  const {host, port} = api
  const {property} = collection

  const callback = requestObject => {
    const augmentedRequestObject = Object.assign({}, requestObject, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    return serveQuery(augmentedRequestObject)
  }

  const serveQuery = query => {
    if (typeof onUpdate === 'function') {
      onUpdate.call(this, Constants.STATUS_LOADING)
    }

    return apiBridgeFetch(query)
      .then(response => {
        if (typeof onUpdate === 'function') {
          const onComplete = onUpdate.bind(this, Constants.STATUS_COMPLETE)

          onUpdate.call(this, Constants.STATUS_IDLE, onComplete)
        }

        return response
      })
      .catch(err => {
        if (typeof onUpdate === 'function') {
          onUpdate.call(this, Constants.STATUS_FAILED)
        }

        return Promise.reject(err)
      })
  }

  const apiWrapperOptions = {
    callback,
    port,
    property,
    uri: host
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

export default apiBridgeFactory

export const registerErrorCallback = callback => {
  onError = callback
}

export const registerProgressCallback = callback => {
  onUpdate = callback
}
