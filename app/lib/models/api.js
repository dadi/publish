'use strict'

const DadiAPI = require('@dadi/api-wrapper')

const Api = function (options) {
  if (!options) return
  return this.configure(options)
}

/**
 * Configure API
 * Configure new instance of api-wrapper
 * @param  {Object} conf Configuration settings object
 * @return {DadiAPI} Configure instance of DADI api-wrapper
 */
Api.prototype.configure = function ({host, port, credentials, version, database}) {
  return new DadiAPI({
    appId: 'DADI Publish',
    uri: host,
    port: port,
    credentials: credentials,
     // debug: config.get('logging.level') === 'debug' ? true : false // Not yet set in config
    version: version || '1.0',
    database: database
  })
}

module.exports = function (options) {
  return new Api(options)
}

module.exports.Api = Api
