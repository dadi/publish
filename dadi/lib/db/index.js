'use strict'

/*
TO DO
- Take Class constructions from a schema file
- Detect arrays and switch between:
 - Single:
    this.value = new dbClass.valueClass(data.value)
  - Array
    this.values =_.map(data.values, value => {return new dbClass.valueClass(value)})
 */

const config = require(GLOBAL.paths.config)
const RDBWrapper = require('reasondb-wrapper')
const mkdirp = require('mkdirp')
const _ = require('underscore')
const path = require('path')
const redis = require('redis')
const Schemas = require(`${paths.lib.db}/schemas` )

const schemas = new Schemas()


const options = {
  root:  path.resolve(config.get('paths.db')),
  key: '_id',
  clear: false,
  active: true,
  async: true
}

const db = new RDBWrapper(options)

const forceJson = function (val) {
  return typeof val === 'string' ? JSON.parse(val) : val
}

const DB = function () {
  this.pagesize = 20
}

/**
 * DB Get query
 * @param  {Object} params Request parameters
 * @return {Promise}        Resolved promise with Stringified JSON
 */
DB.prototype.results = function () {
  this.resultsOnly = true
  return this
}

/**
 * DB Get query
 * @param  {Object} params Request parameters
 * @return {Promise}        Resolved promise with Stringified JSON
 */
DB.prototype.get = function (params) {
  
  let _id = ((params.filter && params.filter._id) ? params.filter._id : params._id) || null
  let instance = schemas.getSchema(params.collection)
  let filter = forceJson(params.filter) || {}
  
  if (_id) {
    Object.assign(filter, {[`${options.key}`]: _id})
  }
  return db.use(instance)
  .page(params.page || 1)
  .limit(params.limit || this.pagesize)
  .fields(params.fields || {})
  .filter(filter)
  .onlyResults(this.resultsOnly || false)
  .get()
  .then((response) => {
    return response
  })
}

/**
 * DB Insert query
 * @param  {Object} params Request parameters
 * @param  {Object} data Post body data (JSON)
 * @return {Promise}        Resolved promise with Stringified JSON
 */
DB.prototype.post = function (params, data) {
  let instance = schemas.getSchema(params.collection)
  return db.use(instance)
  .post(data).then((results) => {
    return results
  })
}

/**
 * DB Update query
 * @param  {Object} params Request parameters
 * @param  {Object} data Post body data (JSON)
 * @return {Promise}        Resolved promise with Stringified JSON
 */
DB.prototype.put = function (params, data) {
  let instance = schemas.getSchema(params.collection)
  return db.use(instance)
  .update(params._id, data)
  .then((results) => {
    return results
  })
}

/**
 * DB Delete query
 * @param  {Object} params Request parameters
 * @return {Promise}        Resolved promise with Stringified JSON
 */
DB.prototype.delete = function (params) {
  let instance = schemas.getSchema(params.collection)
  return db.use(instance)
  .delete(params._id)
  .then((results) => {
    return results
  })
}

module.exports = function () {
  return new DB()
}

module.exports.DB = DB