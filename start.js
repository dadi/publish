// This file is used for starting the app from source (i.e. when closing the
// repo rather than using it as a dependency).
const app = require('./index')
const path = require('path')

app.run({
  configPath: path.resolve(__dirname, 'dev-config')
})
