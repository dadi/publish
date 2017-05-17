'use strict'

const restify = require('restify')
const APIBridgeController = require(`${paths.lib.controllers}/api-bridge`)

module.exports = function (app) {
  const controller = new APIBridgeController()

  app.use(restify.throttle({
    burst: 100,
    rate: 50,
    ip: true,
    overrides: {
      '0.0.0.0': {
        rate: 0, // unlimited
        burst: 0
      }
    }
  }))

  app.post('/api', controller.post)
}
