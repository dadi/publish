'use strict'

const cookieParser = require('restify-cookies')
const session = require('cookie-session')
const flash = require('connect-flash')
const passport = require('passport-restify')
const LocalStrategy = require('passport-local')

const SessionController = require(`${paths.lib.controllers}/session`)

module.exports = function (app) {
  let sessionController = new SessionController()

  // Add session rules
  app.use(cookieParser.parse)
  app.use(session({
    key: 'dadi-publish',
    secret: 'keyboard cat',
    saveUninitialized: true,
    resave: true
  }))
  // Initialise passport session
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())

  // Passport Local stategy selected
  passport.use(new LocalStrategy(sessionController.authorise))

  passport.serializeUser((user, done) => {
    if (!user) return done({err: 'User not found'}, null)

    return done(null, user)
  })

  passport.deserializeUser((user, done) => {
    if (!user) return done({err: 'No session'}, null)

    return done(null, user)
  })

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

  app.post('/session', (req, res, next) => {
    return sessionController.post(req, res, next, passport)
  })

  app.put('/session', sessionController.put)

  app.del('/session', sessionController.delete)
}
