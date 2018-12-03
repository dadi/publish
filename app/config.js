'use strict'

const convict = require('convict')
const globals = require('./globals') // eslint-disable-line
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

const getUnauthenticatedConfig = (tree = schema, target = {}, trail = []) => {
  if (!tree || typeof tree !== 'object') {
    return
  }

  Object.keys(tree).forEach(key => {
    let path = trail.concat(key)

    if (
      tree[key] &&
      typeof tree[key] === 'object' &&
      tree[key].requireAuthentication === false
    ) {
      let pointer = target

      trail.forEach(node => {
        target[node] = target[node] || {}
        pointer = target[node]
      })

      pointer[key] = config.get(path.join('.'))
    } else {
      getUnauthenticatedConfig(tree[key], target, path)
    }
  })

  return target
}

const initialiseConfig = () => {
  // Fetch aditional component schema
  getAdditionalSchema(paths.frontend.components, /ConfigSchema$/g)

  const config = convict(schema)
  const env = config.get('env')
  const envConfigPath = `${paths.configDir}/config.${env}.json`

  // Check that environmental config file exists.
  if (fs.existsSync(envConfigPath)) {
    config.loadFile(`${paths.configDir}/config.${env}.json`)
  } else {
    console.log(`Failed to load ${envConfigPath}, dropping to defaults`)
  }

  // Perform validation
  config.validate({})

  return config
}

let config = initialiseConfig()

module.exports = config
module.exports.initialiseConfig = initialiseConfig
module.exports.getAdditionalSchema = getAdditionalSchema
module.exports.getUnauthenticatedConfig = getUnauthenticatedConfig
