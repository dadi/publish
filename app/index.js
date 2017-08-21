'use strict'

const globals = require('./globals') // eslint-disable-line

const Server = require(paths.lib.server)
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
 * @return {Server}        Server Instance
 */
App.prototype.start = function () {
  this.server = new Server()
  return this.server.start()
}

module.exports = new App()
module.exports.app = App
