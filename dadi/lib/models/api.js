'use strict'

const DadiAPI = require('@dadi/api-wrapper')
const _ = require('underscore')

const Api =  function () {}

/**
 * Configure API
 * Configure new instance of api-wrapper
 * @param  {Object} conf Configuration settings object
 * @return {DadiAPI}      Configure instance of DADI api-wrapper
 */
const configure = ({host, port, credentials, version, database}) => {
  return {
    appId: 'DADI Publish',
    uri: host,
    port: port,
    credentials: credentials,
     // debug: config.get('logging.level') === 'debug' ? true : false // Not yet set in config
    version: version || '1.0',
    database: database
  }
}

const extendWithPrototypes = function () {
  _.each(Object.getPrototypeOf(new Api), (value, key) => {
    DadiAPI.prototype[key] = value
  })
}

module.exports = function (options) {
  extendWithPrototypes() // Extend API wrapper with Api prototypes
  return new DadiAPI(configure(options))
}

module.exports.Api = Api