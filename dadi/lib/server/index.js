'use strict'

const restify = require('restify')
const path = require('path')

const config = require(paths.config)
const Router = require(paths.lib.router)
const Socket = require(`${paths.lib.server}/socket`)
const log = require('@dadi/logger')

const md5 = require('md5')

process.env.TZ = config.get('TZ')

// (!) This should probably be moved to a more suitable place
const getApisBlockWithUUIDs = (apis) => {
  return apis.map(api => {
    let uuid = md5(api.host + api.port + api.credentials.clientId)

    return Object.assign({}, api, {_publishId: uuid})
  })
}

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
          // catch our Error
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
  return new Promise((resolve, reject) => {
    // Inject API UUIDs in config
    config.set('apis', getApisBlockWithUUIDs(config.get('apis')))

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
  return new Promise((resolve, reject) => {
    return this.app.listen(Number(this.options.port), this.options.host, resolve)
  })
}

module.exports = function () {
  return new Server()
}

module.exports.Server = Server

