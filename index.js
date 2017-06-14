'use strict'

const app = require('./app')

const Publish = function () {}

Publish.prototype.start = function (options) {
  app.start(options).then(() => {
    console.log('App started successfully')
  }).catch((err) => {
    console.log('App failed to start', err)
  })
}

// Run-type switch
if (require.main === module) {
  // App called directly
  module.exports = new Publish(true)
} else {
  // App called as module
  module.exports = function () {
    return new Publish()
  }
  module.exports.Publish = Publish
}

