'use strict'

const APIBridgeController = require(`${GLOBAL.paths.lib.controllers}/api-bridge`)

module.exports = function (app) {
  const controller = new APIBridgeController()

  app.post('/api', controller.post)  
}
