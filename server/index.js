const config = require('../config')
const cookieParser = require('restify-cookies')
const fs = require('fs')
const log = require('@dadi/logger')
const restify = require('restify')

class Server {
  constructor() {
    this.routes = [
      require('./routes/static'),
      require('./routes/config'),
      require('./routes/app')
    ]
  }

  attachMainServerRoutes(server) {
    server
      .use(restify.plugins.gzipResponse())
      .use(restify.plugins.queryParser({mapParams: true}))
      .use(restify.plugins.bodyParser({mapParams: true}))
      .use(cookieParser.parse)
      .use(log.requestLogger)

    this.routes.forEach(route => {
      route(server)
    })

    return server
  }

  attachRedirectServerRoutes(server) {
    server.get('*', (req, res) => {
      const port = config.get('server.port')
      const hostname = req.headers.host.split(':')[0]
      const location = `https://${hostname}:${port}${req.url}`

      res.setHeader('Location', location)
      res.statusCode = 301
      res.end()
    })
  }

  createHttpServer() {
    const options = {
      log
    }

    return restify.createServer(options)
  }

  createHttpsServer() {
    const passphrase = config.get('server.sslPassphrase')
    const caPath = config.get('server.sslIntermediateCertificatePath')
    const caPaths = config.get('server.sslIntermediateCertificatePaths')
    const certificate = fs.readFileSync(
      config.get('server.sslCertificatePath'),
      'utf8'
    )
    const key = fs.readFileSync(config.get('server.sslPrivateKeyPath'), 'utf8')

    let ca

    if (caPaths && caPaths.length > 0) {
      ca = caPaths
        .map(path => {
          const data = fs.readFileSync(path, 'utf8')

          return data
        })
        .filter(Boolean)
    } else if (caPath && caPath.length > 0) {
      ca = fs.readFileSync(caPath, 'utf8')
    }

    const options = {
      ca,
      certificate,
      log,
      key
    }

    if (passphrase && passphrase.length > 0) {
      options.passphrase = passphrase
    }

    try {
      const httpsServer = restify.createServer(options)

      return httpsServer
    } catch (error) {
      const prefix = 'error starting https server'

      // We need to catch any errors resulting from bad parameters,
      // such as incorrect passphrase or no passphrase provided.
      switch (error.message) {
        case 'error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt':
          throw new Error(`${prefix}: incorrect ssl passphrase`)

        case 'error:0906A068:PEM routines:PEM_do_header:bad password read':
          throw new Error(`${prefix}: required ssl passphrase not provided`)

        default:
          throw new Error(`${prefix}: ${error.message}`)
      }
    }
  }

  start() {
    const port = config.get('server.port')
    const redirectPort = config.get('server.redirectPort')
    const protocol = config.get('server.protocol')
    const mainServer =
      protocol === 'https' ? this.createHttpsServer() : this.createHttpServer()

    this.mainServer = mainServer

    // Initialise routes.
    this.attachMainServerRoutes(mainServer)

    // Initialise logger.
    log.init(config.get('logging'), {}, config.get('env'))

    const servers = [
      new Promise(resolve => {
        mainServer.listen(port, resolve)
      })
    ]

    // Do we need to create an HTTP server to redirect traffic to HTTPS?
    if (protocol === 'https' && redirectPort > 0) {
      const redirectServer = this.createHttpServer()

      this.redirectServer = redirectServer

      this.attachRedirectServerRoutes(redirectServer)

      servers.push(
        new Promise(resolve => redirectServer.listen(redirectPort, resolve))
      )
    }

    return Promise.all(servers)
  }

  stop() {
    const runningServers = [this.mainServer, this.redirectServer].filter(
      Boolean
    )

    let closedServers = 0

    return new Promise((resolve, reject) => {
      runningServers.forEach(server => {
        try {
          server.close(() => {
            closedServers++

            if (closedServers === runningServers.length) {
              return resolve()
            }
          })
        } catch (error) {
          return reject(error)
        }
      })
    })
  }
}

module.exports = Server
