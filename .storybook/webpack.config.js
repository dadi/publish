'use strict'

let config = require('../webpack.config')

config.resolve.alias['react'] =  'preact-compat'
config.resolve.alias['react-dom'] =  'preact-compat'

module.exports = config