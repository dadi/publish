const api = require('./../api')
const Bootstrap = require('./bootstrap')
const publish = require('./../../index')

module.exports = {
  bootstrap: done => {
    api
      .start()
      .then(() => {
        // Bootstrap the database
        return new Bootstrap()
          .run()
          .then(() => {
            return publish.run()
          })
      }).then(done)
  },

  teardown: done => {
    api.stop().then(() => {
      return done()
    })
  }
}
