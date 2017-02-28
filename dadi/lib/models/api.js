'use strict'

const DadiAPI = require('@dadi/api-wrapper')

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

module.exports = function (options) {
  return new DadiAPI(configure(options))
}

module.exports.Api = Api