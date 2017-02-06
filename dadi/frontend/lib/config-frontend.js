'use strict'

const config = require('../../config')
const _ = require('underscore')
const whitelist = [
  'app',
  'apis',
  'ui',
  'server.host',
  'server.port',
  'TZ',
  'env'
]

const Config = function () {
  let data = _.map(whitelist, (key) => {
    return {key: key, value: config.get(key)}
  })
  return _.object(_.pluck(data, 'key'), _.pluck(data, 'value'))
}

module.exports = new Config()
