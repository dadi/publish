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
  const ssl = new SSL()
    .certificateDir(config.get('server.ssl.dir'), true)

  const key = ssl.getKey()
  const certificate = ssl.getCertificate()
  // Store valid in config
  config.set('server.ssl.valid', (key && certificate))

  const formatters = {
    'text/plain': (req, res, body) => {
      if (body instanceof Error) {
        // catch our Error
        log.error(body.stack)
        return body.message
      }
    }
  }
  // To-do
  // - If SSL enabled, create both apps
  // - We always want middleware for certs, so always apply that to port 80 app
  // - For port 80 app, either apply redirect or standard routes

  this.options = {
    port: config.get('server.ssl.enabled') ? 443 : config.get('server.port'),
    host: config.get('server.host'),
    formatters: formatters
  }
  this.redirectOptions = {
    port: 80,
    host: config.get('server.host')//,
    // formatters: formatters
  }
  if (config.get('server.ssl.valid')) {
    Object.assign(this.options, {key, certificate})
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

    this.app = restify.createServer(this.options)
    if (config.get('server.ssl.enabled')) {
      this.redirectApp = restify.createServer(this.redirectOptions)
    }
    new Router(this.app, this.redirectApp).addRoutes()

    return this.addListeners()
      .then(() => {
        this.socket = new Socket(this.app)
        resolve()
      })
  })
}

/**
 * Add Listeners
 * Set all listeners for Resify server instance
 */
Server.prototype.addListeners = function () {
  let appListeners = []
  appListeners.push(this.appListen(this.app, this.options.port, this.options.host))

  if (
    config.get('server.ssl.enabled') && 
     this.redirectApp
  ) {
    appListeners.push(this.appListen(this.redirectApp, this.redirectOptions.port, this.redirectOptions.host))
  }

  return Promise.all(appListeners)
}

/**
 * Begin Restify server listen
 * @return {Restify} Restify server instance
 */
Server.prototype.appListen = function (app, port, host) {
  return new Promise((resolve, reject) => app
    .listen(Number(port), host, resolve))
}

module.exports = function () {
  return new Server()
}

module.exports.Server = Server

