'use strict'

const path = require('path')
const config = require('./config')

const base = __dirname + '/../'
const lib = __dirname + '/lib'

/**
 * Set Global parameters
 */
const Globals = function () {  
  global.paths = {
    config: path.resolve(`${__dirname}/config`),
    lib: {
      root: lib,
      controllers: path.resolve(`${lib}/controllers`),
      models: path.resolve(`${lib}/models`),
      server: path.resolve(`${lib}/server`),
      monitor: path.resolve(`${lib}/monitor`),
      router: path.resolve(`${lib}/router`),
      helpers: path.resolve(`${lib}/helpers`),
      db: path.resolve(`${lib}/db`)
    }
  }
}

// exports
module.exports = function () {
  return new Globals()
}

module.exports.Globals = new Globals()