'use strict'

const config = require(paths.config)
const DadiAPI = require('@dadi/api-wrapper')
const Constants = require(`${paths.lib.root}/constants`)

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
  const authAPI = config.get('auth')

  // No authentication.
  if (!authAPI.enabled) {
    this.returnAuthDisabled({next})
  }

  return new DadiAPI(Object.assign(authAPI, {uri: authAPI.host}))
    .in(authAPI.collection)
    .whereFieldIsEqualTo('email', email)
    .whereFieldIsEqualTo('password', password)
    .find({extractResults: true})
    .then(users => {
      if (users && users.length > 0) {
        return next(null, users[0])
      } else {
        return next(Constants.WRONG_CREDENTIALS)
      }
    }).catch(response => {
      if (response && response.error && Array.isArray(response.error) && (response.error[0].code === Constants.WRONG_CREDENTIALS)) {
        return next(Constants.WRONG_CREDENTIALS)
      }

      return next(Constants.AUTH_UNREACHABLE)
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
  res.header('Content-Type', 'application/json')
  req.logout()
  res.end(JSON.stringify({authenticated: req.isAuthenticated()}))

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
  const authAPI = config.get('auth')
  res.header('Content-Type', 'application/json')

  // No authentication.
  if (!authAPI.enabled) {
    this.returnAuthDisabled({res, next})
  }

  if (req.isAuthenticated()) {
    res.end(JSON.stringify(req.session.passport.user))

    return next()
  } else {
    res.statusCode = 401
    res.end(JSON.stringify({error: Constants.AUTH_FAILED}))

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

  passport.authenticate('local', (error, user) => {
    if (error) {
      switch (error) {
        case Constants.AUTH_DISABLED:
          this.returnAuthDisabled({res, next})

          break

        case Constants.AUTH_UNREACHABLE:
          res.statusCode = 404
          res.end(JSON.stringify({error}))

          break

        case Constants.WRONG_CREDENTIALS:
          res.statusCode = 401
          res.end(JSON.stringify({error}))

          break

        default:
          res.statusCode = 500
          res.end(JSON.stringify({error: Constants.UNKNOWN_ERROR}))

          break
      }

      return next()
    } else {
      req.login(user, {}, error => {
        if (error) {
          res.statusCode = 401
          res.end(JSON.stringify({error: Constants.AUTH_FAILED}))
        } else {
          res.end(JSON.stringify(user))
        }

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

    res.end(JSON.stringify({}))
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

  const authAPI = config.get('auth')

  // No authentication.
  if (!authAPI.enabled) {
    this.returnAuthDisabled({res, next})
  }

  // If token and password are missing return error.
  if (!req.body || !(req.body.token && req.body.password)) {
    res.end(JSON.stringify({error: Constants.PASSWORD_RESET_INVALID}))

    return next()
  }

  return new DadiAPI(Object.assign(authAPI, {uri: authAPI.host}))
    .in(authAPI.collection)
    .whereFieldIsEqualTo('loginToken', req.body.token)
    .update({password: req.body.password})
    .then(resp => {
      if (resp.results.length) {
        res.end(JSON.stringify({success: true}))
      } else {
        res.end(JSON.stringify({error: Constants.PASSWORD_RESET_FAILED}))
      }

      return next()
    })
}

Session.prototype.returnAuthDisabled = function ({
  res = null,
  next
  }) {
  if (!res) return next(null)

  res.statusCode = 503
  res.end(JSON.stringify({error: Constants.AUTH_DISABLED}))

  return next()
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

  const authAPI = config.get('auth')

  // No authentication.
  if (!authAPI.enabled) {
    this.returnAuthDisabled({res, next})
  }

  // Check for required email value.
  if (!req.body || !req.body.email) {
    res.end(JSON.stringify({error: Constants.INVALID_EMAIL}))

    return next()
  }
  // TO-DO: Handle missing user.

  return new DadiAPI(Object.assign(authAPI, {uri: authAPI.host}))
    .in(authAPI.collection)
    .whereFieldIsEqualTo('email', req.body.email)
    .update({
      loginWithToken: true
    })
    .then(resp => {
      res.end(JSON.stringify({expiresAt: 1494516108})) // TO-DO: Remove temporary expiration param.

      return next()
    })
}

module.exports = function () {
  return new Session()
}

module.exports.Session = Session
