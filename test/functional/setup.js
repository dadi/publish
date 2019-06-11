const api = require('./../api')
const Bootstrap = require('./bootstrap')
const path = require('path')
const publish = require('./../../index')

module.exports = {
  bootstrap: done => {
    api
      .start()
      .then(() => {
        // Bootstrap the database
        return new Bootstrap().run()
      })
      .then(() => {
        return publish.run({
          configPath: path.resolve(__dirname, '../../dev-config')
        })
      })
      .then(done)
      .catch(error => {
        console.error(error)

        process.exit(1)
      })
  },

  teardown: done => {
    api.stop().then(done)
  }
}
