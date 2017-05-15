'use strict'

const config = require(paths.config)
const Api = require(`${paths.lib.models}/api`)

const Session = function () {}

/**
 * Authorise
 * User email/password authorisation through API request.
 * @param  {Object} req server request.
 * @param  {Object} res server response.
 * @param  {Function} next Next middleware process.
 * @return {Function} Next method call.
 */
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

/**
 * Delete
 * Remove user.
 * @param  {Object} req server request.
 * @param  {Object} res server response.
 * @param  {Function} next Next middleware process.
 * @return {Function} Next method call.
 */
Session.prototype.delete = function (req, res, next) {
  req.logout()
  res.write(JSON.stringify({authenticated: req.isAuthenticated()}))
  res.end()

  return next()
}

/**
 * Get
 * Fetch user if isAuthenticated.
 * @param  {Object} req server request.
 * @param  {Object} res server response.
 * @param  {Function} next Next middleware process.
 * @return {Function} Next method call.
 */
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

/**
 * Post
 * Create user record.
 * @param  {Object} req server request.
 * @param  {Object} res server response.
 * @param  {Function} next Next middleware process.
 * @return {Function} Next method call.
 */
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

/**
 * Put
 * Update user record.
 * @param  {Object} req server request.
 * @param  {Object} res server response.
 * @param  {Function} next Next middleware process.
 * @return {Function} Next method call.
 */
Session.prototype.put = function (req, res, next) {
  res.header('Content-Type', 'application/json')

  req.login(req.body, {}, err => {
    if (err) {
      res.statusCode = 500
    }

    res.write(JSON.stringify({}))
    res.end()
  })

  return next()
}

/**
 * Reset
 * Reset password.
 * @param  {Object} req server request.
 * @param  {Object} res server response.
 * @param  {Function} next Next middleware process.
 * @return {Function} Next method call.
 */
Session.prototype.reset = function (req, res, next) {
  res.header('Content-Type', 'application/json')

  let authAPI = config.get('auth')

  // No authentication.
  if (!authAPI.enabled) {
    res.write(JSON.stringify({error: 'AUTH_DISABLED'}))
    res.end()
    return next()
  }

  // No authentication.
  if (!authAPI.enabled) {
    res.write(JSON.stringify({error: 'AUTH_DISABLED'}))
    res.end()
    return next()
  }

  if (req.body && (req.body.token && req.body.password)) {
    return new Api(authAPI)
      .in(authAPI.collection)
      .whereFieldIsEqualTo('loginToken', req.body.token)
      .update({password: req.body.password})
      .then(resp => {
        if (resp.results.length) {
          res.write(JSON.stringify({success: true}))
        } else {
          res.write(JSON.stringify({err: 'PASSWORD_RESET_FAILED'}))
        }
        res.end()

        return next()
      })
  }
}

/**
 * Reset token
 * Fetch password reset token.
 * @param  {Object} req server request.
 * @param  {Object} res server response.
 * @param  {Function} next Next middleware process.
 * @return {Function} Next method call.
 */
Session.prototype.resetToken = function (req, res, next) {
  res.header('Content-Type', 'application/json')

  let authAPI = config.get('auth')

  // No authentication.
  if (!authAPI.enabled) {
    res.write(JSON.stringify({error: 'AUTH_DISABLED'}))
    res.end()
    return next()
  }

  // Check for required email value.
  if (req.body && req.body.email) {
    return new Api(authAPI)
      .in(authAPI.collection)
      .whereFieldIsEqualTo('email', req.body.email)
      .update({
        loginWithToken: true
      })
      .then(resp => {
        res.write(JSON.stringify({expiresAt: 1494516108})) // TO-DO: Remove temporary expiration param.
        res.end()

        return next()
      })
  }

  // Default: email address missing error.
  res.write(JSON.stringify({error: 'MISSING_EMAIL_ADDRESS'}))
  res.end()

  return next()
}

module.exports = function () {
  return new Session()
}

module.exports.Session = Session
