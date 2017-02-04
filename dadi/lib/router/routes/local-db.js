'use strict'

const localDBController = require(GLOBAL.paths.lib.controllers + '/local-db')

module.exports = function (app) {

  let controller = new localDBController()

  app.get('/db/:collection', controller.get)
  app.get('/db/:collection/:_id', controller.get)
  app.post('/db/:collection', controller.post)
  app.put('/db/:collection/:_id', controller.put)
  app.del('/db/:collection/:_id', controller.delete)
}