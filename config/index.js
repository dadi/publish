const convict = require('convict')
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

    console.log('---> loading:', filePath)
  
    this.instance.loadFile(filePath)
    this.instance.validate({})
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
