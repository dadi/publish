'use strict'

const config = require(GLOBAL.paths.config)
const passport = require('@dadi/passport')
const request = require('request-promise')
const slugify = require("underscore.string/slugify")

const APIBridgeController = function () {

}

const _createPassport = function (host, port, clientId, secret) {
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
      path: __dirname + '/../../../../.wallet/' + _generateTokenWalletFilename(host, port, clientId)
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
    const requestObject = req.body

    console.log('** REQ OBJ:', requestObject, this)

    const passport = _createPassport({
      host: `${requestObject.uri.protocol}//${requestObject.uri.hostname}`,
      port: requestObject.uri.port,
      clientId: 'worker',
      secret: 'd4d1t3ch'
    }).then(request => {
      request({
        uri: requestObject.uri.href,
        method: requestObject.method,
        body: requestObject.body
      }).then(response => {
        res.end(JSON.stringify(response))
      })
    })
  } catch (err) {
    console.log('** ERR:', err)
  }

  return next()
}

module.exports = function() {
  return new APIBridgeController()
}

module.exports.APIBridgeController = APIBridgeController
