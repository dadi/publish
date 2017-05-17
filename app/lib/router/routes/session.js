'use strict'

const passport = require('passport-restify')
const SessionController = require(`${paths.lib.controllers}/session`)

module.exports = function (app) {
  const sessionController = new SessionController()
  // Reset token request endpoint.
  app.post({
    name: 'session-password-reset',
    path: '/session/password-reset'
  }, sessionController.reset)

  // Reset token request endpoint.
  app.post({
    name: 'session-reset-token',
    path: '/session/reset-token'
  }, sessionController.resetToken)

  app.get({
    name: 'session',
    path: '/session'
  }, sessionController.get)

  app.post('/session', (req, res, next) => sessionController.post(req, res, next, passport))

  app.put('/session', sessionController.put)

  app.del('/session', sessionController.delete)
}
