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

  // Where can the user access Publish?
  let server = config.get('publicUrl.host')
    ? `${config.get('publicUrl.protocol')}://${config.get('publicUrl.host')}:${port}`
    : `http://${config.get('server.host')}:${port}`

  // Print out API.
  let apis = config.get('apis')
  let apiUrl = (apis.length > 0) && `${apis[0].host}:${apis[0].port}`
  let footer = {
    'API': apiUrl || colors.red('Not connected')
  }

  if (env !== 'test') {
    dadiBoot.started({
      server,
      header: {
        app: config.get('app.name')
      },
      body: {
        'Version': pkg.version,
        'Node.js': nodeVersion,
        'Environment': env
      },
      footer
    })
  }
}

Publish.prototype.run = function () {
  if (config.get('env') !== 'test') {
    dadiBoot.start(require('./package.json'))  
  }

  return app
    .start()
    .then(this.getStartupMessage)
    .catch(err => {
      console.log('App failed to start', err)
    })
}

Publish.prototype.stop = function () {
  return app.stop().catch(err => {
    console.log('App failed to stop', err)
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

