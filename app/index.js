'use strict'

const globals = require('./globals') // eslint-disable-line

const Server = require(paths.lib.server)
const Watch = require(paths.lib.watch)
let config = require(paths.config) // eslint-disable-line

/*
To-do - this.server.close should be promise based
 */

/**
 * @constructor
 * App server index
 */
const App = function () {}

/**
 * Start Publish App
 * @return {Server}        Server Instace
 */
App.prototype.start = function (options = {isStandalone: false}) {
  if (!options.isStandalone) {
    new Watch().start()
  }
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
module.exports.app = App
