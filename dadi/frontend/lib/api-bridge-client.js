'use strict'

import 'whatwg-fetch'

const APIWrapper = require('@dadi/api-wrapper-core')

module.exports = ({uri, port, version, database}) => {
  const APIBridgeClient = function () {

  }

  APIBridgeClient.prototype = new APIWrapper({
    uri,
    port,
    version,
    database
  })

  APIBridgeClient.prototype._fetch = function (requestObject) {
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

  APIBridgeClient.prototype._find = APIBridgeClient.prototype.find

  APIBridgeClient.prototype.find = function () {
    return this._fetch(this._find(arguments))
  }

  return new APIBridgeClient()
}
