'use strict'

const cookieParser = require('restify-cookies')
const session = require('cookie-session')
const flash = require('connect-flash')
const passport = require('passport-restify')
const LocalStrategy = require('passport-local')

const SessionController = require(`${paths.lib.controllers}/session`)
const User = require(`${paths.lib.models}/user`)

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
    done(null, user._id)
  })

  passport.deserializeUser((id, done) => {
    return new User().find({_id: id}).then((user) => {
      return done(null, user)
    })
  })

  // app.post('/auth/user', sessionController.createUser)

  app.get({
      name: 'session', // This allows us to reuse the auth request
      path: '/session'
    }, 
    (req, res, next) => {
    if (req.isAuthenticated()) {
      return new User().find({_id: req.session.passport.user}).then((user) => {
        res.write(JSON.stringify(user))
        res.end()
        return next()
      })
    } else {
      res.write(JSON.stringify({success: false}))
      res.end()
      return next()
    }
  })

  // Move to sessionController
  app.post('/session', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err) }
      req.login(user, {}, (err) => {
        res.write(JSON.stringify(user))
        res.end()
        return next()
      })
    })(req, res, next)
  })
}