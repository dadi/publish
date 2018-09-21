'use strict'
const ComponentTreePlugin = require('component-tree-webpack-plugin')

let config = require('../webpack.config')

config.plugins = config.plugins.filter(plugin => !(plugin instanceof ComponentTreePlugin))

config.resolve.alias['react'] =  'preact-compat'
config.resolve.alias['react-dom'] =  'preact-compat'

module.exports = config