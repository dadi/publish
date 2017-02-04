'use strict'

const config = require(paths.config)
const DB = require(paths.lib.db)
const errors = require('restify-errors')

const localDB = function () {
}

/**
 * GET 
 * Fetch document from local DB
 * @param  {req}   req  request object
 * @param  {res}   res  response object
 * @param  {Function} next callback
 * @return {Function}        next callback
 */
localDB.prototype.get = function (req, res, next) {
  res.header('Content-Type', 'application/json')
  if (!req.isAuthenticated() && config.get('localDB.authenticate')) {
    return next(new errors.UnauthorizedError())
  }
  if (!req.is('application/json')) {
    return next(new errors.InvalidHeaderError())
  }
  new DB().get(req.params).then((response) => {
    res.end(JSON.stringify(response, null, 2))
    return next()
  })
}

/**
 * POST 
 * Insert new document to local DB
 * @param  {req}   req  request object
 * @param  {res}   res  response object
 * @param  {Function} next callback
 * @return {Function}        next callback
 */
localDB.prototype.post = function (req, res, next) {
  res.header('Content-Type', 'application/json')
  if (!req.isAuthenticated() && config.get('localDB.authenticate')) {
    return next(new errors.UnauthorizedError())
  }
  if (!req.is('application/json')) {
    return next(new errors.InvalidHeaderError())
  }
  new DB().post(req.params, req.body).then((response) => {
    res.end(JSON.stringify(response, null, 2))
    return next()
  })
}

/**
 * PUT
 * Update document in local DB
 * @param  {req}   req  request object
 * @param  {res}   res  response object
 * @param  {Function} next callback
 * @return {Function}        next callback
 */
localDB.prototype.put = function (req, res, next) {
  res.header('Content-Type', 'application/json')
  if (!req.isAuthenticated() && config.get('localDB.authenticate')) {
    return next(new errors.UnauthorizedError())
  }
  if (!req.is('application/json')) {
    return next(new errors.InvalidHeaderError())
  }
  new DB().put(req.params, req.body).then((response) => {
    res.end(JSON.stringify(response, null, 2))
    return next()
  })
}

/**
 * DELETE
 * Delete document in local DB
 * @param  {req}   req  request object
 * @param  {res}   res  response object
 * @param  {Function} next callback
 * @return {Function}        next callback
 */
localDB.prototype.delete = function (req, res, next) {
  res.header('Content-Type', 'application/json')
  if (!req.isAuthenticated() && config.get('localDB.authenticate')) {
    return next(new errors.UnauthorizedError())
  }
  if (!req.is('application/json')) {
    return next(new errors.InvalidHeaderError())
  }
  new DB().delete(req.params).then((response) => {
    res.end(JSON.stringify(response, null, 2))
    return next()
  })
}

module.exports = function() {
  return new localDB()
}

module.exports.localDB = localDB