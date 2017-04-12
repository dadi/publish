'use strict'

const config = require(paths.config)
const objectPath = require('object-path')
const passport = require('@dadi/passport')
const request = require('request-promise')
const slugify = require(`${paths.lib.helpers}/string`).Slugify

const APIBridgeController = function () {}

const _createPassport = function ({host, port, clientId, secret}) {
  return passport({
    issuer: {
      uri: host,
      port: port,
      endpoint: '/token'
    },
    credentials: {
      clientId: clientId,
      secret: secret
    },
    wallet: 'file',
    walletOptions: {
      path: `${paths.wallet}/${_generateTokenWalletFilename(host, port, clientId)}`
    }
  }, request)
}

const _generateTokenWalletFilename = function (host, port, clientId) {
  return `token.${slugify(host + port)}.${slugify(clientId)}.json`
}

APIBridgeController.prototype.post = function (req, res, next) {
  if (!req.is('application/json')) {
    res.end()

    return next()
  }

  res.header('Content-Type', 'application/json')

  try {
    let multiple = Array.isArray(req.body)
    const requestObjects = multiple ? req.body : [req.body]

    let queue = []

    requestObjects.forEach(requestObject => {
      const apiConfig = config.get('apis').find(api => {
        return api._publishId === requestObject._publishId
      })

      if (!apiConfig) return

      queue.push(_createPassport({
        host: `${requestObject.uri.protocol}//${requestObject.uri.hostname}`,
        port: Number(requestObject.uri.port),
        clientId: apiConfig.credentials.clientId,
        secret: apiConfig.credentials.secret
      }).then(request => {
        let payload = {
          uri: requestObject.uri.href,
          method: requestObject.method,
          headers: {
            'content-type': 'application/json'
          }
        }

        if (typeof requestObject.body !== 'undefined') {
          payload.body = JSON.stringify(requestObject.body)
        }

        return request(payload).then(response => {
          return response.length ? JSON.parse(response) : response
        })
      }))
    })

    Promise.all(queue).then(response => {
      let output = multiple ? response : response[0]

      res.end(JSON.stringify(output))
    }).catch(err => {
      console.log('(*) API Bridge error:', err)

      res.statusCode = 500
      res.end(JSON.stringify(err))
    })
  } catch (err) {
    res.statusCode = 500
    res.end(JSON.stringify(err))
  }

  return next()
}

module.exports = function () {
  return new APIBridgeController()
}

module.exports.APIBridgeController = APIBridgeController
