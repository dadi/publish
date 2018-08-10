'use strict'

const Collection = require(`${paths.lib.models}/collection`)
const config = require(paths.config)
const cookieParser = require('restify-cookies')
const flash = require('connect-flash')
const fs = require('fs')
const log = require('@dadi/logger')
const path = require('path')
const request = require('request-promise')
const restify = require('restify')
const session = require('cookie-session')

/**
 * @constructor
 * App Router
 */
const Router = function (server) {
  this.publicDir = path.resolve(__dirname, '../../../public')
  this.routesDir = path.join(__dirname, 'routes')
  this.server = server
  this.entryPointTemplate = fs.readFileSync(path.join(this.publicDir, 'index.html'), 'utf8')
}

/**
 * Add Routes
 */
Router.prototype.addRoutes = function () {
  if (!this.server) {
    log.error({module: 'router'}, `setHeaders failed: this.server is undefined`)

    return
  }

  this.pre()
  this.use()
  this.getRoutes()
  this.componentRoutes(path.resolve(`${paths.frontend.components}`), /Routes$/g)
  this.setHeaders()
  this.webRoutes()
  return this
}

Router.prototype.addSecureRedirect = function (ssl) {
  this.server.use(this.secureRedirect(ssl))
  return this
}

Router.prototype.secureRedirect = function (ssl) {
  return (req, res, next) => {
    // Skip redirect if ssl is not present
    if (!ssl.getKey() || !ssl.getCertificate()) return next()

    const hostname = req.headers.host.split(':')[0]
    const location = `https://${hostname}${req.url}`

    res.setHeader('Location', location)
    res.statusCode = 301
    return res.end()
  }
}

Router.prototype.getRoutes = function () {
  try {
    fs.readdirSync(path.resolve(this.routesDir)).forEach((file) => {
      /* require module with its name (from filename), passing app */
      let controller = require(path.join(this.routesDir, file))

      controller(this.server)
    })
  } catch (error) {
    log.warn({module: 'router'}, error)
  }
}

/**
 * Web routes (Needs moving to controller?)
 * For use with isomorphic web application base route
 */
Router.prototype.webRoutes = function () {
  if (!this.server) {
    log.error({module: 'router'}, `setHeaders failed: this.server is undefined`)

    return
  }

  this.server.get(/\/public\/?.*/, restify.serveStatic({
    directory: path.resolve(__dirname, '../../..')
  }))

  // Respond to HEAD requests - this is used by ConnectionMonitor in App.jsx.
  this.server.head(/.*/, (req, res, next) => {
    res.header('Content-Type', 'application/json')

    return res.end()
  })

  this.server.get(/.*/, (req, res, next) => {
    res.header('Content-Type', 'text/html; charset=utf-8')

    let entryPointPage = this.entryPointTemplate
      .replace(
        '/*@@apiInfo@@*/',
        `window.__apiInfo__ = ${JSON.stringify(config.get('apis.0'))};`
      )

    let accessToken = req.cookies && req.cookies.accessToken
    let authenticate = Promise.resolve()

    if (accessToken) {
      authenticate = new Collection({accessToken})
        .buildCollectionRoutes()
        .then(documentRoutes => {
          if (documentRoutes) {
            entryPointPage = entryPointPage
              .replace(
                '/*@@documentRoutes@@*/',
                `window.__documentRoutes__ = ${JSON.stringify(documentRoutes)};`
              )
              .replace(
                '/*@@config@@*/',
                `window.__config__ = ${config.toString()};`
              )
          }

          let api = config.get('apis.0')

          return request({
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            json: true,
            uri: `${api.host}:${api.port}/api/client`
          })
        }).then(({results}) => {
          entryPointPage = entryPointPage
            .replace(
              '/*@@client@@*/',
              `window.__client__ = ${JSON.stringify(results[0])};`
            )
        })
        .catch(e => {
          log.error({module: 'router'}, `buildCollectionRoutes failed: ${JSON.stringify(e)}`)

          entryPointPage = entryPointPage.replace(
            '/*@@apiError@@*/',
            `window.__apiError__ = ${JSON.stringify(e)};`
          )
        })
    }

    return authenticate.then(() => {
      res.end(entryPointPage)

      return next()
    })
  })
}

/**
 * Add component routes
 */
Router.prototype.componentRoutes = function (dir, match) {
  if (!this.server) {
    log.error({module: 'router'}, `setHeaders failed: this.server is undefined`)

    return
  }

  // Fetch aditional component schema
  fs.readdirSync(dir).forEach(folder => {
    const sub = path.resolve(dir, folder)

    if (fs.lstatSync(sub).isDirectory()) {
      this.componentRoutes(sub, match)
    } else if (fs.lstatSync(sub).isFile()) {
      const file = path.parse(sub)

      if (
        (file.ext === '.js') &&
        file.name.match(match)
      ) {
        const controller = require(sub)

        controller(this.server)
      }
    }
  })
}

/**
 * Set headers
 */
Router.prototype.setHeaders = function () {
  if (!this.server) {
    log.error({module: 'router'}, `setHeaders failed: this.server is undefined`)

    return
  }

  this.server.use((req, res, next) => {
    res.set({
      'Last-Modified': new Date(),
      'ETag': 'publish-etag',
      'Vary': 'Accept-Encoding'
    })

    return next()
  })
}

/**
 * Middleware
 * @param  {restify} app Restify web server instance
 */
Router.prototype.use = function () {
  if (!this.server) {
    log.error({module: 'router'}, `use failed: this.server is undefined`)

    return
  }

  this.server
    .use(restify.gzipResponse())
    .use(restify.queryParser())
    .use(restify.bodyParser({mapParams: true})) // Changing to false throws issues with auth. Needs addressing
    .use(cookieParser.parse)
    // Request logging middleware.
    .use(log.requestLogger)
    // Add session.
    .use(session({
      key: 'dadi-publish',
      secret: 'keyboard cat',
      saveUninitialized: true,
      resave: true
    }))
    .use(flash())
}

/**
 * Pre Middleware
 * @param  {restify} app Restify web server instance
 */
Router.prototype.pre = function () {
  if (!this.server) {
    log.error({module: 'router'}, `use failed: this.server is undefined`)

    return
  }

  this.server.pre(restify.pre.sanitizePath())
}

module.exports = function (server) {
  return new Router(server)
}

module.exports.Router = Router
