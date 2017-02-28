'use strict'

const path = require('path')
const config = require('./config')

const base = __dirname + '/../'
const lib = __dirname + '/lib'
const frontend = __dirname + '/frontend'

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
      router: path.resolve(`${lib}/router`),
      helpers: path.resolve(`${lib}/helpers`),
      watch: path.resolve(`${lib}/watch`)
    },
    frontend: {
      root: frontend,
      components: path.resolve(`${frontend}/components`)
    },
    wallet: path.resolve(`${base}/.wallet`)
  }
}

// exports
module.exports = function () {
  return new Globals()
}

module.exports.Globals = new Globals()
