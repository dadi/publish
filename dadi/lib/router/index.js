'use strict'

const restify = require('restify')
const restifyErrors = require('restify-errors')
const serveStatic = require('serve-static-restify')
const path = require('path')
const fs = require('fs')

const cookieParser = require('restify-cookies')
const session = require('cookie-session')
const flash = require('connect-flash')
const passport = require('passport-restify')
const LocalStrategy = require('passport-local')

/**
 * @constructor
 * App Router
 */
const Router = function () {
  this.routesDir = path.join(__dirname, 'routes')
}

/**
 * Add Routes
 * @param {restify} app Restify web server instance
 */
Router.prototype.addRoutes = function (app) {
  this.app = app

  this.pre()
  this.use()
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
 * Web routes (Needs moving to controller?)
 * For use with isomorphic web application base route
 * @param  {restify} app Restify web server instance
 */
Router.prototype.webRoutes = function () {
  this.app.pre(serveStatic(path.resolve(__dirname, '../../../public'), {'index': ['index.html'], 'dotfiles': 'ignore'}))
  this.app.get(/.*/,restify.serveStatic({
    directory: path.resolve(__dirname, '../../../public'),
    file: 'index.html'
  }))
}

/**
 * Add component routes
 * @param {restify} app Restify web server instance
 */
Router.prototype.componentRoutes = function (dir, match) {
  // Fetch aditional component schema
  fs.readdirSync(dir).forEach((folder) => {
    let sub = path.resolve(dir,folder)

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
  this.app.use(restify.requestLogger())
  this.app.use(restify.queryParser())
  this.app.use(restify.bodyParser({mapParams: true})) // Changing to false throws issues with auth. Needs addressing 
}

/**
 * Pre Middleware
 * @param  {restify} app Restify web server instance
 */
Router.prototype.pre = function () {
  this.app.pre(restify.pre.sanitizePath())
}

module.exports = function () {
  return new Router()
}

module.exports.Router = Router