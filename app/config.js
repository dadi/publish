'use strict'

const convict = require('convict')
const path = require('path')
const fs = require('fs')
// Define a schema
const schema = require('./config-schema')

/**
 * Get Adittional Schema
 * @param  {String} dir   Directory to searcg
 * @param  {Regex} match Filename regular expression
 * @return {undefined}
 */
const getAdditionalSchema = (dir, match) => {
  fs.readdirSync(dir).forEach(folder => {
    let sub = path.resolve(dir, folder)

    if (fs.lstatSync(sub).isDirectory()) {
      getAdditionalSchema(sub, match)
    } else if (fs.lstatSync(sub).isFile()) {
      let file = path.parse(sub)

      if (file.ext === '.js' && file.name.match(match)) {
        let subSchema = require(sub)
        Object.assign(schema, subSchema)
      }
    }
  })
}

const getFrontendProps = (schema = {}, prev = {}) => {
  return Object.assign(prev,
    ...Object.keys(schema).filter(key => Object.is(schema[key].availableInFrontend, true))
    .map(key => {
      const val = getFrontendProps(schema[key], {})
      return {[`${key}`]: Object.keys(val).length > 0 ? val : true}
    })
  )
}

// Fetch aditional component schema
getAdditionalSchema(paths.frontend.components, /ConfigSchema$/g)

let availableInFrontend = getFrontendProps(schema)
const conf = convict(schema)

conf.set('availableInFrontend', availableInFrontend)

// Load environment dependent configuration
const env = conf.get('env')

try {
  conf.loadFile(path.resolve(path.join(__dirname, '/../config/config.' + env + '.json')))
} catch (e) {
  console.log('Failed to load config, dropping to defaults.')
}

// Perform validation
conf.validate({})

module.exports = conf
module.exports.getFrontendProps = getFrontendProps
