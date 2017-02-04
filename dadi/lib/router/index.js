'use strict'

const restify = require('restify')
const restifyErrors = require('restify-errors')
const serveStatic = require('serve-static-restify')
const path = require('path')
const fs = require('fs')
const _ = require('underscore')

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
  this.webRoutes()
}

Router.prototype.getRoutes = function () {

  _.each(fs.readdirSync(path.resolve(this.routesDir)), (file) => {
    /* require module with its name (from filename), passing app */
    var controller = require(path.join(this.routesDir, file))

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
 * Set headers
 * @param {restify} app Restify web server instance
 */
Router.prototype.setHeaders = function () {
  this.app.use((req, res, next) => {
    //res.header('ETag', 'publish-etag')
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