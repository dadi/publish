'use strict'

const config = require(paths.config)
const fs = require('fs')
const log = require('@dadi/logger')
const md5 = require('md5')
const restify = require('restify')
const Router = require(paths.lib.router)
const Socket = require(`${paths.lib.server}/socket`)

process.env.TZ = config.get('TZ')

// (!) This should probably be moved to a more suitable place
const getApisBlockWithUUIDs = apis => {
  return apis.map(api => {
    let uuid = md5(api.host + api.port + api.version + api.database)

    return Object.assign({}, api, {publishId: uuid})
  })
}

const readFileSyncSafe = path => {
  try {
    return fs.readFileSync(path)
  } catch (ex) {
    console.log(ex)
  }

  return null
}

/**
 * @constructor
 * Server initialisation
 */
const Server = function () {}

Server.prototype.getOptions = function (override = {}) {
  const formatters = {
    'text/plain': (req, res, body) => {
      if (body instanceof Error) {
        log.error(body.stack)

        return body.message
      }
    }
  }

  return Object.assign({
    formatters,
    host: config.get('server.host'),
    log,
    port: config.get('server.port')
  }, override)
}

/**
 * Start server
 * @return {Promise}  Add Listener
 */
Server.prototype.start = function () {
  // Inject API UUIDs in config
  config.set('apis', getApisBlockWithUUIDs(config.get('apis')))

  // If we're using ssl, create a server on port 80 to handle redirects
  this.createRedirectServer()

  return this.createPrimaryServer()
}

Server.prototype.restartServers = function () {
  if (this.primaryServer) {
    this.primaryServer.close(server => {
      this.createPrimaryServer()
    })
  }

  if (this.redirectServer) {
    this.redirectServer.close(server => {
      this.createRedirectServer()
    })
  }
}

Server.prototype.createPrimaryServer = function () {
  return new Promise((resolve, reject) => {
    let serverOptions = this.getOptions()
    let protocol = config.get('server.protocol')

    if (protocol === 'http') {
      this.primaryServer = restify.createServer(serverOptions)
    } else if (protocol === 'https') {
      let passphrase = config.get('server.sslPassphrase')
      let caPath = config.get('server.sslIntermediateCertificatePath')
      let caPaths = config.get('server.sslIntermediateCertificatePaths')

      serverOptions.port = 443

      serverOptions.certificate = readFileSyncSafe(config.get('server.sslCertificatePath'))
      serverOptions.key = readFileSyncSafe(config.get('server.sslPrivateKeyPath'))

      if (passphrase && passphrase.length >= 4) {
        serverOptions.passphrase = passphrase
      }

      if (caPaths && caPaths.length > 0) {
        serverOptions.ca = []
        caPaths.forEach(path => {
          let data = readFileSyncSafe(path)

          if (data) {
            serverOptions.ca.push(data)
          }
        })
      } else if (caPath && caPath.length > 0) {
        serverOptions.ca = readFileSyncSafe(caPath)
      }

      // We need to catch any errors resulting from bad parameters,
      // such as incorrect passphrase or no passphrase provided.
      try {
        this.primaryServer = restify.createServer(serverOptions)
      } catch (ex) {
        let exPrefix = 'error starting https server: '

        switch (ex.message) {
          case 'error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt':
            throw new Error(exPrefix + 'incorrect ssl passphrase')

          case 'error:0906A068:PEM routines:PEM_do_header:bad password read':
            throw new Error(exPrefix + 'required ssl passphrase not provided')

          default:
            throw new Error(exPrefix + ex.message)
        }
      }
    }

    // Add all routes to server
    new Router(this.primaryServer).addRoutes()

    // Add listeners and initialise socket
    return this
      .addListeners(this.primaryServer, serverOptions)
      .then(() => {
        this.socket = new Socket(this.primaryServer)

        return resolve()
      })
  })
}

Server.prototype.createRedirectServer = function () {
  let redirectServer
  let serverOptions = this.getOptions()

  let redirectPort = config.get('server.redirectPort')

  if (redirectPort > 0) {
    serverOptions.port = redirectPort

    redirectServer = restify.createServer(serverOptions)
    redirectServer.on('listening', this.onRedirectListening)
    redirectServer.listen(redirectPort)

    redirectServer.get('*', (req, res) => {
      let port = config.get('server.port')
      let hostname = req.headers.host.split(':')[0]
      let location = `https://${hostname}:${port}${req.url}`

      res.setHeader('Location', location)
      res.statusCode = 301
      res.end()
    })
  }
}

/**
 * Handler function for when the HTTP->HTTPS redirect server
 * is listening for requests.
 */
Server.prototype.onRedirectListening = function () {
  let address = this.address()
  let env = config.get('env')

  let startText = ''

  /* istanbul ignore next */
  if (env !== 'test') {
    startText = '\n  ----------------------------\n'
    startText += '  Started HTTP -> HTTPS Redirect\n'
    startText += '  ----------------------------\n'
    startText += '  Server:      '.green + address.address + ':' + address.port + '\n'
    startText += '  ----------------------------\n'

    console.log(startText)
  }
}

/**
 * Add Listeners
 * Set all listeners for Resify server instance
 */
Server.prototype.addListeners = function (server, options) {
  if (isNaN(options.port)) throw new Error('Port must be a valid Number.')
  if (typeof options.host !== 'string') throw new Error('Host must be a valid String.')

  return new Promise(resolve => server
    .listen(Number(options.port), options.host, resolve))
}

module.exports = function () {
  return new Server()
}

module.exports.Server = Server

