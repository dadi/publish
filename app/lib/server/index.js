'use strict'

const restify = require('restify')

const config = require(paths.config)
const Router = require(paths.lib.router)
const Socket = require(`${paths.lib.server}/socket`)
const log = require('@dadi/logger')
const md5 = require('md5')

process.env.TZ = config.get('TZ')

// (!) This should probably be moved to a more suitable place
const getApisBlockWithUUIDs = apis => {
  return apis.map(api => {
    let uuid = md5(api.host + api.port + api.credentials.clientId)

    return Object.assign({}, api, {publishId: uuid})
  })
}

/**
 * @constructor
 * Server initialisation
 */
const Server = function () {
}

Server.prototype.getOptions = function (override = {}) {
  const formatters = {
    'text/plain': (req, res, body) => {
      if (body instanceof Error) {
        // catch our Error
        log.error(body.stack)
        return body.message
      }
    }
  }

  return Object.assign({
    port: config.get('server.port'),
    host: config.get('server.host'),
    formatters
  }, override)
}

/**
 * Start server
 * @return {Promise}  Add Listener
 */
Server.prototype.start = function () {
  let listenerQueue = []
    // Inject API UUIDs in config
  config.set('apis', getApisBlockWithUUIDs(config.get('apis')))
  listenerQueue.push(this.createBaseServer())

  // Add all listeners
  return Promise.all(listenerQueue)
}

Server.prototype.createBaseServer = function () {
  const options = this.getOptions()

  const server = restify.createServer(options)

  // Add all routes to server
  new Router(server).addRoutes()

  // Add listeners and initialise socket
  return this.addListeners(server, options)
    .then(() => {
      this.socket = new Socket(server)
    })
}

/**
 * Add Listeners
 * Set all listeners for Resify server instance
 */
Server.prototype.addListeners = function (server, options) {
  let listeners = []
  listeners.push(this.addServerListener(server, options.port, options.host))

  return Promise.all(listeners)
}

/**
 * Begin Restify server listen
 * @return {Restify} Restify server instance
 */
Server.prototype.addServerListener = function (server, port, host) {
  return new Promise((resolve, reject) => server
    .listen(Number(port), host, resolve))
}

module.exports = function () {
  return new Server()
}

module.exports.Server = Server

