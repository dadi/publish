'use strict'

const globals = require('./globals')
const config = require(GLOBAL.paths.config)
const Server = require(GLOBAL.paths.lib.server)

/*
To-do - this.server.close should be promise based
 */

const App = () => {}

/**
 * Start Publish App
 * @return {Server}        Server Instace
 */
App.prototype.start = function () {
  this.server = new Server()
  return this.server.start()
}

/**
 * Stop Publish App
 * @return {Promise} app.close promise
 */
App.prototype.stop = function () {
  return this.server.stop()
}

module.exports = new App()
