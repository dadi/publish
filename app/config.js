'use strict'

const convict = require('convict')
const path = require('path')
const fs = require('fs')
// Define a schema
const schema = require('./config-schema')

/**
 * Get Adittional Schema
 * @param  {String} dir Directory to search
 * @param  {Regex} match Filename regular expression
 * @return {undefined}
 */
const getAdditionalSchema = (dir, match) => {
  fs.readdirSync(dir).forEach(folder => {
    const sub = path.resolve(dir, folder)

    if (fs.lstatSync(sub).isDirectory()) {
      getAdditionalSchema(sub, match)
    } else if (fs.lstatSync(sub).isFile()) {
      const file = path.parse(sub)

      if (file.ext === '.js' && file.name.match(match)) {
        const subSchema = require(sub)
        Object.assign(schema, subSchema)
      }
    }
  })
}

const getFrontendProps = (schema = {}, prev = {}) => {
  return Object.assign(prev,
    ...Object.keys(schema)
    .filter(key => Object.is(schema[key].availableInFrontend, true))
    .map(key => {
      const val = getFrontendProps(schema[key], {})
      return {[`${key}`]: (Object.keys(val).length > 0) ? val : true}
    })
  )
}

const initConf = () => {
  // Fetch aditional component schema
  getAdditionalSchema(paths.frontend.components, /ConfigSchema$/g)

  const availableInFrontend = getFrontendProps(schema)
  const conf = convict(schema)
  const env = conf.get('env')
  const envConfigPath = `${paths.configDir}/config.${env}.json`

  conf.set('availableInFrontend', availableInFrontend)

  // Check that environmental config file exists.
  if (fs.existsSync(envConfigPath)) {
    conf.loadFile(`${paths.configDir}/config.${env}.json`)
  } else {
    console.log(`Failed to load ${envConfigPath}, dropping to defaults`)
  }

  // Force port 443 if ssl is enabled.
  if (conf.get('server.ssl.enabled')) {
    conf.set('server.port', 443)
  }

  // Perform validation
  conf.validate({})

  return conf
}

module.exports = initConf()
module.exports.initConf = initConf
module.exports.getFrontendProps = getFrontendProps
module.exports.getAdditionalSchema = getAdditionalSchema
