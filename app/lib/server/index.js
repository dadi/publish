'use strict'

const restify = require('restify')

const config = require(paths.config)
const Router = require(paths.lib.router)
const Socket = require(`${paths.lib.server}/socket`)
const SSL = require('ssl')
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
  this.ssl = new SSL()
    .useDomains(config.get('server.ssl.domains'))
    .certificateDir(config.get('server.ssl.dir'), true)
    .useEnvironment('production')
    .provider('letsencrypt')
    .registerTo(config.get('server.ssl.email'))
    .autoRenew(true)
    .byteLength(3072)
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
  // If we're using ssl, create a server on port 80 to handle
  // redirects and challenge authentication
  if (config.get('server.ssl.enabled')) {
    listenerQueue.push(this.createRedirectServer())
  }
  // Add all listeners
  return Promise.all(listenerQueue)
}

Server.prototype.createBaseServer = function () {
  // If we're using ssl, start a server on port 443
  const options = config.get('server.ssl.enabled') ? this.getOptions({
    port: 443,
    key: this.ssl.getKey(),
    certificate: this.ssl.getCertificate()
  }) : this.getOptions()

  const server = restify.createServer(options)

  // Add all routes to server
  new Router(server).addRoutes()

  if (config.get('server.ssl.enabled')) {
    this.ssl.useSecureServer(server)
  }

  // Add listeners and initialise socket
  return this.addListeners(server, options)
    .then(() => {
      this.socket = new Socket(server)
    })
}

Server.prototype.createRedirectServer = function () {
  const options = this.getOptions({
    port: 80
  })
  const server = restify.createServer(options)

  this.addSSL(server)
  new Router(server)
    .addSecureRedirect(this.ssl)
    .addRoutes()

  return this.addListeners(server, options)
}

Server.prototype.addSSL = function (server) {
  this.ssl
    .useListeningServer(server)
    .start()
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

