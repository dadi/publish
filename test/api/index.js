const path = require('path')

let api

module.exports = {
  start: () =>
    new Promise((resolve, reject) => {
      const cwd = process.cwd()

      process.chdir(path.join(cwd, 'test/api'))

      api = require('@dadi/api')
      api.start(() => {
        process.chdir(cwd)

        setTimeout(resolve, 2000)
      })
    }),

  stop: () =>
    new Promise((resolve, reject) => {
      api.stop(resolve)
    })
}
