'use strict'

const Watch = function () {

}

/**
 * Start (WIP)
 * @return {this} return Watch
 */
Watch.prototype.start = function () {
  // Start watching directories for compile
  return this
}

module.exports = function () {
  return new Watch()
}

module.exports.Watch = Watch
