const config = require(paths.config)
const cookieParser = require('restify-cookies')
const flash = require('connect-flash')
const fs = require('fs')
const log = require('@dadi/logger')
const path = require('path')
const packageJson = require(
  path.join(paths.base, 'package.json')
)
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
    log.error({module: 'router'}, 'addRoutes failed: this.server is undefined')

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

Router.prototype.getRoutes = function () {
  try {
    fs.readdirSync(path.resolve(this.routesDir)).forEach((file) => {
      // Require module with its name (from filename), passing app
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
    log.error({module: 'router'}, 'webRoutes failed: this.server is undefined')

    return
  }

  // The user's /workspace/public folder can override the system one
  this.server.get('/public/*', (req, res, next) => {
    restify.plugins.serveStatic({
      directory: path.join(process.cwd(), 'workspace')
    })(req, res, (err) => {
      if (err) {
        restify.plugins.serveStatic({
          directory: path.resolve(__dirname, '../../..')
        })(req, res, next)
      }
    })
  })

  // Respond to HEAD requests - this is used by ConnectionMonitor in App.jsx.
  this.server.head('*', (req, res, next) => {
    res.header('Content-Type', 'application/json')

    return res.end()
  })

  this.server.get('*', (req, res, next) => {
    res.header('Content-Type', 'text/html; charset=utf-8')

    let entryPointPage = this.entryPointTemplate.replace(
      '/*@@publishVersion@@*/',
      `window.__version__ = ${JSON.stringify(packageJson.version)};`
    )
    let accessToken = req.cookies && req.cookies.accessToken
    let authenticate = Promise.resolve()
    let apis = config.get('apis')
    let mainApi = apis.length && apis[0]

    if (accessToken && mainApi) {
      authenticate = request({
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        json: true,
        uri: `${mainApi.host}:${mainApi.port}/api/client`
      }).then(({results}) => {
        entryPointPage = entryPointPage
          .replace(
            '/*@@config@@*/',
            `window.__config__ = ${config.toString()};`
          )
          .replace(
            '/*@@client@@*/',
            `window.__client__ = ${JSON.stringify(results[0])};`
          )
      }).catch(error => {
        log.error({module: 'router'}, error)

        entryPointPage = entryPointPage
          .replace(
            '/*@@apiError@@*/',
            `window.__apiError__ = ${JSON.stringify(error)};`
          )
          .replace(
            '/*@@config@@*/',
            `window.__config__ = ${JSON.stringify(config.getUnauthenticatedConfig())};`
          )
      })
    } else {
      entryPointPage = entryPointPage
        .replace(
          '/*@@config@@*/',
          `window.__config__ = ${JSON.stringify(config.getUnauthenticatedConfig())};`
        )
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
    log.error({module: 'router'}, 'componentRoutes failed: this.server is undefined')

    return
  }

  // Fetch aditional component schema
  fs.readdirSync(dir).forEach(folder => {
    let sub = path.resolve(dir, folder)

    if (fs.lstatSync(sub).isDirectory()) {
      this.componentRoutes(sub, match)
    } else if (fs.lstatSync(sub).isFile()) {
      let file = path.parse(sub)

      if (
        (file.ext === '.js') &&
        file.name.match(match)
      ) {
        let controller = require(sub)

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
    log.error({module: 'router'}, 'setHeaders failed: this.server is undefined')

    return
  }

  this.server.use((req, res, next) => {
    res.set({
      'ETag': 'publish-etag',
      'Last-Modified': new Date(),
      'Vary': 'Accept-Encoding'
    })

    return next()
  })
}

/**
 * Pre Middleware
 * @param  {restify} app Restify web server instance
 */
Router.prototype.pre = function () {
  if (!this.server) {
    log.error({module: 'router'}, 'pre failed: this.server is undefined')

    return
  }

  this.server.pre(restify.plugins.pre.sanitizePath())
}

/**
 * Middleware
 * @param  {restify} app Restify web server instance
 */
Router.prototype.use = function () {
  if (!this.server) {
    log.error({module: 'router'}, 'use failed: this.server is undefined')

    return
  }

  this.server
    .use(restify.plugins.gzipResponse())
    .use(restify.plugins.queryParser({mapParams: true}))
    .use(restify.plugins.bodyParser({mapParams: true}))
    .use(cookieParser.parse)
    .use(log.requestLogger)
    .use(session({
      key: 'dadi-publish',
      resave: true,
      saveUninitialized: true,
      secret: 'keyboard cat'
    }))
    .use(flash())
}

module.exports = function (server) {
  return new Router(server)
}

module.exports.Router = Router
