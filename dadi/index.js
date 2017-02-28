'use strict'

const globals = require('./globals')

const Server = require(paths.lib.server)
const Watch = require(paths.lib.watch)
let config = require(paths.config)

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
App.prototype.start = function (isModule) {
  if (isModule) {
    let watcher = new Watch().start()

    // Overwrite default config with app-specific module
    config = watcher.getConfig(config)
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
