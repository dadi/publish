const api = require('./../api')
const publish = require('./../../index')

module.exports = {
  bootstrap: done => {
    api.start().then(() => {
      return publish.run()
    }).then(done)
  },

  teardown: done => {
    api.stop().then(() => {
      return done()
    })
  }
}
