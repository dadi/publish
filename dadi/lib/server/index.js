'use strict'

const restify = require('restify')
const http = require('http')
const fs = require('fs')
const url = require('url')
const path = require('path')

const config = require(paths.config)
const Router = require(paths.lib.router)
const Socket = require(`${paths.lib.server}/socket`)
const log = require('@dadi/logger')

process.env.TZ = config.get('TZ')

/**
 * @constructor
 * Server initialisation
 */
const Server = function () {
  this.options = {
    port: config.get('server.port'),
    host: config.get('server.host'),
    formatters: {
      'text/plain': (req, res, body) => {
        if (body instanceof Error) {
          //catch our Error
          log.error(body.stack)
          return body.message
        }
      }
    }
  }
}

/**
 * Start server
 * @return {Promise}  Add Listener
 */
Server.prototype.start = function () {
  return new Promise( (resolve, reject) => {
    this.createServer()
    new Router().addRoutes(this.app)
    return this.addListeners().then(() => {
      this.socket = new Socket(this.app)
      resolve()
    })
  })
}

/**
 * Stop Server
 */
Server.prototype.stop = function () {

}

/**
 * Create Restify server instance
 */
Server.prototype.createServer = function () {
  this.app = restify.createServer(this.options)
}

/**
 * Add Listeners
 * Set all listeners for Resify server instance
 */
Server.prototype.addListeners = function () {

  // this.app.on('NotFound', router.notFound())

  this.app.on('listening', () => {
    log.info(`Publish up on ${this.options.host}:${this.options.port}`)
  })
  this.app.on('close', () => {
    console.log('Closing server connection.')
  })
  return this.appListen()
}

/**
 * Begin Restify server listen
 * @return {Restify} Restify server instance
 */
Server.prototype.appListen = function () {
  return new Promise( (resolve, reject) => {
    return this.app.listen(Number(this.options.port), this.options.host, resolve)
  })
}

module.exports  = function () {
  return new Server()
}

module.exports.Server = Server



