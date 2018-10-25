'use strict'

const app = require('./app')
const colors = require('colors') // eslint-disable-line
const config = require(paths.config)
const dadiBoot = require('@dadi/boot')
const log = require('@dadi/logger')
const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1])
const pkg = require('./package.json')

const Publish = function () {}

Publish.prototype.getStartupMessage = function () {
  let env = config.get('env')

  log.init(config.get('logging'), {}, env)

  let port = config.get('server.protocol') === 'https' ? 443 : config.get('server.port')

  if (env !== 'test') {
    dadiBoot.started({
      server: `http://${config.get('server.host')}:${port} (Public URL: ${config.get('publicUrl.protocol')}://${config.get('publicUrl.host')}:${port})`,
      header: {
        app: `${config.get('app.name')}${config.get('app.publisher') && config.get('app.publisher') !== '' ? ' - ' + config.get('app.publisher') : ''}`
      },
      body: {
        'Version': pkg.version,
        'Node.js': nodeVersion,
        'Environment': env
      },
      footer: {}
    })
  }
}

Publish.prototype.run = function () {
  dadiBoot.start(require('./package.json'))

  app
    .start()
    .then(this.getStartupMessage)
    .catch(err => {
      console.log('App failed to start', err)
    })
}

// Run-type switch
if (require.main === module) {
  // App called directly
  module.exports = new Publish().run()
} else {
  // App called as module
  module.exports = new Publish()
  module.exports.Publish = Publish
}

