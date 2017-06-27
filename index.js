'use strict'

const app = require('./app')
const colors = require('colors') // eslint-disable-line
const config = require(paths.config)
const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1])
const pkg = require('./package.json')

const Publish = function () {}

Publish.prototype.getStartupMessage = function () {
  const env = config.get('env')

  let startText = '\n\n'

  startText += '----------------------------\n'
  startText += '' + config.get('app.name').green + '\n'
  startText += 'Started \'DADI Publish\'\n'
  startText += '----------------------------\n'
  startText += 'Server:      '.green + config.get('server.host') + ':' + config.get('server.port') + '\n'
  startText += 'Version:     '.green + pkg.version + '\n'
  startText += 'Node.JS:     '.green + nodeVersion + '\n'
  startText += 'Environment: '.green + env + '\n'
  startText += '----------------------------\n'

  startText += '\n\nCopyright ' + String.fromCharCode(169) + ' 2015-' + new Date().getFullYear() + ' DADI+ Limited (https://dadi.tech)'.white + '\n'

  if (env !== 'test') {
    console.log(startText)
  }
}

Publish.prototype.run = function (options) {
  app.start(options)
    .then(this.getStartupMessage)
    .catch((err) => {
      console.log('App failed to start', err)
    })
}

// Run-type switch
if (require.main === module) {
  // App called directly
  module.exports = new Publish().run({isStandalone: true})
} else {
  // App called as module
  module.exports = new Publish()
  module.exports.Publish = Publish
}

