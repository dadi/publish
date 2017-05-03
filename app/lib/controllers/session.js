'use strict'

const config = require(paths.config)
const Api = require(`${paths.lib.models}/api`)

const Session = function () {}

Session.prototype.authorise = function (email, password, next) {
  let authAPI = config.get('auth')

  if (!authAPI.enabled) return next(null)

  return new Api(authAPI)
    .in(authAPI.collection)
    .whereFieldIsEqualTo('email', email)
    .whereFieldIsEqualTo('password', password)
    .find({extractResults: true}).then(user => {
      if (user.length > 0) {
        return next(null, user[0])
      } else {
        return next(null)
      }
    }).catch(response => {
      if ((response.error instanceof Array) && (response.error[0].details.includes('WRONG_CREDENTIALS'))) {
        return next('WRONG_CREDENTIALS')
      }

      return next('MISSING_AUTH_API')
    })
}

Session.prototype.delete = function (req, res, next) {
  req.logout()
  res.write(JSON.stringify({authenticated: req.isAuthenticated()}))
  res.end()

  return next()
}

Session.prototype.get = function (req, res, next) {
  res.header('Content-Type', 'application/json')

  if (req.isAuthenticated()) {
    res.write(JSON.stringify(req.session.passport.user))
    res.end()

    return next()
  } else {
    res.statusCode = 401
    res.write(JSON.stringify({err: 'AUTH_FAILED'}))
    res.end()

    return next()
  }
}

Session.prototype.post = function (req, res, next, passport) {
  res.header('Content-Type', 'application/json')

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      switch (err) {
        case 'MISSING_AUTH_API':
          res.statusCode = 503
          res.write(JSON.stringify({err}))

          break

        case 'WRONG_CREDENTIALS':
          res.statusCode = 401
          res.write(JSON.stringify({err}))

          break

        default:
          res.statusCode = 500
          res.write(JSON.stringify({err: 'UNKNOWN_ERROR'}))

          break
      }

      res.end()

      return next()
    } else {
      req.login(user, {}, (err) => {
        if (err) {
          res.statusCode = 401
          res.write(JSON.stringify({err: 'AUTH_FAILED'}))
        } else {
          res.write(JSON.stringify(user))
        }

        res.end()

        return next()
      })
    }
  })(req, res, next)
}

Session.prototype.put = function (req, res, next) {
  req.login(req.body, {}, err => {
    if (err) {
      res.statusCode = 500
    }

    res.write(JSON.stringify({}))
    res.end()
  })

  return next()
}

module.exports = function () {
  return new Session()
}

module.exports.Session = Session
