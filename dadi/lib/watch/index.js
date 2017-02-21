'use strict'

const fs = require('fs')
const convict = require('convict')
const path = require('path')

const Watch = function () {
  this.root = process.cwd()
}

Watch.prototype.getConfig = function (config) {
  let conf = convict(config.root())
  let env = config.get('env')
  try {
    conf.loadFile(path.resolve(`${this.root}/config/config.${env}.json`))
  } catch (e) {
    console.log('Failed to load config, dropping to app defaults.')
    return config
  }
  return conf.validate({})
}

Watch.prototype.start = function () {
  // Start watching directories for compile
  return this
}

module.exports = function () {
  return new Watch()
}

module.exports.Watch = Watch