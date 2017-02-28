'use strict'

const path = require('path')

const base = path.join(__dirname, '/../')
const lib = path.join(__dirname, '/lib')
const frontend = path.join(__dirname, '/frontend')

/**
 * Set Global parameters
 */
const Globals = function () {}

Globals.prototype.set = function () {
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
module.exports.Globals = new Globals()
