/*
@readme
Unlike most other database requests, we handle user validation logic on the server instead of validating in the frontend. This is to:
- avoid encrypted passwords being transfered across the internet
- exposing the encryption method within frontend JS
 */

'use strict'

const Controller = require(`${paths.lib.controllers}/user`)

module.exports = function (app) {

  let controller = new Controller()

  // app.post('/user', controller.post)
  // app.put('/user', Controller.put)
}