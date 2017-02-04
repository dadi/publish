'use strict'

const convict = require('convict')
const path = require('path')
// Define a schema
const conf = convict(require('./config-schema'))

// Load environment dependent configuration
const env = conf.get('env')

try {
  conf.loadFile(path.resolve(__dirname + '/../config/config.' + env + '.json'))
} catch (e) {
  console.log('Failed to load config, dropping to defaults.')
}

// Perform validation
conf.validate({})

module.exports = conf
