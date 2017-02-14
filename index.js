'use strict'

const app = module.exports = require('./dadi')
app.start().then(() => {
  console.log("App started successfully")
}).catch((err) => {
  console.log("App failed to start", err)
})
