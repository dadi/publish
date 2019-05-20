const bootMessage = require('@dadi/boot')
const config = require('./config')
const packageJSON = require('./package.json')
const Server = require('./server')

class App {
  printStartupMessage() {
    const env = config.get('env')
    const port = config.get('server.protocol') === 'https'
      ? 443
      : config.get('server.port')
  
    // Where can the user access Publish?
    const server = config.get('publicUrl.host')
      ? `${config.get('publicUrl.protocol')}://${config.get('publicUrl.host')}:${port}`
      : `http://${config.get('server.host')}:${port}`
  
    // Print out API.
    const api = config.get('api')
    const apiUrl = api.host && `${api.host}:${api.port}`
    const footer = {
      'API': apiUrl || colors.red('Not connected')
    }
  
    if (env !== 'test') {
      bootMessage.started({
        body: {
          'Version': packageJSON.version,
          'Node.js': Number(process.version.match(/^v(\d+\.\d+)/)[1]),
          'Environment': env
        },        
        header: {
          app: config.get('app.name')
        },
        footer,
        server
      })
    }    
  }

  run({configPath} = {}) {
    // Initialise config.
    config.initialise(configPath)

    // Initialise startup message package.
    if (config.get('env') !== 'test') {
      bootMessage.start(packageJSON)
    }

    this.server = new Server()

    return this.server.start().then(() => {
      this.printStartupMessage()
    })
  }

  stop() {
    return this.server.stop()
  }
}

module.exports = new App()
