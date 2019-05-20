const convict = require('convict')
const log = require('@dadi/logger')
const path = require('path')
const schema = require('./schema')

class Config {
  constructor () {
    this.instance = convict(schema)
  }

  filterUnauthenticatedProperties (node, configObject) {
    if (!node.properties) {
      return node.showToUnauthenticatedUsers
        ? configObject
        : null
    }
  
    let result
  
    Object.keys(node.properties).forEach(key => {
      const keyResult = this.filterUnauthenticatedProperties(
        node.properties[key],
        configObject[key]
      )
  
      if (keyResult) {
        result = result || {}
        result[key] = keyResult
      }
    })
  
    return result
  }

  getProperties ({authenticated = false} = {}) {
    if (authenticated) {
      return this.instance.getProperties()
    }

    return this.filterUnauthenticatedProperties(
      this.instance.getSchema(),
      this.instance.getProperties()
    )
  }

  load (configPath) {
    const environment = this.instance.get('env')
    const filePath = path.join(
      configPath, `config.${environment}.json`
    )

    try {
      const data = require(filePath)
      const sanitisedData = this.sanitiseConfigData(data)

      this.instance.load(sanitisedData)
      this.instance.validate({})
    } catch (error) {
      log.error({module: 'config'}, error)
    }
  }

  sanitiseConfigData (inputData) {
    let data = {...inputData}

    if (data.apis && !data.api) {
      data.api = data.apis[0]
      data.apis = undefined

      const newSyntax = JSON.stringify({api: data.api}, null, 2)

      console.log(
        `The configuration file is using a legacy syntax for configuring the API. Please replace the "apis" property with:\n\n${newSyntax}`
      )
    }

    if (data.api.credentials) {
      data.api.credentials = undefined

      console.log(
        `The configuration file is using a legacy "credentials" block in the API configuration, which is deprecated. Please remove it from your configuration files.`
      )
    }

    return data
  }
}

const config = new Config()

module.exports = config.instance
module.exports.getUnauthenticated = () => {
  return config.getProperties({
    authenticated: false
  })
}
module.exports.initialise = configPath => {
  config.load(configPath)
}
