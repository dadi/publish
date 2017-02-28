'use strict'

const AppConfigController = require(`${paths.lib.controllers}/app-config`)

module.exports = function (app) {
  const controller = new AppConfigController()

  app.get('/config', controller.get)  
}
