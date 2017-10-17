'use strict'

const config = require(paths.config)
const Constants = require(`${paths.lib.root}/constants`)
const log = require('@dadi/logger')
const passport = require('@dadi/passport')
const request = require('request-promise')
const slugify = require(`${paths.lib.helpers}/string`).Slugify

const APIBridgeController = function () {}

const createPassport = ({host, port, clientId, secret}) => {
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
      path: `${paths.wallet}/${generateTokenWalletFilename(host, port, clientId)}`
    }
  }, request)
}

const generateTokenWalletFilename = (host, port, clientId) => {
  return `token.${slugify(host + port)}.${slugify(clientId)}.json`
}

APIBridgeController.prototype.post = function (req, res, next) {
  const authAPI = config.get('auth')

  // Post content must be JSON.
  if (!req.is('application/json')) {
    res.end()

    return next()
  }

  res.header('Content-Type', 'application/json')

  // Block any API requests if there's no session
  if (authAPI.enabled && !req.isAuthenticated()) {
    const error = {error: Constants.AUTH_FAILED}
    log.warn({ module: 'api-bridge' }, `POST: ${JSON.stringify(error)}`)
    res.write(JSON.stringify(error))
    res.end()
  }

  try {
    let isBundle = Array.isArray(req.body)
    const requestObjects = isBundle ? req.body : [req.body]

    let queue = []
    requestObjects.forEach(requestObject => {
      const apiConfig = config.get('apis')
        .find(api => api.publishId === requestObject.publishId)

      if (!apiConfig) return
      if (!requestObject.uri) return

      queue.push(createPassport({
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

        if (requestObject.body !== undefined) {
          payload.body = JSON.stringify(requestObject.body)
        }

        return request(payload)
          .then(response => response.length ? JSON.parse(response) : response)
          .catch(error => {
            if (isBundle) {
              log.error({ module: 'api-bridge' }, `POST: ${JSON.stringify(error)}`)

              return Promise.resolve({
                apiBridgeError: true
              })
            }

            return Promise.reject(error)
          })
      }))
    })
    Promise.all(queue)
      .then(response => {
        let output = isBundle ? response : response[0]

        res.end(JSON.stringify(output))
      })
      .catch(error => {
        log.error({ module: 'api-bridge' }, `POST: ${JSON.stringify(error)}`)

        res.statusCode = 500
        res.end(JSON.stringify(error))
      })
  } catch (error) {
    log.error({ module: 'api-bridge' }, `POST: ${JSON.stringify(error)}`)
    res.statusCode = 500
    res.end(JSON.stringify(error))
  }

  return next()
}

module.exports = function () {
  return new APIBridgeController()
}

module.exports.APIBridgeController = APIBridgeController
