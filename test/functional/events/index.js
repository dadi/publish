const event = require('codeceptjs').event
const publish = require('./../../../index')

module.exports = function () {
  event.dispatcher.on(event.all.before, function () {
    this.failedTests = 0
  })

  event.dispatcher.on(event.test.failed, function () {
    this.failedTests++
  })

  event.dispatcher.on(event.all.result, function (x) {
    publish.stop().then(() => {
      process.exit(this.failedTests === 0 ? 0 : 1)
    })
  })
}
