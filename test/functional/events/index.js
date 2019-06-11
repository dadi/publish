const event = require('codeceptjs').event
const publish = require('./../../../index')

module.exports = function() {
  // Test of all tests, reset failures.
  event.dispatcher.on(event.all.before, function() {
    this.failedTests = 0
  })

  // Current test has failed, increment count of failures.
  event.dispatcher.on(event.test.failed, function() {
    this.failedTests++
  })

  // All tests have finished, close Publish server and exit.
  event.dispatcher.on(event.all.result, function(x) {
    publish.stop().then(() => {
      process.exit(this.failedTests === 0 ? 0 : 1)
    })
  })
}
