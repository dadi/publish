'use strict'

const cookieParser = require('restify-cookies')
const config = require(paths.config)
const session = require('cookie-session')
const flash = require('connect-flash')
const fs = require('fs')
const path = require('path')
const passport = require('passport-restify')
const LocalStrategy = require('passport-local')
const restify = require('restify')
const SessionController = require(`${paths.lib.controllers}/session`)
const SSL = require('ssl')

/**
 * @constructor
 * App Router
 */
const Router = function (app) {
  this.publicDir = path.resolve(__dirname, '../../../public')
  this.routesDir = path.join(__dirname, 'routes')
  this.app = app

  this.ssl = new SSL()
    .useDomains(config.get('server.ssl.domains'))
    .useDir(config.get('server.ssl.dir'), true)
    .useEnvironment('production')
    .provider('letsencrypt')
    .registerTo(config.get('server.ssl.email'))
    .autoRenew(true)
    .byteLength(3072)
    .server(app)
    .create()

  this.entryPointTemplate = fs.readFileSync(path.join(this.publicDir, 'index.html'), 'utf8')
}

/**
 * Add Routes
 * @param {restify} app Restify web server instance
 */
Router.prototype.addRoutes = function () {
  this.pre()
  this.use()
  this.setPassportStrategies()
  this.setHeaders() // Only run when no redirects
  this.getRoutes()
  this.componentRoutes(path.resolve(`${paths.frontend.components}`), /Routes$/g)
  this.webRoutes()
}

Router.prototype.getRoutes = function () {
  fs.readdirSync(path.resolve(this.routesDir)).forEach((file) => {
    /* require module with its name (from filename), passing app */
    let controller = require(path.join(this.routesDir, file))

    controller(this.app)
  })
}

/**
 * Set Passport Strategies
 * Add local sessionController strategies to passport.
 */
Router.prototype.setPassportStrategies = function () {
  const sessionController = new SessionController()

  // Passport Local stategy selected
  passport.use(new LocalStrategy(sessionController.authorise))

  passport.serializeUser((user, done) =>
    done(!user ? {err: 'User not found'} : null, user || null)
  )

  passport.deserializeUser((user, done) =>
    done(!user ? {err: 'User not found'} : null, user || null)
  )
}

/**
 * Web routes (Needs moving to controller?)
 * For use with isomorphic web application base route
 * @param  {restify} app Restify web server instance
 */
Router.prototype.webRoutes = function () {
  this.app.get(/\/public\/?.*/, restify.serveStatic({
    directory: path.resolve(__dirname, '../../..')
  }))

  // Respond to HEAD requests - this is used by ConnectionMonitor in App.jsx.
  this.app.head(/.*/, (req, res, next) => {
    res.header('Content-Type', 'application/json')

    return res.end()
  })

  this.app.get(/.*/, (req, res, next) => {
    const serialisedUser = (req.session.passport && req.session.passport.user)
      ? JSON.stringify(req.session.passport.user)
      : null
    const entryPointPage = this.entryPointTemplate
      .replace('/*@@userData@@*/', `window.__userData__ = ${serialisedUser}`)

    res.end(entryPointPage)

    return next()
  })
}

/**
 * Add component routes
 * @param {restify} app Restify web server instance
 */
Router.prototype.componentRoutes = function (dir, match) {
  // Fetch aditional component schema
  fs.readdirSync(dir).forEach(folder => {
    let sub = path.resolve(dir, folder)

    if (fs.lstatSync(sub).isDirectory()) {
      this.componentRoutes(sub, match)
    } else if (fs.lstatSync(sub).isFile()) {
      let file = path.parse(sub)

      if (file.ext === '.js' && file.name.match(match)) {
        let controller = require(sub)

        controller(this.app)
      }
    }
  })
}

/**
 * Set headers
 * @param {restify} app Restify web server instance
 */
Router.prototype.setHeaders = function () {
  this.app.use((req, res, next) => {
    res.header('ETag', 'publish-etag')
    res.header('Last-Modified', new Date())
    return next()
  })
}

/**
 * Middleware
 * @param  {restify} app Restify web server instance
 */
Router.prototype.use = function () {
  this.app.use(restify.gzipResponse())
    .use(restify.requestLogger())
    .use(restify.queryParser())
    .use(restify.bodyParser({mapParams: true})) // Changing to false throws issues with auth. Needs addressing
    .use(cookieParser.parse)
    // Add session.
    .use(session({
      key: 'dadi-publish',
      secret: 'keyboard cat',
      saveUninitialized: true,
      resave: true
    }))
    // Initialise passport session.
    .use(passport.initialize())
    .use(passport.session())
    .use(flash())
    .use(this.ssl.middleware())
}

/**
 * Pre Middleware
 * @param  {restify} app Restify web server instance
 */
Router.prototype.pre = function () {
  this.app.pre(restify.pre.sanitizePath())
}

module.exports = function (app) {
  return new Router(app)
}

module.exports.Router = Router
